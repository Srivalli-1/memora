const prisma = require('../utils/prisma');
const { uploadImageToCloudinary, deleteImageFromCloudinary } = require('../services/cloudinaryService');

// Get all spaces current user is a member of, plus pending invitations
const getMySpaces = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Spaces where user is a member
    const memberships = await prisma.sharedSpaceMember.findMany({
      where: { userId },
      include: {
        sharedSpace: {
          include: {
            owner: {
              select: { id: true, fullName: true, username: true, avatarUrl: true }
            },
            members: {
              include: {
                user: {
                  select: { id: true, fullName: true, username: true, avatarUrl: true }
                }
              }
            },
            _count: {
              select: {
                memories: true,
                timeline: true,
                commitments: true,
                games: true
              }
            }
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    });

    const spaces = memberships.map((m) => ({
      ...m.sharedSpace,
      userRole: m.role
    }));

    // Invitations for current user
    const pendingInvitations = await prisma.sharedSpaceInvitation.findMany({
      where: {
        inviteeId: userId,
        status: 'PENDING'
      },
      include: {
        sharedSpace: {
          select: { id: true, name: true, description: true, coverImage: true }
        },
        inviter: {
          select: { id: true, fullName: true, username: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      success: true,
      spaces,
      pendingInvitations
    });
  } catch (error) {
    next(error);
  }
};

// Get single shared space details
const getSpaceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const membership = await prisma.sharedSpaceMember.findUnique({
      where: {
        sharedSpaceId_userId: {
          sharedSpaceId: id,
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

    const space = await prisma.sharedSpace.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, fullName: true, username: true, avatarUrl: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, fullName: true, username: true, avatarUrl: true }
            }
          }
        },
        memories: {
          include: {
            images: true,
            user: {
              select: { id: true, fullName: true, username: true, avatarUrl: true }
            }
          },
          orderBy: { date: 'desc' }
        },
        timeline: {
          include: {
            images: true,
            user: {
              select: { id: true, fullName: true, username: true, avatarUrl: true }
            }
          },
          orderBy: { date: 'asc' }
        },
        commitments: {
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
          },
          orderBy: { createdAt: 'desc' }
        },
        games: {
          include: {
            questions: true,
            results: {
              include: {
                user: { select: { id: true, fullName: true, username: true, avatarUrl: true } }
              }
            }
          }
        }
      }
    });

    if (!space) {
      return res.status(404).json({
        success: false,
        message: 'Space not found.'
      });
    }

    return res.status(200).json({
      success: true,
      space: {
        ...space,
        userRole: membership.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create a new Shared Space
const createSpace = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Space name is required.'
      });
    }

    let coverImage = null;
    if (req.file) {
      const uploadRes = await uploadImageToCloudinary(req.file, 'spaces');
      if (uploadRes) {
        coverImage = uploadRes.url;
      }
    }

    const space = await prisma.sharedSpace.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        coverImage,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'OWNER'
          }
        }
      },
      include: {
        owner: {
          select: { id: true, fullName: true, username: true, avatarUrl: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, fullName: true, username: true, avatarUrl: true }
            }
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Shared Space created successfully.',
      space: {
        ...space,
        userRole: 'OWNER'
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update space (Owner only)
const updateSpace = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, description } = req.body;

    const space = await prisma.sharedSpace.findUnique({ where: { id } });
    if (!space) {
      return res.status(404).json({
        success: false,
        message: 'Space not found.'
      });
    }

    if (space.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the space owner can update space details.'
      });
    }

    let coverImage = space.coverImage;
    if (req.file) {
      const uploadRes = await uploadImageToCloudinary(req.file, 'spaces');
      if (uploadRes) {
        coverImage = uploadRes.url;
      }
    }

    const updated = await prisma.sharedSpace.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        description: description !== undefined ? description.trim() : undefined,
        coverImage
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Space updated successfully.',
      space: updated
    });
  } catch (error) {
    next(error);
  }
};

