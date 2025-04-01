const Task = require('../models/Task');
const Joi = require('joi');
const { ErrorResponse } = require('../middleware/error');
const sanitize = require('mongo-sanitize');

// @desc    Get all tasks for a user
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    // Parse query parameters for filtering, sorting and pagination
    const { 
      completed, 
      priority, 
      sort, 
      sortDir = 'asc',
      page = 1,
      limit = 10
    } = req.query;
    
    // Sanitize and parse pagination params
    const pageNum = parseInt(sanitize(page), 10);
    const limitNum = parseInt(sanitize(limit), 10);
    const startIndex = (pageNum - 1) * limitNum;
    
    // Build query
    const query = { user: req.user.id };
    
    // Add filters if provided
    if (completed !== undefined) {
      query.completed = completed === 'true';
    }
    
    if (priority) {
      query.priority = sanitize(priority);
    }
    
    // Build sort object
    let sortObj = {};
    if (sort) {
      sortObj[sanitize(sort)] = sortDir === 'desc' ? -1 : 1;
    } else {
      // Default sort by createdAt
      sortObj = { createdAt: -1 };
    }
    
    // Count total documents for pagination
    const total = await Task.countDocuments(query);
    
    // Execute query with pagination
    const tasks = await Task.find(query)
      .sort(sortObj)
      .skip(startIndex)
      .limit(limitNum);
    
    // Pagination result
    const pagination = {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    };
    
    res.status(200).json({
      success: true,
      pagination,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res, next) => {
  try {
    const taskId = sanitize(req.params.id);
    const task = await Task.findById(taskId);
    
    if (!task) {
      return next(new ErrorResponse('Task not found', 404));
    }
    
    // Check task ownership
    if (task.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to access this task', 403));
    }
    
    res.status(200).json({
      success: true,
      data: task
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res, next) => {
  try {
    // Validation schema
    const schema = Joi.object({
      title: Joi.string().required().max(100),
      description: Joi.string().max(500),
      completed: Joi.boolean(),
      dueDate: Joi.date(),
      priority: Joi.string().valid('low', 'medium', 'high')
    });
    
    // Validate request body
    const { error } = schema.validate(req.body);
    if (error) {
      return next(new ErrorResponse(error.details[0].message, 400));
    }
    
    // Sanitize inputs
    const sanitizedBody = {};
    for (const [key, value] of Object.entries(req.body)) {
      sanitizedBody[key] = sanitize(value);
    }
    
    // Add user to request body
    sanitizedBody.user = req.user.id;
    
    const task = await Task.create(sanitizedBody);
    
    res.status(201).json({
      success: true,
      data: task
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    // Validation schema
    const schema = Joi.object({
      title: Joi.string().max(100),
      description: Joi.string().max(500),
      completed: Joi.boolean(),
      dueDate: Joi.date(),
      priority: Joi.string().valid('low', 'medium', 'high')
    });
    
    // Validate request body
    const { error } = schema.validate(req.body);
    if (error) {
      return next(new ErrorResponse(error.details[0].message, 400));
    }
    
    // Sanitize inputs
    const taskId = sanitize(req.params.id);
    const sanitizedBody = {};
    for (const [key, value] of Object.entries(req.body)) {
      sanitizedBody[key] = sanitize(value);
    }
    
    // Always update the updatedAt field
    sanitizedBody.updatedAt = Date.now();
    
    let task = await Task.findById(taskId);
    
    if (!task) {
      return next(new ErrorResponse('Task not found', 404));
    }
    
    // Check task ownership
    if (task.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this task', 403));
    }
    
    // Update task
    task = await Task.findByIdAndUpdate(taskId, sanitizedBody, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: task
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res, next) => {
  try {
    const taskId = sanitize(req.params.id);
    const task = await Task.findById(taskId);
    
    if (!task) {
      return next(new ErrorResponse('Task not found', 404));
    }
    
    // Check task ownership
    if (task.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to delete this task', 403));
    }
    
    await task.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
}; 