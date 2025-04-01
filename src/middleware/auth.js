const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ErrorResponse } = require('./error');
const logger = require('../utils/logger');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in cookies first
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } 
  // If no cookie, check authorization header
  else if (req.headers.authorization) {
    // Handle both Bearer token and raw token formats
    if (req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else {
      token = req.headers.authorization;
    }
  }

  // Check if token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Set user to req.user
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 401));
    }

    req.user = user;
    next();
  } catch (err) {
    logger.error(`Auth error: ${err.message}`);
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
}; 