const prisma = require('../utils/prisma');
const { uploadImageToCloudinary, deleteImageFromCloudinary } = require('../services/cloudinaryService');

// Get all diary entries for current user
const getDiaryEntries = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { search, mood, tag, startDate, endDate, month, year } = req.query;

    const where = {
      userId,
      AND: []
    };

    if (search && search.trim()) {
      where.AND.push({
        OR: [
          { title: { contains: search.trim(), mode: 'insensitive' } },
          { content: { contains: search.trim(), mode: 'insensitive' } },
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

    if (startDate) {
      where.AND.push({ date: { gte: new Date(startDate) } });
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.AND.push({ date: { lte: end } });
    }

    if (month && year) {
      const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
      where.AND.push({
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      });
    }

    const entries = await prisma.diaryEntry.findMany({
      where,
      include: {
        images: true
      },
      orderBy: { date: 'desc' }
    });

    return res.status(200).json({
      success: true,
      count: entries.length,
      entries
    });
  } catch (error) {
    next(error);
  }
};

// Get single diary entry by ID (strictly owner only)
const getDiaryEntryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const entry = await prisma.diaryEntry.findUnique({
      where: { id },
      include: {
        images: true
      }
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Diary entry not found.'
      });
    }

    if (entry.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this private diary entry.'
      });
    }

    return res.status(200).json({
      success: true,
      entry
    });
  } catch (error) {
    next(error);
  }
};

// Create new diary entry
const createDiaryEntry = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, content, date, mood, tags } = req.body;

    if (!title || !content || !date || !mood) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, date, and mood are required for diary entry.'
      });
    }

    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadRes = await uploadImageToCloudinary(file, 'diary');
        if (uploadRes) {
          uploadedImages.push({
            url: uploadRes.url,
            publicId: uploadRes.publicId
          });
        }
      }
    }

    const entry = await prisma.diaryEntry.create({
      data: {
        userId,
        title: title.trim(),
        content: content.trim(),
        date: new Date(date),
        mood: mood.trim(),
        tags: tags ? tags.trim() : '',
        images: {
          create: uploadedImages
        }
      },
      include: {
        images: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Diary entry saved successfully.',
      entry
    });
  } catch (error) {
    next(error);
  }
};

// Update diary entry
const updateDiaryEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, content, date, mood, tags, removeImageIds } = req.body;

    const existing = await prisma.diaryEntry.findUnique({
      where: { id },
      include: { images: true }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Diary entry not found.'
      });
    }

    if (existing.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own diary entries.'
      });
    }

    // Remove deleted images
    if (removeImageIds) {
      const idsToRemove = Array.isArray(removeImageIds) ? removeImageIds : JSON.parse(removeImageIds || '[]');
      for (const imgId of idsToRemove) {
        const img = existing.images.find((i) => i.id === imgId);
        if (img) {
          await deleteImageFromCloudinary(img.publicId);
          await prisma.diaryImage.delete({ where: { id: imgId } });
        }
      }
    }

    // Add new images
    const newImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadRes = await uploadImageToCloudinary(file, 'diary');
        if (uploadRes) {
          newImages.push({
            url: uploadRes.url,
            publicId: uploadRes.publicId
          });
        }
      }
    }

    const updated = await prisma.diaryEntry.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : undefined,
        content: content !== undefined ? content.trim() : undefined,
        date: date ? new Date(date) : undefined,
        mood: mood !== undefined ? mood.trim() : undefined,
        tags: tags !== undefined ? tags.trim() : undefined,
        images: newImages.length > 0 ? { create: newImages } : undefined
      },
      include: {
        images: true
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Diary entry updated successfully.',
      entry: updated
    });
  } catch (error) {
    next(error);
  }
};

// Delete diary entry
const deleteDiaryEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.diaryEntry.findUnique({
      where: { id },
      include: { images: true }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Diary entry not found.'
      });
    }

    if (existing.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own diary entries.'
      });
    }

    for (const img of existing.images) {
      await deleteImageFromCloudinary(img.publicId);
    }

    await prisma.diaryEntry.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: 'Diary entry deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Delete single image from a diary entry
const deleteDiaryImage = async (req, res, next) => {
  try {
    const { id, imageId } = req.params;
    const userId = req.user.id;

    const entry = await prisma.diaryEntry.findUnique({
      where: { id },
      include: { images: true }
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Diary entry not found.'
      });
    }

    if (entry.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own diary entries.'
      });
    }

    const image = entry.images.find((img) => img.id === imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found in this diary entry.'
      });
    }

    if (image.publicId) {
      await deleteImageFromCloudinary(image.publicId);
    }

    await prisma.diaryImage.delete({
      where: { id: imageId }
    });

    return res.status(200).json({
      success: true,
      message: 'Image removed from diary entry.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDiaryEntries,
  getDiaryEntryById,
  createDiaryEntry,
  updateDiaryEntry,
  deleteDiaryEntry,
  deleteDiaryImage
};
