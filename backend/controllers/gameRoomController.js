const prisma = require('../utils/prisma');

// Create a new game room for multiplayer
const createGameRoom = async (req, res, next) => {
  try {
    const { sharedSpaceId, gameType } = req.body;
    const userId = req.user.id;

    // Verify user is a member of the space
    const membership = await prisma.sharedSpaceMember.findUnique({
      where: {
        sharedSpaceId_userId: {
          sharedSpaceId,
          userId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this space.'
      });
    }

    // Verify max 2 members in space
    const memberCount = await prisma.sharedSpaceMember.count({
      where: { sharedSpaceId }
    });

    if (memberCount > 2) {
      return res.status(400).json({
        success: false,
        message: 'Space has more than 2 members. Cannot create multiplayer game.'
      });
    }

    // Create game room
    const gameRoom = await prisma.gameRoom.create({
      data: {
        sharedSpaceId,
        gameType,
        status: 'WAITING',
        players: {
          create: {
            userId,
            isReady: false
          }
        }
      },
      include: {
        players: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Game room created.',
      gameRoom
    });
  } catch (error) {
    next(error);
  }
};

// Get game room details
const getGameRoom = async (req, res, next) => {
  try {
    const { gameRoomId } = req.params;
    const userId = req.user.id;

    const gameRoom = await prisma.gameRoom.findUnique({
      where: { id: gameRoomId },
      include: {
        players: true,
        sharedSpace: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, fullName: true, username: true, avatarUrl: true }
                }
              }
            }
          }
        }
      }
    });

    if (!gameRoom) {
      return res.status(404).json({
        success: false,
        message: 'Game room not found.'
      });
    }

    // Verify user is a member of the space
    const isMember = gameRoom.sharedSpace.members.some(m => m.userId === userId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this space.'
      });
    }

    // Enrich player data with user info
    const playersWithDetails = gameRoom.players.map(player => {
      const userInfo = gameRoom.sharedSpace.members.find(m => m.userId === player.userId);
      return {
        ...player,
        user: userInfo?.user
      };
    });

    return res.status(200).json({
      success: true,
      gameRoom: {
        ...gameRoom,
        players: playersWithDetails
      }
    });
  } catch (error) {
    next(error);
  }
};

// Join a game room
const joinGameRoom = async (req, res, next) => {
  try {
    const { gameRoomId } = req.params;
    const userId = req.user.id;

    const gameRoom = await prisma.gameRoom.findUnique({
      where: { id: gameRoomId },
      include: {
        players: true,
        sharedSpace: {
          include: {
            members: true
          }
        }
      }
    });

    if (!gameRoom) {
      return res.status(404).json({
        success: false,
        message: 'Game room not found.'
      });
    }

    // Verify user is a member of the space
    const isMember = gameRoom.sharedSpace.members.some(m => m.userId === userId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this space.'
      });
    }

    // Check if already in game room
    const existingPlayer = gameRoom.players.find(p => p.userId === userId);
    if (existingPlayer) {
      return res.status(400).json({
        success: false,
        message: 'You are already in this game room.'
      });
    }

    // Check room capacity (max 2 players)
    if (gameRoom.players.length >= 2) {
      return res.status(400).json({
        success: false,
        message: 'Game room is full (maximum 2 players).'
      });
    }

    // Add player to room
    const player = await prisma.gameRoomPlayer.create({
      data: {
        gameRoomId,
        userId,
        isReady: false
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Joined game room.',
      player
    });
  } catch (error) {
    next(error);
  }
};

// Player ready/not ready
const setPlayerReady = async (req, res, next) => {
  try {
    const { gameRoomId } = req.params;
    const { isReady } = req.body;
    const userId = req.user.id;

    const player = await prisma.gameRoomPlayer.findFirst({
      where: {
        gameRoomId,
        userId
      }
    });

    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found in this game room.'
      });
    }

    const updated = await prisma.gameRoomPlayer.update({
      where: { id: player.id },
      data: { isReady }
    });

    // Check if all players are ready
    const gameRoom = await prisma.gameRoom.findUnique({
      where: { id: gameRoomId },
      include: { players: true }
    });

    const allReady = gameRoom.players.length === 2 && gameRoom.players.every(p => p.isReady);

    return res.status(200).json({
      success: true,
      player: updated,
      allReady
    });
  } catch (error) {
    next(error);
  }
};

