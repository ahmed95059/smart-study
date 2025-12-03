import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { body } from 'express-validator';
import { validate, idValidation } from '../middleware/validators.js';
import Timetable from '../models/Timetable.js';

const router = express.Router();
router.use(requireAuth);

/**
 * Timetable validation
 */
const createTimetableValidation = [
  body('semester')
    .trim()
    .notEmpty()
    .withMessage('Semester is required')
    .isLength({ max: 50 })
    .withMessage('Semester cannot exceed 50 characters'),
  body('courses')
    .isArray()
    .withMessage('Courses must be an array'),
  body('courses.*.courseCode')
    .trim()
    .notEmpty()
    .withMessage('Course code is required'),
  body('courses.*.courseName')
    .trim()
    .notEmpty()
    .withMessage('Course name is required'),
  validate
];

/**
 * @route   GET /api/timetable
 * @desc    Get all timetables for the current user
 * @access  Private
 */
router.get('/', asyncHandler(async (req, res) => {
  const timetables = await Timetable.find({ userId: req.userId }).sort({ isActive: -1, createdAt: -1 });

  res.json({
    success: true,
    count: timetables.length,
    timetables
  });
}));

/**
 * @route   GET /api/timetable/active
 * @desc    Get active timetable
 * @access  Private
 */
router.get('/active', asyncHandler(async (req, res) => {
  const timetable = await Timetable.findOne({
    userId: req.userId,
    isActive: true
  });

  if (!timetable) {
    return res.status(404).json({
      success: false,
      error: 'No active timetable found'
    });
  }

  res.json({
    success: true,
    timetable
  });
}));

/**
 * @route   GET /api/timetable/:id
 * @desc    Get single timetable
 * @access  Private
 */
router.get('/:id', idValidation, asyncHandler(async (req, res) => {
  const timetable = await Timetable.findOne({
    _id: req.params.id,
    userId: req.userId
  });

  if (!timetable) {
    return res.status(404).json({
      success: false,
      error: 'Timetable not found'
    });
  }

  res.json({
    success: true,
    timetable
  });
}));

/**
 * @route   POST /api/timetable
 * @desc    Create new timetable
 * @access  Private
 */
router.post('/', createTimetableValidation, asyncHandler(async (req, res) => {
  const timetable = await Timetable.create({
    ...req.body,
    userId: req.userId
  });

  res.status(201).json({
    success: true,
    timetable
  });
}));

/**
 * @route   PUT /api/timetable/:id
 * @desc    Update timetable
 * @access  Private
 */
router.put('/:id', idValidation, asyncHandler(async (req, res) => {
  const timetable = await Timetable.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!timetable) {
    return res.status(404).json({
      success: false,
      error: 'Timetable not found'
    });
  }

  res.json({
    success: true,
    timetable
  });
}));

/**
 * @route   PATCH /api/timetable/:id/activate
 * @desc    Set timetable as active
 * @access  Private
 */
router.patch('/:id/activate', idValidation, asyncHandler(async (req, res) => {
  const timetable = await Timetable.findOne({
    _id: req.params.id,
    userId: req.userId
  });

  if (!timetable) {
    return res.status(404).json({
      success: false,
      error: 'Timetable not found'
    });
  }

  timetable.isActive = true;
  await timetable.save(); // Pre-save hook will deactivate others

  res.json({
    success: true,
    timetable
  });
}));

/**
 * @route   DELETE /api/timetable/:id
 * @desc    Delete timetable
 * @access  Private
 */
router.delete('/:id', idValidation, asyncHandler(async (req, res) => {
  const timetable = await Timetable.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId
  });

  if (!timetable) {
    return res.status(404).json({
      success: false,
      error: 'Timetable not found'
    });
  }

  res.json({
    success: true,
    message: 'Timetable deleted successfully',
    id: req.params.id
  });
}));

export default router;
