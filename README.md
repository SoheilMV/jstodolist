# Todo List API

A secure, production-ready RESTful API for managing todo tasks with user authentication, built with Node.js, Express, and MongoDB.

![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)
![Express](https://img.shields.io/badge/Express-v5.1.0-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-v5+-yellow.svg)
![License](https://img.shields.io/badge/License-MIT-orange.svg)

## Features

- 🔐 **Secure Authentication**: JWT-based with refresh tokens and cookie support
- 📝 **Todo Management**: CRUD operations for tasks with filtering, sorting, and pagination
- 📚 **API Documentation**: Interactive Swagger UI documentation
- 🛡️ **Security**: Input validation, sanitization, and proper error handling
- 📊 **Logging**: Production-ready logging with Winston
- 🔄 **Environment-specific Configuration**: Development and production settings

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🚀 Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/todolist.git
cd todolist
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory (or copy and modify the existing one):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/todolist
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
NODE_ENV=development
```

4. **Start the server**

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Documentation

After starting the server, visit:
```
http://localhost:5000/api-docs
```

The Swagger UI documentation provides an interactive interface to test and explore all API endpoints.

## 🔑 Authentication

The API supports both cookie-based and token-based authentication:

### Register a new user

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get current user

```http
GET /api/auth/me
Authorization: Bearer {token}
```

### Refresh token

```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### Logout

```http
POST /api/auth/logout
Authorization: Bearer {token}
```

## 📝 Task Management

### Create a task

```http
POST /api/tasks
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Finish project",
  "description": "Complete the remaining tasks",
  "priority": "high",
  "dueDate": "2023-12-31"
}
```

### Get all tasks (with filtering and pagination)

```http
GET /api/tasks?completed=false&priority=high&page=1&limit=10&sort=dueDate&sortDir=asc
Authorization: Bearer {token}
```

### Get a single task

```http
GET /api/tasks/{task_id}
Authorization: Bearer {token}
```

### Update a task

```http
PUT /api/tasks/{task_id}
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Updated title",
  "completed": true
}
```

### Delete a task

```http
DELETE /api/tasks/{task_id}
Authorization: Bearer {token}
```

## 🚀 Deployment

For production deployment, update the `.env` file with production settings:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=your_production_mongodb_uri
JWT_SECRET=your_production_secret_key
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
CORS_ORIGIN=https://yourdomain.com
API_URL=https://api.yourdomain.com
```

### Docker Deployment (optional)

A Dockerfile is included for containerization:

```bash
# Build the image
docker build -t todolist-api .

# Run the container
docker run -p 5000:5000 -d todolist-api
```

## 📚 Project Structure

```
├── src/
│   ├── config/        # Configuration files
│   ├── controllers/   # Route controllers
│   ├── docs/          # API documentation
│   ├── middleware/    # Custom middleware
│   ├── models/        # Mongoose models
│   ├── routes/        # API routes
│   ├── utils/         # Utility functions
│   ├── logs/          # Application logs
│   └── index.js       # Entry point
├── .env               # Environment variables
├── package.json       # Dependencies and scripts
└── README.md          # Project documentation
```

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Application port | 5000 |
| MONGO_URI | MongoDB connection string | - |
| JWT_SECRET | Secret for JWT signing | - |
| JWT_EXPIRE | JWT expiration time | 30d |
| JWT_COOKIE_EXPIRE | Cookie expiration time (days) | 30 |
| NODE_ENV | Application environment | development |
| CORS_ORIGIN | Allowed CORS origin (production) | - |
| API_URL | Base API URL (production) | - |

## 🔒 Security Best Practices

- **Use HTTPS**: Always deploy with HTTPS in production
- **JWT Security**: Rotate keys regularly, use secure cookies
- **Input Validation**: All inputs are validated and sanitized
- **Error Handling**: Proper error handling prevents information leakage
- **Authentication**: JWT tokens with refresh token rotation
- **Rate Limiting**: Add rate limiting for sensitive endpoints
- **Password Storage**: Passwords are hashed with bcrypt

## 🔄 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 