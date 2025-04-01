const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
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

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));

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
        url: `http://localhost:${PORT}`,
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

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'JWT_EXPIRE'];
const missingEnvVars = requiredEnvVars.filter(env => !process.env[env]);

if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
    // Start the server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    logger.error(`Could not connect to MongoDB: ${err.message}`);
    process.exit(1);
  }); 