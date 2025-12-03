import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { signupValidation, loginValidation } from '../middleware/validators.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

/**
 * @route   POST /api/auth/signup
 * @desc    Register new user
 * @access  Public
 */
router.post('/signup', signupValidation, asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: 'Email already registered'
    });
  }

  // Create user
  const user = await User.create({ name, email, password });

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      preferences: user.preferences
    }
  });
}));

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginValidation, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and explicitly select password
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  // Generate token
  const token = generateToken(user._id);

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      preferences: user.preferences
    }
  });
}));

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  res.json({
    success: true,
    user
  });
}));

/**
 * @route   PUT /api/auth/me
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/me', requireAuth, asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'profilePicture', 'preferences'];
  const updates = {};

  // Filter allowed fields
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.userId,
    updates,
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
    user
  });
}));

/**
 * @route   PUT /api/auth/password
 * @desc    Change password
 * @access  Private
 */
router.put('/password', requireAuth, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      error: 'Current password and new password are required'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'New password must be at least 6 characters'
    });
  }

  // Get user with password
  const user = await User.findById(req.userId).select('+password');

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // Verify current password
  const isValid = await user.comparePassword(currentPassword);

  if (!isValid) {
    return res.status(401).json({
      success: false,
      error: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password updated successfully'
  });
}));

export default router;
