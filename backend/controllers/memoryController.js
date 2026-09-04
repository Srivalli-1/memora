const prisma = require('../utils/prisma');
const { uploadImageToCloudinary, deleteImageFromCloudinary } = require('../services/cloudinaryService');

// Get all memories accessible to current user
const getMemories = async (req, res, next) => {
  try {
    const { search, mood, tag, startDate, endDate, spaceId, privacy } = req.query;
    const userId = req.user.id;

    // Base condition: memories owned by user OR shared in a space the user is a member of
    const userSpaces = await prisma.sharedSpaceMember.findMany({
      where: { userId },
      select: { sharedSpaceId: true }
    });
    const spaceIds = userSpaces.map((s) => s.sharedSpaceId);

    const where = {
      AND: [
        {
          OR: [
            { userId },
            {
              AND: [
                { privacyStatus: 'SHARED' },
                { sharedSpaceId: { in: spaceIds } }
              ]
            }
          ]
        }
      ]
    };

    if (search && search.trim()) {
      where.AND.push({
        OR: [
          { title: { contains: search.trim(), mode: 'insensitive' } },
          { description: { contains: search.trim(), mode: 'insensitive' } },
          { location: { contains: search.trim(), mode: 'insensitive' } },
          { tags: { contains: search.trim(), mode: 'insensitive' } }
        ]
      });
    }

    if (mood && mood !== 'ALL') {
      where.AND.push({ mood: { equals: mood, mode: 'insensitive' } });
    }

    if (tag && tag.trim()) {
      where.AND.push({ tags: { contains: tag.trim(), mode: 'insensitive' } });
    }

    if (privacy && privacy !== 'ALL') {
      where.AND.push({ privacyStatus: privacy.toUpperCase() });
    }

    if (spaceId) {
      where.AND.push({ sharedSpaceId: spaceId });
    }

    if (startDate) {
      where.AND.push({ date: { gte: new Date(startDate) } });
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.AND.push({ date: { lte: end } });
    }

    const memories = await prisma.memory.findMany({
      where,
      include: {
        images: true,
        user: {
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
      orderBy: { date: 'desc' }
    });

    return res.status(200).json({
      success: true,
      count: memories.length,
      memories
    });
  } catch (error) {
    next(error);
  }
};

// Get single memory by ID
const getMemoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const memory = await prisma.memory.findUnique({
      where: { id },
      include: {
        images: true,
        user: {
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

    if (!memory) {
      return res.status(404).json({
        success: false,
        message: 'Memory not found.'
      });
    }

    // Access check: Owner or member of shared space
    if (memory.userId !== userId) {
      if (memory.privacyStatus !== 'SHARED' || !memory.sharedSpaceId) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this private memory.'
        });
      }

      const membership = await prisma.sharedSpaceMember.findUnique({
        where: {
          sharedSpaceId_userId: {
            sharedSpaceId: memory.sharedSpaceId,
            userId
          }
        }
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: 'You are not a member of the space where this memory was shared.'
        });
      }
    }

    return res.status(200).json({
      success: true,
      memory
    });
  } catch (error) {
    next(error);
  }
};

// Create a new memory
const createMemory = async (req, res, next) => {
  try {
    const { title, description, date, time, location, mood, tags, privacyStatus, sharedSpaceId } = req.body;
    const userId = req.user.id;

    if (!title || !description || !date || !mood) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, date, and mood are required.'
      });
    }

    // If shared to space, verify membership
    if (sharedSpaceId) {
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
          message: 'You must be a member of the space to post memories to it.'
        });
      }
    }

    // Process uploaded images
    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadRes = await uploadImageToCloudinary(file, 'memories');
        if (uploadRes) {
          uploadedImages.push({
            url: uploadRes.url,
            publicId: uploadRes.publicId
          });
        }
      }
    }

    const memory = await prisma.memory.create({
      data: {
        userId,
        title: title.trim(),
        description: description.trim(),
        date: new Date(date),
        time: time || null,
        location: location ? location.trim() : null,
        mood: mood.trim(),
        tags: tags ? tags.trim() : '',
        privacyStatus: privacyStatus === 'SHARED' ? 'SHARED' : 'PRIVATE',
        sharedSpaceId: sharedSpaceId || null,
        images: {
          create: uploadedImages
        }
      },
      include: {
        images: true,
        user: {
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
      }
    });

    // Notify shared space members if shared
    if (memory.privacyStatus === 'SHARED' && memory.sharedSpaceId) {
      const otherMembers = await prisma.sharedSpaceMember.findMany({
        where: {
          sharedSpaceId: memory.sharedSpaceId,
          userId: { not: userId }
        }
      });

      const notifications = otherMembers.map((m) => ({
        userId: m.userId,
        title: 'New Shared Memory 📸',
        message: `${req.user.fullName} added a new memory: "${memory.title}"`,
        type: 'NEW_SHARED_MEMORY',
        link: `/memories/${memory.id}`
      }));

      if (notifications.length > 0) {
        await prisma.notification.createMany({ data: notifications });
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Memory created successfully.',
      memory
    });
  } catch (error) {
    next(error);
  }
};

