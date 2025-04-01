# Todo List API

A RESTful API for managing todo tasks with user authentication.

## Technologies Used

- **Node.js + Express.js**: For backend API
- **MongoDB + Mongoose**: For database management
- **JWT (jsonwebtoken)**: For authentication with refresh tokens
- **bcryptjs**: For password hashing
- **Joi**: For input validation
- **mongo-sanitize**: For input sanitization against NoSQL injection
- **Swagger**: For API documentation
- **Winston**: For logging

## Features

- User Authentication (Signup/Login with hashed password & JWT)
- Refresh Token mechanism for enhanced security
- CRUD Operations for Tasks (Create, Read, Update, Delete)
- Task Ownership Restriction (Users can only manage their own tasks)
- Task Filtering & Sorting (By date, completion status, priority)
- Pagination for efficient data fetching
- Timestamps (Save creation and update dates for tasks)
- Centralized Error Handling
- Input Sanitization for security
- Swagger API Documentation
- Comprehensive Logging

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/todolist
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=1h
   NODE_ENV=development
   ```

### Running the Application

- Development mode:
  ```
  npm run dev
  ```
- Production mode:
  ```
  npm start
  ```

## API Documentation

API documentation is available at `/api-docs` when the server is running.

### Main Endpoints

- **Auth Routes**:
  - `POST /api/auth/register` - Register a new user
  - `POST /api/auth/login` - Login user
  - `POST /api/auth/refresh-token` - Refresh access token
  - `GET /api/auth/me` - Get current user info

- **Task Routes** (all require authentication):
  - `GET /api/tasks` - Get all tasks (with filtering, sorting, and pagination)
  - `GET /api/tasks/:id` - Get a single task
  - `POST /api/tasks` - Create a new task
  - `PUT /api/tasks/:id` - Update a task
  - `DELETE /api/tasks/:id` - Delete a task

## Security Features

- Password hashing with bcryptjs
- JWT authentication with access and refresh tokens
- Input validation with Joi
- Input sanitization with mongo-sanitize
- Task ownership verification
- Environment variables validation at startup

## Testing

API can be tested using Postman or any other API testing tool. 