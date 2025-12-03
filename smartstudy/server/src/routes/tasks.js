import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  createTaskValidation,
  updateTaskValidation,
  idValidation
} from '../middleware/validators.js';
import Task from '../models/Task.js';

const router = express.Router();
router.use(requireAuth);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for the current user
 * @access  Private
 */
router.get('/', asyncHandler(async (req, res) => {
  const { status, priority, courseCode } = req.query;
  const query = { userId: req.userId };

  if (status === 'completed') {
    query.done = true;
  } else if (status === 'pending') {
    query.done = false;
  }

  if (priority) {
    query.priority = priority;
  }

  if (courseCode) {
    query.relatedCourseCode = courseCode;
  }

  const tasks = await Task.find(query)
    .sort({ done: 1, priority: -1, due: 1, createdAt: -1 })
    .populate('relatedEventId', 'title start end');

  res.json({
    success: true,
    count: tasks.length,
    tasks
  });
}));

/**
 * @route   GET /api/tasks/:id
 * @desc    Get single task
 * @access  Private
 */
router.get('/:id', idValidation, asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    userId: req.userId
  }).populate('relatedEventId', 'title start end');

  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  res.json({
    success: true,
    task
  });
}));

/**
 * @route   POST /api/tasks
 * @desc    Create new task
 * @access  Private
 */
router.post('/', createTaskValidation, asyncHandler(async (req, res) => {
  const task = await Task.create({
    ...req.body,
    userId: req.userId
  });

  res.status(201).json({
    success: true,
    task
  });
}));

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task
 * @access  Private
 */
router.put('/:id', updateTaskValidation, asyncHandler(async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  res.json({
    success: true,
    task
  });
}));

/**
 * @route   PATCH /api/tasks/:id/toggle
 * @desc    Toggle task completion status
 * @access  Private
 */
router.patch('/:id/toggle', idValidation, asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    userId: req.userId
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  task.done = !task.done;
  await task.save();

  res.json({
    success: true,
    task
  });
}));

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task
 * @access  Private
 */
router.delete('/:id', idValidation, asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  res.json({
    success: true,
    message: 'Task deleted successfully',
    id: req.params.id
  });
}));

/**
 * @route   GET /api/tasks/statistics
 * @desc    Get task statistics
 * @access  Private
 */
router.get('/stats/summary', asyncHandler(async (req, res) => {
  const tasks = await Task.find({ userId: req.userId });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.done).length,
    pending: tasks.filter(t => !t.done).length,
    overdue: tasks.filter(t => !t.done && t.due && new Date(t.due) < new Date()).length,
    byPriority: {
      high: tasks.filter(t => !t.done && t.priority === 'high').length,
      medium: tasks.filter(t => !t.done && t.priority === 'medium').length,
      low: tasks.filter(t => !t.done && t.priority === 'low').length
    }
  };

  res.json({
    success: true,
    stats
  });
}));

export default router;