// Update memory
const updateMemory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, date, time, location, mood, tags, privacyStatus, sharedSpaceId, removeImageIds } = req.body;

    const existingMemory = await prisma.memory.findUnique({
      where: { id },
      include: { images: true }
    });

    if (!existingMemory) {
      return res.status(404).json({
        success: false,
        message: 'Memory not found.'
      });
    }

    if (existingMemory.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit memories you created.'
      });
    }

    // Handle removal of existing images
    if (removeImageIds) {
      const idsToRemove = Array.isArray(removeImageIds) ? removeImageIds : JSON.parse(removeImageIds || '[]');
      for (const imgId of idsToRemove) {
        const img = existingMemory.images.find((i) => i.id === imgId);
        if (img) {
          await deleteImageFromCloudinary(img.publicId);
          await prisma.memoryImage.delete({ where: { id: imgId } });
        }
      }
    }

    // Handle upload of new images
    const newImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadRes = await uploadImageToCloudinary(file, 'memories');
        if (uploadRes) {
          newImages.push({
            url: uploadRes.url,
            publicId: uploadRes.publicId
          });
        }
      }
    }

    const updated = await prisma.memory.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : undefined,
        description: description !== undefined ? description.trim() : undefined,
        date: date ? new Date(date) : undefined,
        time: time !== undefined ? time : undefined,
        location: location !== undefined ? location.trim() : undefined,
        mood: mood !== undefined ? mood.trim() : undefined,
        tags: tags !== undefined ? tags.trim() : undefined,
        privacyStatus: privacyStatus ? (privacyStatus === 'SHARED' ? 'SHARED' : 'PRIVATE') : undefined,
        sharedSpaceId: sharedSpaceId !== undefined ? (sharedSpaceId || null) : undefined,
        images: newImages.length > 0 ? { create: newImages } : undefined
      },
      include: {
        images: true,
        user: {
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
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Memory updated successfully.',
      memory: updated
    });
  } catch (error) {
    next(error);
  }
};

// Delete memory
const deleteMemory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const memory = await prisma.memory.findUnique({
      where: { id },
      include: { images: true }
    });

    if (!memory) {
      return res.status(404).json({
        success: false,
        message: 'Memory not found.'
      });
    }

    if (memory.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own memories.'
      });
    }

    // Clean up images
    for (const image of memory.images) {
      await deleteImageFromCloudinary(image.publicId);
    }

    await prisma.memory.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: 'Memory deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Delete single image from a memory
const deleteMemoryImage = async (req, res, next) => {
  try {
    const { id, imageId } = req.params;
    const userId = req.user.id;

    const memory = await prisma.memory.findUnique({
      where: { id },
      include: { images: true }
    });

    if (!memory) {
      return res.status(404).json({
        success: false,
        message: 'Memory not found.'
      });
    }

    if (memory.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own memories.'
      });
    }

    const image = memory.images.find((img) => img.id === imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found in this memory.'
      });
    }

    if (image.publicId) {
      await deleteImageFromCloudinary(image.publicId);
    }

    await prisma.memoryImage.delete({
      where: { id: imageId }
    });

    return res.status(200).json({
      success: true,
      message: 'Image removed from memory.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMemories,
  getMemoryById,
  createMemory,
  updateMemory,
  deleteMemory,
  deleteMemoryImage
};
