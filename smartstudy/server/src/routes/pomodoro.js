import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { body, param } from 'express-validator';
import { validate, idValidation } from '../middleware/validators.js';
import PomodoroSession from '../models/PomodoroSession.js';
import Task from '../models/Task.js';

const router = express.Router();
router.use(requireAuth);

/**
 * Pomodoro session validation
 */
const createSessionValidation = [
  body('sessionType')
    .isIn(['work', 'short-break', 'long-break'])
    .withMessage('Invalid session type'),
  body('duration')
    .isInt({ min: 1, max: 120 })
    .withMessage('Duration must be between 1 and 120 minutes'),
  body('startTime')
    .isISO8601()
    .withMessage('Invalid start time'),
  body('endTime')
    .isISO8601()
    .withMessage('Invalid end time'),
  body('relatedTaskId')
    .optional()
    .isMongoId()
    .withMessage('Invalid task ID'),
  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed must be a boolean'),
  validate
];

/**
 * @route   GET /api/pomodoro/sessions
 * @desc    Get pomodoro session history
 * @access  Private
 */
router.get('/sessions', asyncHandler(async (req, res) => {
  const { limit = 50, startDate, endDate, sessionType } = req.query;
  const query = { userId: req.userId };

  if (startDate || endDate) {
    query.startTime = {};
    if (startDate) query.startTime.$gte = new Date(startDate);
    if (endDate) query.startTime.$lte = new Date(endDate);
  }

  if (sessionType) {
    query.sessionType = sessionType;
  }

  const sessions = await PomodoroSession.find(query)
    .sort({ startTime: -1 })
    .limit(parseInt(limit))
    .populate('relatedTaskId', 'title');

  res.json({
    success: true,
    count: sessions.length,
    sessions
  });
}));

/**
 * @route   POST /api/pomodoro/sessions
 * @desc    Create/log a pomodoro session
 * @access  Private
 */
router.post('/sessions', createSessionValidation, asyncHandler(async (req, res) => {
  const session = await PomodoroSession.create({
    ...req.body,
    userId: req.userId
  });

  // If session is completed and linked to a task, increment pomodoro count
  if (session.completed && session.relatedTaskId && session.sessionType === 'work') {
    await Task.findByIdAndUpdate(session.relatedTaskId, {
      $inc: { pomodoroCount: 1 }
    });
  }

  res.status(201).json({
    success: true,
    session
  });
}));

/**
 * @route   PUT /api/pomodoro/sessions/:id
 * @desc    Update a pomodoro session (e.g., mark as completed/interrupted)
 * @access  Private
 */
router.put('/sessions/:id', idValidation, asyncHandler(async (req, res) => {
  const oldSession = await PomodoroSession.findOne({
    _id: req.params.id,
    userId: req.userId
  });

  if (!oldSession) {
    return res.status(404).json({
      success: false,
      error: 'Session not found'
    });
  }

  const session = await PomodoroSession.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true, runValidators: true }
  );

  // If session just became completed and has a task, increment pomodoro count
  if (!oldSession.completed && session.completed && session.relatedTaskId && session.sessionType === 'work') {
    await Task.findByIdAndUpdate(session.relatedTaskId, {
      $inc: { pomodoroCount: 1 }
    });
  }

  res.json({
    success: true,
    session
  });
}));

/**
 * @route   GET /api/pomodoro/statistics
 * @desc    Get pomodoro statistics
 * @access  Private
 */
router.get('/statistics', asyncHandler(async (req, res) => {
  const { period = '7d' } = req.query;
  
  let startDate = new Date();
  if (period === '7d') {
    startDate.setDate(startDate.getDate() - 7);
  } else if (period === '30d') {
    startDate.setDate(startDate.getDate() - 30);
  } else if (period === '90d') {
    startDate.setDate(startDate.getDate() - 90);
  }

  const sessions = await PomodoroSession.find({
    userId: req.userId,
    startTime: { $gte: startDate }
  });

  const stats = {
    total: sessions.length,
    completed: sessions.filter(s => s.completed).length,
    interrupted: sessions.filter(s => !s.completed).length,
    totalMinutes: sessions.reduce((sum, s) => sum + s.duration, 0),
    byType: {
      work: sessions.filter(s => s.sessionType === 'work').length,
      shortBreak: sessions.filter(s => s.sessionType === 'short-break').length,
      longBreak: sessions.filter(s => s.sessionType === 'long-break').length
    },
    averageDuration: sessions.length > 0 
      ? Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length)
      : 0
  };

  res.json({
    success: true,
    period,
    stats
  });
}));

/**
 * @route   GET /api/pomodoro/settings
 * @desc    Get user's pomodoro settings
 * @access  Private
 */
router.get('/settings', asyncHandler(async (req, res) => {
  const User = (await import('../models/User.js')).default;
  const user = await User.findById(req.userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  res.json({
    success: true,
    settings: user.preferences.pomodoroSettings
  });
}));

/**
 * @route   PUT /api/pomodoro/settings
 * @desc    Update pomodoro settings
 * @access  Private
 */
router.put('/settings', asyncHandler(async (req, res) => {
  const User = (await import('../models/User.js')).default;
  const { workDuration, shortBreak, longBreak, sessionsBeforeLongBreak } = req.body;

  const updates = {};
  if (workDuration !== undefined) {
    updates['preferences.pomodoroSettings.workDuration'] = workDuration;
  }
  if (shortBreak !== undefined) {
    updates['preferences.pomodoroSettings.shortBreak'] = shortBreak;
  }
  if (longBreak !== undefined) {
    updates['preferences.pomodoroSettings.longBreak'] = longBreak;
  }
  if (sessionsBeforeLongBreak !== undefined) {
    updates['preferences.pomodoroSettings.sessionsBeforeLongBreak'] = sessionsBeforeLongBreak;
  }

  const user = await User.findByIdAndUpdate(
    req.userId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  res.json({
    success: true,
    settings: user.preferences.pomodoroSettings
  });
}));

export default router;
