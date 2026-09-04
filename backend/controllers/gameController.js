const prisma = require('../utils/prisma');

// Get all games in a space or created by user
const getGames = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, spaceId } = req.query;

    const where = {};
    if (type) where.type = type.toUpperCase();
    if (spaceId) where.sharedSpaceId = spaceId;

    const games = await prisma.game.findMany({
      where,
      include: {
        questions: true,
        results: {
          include: {
            user: {
              select: { id: true, fullName: true, username: true, avatarUrl: true }
            }
          },
          orderBy: { score: 'desc' }
        },
        sharedSpace: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      success: true,
      count: games.length,
      games
    });
  } catch (error) {
    next(error);
  }
};

// Create a custom game or quiz (e.g., How Well Do You Know Me)
const createGame = async (req, res, next) => {
  try {
    const creatorId = req.user.id;
    const { title, type, sharedSpaceId, config, questions } = req.body;

    if (!title || !type) {
      return res.status(400).json({
        success: false,
        message: 'Title and type are required.'
      });
    }

    const game = await prisma.game.create({
      data: {
        creatorId,
        sharedSpaceId: sharedSpaceId || null,
        title: title.trim(),
        type: type.toUpperCase(),
        config: config ? (typeof config === 'string' ? config : JSON.stringify(config)) : null,
        questions: {
          create: (questions || []).map((q) => ({
            questionText: q.questionText,
            options: JSON.stringify(q.options || []),
            correctAnswer: q.correctAnswer || null,
            creatorId
          }))
        }
      },
      include: {
        questions: true,
        sharedSpace: {
          select: { id: true, name: true }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Game created successfully!',
      game
    });
  } catch (error) {
    next(error);
  }
};

// Generate Memory Quiz based on real memories!
const generateMemoryQuiz = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { spaceId } = req.body;

    // Fetch up to 10 memories either from space or user
    const memories = await prisma.memory.findMany({
      where: spaceId
        ? { sharedSpaceId: spaceId }
        : { userId },
      take: 10,
      orderBy: { date: 'desc' }
    });

    if (memories.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'You need at least 2 memories to generate a Memory Quiz. Add some memories first!'
      });
    }

    // Build real questions
    const generatedQuestions = [];
    const moods = ['Joyful', 'Nostalgic', 'Peaceful', 'Romantic', 'Excited', 'Reflective'];

    for (let i = 0; i < Math.min(memories.length, 5); i++) {
      const memory = memories[i];
      const qType = i % 3;

      if (qType === 0 && memory.location) {
        const fakeLocations = ['Paris, France', 'Tokyo, Japan', 'Grand Canyon, AZ', 'Cozy Home', 'Sunset Beach', 'Central Park']
          .filter((loc) => loc.toLowerCase() !== (memory.location || '').toLowerCase());
        const options = [memory.location, fakeLocations[0], fakeLocations[1], fakeLocations[2]].sort(() => 0.5 - Math.random());

        generatedQuestions.push({
          questionText: `Where did the memory "${memory.title}" take place?`,
          options: JSON.stringify(options),
          correctAnswer: memory.location
        });
      } else if (qType === 1) {
        // Mood question
        const options = [
          memory.mood,
          ...moods.filter((m) => m.toLowerCase() !== memory.mood.toLowerCase()).slice(0, 3)
        ].sort(() => 0.5 - Math.random());

        generatedQuestions.push({
          questionText: `What mood was recorded for the memory "${memory.title}"?`,
          options: JSON.stringify(options),
          correctAnswer: memory.mood
        });
      } else {
        // Date question
        const actualYear = new Date(memory.date).getFullYear();
        const actualMonth = new Date(memory.date).toLocaleString('default', { month: 'long' });
        const correctStr = `${actualMonth} ${actualYear}`;
        const fakeMonths = ['January', 'April', 'July', 'October'].filter((m) => m !== actualMonth);
        const options = [
          correctStr,
          `${fakeMonths[0]} ${actualYear}`,
          `${fakeMonths[1]} ${actualYear - 1}`,
          `${fakeMonths[2]} ${actualYear}`
        ].sort(() => 0.5 - Math.random());

        generatedQuestions.push({
          questionText: `In which month and year was the memory "${memory.title}" preserved?`,
          options: JSON.stringify(options),
          correctAnswer: correctStr
        });
      }
    }

    const game = await prisma.game.create({
      data: {
        creatorId: userId,
        sharedSpaceId: spaceId || null,
        title: `Memory Flashback Quiz (${new Date().toLocaleDateString()})`,
        type: 'MEMORY_QUIZ',
        questions: {
          create: generatedQuestions.map((q) => ({
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            creatorId: userId
          }))
        }
      },
      include: {
        questions: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Memory Quiz generated successfully from your actual memories!',
      game
    });
  } catch (error) {
    next(error);
  }
};

