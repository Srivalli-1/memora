require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server: SocketIOServer } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const memoryRoutes = require('./routes/memoryRoutes');
const diaryRoutes = require('./routes/diaryRoutes');
const timelineRoutes = require('./routes/timelineRoutes');
const letterRoutes = require('./routes/letterRoutes');
const sharedSpaceRoutes = require('./routes/sharedSpaceRoutes');
const commitmentRoutes = require('./routes/commitmentRoutes');
const gameRoutes = require('./routes/gameRoutes');
const gameRoomRoutes = require('./routes/gameRoomRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();
const server = http.createServer(app);
const CLIENT_URLS = (process.env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);
const LOCAL_ORIGINS = new Set([
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5000'
]);
const NETLIFY_MAIN_ORIGIN = 'https://chipper-conkies-fd728b.netlify.app';
const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (CLIENT_URLS.includes(origin) || LOCAL_ORIGINS.has(origin) || origin === NETLIFY_MAIN_ORIGIN) {
    return true;
  }

  try {
    const url = new URL(origin);
    return url.protocol === 'https:' && url.hostname.endsWith('.netlify.app');
  } catch {
    return false;
  }
};
const corsOptions = {
  origin: (origin, callback) => {
    callback(null, isAllowedOrigin(origin));
  },
  credentials: true,
  optionsSuccessStatus: 204
};

const io = new SocketIOServer(server, {
  cors: corsOptions
});

const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MEMORA Backend API is running successfully'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy'
  });
});

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
app.use('/api/game-rooms', gameRoomRoutes);
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

// Socket.IO Event Handlers for Game Rooms
io.on('connection', (socket) => {
  console.log(`✨ User connected: ${socket.id}`);

  // Join a game room
  socket.on('game:join', async (data) => {
    const { gameRoomId, userId } = data;
    const roomName = `game-${gameRoomId}`;
    socket.join(roomName);
    
    // Notify others that a player joined
    io.to(roomName).emit('game:player-joined', {
      userId,
      timestamp: new Date()
    });
    
    console.log(`User ${userId} joined game room ${gameRoomId}`);
  });

  // Player submits answer
  socket.on('game:answer-submitted', async (data) => {
    const { gameRoomId, userId, answer, questionIndex } = data;
    const roomName = `game-${gameRoomId}`;
    
    // Broadcast answer to all players in the room
    io.to(roomName).emit('game:answer-received', {
      userId,
      answer,
      questionIndex,
      timestamp: new Date()
    });
  });

  // Move to next question
  socket.on('game:next-question', async (data) => {
    const { gameRoomId, questionIndex } = data;
    const roomName = `game-${gameRoomId}`;
    
    io.to(roomName).emit('game:question-changed', {
      questionIndex,
      timestamp: new Date()
    });
  });

  // Game completed
  socket.on('game:complete', async (data) => {
    const { gameRoomId, results } = data;
    const roomName = `game-${gameRoomId}`;
    
    io.to(roomName).emit('game:completed', {
      results,
      timestamp: new Date()
    });
  });

  // Leave game room
  socket.on('game:leave', (data) => {
    const { gameRoomId } = data;
    const roomName = `game-${gameRoomId}`;
    socket.leave(roomName);
    
    io.to(roomName).emit('game:player-left', {
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log(`✨ User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`✨ MEMORA Server running smoothly on http://localhost:${PORT}`);
});

module.exports = app;
