const User = require('../models/User');
const Joi = require('joi');
const { ErrorResponse } = require('../middleware/error');
const sanitize = require('mongo-sanitize');
const crypto = require('crypto');

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

    // Hash the provided token to check against the database
    const hashedToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    // Find user with the hashed refresh token and include the expiration field
    const user = await User.findOne({ 
      refreshToken: hashedToken,
      refreshTokenExpire: { $gt: Date.now() }
    }).select('+refreshToken +refreshTokenExpire');
    
    if (!user) {
      return next(new ErrorResponse('Invalid or expired refresh token', 401));
    }

    // Generate new tokens
    await sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// Helper function to get token and send response
const sendTokenResponse = async (user, statusCode, res) => {
  try {
    // Create token
    const token = user.getSignedJwtToken();
    
    // Create refresh token
    const refreshToken = user.getSignedRefreshToken();
    
    // Save refresh token to user
    await User.findByIdAndUpdate(user._id, { refreshToken: user.refreshToken }, { new: true });

    // Cookie options
    const cookieOptions = {
      httpOnly: true,
      // Expires in 30 days (or whatever JWT_EXPIRE is set to)
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000 || 30 * 24 * 60 * 60 * 1000
      )
    };

    // Set secure flag in production
    if (process.env.NODE_ENV === 'production') {
      cookieOptions.secure = true;
      cookieOptions.sameSite = 'strict';
    }

    // Set cookies
    res.cookie('token', token, cookieOptions);
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days for refresh token
    });

    // Return user details and tokens (tokens still returned for clients that don't use cookies)
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
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error generating authentication tokens'
    });
  }
};

// @desc    Logout user / clear refresh token
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { 
      refreshToken: null,
      refreshTokenExpire: null
    });
    
    // Clear cookies
    res.cookie('token', 'none', {
      httpOnly: true,
      expires: new Date(Date.now() + 10 * 1000) // Expires in 10 seconds
    });
    
    res.cookie('refreshToken', 'none', {
      httpOnly: true,
      expires: new Date(Date.now() + 10 * 1000)
    });
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
}; 