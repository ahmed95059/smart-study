/**
 * Request validation middleware using express-validator
 */
import { body, param, query, validationResult } from 'express-validator';

/**
 * Middleware to check validation result
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Auth validation rules
 */
export const signupValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),
  validate
];

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate
];

/**
 * Event validation rules
 */
export const createEventValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('start')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Invalid start date format'),
  body('end')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('Invalid end date format')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.start)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('type')
    .optional()
    .isIn(['event', 'course']).withMessage('Type must be "event" or "course"'),
  body('allDay')
    .optional()
    .isBoolean().withMessage('allDay must be a boolean'),
  body('courseCode')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Course code cannot exceed 20 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Location cannot exceed 100 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
  validate
];

export const updateEventValidation = [
  param('id').isMongoId().withMessage('Invalid event ID'),
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('start')
    .optional()
    .isISO8601().withMessage('Invalid start date format'),
  body('end')
    .optional()
    .isISO8601().withMessage('Invalid end date format'),
  body('type')
    .optional()
    .isIn(['event', 'course']).withMessage('Type must be "event" or "course"'),
  body('allDay')
    .optional()
    .isBoolean().withMessage('allDay must be a boolean'),
  validate
];

/**
 * Task validation rules
 */
export const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('due')
    .optional()
    .isISO8601().withMessage('Invalid due date format'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
  body('done')
    .optional()
    .isBoolean().withMessage('done must be a boolean'),
  validate
];

export const updateTaskValidation = [
  param('id').isMongoId().withMessage('Invalid task ID'),
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('done')
    .optional()
    .isBoolean().withMessage('done must be a boolean'),
  body('due')
    .optional()
    .isISO8601().withMessage('Invalid due date format'),
  validate
];

/**
 * Note validation rules
 */
export const createNoteValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ max: 50000 }).withMessage('Content cannot exceed 50,000 characters'),
  validate
];

export const updateNoteValidation = [
  param('id').isMongoId().withMessage('Invalid note ID'),
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ max: 50000 }).withMessage('Content cannot exceed 50,000 characters'),
  validate
];

/**
 * ID validation
 */
export const idValidation = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  validate
];

/**
 * Date range validation for queries
 */
export const dateRangeValidation = [
  query('start')
    .optional()
    .isISO8601().withMessage('Invalid start date format'),
  query('end')
    .optional()
    .isISO8601().withMessage('Invalid end date format'),
  validate
];
