require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/authRoutes');
const memoryRoutes = require('./routes/memoryRoutes');
const diaryRoutes = require('./routes/diaryRoutes');
const timelineRoutes = require('./routes/timelineRoutes');
const letterRoutes = require('./routes/letterRoutes');
const sharedSpaceRoutes = require('./routes/sharedSpaceRoutes');
const commitmentRoutes = require('./routes/commitmentRoutes');
const gameRoutes = require('./routes/gameRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests from client or when no origin (like mobile/curl/postman)
      callback(null, true);
    },
    credentials: true
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads serving
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    app: 'MEMORA API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/diary', diaryRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/letters', letterRoutes);
app.use('/api/spaces', sharedSpaceRoutes);
app.use('/api/commitments', commitmentRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

// 404 Handler for API
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found.`
  });
});

// Centralized error handling
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`✨ MEMORA Server running smoothly on http://localhost:${PORT}`);
});

module.exports = app;
