const prisma = require('../utils/prisma');

// Get all letters involving current user (sent or received)
const getLetters = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type } = req.query; // 'MYSELF', 'USER', 'FUTURE', or all

    const where = {
      OR: [
        { senderId: userId },
        { recipientId: userId }
      ]
    };

    if (type && ['MYSELF', 'USER', 'FUTURE'].includes(type.toUpperCase())) {
      where.letterType = type.toUpperCase();
    }

    const letters = await prisma.letter.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatarUrl: true
          }
        },
        recipient: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatarUrl: true
          }
        },
        sharedSpace: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const now = new Date();

    // Redact content if letter is locked!
    const processed = letters.map((letter) => {
      const isLocked = letter.unlockDate ? new Date(letter.unlockDate) > now : false;

      // If future letter is locked: hide content
      if (isLocked) {
        return {
          ...letter,
          content: '[LOCKED UNTIL UNLOCK DATE]',
          isLocked: true
        };
      }

      return {
        ...letter,
        isLocked: false
      };
    });

    return res.status(200).json({
      success: true,
      count: processed.length,
      letters: processed
    });
  } catch (error) {
    next(error);
  }
};

// Get single letter by ID
const getLetterById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const letter = await prisma.letter.findUnique({
      where: { id },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatarUrl: true
          }
        },
        recipient: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatarUrl: true
          }
        },
        sharedSpace: true
      }
    });

    if (!letter) {
      return res.status(404).json({
        success: false,
        message: 'Letter not found.'
      });
    }

    // Access check: User must be sender or recipient
    if (letter.senderId !== userId && letter.recipientId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this letter.'
      });
    }

    const now = new Date();
    const isLocked = letter.unlockDate ? new Date(letter.unlockDate) > now : false;

    if (isLocked) {
      return res.status(200).json({
        success: true,
        letter: {
          ...letter,
          content: '[LOCKED UNTIL UNLOCK DATE]',
          isLocked: true
        }
      });
    }

    // Mark as read if current user is recipient
    if (letter.recipientId === userId && !letter.isRead) {
      await prisma.letter.update({
        where: { id },
        data: { isRead: true }
      });
      letter.isRead = true;
    }

    return res.status(200).json({
      success: true,
      letter: {
        ...letter,
        isLocked: false
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create a letter
const createLetter = async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const { title, content, letterType, recipientId, unlockDate, sharedSpaceId } = req.body;

    if (!title || !content || !letterType) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and letter type are required.'
      });
    }

    const validTypes = ['MYSELF', 'USER', 'FUTURE'];
    const typeUpper = letterType.toUpperCase();
    if (!validTypes.includes(typeUpper)) {
      return res.status(400).json({
        success: false,
        message: 'letterType must be MYSELF, USER, or FUTURE.'
      });
    }

    let targetRecipientId = null;
    if (typeUpper === 'USER') {
      if (!recipientId) {
        return res.status(400).json({
          success: false,
          message: 'Recipient is required for letters to another user.'
        });
      }
      targetRecipientId = recipientId;
    } else if (typeUpper === 'MYSELF' || typeUpper === 'FUTURE') {
      targetRecipientId = recipientId || senderId;
    }

    let parsedUnlockDate = null;
    if (typeUpper === 'FUTURE') {
      if (!unlockDate) {
        return res.status(400).json({
          success: false,
          message: 'Unlock date is required for future letters.'
        });
      }
      parsedUnlockDate = new Date(unlockDate);
      if (isNaN(parsedUnlockDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid unlock date format.'
        });
      }
    } else if (unlockDate) {
      parsedUnlockDate = new Date(unlockDate);
    }

    const letter = await prisma.letter.create({
      data: {
        senderId,
        recipientId: targetRecipientId,
        sharedSpaceId: sharedSpaceId || null,
        title: title.trim(),
        content: content.trim(),
        letterType: typeUpper,
        unlockDate: parsedUnlockDate
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatarUrl: true
          }
        },
        recipient: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatarUrl: true
          }
        }
      }
    });

    // Notify recipient if letter is to another user and not currently locked
    if (targetRecipientId && targetRecipientId !== senderId) {
      const isLocked = parsedUnlockDate ? parsedUnlockDate > new Date() : false;
      await prisma.notification.create({
        data: {
          userId: targetRecipientId,
          title: isLocked ? 'You received a Future Time Capsule Letter ⏳' : 'New Letter Received ✉️',
          message: isLocked
            ? `${req.user.fullName} sent you a letter that will unlock on ${parsedUnlockDate.toLocaleDateString()}`
            : `${req.user.fullName} sent you a personal letter: "${title}"`,
          type: 'LETTER_RECEIVED',
          link: `/letters/${letter.id}`
        }
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Letter created successfully.',
      letter
    });
  } catch (error) {
    next(error);
  }
};

// Update letter (only sender can update, and only if not yet unlocked or read)
const updateLetter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, content, unlockDate } = req.body;

    const existing = await prisma.letter.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Letter not found.'
      });
    }

    if (existing.senderId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit letters you wrote.'
      });
    }

    const updated = await prisma.letter.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : undefined,
        content: content !== undefined ? content.trim() : undefined,
        unlockDate: unlockDate ? new Date(unlockDate) : undefined
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Letter updated successfully.',
      letter: updated
    });
  } catch (error) {
    next(error);
  }
};

// Delete letter
const deleteLetter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.letter.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Letter not found.'
      });
    }

    if (existing.senderId !== userId && existing.recipientId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this letter.'
      });
    }

    await prisma.letter.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Letter deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLetters,
  getLetterById,
  createLetter,
  updateLetter,
  deleteLetter
};
