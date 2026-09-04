const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const { uploadImageToCloudinary } = require('../services/cloudinaryService');

// Get profile & statistics
const getProfileAndStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        avatarUrl: true,
        bio: true,
        createdAt: true
      }
    });

    const [
      memoriesCount,
      diaryCount,
      timelineCount,
      spacesCount,
      commitmentsCount,
      lettersCount
    ] = await Promise.all([
      prisma.memory.count({ where: { userId } }),
      prisma.diaryEntry.count({ where: { userId } }),
      prisma.timelineEvent.count({ where: { userId } }),
      prisma.sharedSpaceMember.count({ where: { userId } }),
      prisma.commitmentParticipant.count({ where: { userId } }),
      prisma.letter.count({ where: { OR: [{ senderId: userId }, { recipientId: userId }] } })
    ]);

    return res.status(200).json({
      success: true,
      user,
      stats: {
        memoriesCount,
        diaryCount,
        timelineCount,
        spacesCount,
        commitmentsCount,
        lettersCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update profile details and/or avatar
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { fullName, bio } = req.body;

    let avatarUrl = undefined;
    if (req.file) {
      const uploadRes = await uploadImageToCloudinary(req.file, 'avatars');
      if (uploadRes) {
        avatarUrl = uploadRes.url;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: fullName !== undefined ? fullName.trim() : undefined,
        bio: bio !== undefined ? bio.trim() : undefined,
        avatarUrl
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        avatarUrl: true,
        bio: true,
        createdAt: true
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// Change password
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'All password fields are required.'
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Delete account
const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to confirm account deletion.'
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect password. Account deletion aborted.'
      });
    }

    // Delete user (cascades related memories, diary entries, etc. based on Prisma schema)
    await prisma.user.delete({ where: { id: userId } });

    return res.status(200).json({
      success: true,
      message: 'Your account and all associated data have been permanently deleted.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfileAndStats,
  updateProfile,
  changePassword,
  deleteAccount
};
