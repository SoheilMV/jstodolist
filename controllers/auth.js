const User = require('../models/User');
const Joi = require('joi');
const { ErrorResponse } = require('../middleware/error');
const sanitize = require('mongo-sanitize');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    // Validation schema
    const schema = Joi.object({
      name: Joi.string().required().max(50),
      email: Joi.string().required().email(),
      password: Joi.string().required().min(6)
    });

    // Validate request body
    const { error } = schema.validate(req.body);
    if (error) {
      return next(new ErrorResponse(error.details[0].message, 400));
    }

    // Sanitize inputs
    const name = sanitize(req.body.name);
    const email = sanitize(req.body.email);
    const password = sanitize(req.body.password);

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new ErrorResponse('User already exists', 400));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate token
    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    // Validation schema
    const schema = Joi.object({
      email: Joi.string().required().email(),
      password: Joi.string().required()
    });

    // Validate request body
    const { error } = schema.validate(req.body);
    if (error) {
      return next(new ErrorResponse(error.details[0].message, 400));
    }

    // Sanitize inputs
    const email = sanitize(req.body.email);
    const password = sanitize(req.body.password);

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Generate token
    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new ErrorResponse('No refresh token provided', 400));
    }

    // Verify refresh token
    const user = await User.findOne({ refreshToken });
    if (!user) {
      return next(new ErrorResponse('Invalid refresh token', 401));
    }

    // Generate new tokens
    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// Helper function to get token and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();
  
  // Create refresh token
  const refreshToken = user.getSignedRefreshToken();
  
  // Save refresh token to user
  User.findByIdAndUpdate(user._id, { refreshToken }, { new: true }).exec();

  res.status(statusCode).json({
    success: true,
    token,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  });
}; 