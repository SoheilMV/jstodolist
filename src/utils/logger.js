const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Environment-specific configuration
const isProd = process.env.NODE_ENV === 'production';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    if (stack) {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}\n${stack}`;
    }
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  })
);

// Create console transport with environment-specific settings
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    logFormat
  ),
  level: isProd ? 'info' : 'debug'
});

// Create file transports
const errorLogTransport = new winston.transports.File({
  filename: path.join(logsDir, isProd ? 'error.log' : 'dev-error.log'),
  level: 'error',
  maxsize: 10485760, // 10MB
  maxFiles: 5
});

const combinedLogTransport = new winston.transports.File({
  filename: path.join(logsDir, isProd ? 'combined.log' : 'dev-combined.log'),
  maxsize: 10485760, // 10MB
  maxFiles: 5
});

// Create logger with environment-specific configuration
const logger = winston.createLogger({
  level: isProd ? 'info' : 'debug',
  format: logFormat,
  transports: [
    consoleTransport,
    errorLogTransport,
    combinedLogTransport
  ],
  // Don't exit on handled exceptions
  exitOnError: false,
  // Silent in test environment
  silent: process.env.NODE_ENV === 'test'
});

// Add production-specific settings
if (isProd) {
  // Add detailed metadata for production debugging
  logger.format = winston.format.combine(
    winston.format.metadata(),
    logger.format
  );
}

module.exports = logger; 