// Invite a user to space
const inviteUserToSpace = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { inviteeIdentifier } = req.body; // username or email

    if (!inviteeIdentifier) {
      return res.status(400).json({
        success: false,
        message: 'Username or email of invitee is required.'
      });
    }

    // Verify current user is a space member
    const membership = await prisma.sharedSpaceMember.findUnique({
      where: {
        sharedSpaceId_userId: {
          sharedSpaceId: id,
          userId
        }
      },
      include: { sharedSpace: true }
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member of the space to invite others.'
      });
    }

    const cleanIdentifier = inviteeIdentifier.trim().toLowerCase();
    const invitee = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier },
          { username: cleanIdentifier }
        ]
      }
    });

    if (!invitee) {
      return res.status(404).json({
        success: false,
        message: 'No registered user found with that email or username.'
      });
    }

    if (invitee.id === userId) {
      return res.status(400).json({
        success: false,
        message: 'You are already in this space.'
      });
    }

    // Check if already a member
    const existingMember = await prisma.sharedSpaceMember.findUnique({
      where: {
        sharedSpaceId_userId: {
          sharedSpaceId: id,
          userId: invitee.id
        }
      }
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'This user is already a member of this space.'
      });
    }

    // Check if pending invitation exists
    const existingInvite = await prisma.sharedSpaceInvitation.findFirst({
      where: {
        sharedSpaceId: id,
        inviteeId: invitee.id,
        status: 'PENDING'
      }
    });

    if (existingInvite) {
      return res.status(400).json({
        success: false,
        message: 'An invitation is already pending for this user.'
      });
    }

    const invitation = await prisma.sharedSpaceInvitation.create({
      data: {
        sharedSpaceId: id,
        inviterId: userId,
        inviteeId: invitee.id,
        status: 'PENDING'
      }
    });

    // Notify invitee
    await prisma.notification.create({
      data: {
        userId: invitee.id,
        title: 'Space Invitation 🌟',
        message: `${req.user.fullName} invited you to join "${membership.sharedSpace.name}"`,
        type: 'SPACE_INVITE',
        link: '/spaces'
      }
    });

    return res.status(201).json({
      success: true,
      message: `Invitation sent to ${invitee.fullName} (@${invitee.username}).`,
      invitation
    });
  } catch (error) {
    next(error);
  }
};

// Respond to invitation (accept / decline)
const respondToInvitation = async (req, res, next) => {
  try {
    const { invitationId } = req.params;
    const { action } = req.body; // 'ACCEPT' or 'DECLINE'
    const userId = req.user.id;

    const invitation = await prisma.sharedSpaceInvitation.findUnique({
      where: { id: invitationId },
      include: { sharedSpace: true }
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found.'
      });
    }

    if (invitation.inviteeId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'This invitation was not addressed to you.'
      });
    }

    if (invitation.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `This invitation has already been ${invitation.status.toLowerCase()}.`
      });
    }

    if (action === 'ACCEPT') {
      await prisma.$transaction([
        prisma.sharedSpaceInvitation.update({
          where: { id: invitationId },
          data: { status: 'ACCEPTED' }
        }),
        prisma.sharedSpaceMember.create({
          data: {
            sharedSpaceId: invitation.sharedSpaceId,
            userId,
            role: 'MEMBER'
          }
        }),
        prisma.notification.create({
          data: {
            userId: invitation.inviterId,
            title: 'Invitation Accepted 🎉',
            message: `${req.user.fullName} accepted your invitation to "${invitation.sharedSpace.name}".`,
            type: 'ACTIVITY',
            link: `/spaces/${invitation.sharedSpaceId}`
          }
        })
      ]);

      return res.status(200).json({
        success: true,
        message: `You have joined "${invitation.sharedSpace.name}"!`
      });
    } else {
      await prisma.sharedSpaceInvitation.update({
        where: { id: invitationId },
        data: { status: 'DECLINED' }
      });

      return res.status(200).json({
        success: true,
        message: 'Invitation declined.'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Remove member from space (Owner only, or self leave)
const removeMember = async (req, res, next) => {
  try {
    const { id, memberUserId } = req.params;
    const userId = req.user.id;

    const space = await prisma.sharedSpace.findUnique({ where: { id } });
    if (!space) {
      return res.status(404).json({
        success: false,
        message: 'Space not found.'
      });
    }

    const isOwner = space.ownerId === userId;
    const isSelfLeaving = memberUserId === userId;

    if (!isOwner && !isSelfLeaving) {
      return res.status(403).json({
        success: false,
        message: 'Only the space owner can remove other members.'
      });
    }

    if (isOwner && isSelfLeaving) {
      return res.status(400).json({
        success: false,
        message: 'The space owner cannot leave their own space. You can delete the space instead.'
      });
    }

    await prisma.sharedSpaceMember.delete({
      where: {
        sharedSpaceId_userId: {
          sharedSpaceId: id,
          userId: memberUserId
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: isSelfLeaving ? 'You left the space.' : 'Member removed from space.'
    });
  } catch (error) {
    next(error);
  }
};

// Delete space (Owner only)
const deleteSpace = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const space = await prisma.sharedSpace.findUnique({ where: { id } });
    if (!space) {
      return res.status(404).json({
        success: false,
        message: 'Space not found.'
      });
    }

    if (space.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the space owner can delete this space.'
      });
    }

    await prisma.sharedSpace.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Space deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMySpaces,
  getSpaceById,
  createSpace,
  updateSpace,
  inviteUserToSpace,
  respondToInvitation,
  removeMember,
  deleteSpace
};
