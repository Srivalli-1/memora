const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const { generateToken } = require('../utils/jwt');

const signup = async (req, res, next) => {
  try {
    const { fullName, username, email, password, confirmPassword } = req.body;

    if (!fullName || !username || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const trimmedUsername = username.trim().toLowerCase();
    const trimmedEmail = email.trim().toLowerCase();

    // Check existing username
    const existingUsername = await prisma.user.findUnique({
      where: { username: trimmedUsername }
    });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken.'
      });
    }

    // Check existing email
    const existingEmail = await prisma.user.findUnique({
      where: { email: trimmedEmail }
    });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email address is already registered.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        username: trimmedUsername,
        email: trimmedEmail,
        password: hashedPassword
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

    // Create welcome notification
    await prisma.notification.create({
      data: {
        userId: newUser.id,
        title: 'Welcome to MEMORA ✨',
        message: 'Begin preserving your treasured memories, thoughts, and connections.',
        type: 'ACTIVITY'
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Please log in.',
      user: newUser
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/Username and password are required.'
      });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Find user by either email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier },
          { username: cleanIdentifier }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password.'
      });
    }

    const token = generateToken(user.id);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    next(error);
  }
};

const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.status(200).json({ success: true, users: [] });
    }

    const query = q.trim().toLowerCase();
    const users = await prisma.user.findMany({
      where: {
        id: { not: req.user.id },
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { fullName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        avatarUrl: true
      },
      take: 10
    });

    return res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  getMe,
  logout,
  searchUsers
};
