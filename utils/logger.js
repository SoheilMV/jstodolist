const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  })
);

// Create console transport
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    logFormat
  )
});

// Create file transports
const errorLogTransport = new winston.transports.File({
  filename: path.join('logs', 'error.log'),
  level: 'error'
});

const combinedLogTransport = new winston.transports.File({
  filename: path.join('logs', 'combined.log')
});

// Create logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    consoleTransport,
    errorLogTransport,
    combinedLogTransport
  ],
  exitOnError: false
});

module.exports = logger; 