// Submit answer for current question
const submitAnswer = async (req, res, next) => {
  try {
    const { gameRoomId } = req.params;
    const { answer, questionIndex, isCorrect } = req.body;
    const userId = req.user.id;

    const player = await prisma.gameRoomPlayer.findFirst({
      where: {
        gameRoomId,
        userId
      }
    });

    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found in this game room.'
      });
    }

    // Parse existing answers
    let answers = {};
    try {
      answers = JSON.parse(player.answers || '{}');
    } catch (e) {
      answers = {};
    }

    // Store answer
    answers[questionIndex] = {
      answer,
      isCorrect,
      timestamp: new Date().toISOString()
    };

    // Update player score if correct
    const scoreIncrement = isCorrect ? 1 : 0;

    const updated = await prisma.gameRoomPlayer.update({
      where: { id: player.id },
      data: {
        answers: JSON.stringify(answers),
        score: player.score + scoreIncrement,
        correctCount: isCorrect ? player.correctCount + 1 : player.correctCount
      }
    });

    return res.status(200).json({
      success: true,
      player: updated
    });
  } catch (error) {
    next(error);
  }
};

// Complete game room
const completeGameRoom = async (req, res, next) => {
  try {
    const { gameRoomId } = req.params;
    const userId = req.user.id;

    const gameRoom = await prisma.gameRoom.findUnique({
      where: { id: gameRoomId },
      include: {
        players: true,
        sharedSpace: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, fullName: true, username: true, avatarUrl: true }
                }
              }
            }
          }
        }
      }
    });

    if (!gameRoom) {
      return res.status(404).json({
        success: false,
        message: 'Game room not found.'
      });
    }

    // Determine winner
    let winner = null;
    if (gameRoom.players.length === 2) {
      const player1 = gameRoom.players[0];
      const player2 = gameRoom.players[1];

      if (player1.correctCount > player2.correctCount) {
        winner = player1.userId;
      } else if (player2.correctCount > player1.correctCount) {
        winner = player2.userId;
      }
      // If tie, winner remains null
    }

    // Update game room status
    const updated = await prisma.gameRoom.update({
      where: { id: gameRoomId },
      data: {
        status: 'COMPLETED',
        winner
      },
      include: {
        players: true
      }
    });

    // Enrich player data with user info
    const playersWithDetails = updated.players.map(player => {
      const userInfo = gameRoom.sharedSpace.members.find(m => m.userId === player.userId);
      return {
        ...player,
        user: userInfo?.user
      };
    });

    return res.status(200).json({
      success: true,
      gameRoom: {
        ...updated,
        players: playersWithDetails
      }
    });
  } catch (error) {
    next(error);
  }
};

// Leave game room
const leaveGameRoom = async (req, res, next) => {
  try {
    const { gameRoomId } = req.params;
    const userId = req.user.id;

    const player = await prisma.gameRoomPlayer.findFirst({
      where: {
        gameRoomId,
        userId
      }
    });

    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found in this game room.'
      });
    }

    // Delete player from game room
    await prisma.gameRoomPlayer.delete({
      where: { id: player.id }
    });

    // If no players left, delete game room
    const remainingPlayers = await prisma.gameRoomPlayer.count({
      where: { gameRoomId }
    });

    if (remainingPlayers === 0) {
      await prisma.gameRoom.delete({
        where: { id: gameRoomId }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Left game room.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGameRoom,
  getGameRoom,
  joinGameRoom,
  setPlayerReady,
  submitAnswer,
  completeGameRoom,
  leaveGameRoom
};
