import './config/env.js';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import taskRoutes from './routes/tasks.js';
import noteRoutes from './routes/notes.js';
import chatbotRoutes from './routes/chatbot.js';
import pomodoroRoutes from './routes/pomodoro.js';
import timetableRoutes from './routes/timetable.js';
import { connectDB } from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({ 
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SmartStudy API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/pomodoro', pomodoroRoutes);
app.use('/api/timetable', timetableRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Connect to database and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n[SUCCESS] Server running in ${process.env.NODE_ENV} mode`);
      console.log(`[INFO] API available at http://localhost:${PORT}`);
      console.log(`[INFO] Database connected`);
      console.log(`\n[INFO] Available endpoints:`);
      console.log(`   - POST   /api/auth/signup`);
      console.log(`   - POST   /api/auth/login`);
      console.log(`   - GET    /api/auth/me`);
      console.log(`   - GET    /api/events`);
      console.log(`   - GET    /api/tasks`);
      console.log(`   - GET    /api/notes`);
      console.log(`   - POST   /api/chatbot`);
      console.log(`   - GET    /api/pomodoro/sessions`);
      console.log(`   - GET    /api/timetable/active`);
      console.log(`\n[SUCCESS] Ready to accept requests!\n`);
    });
  })
  .catch((e) => {
    console.error('[ERROR] Failed to connect to database:', e.message);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[ERROR] Unhandled Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[ERROR] Uncaught Exception:', err);
  process.exit(1);
});
