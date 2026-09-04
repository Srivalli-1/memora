const prisma = require('../utils/prisma');
const { uploadImageToCloudinary, deleteImageFromCloudinary } = require('../services/cloudinaryService');

// Get timeline events
const getTimelineEvents = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { search, spaceId, startDate, endDate, mood, isShared } = req.query;

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
                { isShared: true },
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
          { location: { contains: search.trim(), mode: 'insensitive' } }
        ]
      });
    }

    if (spaceId) {
      where.AND.push({ sharedSpaceId: spaceId });
    }

    if (mood && mood !== 'ALL') {
      where.AND.push({ mood: { equals: mood, mode: 'insensitive' } });
    }

    if (isShared !== undefined) {
      where.AND.push({ isShared: isShared === 'true' });
    }

    if (startDate) {
      where.AND.push({ date: { gte: new Date(startDate) } });
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.AND.push({ date: { lte: end } });
    }

    const events = await prisma.timelineEvent.findMany({
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
      orderBy: { date: 'asc' } // Chronological order
    });

    return res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    next(error);
  }
};

// Create timeline event
const createTimelineEvent = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, description, date, time, location, mood, isShared, sharedSpaceId } = req.body;

    if (!title || !description || !date) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and date are required.'
      });
    }

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
          message: 'You must be a member of the space to post timeline events.'
        });
      }
    }

    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadRes = await uploadImageToCloudinary(file, 'timeline');
        if (uploadRes) {
          uploadedImages.push({
            url: uploadRes.url,
            publicId: uploadRes.publicId
          });
        }
      }
    }

    const event = await prisma.timelineEvent.create({
      data: {
        userId,
        title: title.trim(),
        description: description.trim(),
        date: new Date(date),
        time: time || null,
        location: location ? location.trim() : null,
        mood: mood ? mood.trim() : null,
        isShared: isShared === 'true' || isShared === true,
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

    return res.status(201).json({
      success: true,
      message: 'Timeline event created successfully.',
      event
    });
  } catch (error) {
    next(error);
  }
};

// Update timeline event
const updateTimelineEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, date, time, location, mood, isShared, sharedSpaceId, removeImageIds } = req.body;

    const existing = await prisma.timelineEvent.findUnique({
      where: { id },
      include: { images: true }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Timeline event not found.'
      });
    }

    if (existing.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit events you created.'
      });
    }

    // Handle image removal
    if (removeImageIds) {
      const idsToRemove = Array.isArray(removeImageIds) ? removeImageIds : JSON.parse(removeImageIds || '[]');
      for (const imgId of idsToRemove) {
        const img = existing.images.find((i) => i.id === imgId);
        if (img) {
          await deleteImageFromCloudinary(img.publicId);
          await prisma.timelineImage.delete({ where: { id: imgId } });
        }
      }
    }

    // Handle new images
    const newImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadRes = await uploadImageToCloudinary(file, 'timeline');
        if (uploadRes) {
          newImages.push({
            url: uploadRes.url,
            publicId: uploadRes.publicId
          });
        }
      }
    }

    const updated = await prisma.timelineEvent.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : undefined,
        description: description !== undefined ? description.trim() : undefined,
        date: date ? new Date(date) : undefined,
        time: time !== undefined ? time : undefined,
        location: location !== undefined ? location.trim() : undefined,
        mood: mood !== undefined ? mood.trim() : undefined,
        isShared: isShared !== undefined ? (isShared === 'true' || isShared === true) : undefined,
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
      message: 'Timeline event updated successfully.',
      event: updated
    });
  } catch (error) {
    next(error);
  }
};

// Delete timeline event
const deleteTimelineEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.timelineEvent.findUnique({
      where: { id },
      include: { images: true }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Timeline event not found.'
      });
    }

    if (existing.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete events you created.'
      });
    }

    for (const img of existing.images) {
      await deleteImageFromCloudinary(img.publicId);
    }

    await prisma.timelineEvent.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: 'Timeline event deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTimelineEvents,
  createTimelineEvent,
  updateTimelineEvent,
  deleteTimelineEvent
};
