import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  createNoteValidation,
  updateNoteValidation,
  idValidation
} from '../middleware/validators.js';
import Note from '../models/Note.js';

const router = express.Router();
router.use(requireAuth);

/**
 * @route   GET /api/notes
 * @desc    Get all notes for the current user
 * @access  Private
 */
router.get('/', asyncHandler(async (req, res) => {
  const { courseCode, tag, folder, pinned } = req.query;
  const query = { userId: req.userId };

  if (courseCode) {
    query.relatedCourseCode = courseCode;
  }

  if (tag) {
    query.tags = tag;
  }

  if (folder) {
    query.folder = folder;
  }

  if (pinned !== undefined) {
    query.isPinned = pinned === 'true';
  }

  const notes = await Note.find(query).sort({ isPinned: -1, updatedAt: -1 });

  res.json({
    success: true,
    count: notes.length,
    notes
  });
}));

/**
 * @route   GET /api/notes/search
 * @desc    Search notes by title and content
 * @access  Private
 */
router.get('/search', asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      error: 'Search query is required'
    });
  }

  const notes = await Note.find({
    userId: req.userId,
    $text: { $search: q }
  }, {
    score: { $meta: 'textScore' }
  }).sort({
    score: { $meta: 'textScore' }
  });

  res.json({
    success: true,
    count: notes.length,
    notes
  });
}));

/**
 * @route   GET /api/notes/:id
 * @desc    Get single note
 * @access  Private
 */
router.get('/:id', idValidation, asyncHandler(async (req, res) => {
  const note = await Note.findOne({
    _id: req.params.id,
    userId: req.userId
  });

  if (!note) {
    return res.status(404).json({
      success: false,
      error: 'Note not found'
    });
  }

  res.json({
    success: true,
    note
  });
}));

/**
 * @route   POST /api/notes
 * @desc    Create new note
 * @access  Private
 */
router.post('/', createNoteValidation, asyncHandler(async (req, res) => {
  const note = await Note.create({
    ...req.body,
    userId: req.userId
  });

  res.status(201).json({
    success: true,
    note
  });
}));

/**
 * @route   PUT /api/notes/:id
 * @desc    Update note
 * @access  Private
 */
router.put('/:id', updateNoteValidation, asyncHandler(async (req, res) => {
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!note) {
    return res.status(404).json({
      success: false,
      error: 'Note not found'
    });
  }

  res.json({
    success: true,
    note
  });
}));

/**
 * @route   PATCH /api/notes/:id/pin
 * @desc    Toggle note pin status
 * @access  Private
 */
router.patch('/:id/pin', idValidation, asyncHandler(async (req, res) => {
  const note = await Note.findOne({
    _id: req.params.id,
    userId: req.userId
  });

  if (!note) {
    return res.status(404).json({
      success: false,
      error: 'Note not found'
    });
  }

  note.isPinned = !note.isPinned;
  await note.save();

  res.json({
    success: true,
    note
  });
}));

/**
 * @route   DELETE /api/notes/:id
 * @desc    Delete note
 * @access  Private
 */
router.delete('/:id', idValidation, asyncHandler(async (req, res) => {
  const note = await Note.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId
  });

  if (!note) {
    return res.status(404).json({
      success: false,
      error: 'Note not found'
    });
  }

  res.json({
    success: true,
    message: 'Note deleted successfully',
    id: req.params.id
  });
}));

export default router;
