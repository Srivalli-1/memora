const prisma = require('../utils/prisma');

// Get all commitments where current user is creator or participant
const getCommitments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, spaceId } = req.query;

    const where = {
      OR: [
        { creatorId: userId },
        { participants: { some: { userId } } }
      ]
    };

    if (status && status !== 'ALL') {
      where.status = status.toUpperCase();
    }

    if (spaceId) {
      where.sharedSpaceId = spaceId;
    }

    const commitments = await prisma.commitment.findMany({
      where,
      include: {
        creator: {
          select: { id: true, fullName: true, username: true, avatarUrl: true }
        },
        participants: {
          include: {
            user: {
              select: { id: true, fullName: true, username: true, avatarUrl: true }
            }
          }
        },
        sharedSpace: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      success: true,
      count: commitments.length,
      commitments
    });
  } catch (error) {
    next(error);
  }
};

// Get single commitment by ID
const getCommitmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const commitment = await prisma.commitment.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, fullName: true, username: true, avatarUrl: true }
        },
        participants: {
          include: {
            user: {
              select: { id: true, fullName: true, username: true, avatarUrl: true }
            }
          }
        },
        sharedSpace: true
      }
    });

    if (!commitment) {
      return res.status(404).json({
        success: false,
        message: 'Commitment not found.'
      });
    }

    const isAuthorized =
      commitment.creatorId === userId ||
      commitment.participants.some((p) => p.userId === userId);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant of this commitment.'
      });
    }

    return res.status(200).json({
      success: true,
      commitment
    });
  } catch (error) {
    next(error);
  }
};

// Create a commitment
const createCommitment = async (req, res, next) => {
  try {
    const creatorId = req.user.id;
    const { title, promiseText, participantIds, sharedSpaceId } = req.body;

    if (!title || !promiseText) {
      return res.status(400).json({
        success: false,
        message: 'Title and promise agreement text are required.'
      });
    }

    // Process participant user IDs
    let pIds = Array.isArray(participantIds) ? participantIds : [];
    if (typeof participantIds === 'string') {
      try {
        pIds = JSON.parse(participantIds);
      } catch (e) {
        pIds = participantIds.split(',').map((s) => s.trim());
      }
    }

    // Filter out creator id from list of other participants to prevent duplication
    const otherParticipantIds = [...new Set(pIds.filter((id) => id && id !== creatorId))];

    // Creator signs immediately
    const participantData = [
      {
        userId: creatorId,
        status: 'ACCEPTED',
        signedAt: new Date(),
        signatureNotes: 'Creator agreement'
      },
      ...otherParticipantIds.map((uId) => ({
        userId: uId,
        status: 'PENDING'
      }))
    ];

    // If there are no other participants (self commitment), it is ACTIVE immediately!
    const initialStatus = otherParticipantIds.length === 0 ? 'ACTIVE' : 'PENDING';

    const commitment = await prisma.commitment.create({
      data: {
        creatorId,
        sharedSpaceId: sharedSpaceId || null,
        title: title.trim(),
        promiseText: promiseText.trim(),
        status: initialStatus,
        participants: {
          create: participantData
        }
      },
      include: {
        creator: {
          select: { id: true, fullName: true, username: true, avatarUrl: true }
        },
        participants: {
          include: {
            user: {
              select: { id: true, fullName: true, username: true, avatarUrl: true }
            }
          }
        }
      }
    });

    // Send notifications to invited participants
    if (otherParticipantIds.length > 0) {
      const notifications = otherParticipantIds.map((uId) => ({
        userId: uId,
        title: 'New Commitment Request 🤝',
        message: `${req.user.fullName} invited you to sign a shared promise: "${title}"`,
        type: 'COMMITMENT_REQUEST',
        link: '/commitments'
      }));

      await prisma.notification.createMany({ data: notifications });
    }

    return res.status(201).json({
      success: true,
      message: 'Commitment created successfully.',
      commitment
    });
  } catch (error) {
    next(error);
  }
};

