import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  createEventValidation,
  updateEventValidation,
  idValidation,
  dateRangeValidation
} from '../middleware/validators.js';
import Event from '../models/Event.js';

const router = express.Router();
router.use(requireAuth);

/**
 * @route   GET /api/events
 * @desc    Get all events for the current user
 * @access  Private
 */
router.get('/', dateRangeValidation, asyncHandler(async (req, res) => {
  const { start, end } = req.query;
  const query = { userId: req.userId };

  if (start && end) {
    query.$or = [
      { start: { $gte: new Date(start), $lte: new Date(end) } },
      { end: { $gte: new Date(start), $lte: new Date(end) } }
    ];
  }

  const events = await Event.find(query).sort({ start: 1 });

  res.json({
    success: true,
    count: events.length,
    events
  });
}));

/**
 * @route   GET /api/events/:id
 * @desc    Get single event
 * @access  Private
 */
router.get('/:id', idValidation, asyncHandler(async (req, res) => {
  const event = await Event.findOne({
    _id: req.params.id,
    userId: req.userId
  });

  if (!event) {
    return res.status(404).json({
      success: false,
      error: 'Event not found'
    });
  }

  res.json({
    success: true,
    event
  });
}));

/**
 * @route   POST /api/events
 * @desc    Create new event
 * @access  Private
 */
router.post('/', createEventValidation, asyncHandler(async (req, res) => {
  const event = await Event.create({
    ...req.body,
    userId: req.userId
  });

  res.status(201).json({
    success: true,
    event
  });
}));

/**
 * @route   PUT /api/events/:id
 * @desc    Update event
 * @access  Private
 */
router.put('/:id', updateEventValidation, asyncHandler(async (req, res) => {
  const event = await Event.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!event) {
    return res.status(404).json({
      success: false,
      error: 'Event not found'
    });
  }

  res.json({
    success: true,
    event
  });
}));

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete event
 * @access  Private
 */
router.delete('/:id', idValidation, asyncHandler(async (req, res) => {
  const event = await Event.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId
  });

  if (!event) {
    return res.status(404).json({
      success: false,
      error: 'Event not found'
    });
  }

  res.json({
    success: true,
    message: 'Event deleted successfully',
    id: req.params.id
  });
}));

export default router;
