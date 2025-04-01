const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const { errorHandler } = require('./middleware/error');
const logger = require('./utils/logger');

// Load environment variables from the root directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration based on environment
const corsOptions = {
  origin: NODE_ENV === 'production' 
    ? process.env.CORS_ORIGIN || 'https://yourdomain.com' 
    : 'http://localhost:3000',
  credentials: true, // Allow cookies to be sent with requests
  maxAge: 86400 // CORS preflight request cache time (24 hours)
};
app.use(cors(corsOptions));

// Logging middleware - only use morgan in development
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Swagger documentation setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Todo List API',
      version: '1.0.0',
      description: 'A simple Todo List API with authentication',
    },
    servers: [
      {
        url: NODE_ENV === 'production' 
          ? process.env.API_URL || 'https://api.yourdomain.com' 
          : `http://localhost:${PORT}`,
      },
    ],
  },
  apis: [path.join(__dirname, './routes/*.js')],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to Todo List API. Visit /api-docs for documentation.');
});

// Error handler middleware (should be after routes)
app.use(errorHandler);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'up',
    environment: NODE_ENV,
    timestamp: new Date()
  });
});

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'JWT_EXPIRE'];
const missingEnvVars = requiredEnvVars.filter(env => !process.env[env]);

if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// MongoDB connection options
const mongoOptions = {
  // Built-in Mongoose options
  serverSelectionTimeoutMS: 5000, // Timeout after 5s
  maxPoolSize: 10, // Maintain up to 10 socket connections
};

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, mongoOptions)
  .then(() => {
    logger.info('Connected to MongoDB');
    // Start the server
    app.listen(PORT, () => {
      logger.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
    });
  })
  .catch(err => {
    logger.error(`Could not connect to MongoDB: ${err.message}`);
    process.exit(1);
  }); 