// Sign or decline commitment
const signCommitment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { action, signatureNotes } = req.body; // action: 'ACCEPT' or 'DECLINE'

    if (!['ACCEPT', 'DECLINE'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be ACCEPT or DECLINE.'
      });
    }

    const commitment = await prisma.commitment.findUnique({
      where: { id },
      include: {
        creator: true,
        participants: true
      }
    });

    if (!commitment) {
      return res.status(404).json({
        success: false,
        message: 'Commitment not found.'
      });
    }

    const participant = commitment.participants.find((p) => p.userId === userId);
    if (!participant) {
      return res.status(403).json({
        success: false,
        message: 'You are not listed as a participant in this commitment.'
      });
    }

    if (action === 'DECLINE') {
      await prisma.$transaction([
        prisma.commitmentParticipant.update({
          where: { id: participant.id },
          data: {
            status: 'DECLINED',
            signedAt: new Date(),
            signatureNotes: signatureNotes ? signatureNotes.trim() : null
          }
        }),
        prisma.commitment.update({
          where: { id },
          data: { status: 'DECLINED' }
        }),
        prisma.notification.create({
          data: {
            userId: commitment.creatorId,
            title: 'Commitment Declined 🥀',
            message: `${req.user.fullName} declined to sign "${commitment.title}".`,
            type: 'ACTIVITY',
            link: '/commitments'
          }
        })
      ]);

      return res.status(200).json({
        success: true,
        message: 'You declined the commitment.'
      });
    }

    // User ACCEPT & SIGN
    const updatedParticipant = await prisma.commitmentParticipant.update({
      where: { id: participant.id },
      data: {
        status: 'ACCEPTED',
        signedAt: new Date(),
        signatureNotes: signatureNotes ? signatureNotes.trim() : null
      }
    });

    // Check if all participants have now accepted
    const remainingPending = await prisma.commitmentParticipant.count({
      where: {
        commitmentId: id,
        status: { not: 'ACCEPTED' }
      }
    });

    let newStatus = commitment.status;
    if (remainingPending === 0) {
      newStatus = 'ACTIVE';
      await prisma.commitment.update({
        where: { id },
        data: { status: 'ACTIVE' }
      });

      // Notify everyone that commitment is now fully ACTIVE
      const allParticipants = await prisma.commitmentParticipant.findMany({
        where: { commitmentId: id }
      });

      const notifyAll = allParticipants.map((p) => ({
        userId: p.userId,
        title: 'Commitment Is Now Active! 💍✨',
        message: `All participants have officially signed "${commitment.title}". It is now bound!`,
        type: 'COMMITMENT_SIGNED',
        link: '/commitments'
      }));

      await prisma.notification.createMany({ data: notifyAll });
    } else {
      // Notify creator of signature
      await prisma.notification.create({
        data: {
          userId: commitment.creatorId,
          title: 'Signature Recorded ✍️',
          message: `${req.user.fullName} digitally signed "${commitment.title}".`,
          type: 'COMMITMENT_SIGNED',
          link: '/commitments'
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'You have digitally signed this commitment!',
      participant: updatedParticipant,
      commitmentStatus: newStatus
    });
  } catch (error) {
    next(error);
  }
};

// Mark commitment completed
const completeCommitment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const commitment = await prisma.commitment.findUnique({ where: { id } });
    if (!commitment) {
      return res.status(404).json({
        success: false,
        message: 'Commitment not found.'
      });
    }

    if (commitment.creatorId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the creator can mark a commitment as completed.'
      });
    }

    const updated = await prisma.commitment.update({
      where: { id },
      data: { status: 'COMPLETED' }
    });

    return res.status(200).json({
      success: true,
      message: 'Commitment marked as completed!',
      commitment: updated
    });
  } catch (error) {
    next(error);
  }
};

// Delete commitment (Creator only)
const deleteCommitment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const commitment = await prisma.commitment.findUnique({ where: { id } });
    if (!commitment) {
      return res.status(404).json({
        success: false,
        message: 'Commitment not found.'
      });
    }

    if (commitment.creatorId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the creator can delete this commitment.'
      });
    }

    await prisma.commitment.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Commitment deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Update commitment (Creator only, before fully signed / locked)
const updateCommitment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, promiseText } = req.body;

    const commitment = await prisma.commitment.findUnique({
      where: { id },
      include: { participants: true }
    });

    if (!commitment) {
      return res.status(404).json({
        success: false,
        message: 'Commitment not found.'
      });
    }

    if (commitment.creatorId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the creator can edit this commitment.'
      });
    }

    // Check if locked: all participants have signed or status is ACTIVE
    if (
      commitment.status === 'ACTIVE' ||
      (commitment.participants.length > 1 && commitment.participants.every((p) => p.status === 'ACCEPTED'))
    ) {
      return res.status(400).json({
        success: false,
        message: 'This agreement is already co-signed and locked. It cannot be edited.'
      });
    }

    const updated = await prisma.commitment.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : undefined,
        promiseText: promiseText !== undefined ? promiseText.trim() : undefined
      },
      include: {
        creator: {
          select: { id: true, fullName: true, username: true, avatarUrl: true }
        },
        participants: {
          include: {
            user: {
              select: { id: true, fullName: true, username: true, avatarUrl: true }
            }
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Commitment updated successfully.',
      commitment: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCommitments,
  getCommitmentById,
  createCommitment,
  updateCommitment,
  signCommitment,
  completeCommitment,
  deleteCommitment
};
