const logger = require('../utils/logger');

// Custom error response class
class ErrorResponse extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.errorCode = err.errorCode;

  // Log error for debugging
  if (error.statusCode >= 500) {
    logger.error(`${err.name}: ${err.message}`, { stack: err.stack, path: req.originalUrl });
  } else {
    logger.warn(`${err.name}: ${err.message}`, { path: req.originalUrl });
  }
  
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new ErrorResponse(message, 404, 'RESOURCE_NOT_FOUND');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400, 'DUPLICATE_VALUE');
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ErrorResponse(message, 400, 'VALIDATION_ERROR');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ErrorResponse('Invalid token', 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    error = new ErrorResponse('Token expired', 401, 'TOKEN_EXPIRED');
  }

  // Default error message for production
  const isProd = process.env.NODE_ENV === 'production';
  const responseMessage = error.statusCode >= 500 && isProd
    ? 'Server Error'
    : error.message;

  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      message: responseMessage,
      code: error.errorCode || 'SERVER_ERROR',
      ...(isProd ? {} : { trace: err.stack })
    }
  });
};

module.exports = {
  ErrorResponse,
  errorHandler
}; 