// Spin the Memory - select a random memory with reflective prompt
const spinMemory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { spaceId } = req.query;

    const where = spaceId ? { sharedSpaceId: spaceId } : { userId };
    const count = await prisma.memory.count({ where });

    if (count === 0) {
      return res.status(404).json({
        success: false,
        message: 'No memories found to spin! Create some memories first.'
      });
    }

    const skip = Math.floor(Math.random() * count);
    const randomMemory = await prisma.memory.findFirst({
      where,
      skip,
      include: {
        images: true,
        user: {
          select: { id: true, fullName: true, username: true, avatarUrl: true }
        }
      }
    });

    const prompts = [
      "What is the very first detail that rushes back when you look at this memory?",
      "If you could whisper something to yourself in this exact moment, what would it be?",
      "Who would you most love to talk about this day with right now?",
      "What sound, smell, or song instantly transports you back to this moment?",
      "What did this moment teach you about love, friendship, or life?",
      "Recreate this memory today in whatever small creative way you can!"
    ];

    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

    return res.status(200).json({
      success: true,
      memory: randomMemory,
      prompt: randomPrompt
    });
  } catch (error) {
    next(error);
  }
};

// Default preset questions for "This or That"
const getThisOrThatQuestions = async (req, res, next) => {
  try {
    const questions = [
      { id: 'tot-1', optionA: 'Late night deep talks', optionB: 'Early morning coffee together' },
      { id: 'tot-2', optionA: 'Handwritten physical letters', optionB: 'Surprise spontaneous voice notes' },
      { id: 'tot-3', optionA: 'Quiet cozy cabin in the rain', optionB: 'Sunlit road trip with windows down' },
      { id: 'tot-4', optionA: 'Polaroid vintage camera shots', optionB: 'Candid video clips of laughter' },
      { id: 'tot-5', optionA: 'Revisiting a favorite nostalgic place', optionB: 'Exploring an entirely unknown city' },
      { id: 'tot-6', optionA: 'Remembering every little anniversary', optionB: 'Celebrating unexpected random milestones' }
    ];

    return res.status(200).json({
      success: true,
      questions
    });
  } catch (error) {
    next(error);
  }
};

// Submit Game Result
const submitResult = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { gameId, score, answers } = req.body;

    if (!gameId) {
      return res.status(400).json({
        success: false,
        message: 'Game ID is required.'
      });
    }

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { questions: true }
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found.'
      });
    }

    const result = await prisma.gameResult.create({
      data: {
        gameId,
        userId,
        score: typeof score === 'number' ? score : 0,
        answers: typeof answers === 'string' ? answers : JSON.stringify(answers || {})
      },
      include: {
        user: {
          select: { id: true, fullName: true, username: true, avatarUrl: true }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Game result submitted successfully!',
      result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGames,
  createGame,
  generateMemoryQuiz,
  spinMemory,
  getThisOrThatQuestions,
  submitResult
};
