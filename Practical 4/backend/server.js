import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { requestLogger } from './middlewares/logger.js';
import { globalErrorHandler } from './middlewares/errorHandler.js';
import Task from './models/Task.js';
import connectDB from './db/connect.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskmanager';

// Connect to MongoDB
connectDB(MONGODB_URI);

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use(requestLogger);

const mapTaskToFrontend = (task) => ({
  id: task._id,
  title: task.title,
  desc: task.description,
  status: task.completed ? 'completed' : 'in-progress',
  date: task.createdAt ? new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
  priority: 'medium'
});

// GET /api/tasks - Read all tasks
app.get('/api/tasks', async (req, res, next) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks.map(mapTaskToFrontend));
  } catch (error) {
    next(error);
  }
});

// GET /api/tasks/:id - Read a single task
app.get('/api/tasks/:id', async (req, res, next) => {
  try {
    const taskId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ error: 'Invalid Task ID format' });
    }
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json(mapTaskToFrontend(task));
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks - Create a new task
app.post('/api/tasks', async (req, res, next) => {
  try {
    const { title, desc, description, status, completed } = req.body;
    
    const newTask = new Task({
      title,
      description: description || desc,
      completed: completed !== undefined ? completed : (status === 'completed')
    });
    
    const savedTask = await newTask.save();
    res.status(201).json(mapTaskToFrontend(savedTask));
  } catch (error) {
    next(error);
  }
});

// PUT /api/tasks/:id - Update an existing task
app.put('/api/tasks/:id', async (req, res, next) => {
  try {
    const taskId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ error: 'Invalid Task ID format' });
    }

    const { title, desc, description, status, completed } = req.body;
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (desc !== undefined || description !== undefined) updateData.description = description || desc;
    if (status !== undefined || completed !== undefined) {
      updateData.completed = completed !== undefined ? completed : (status === 'completed');
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.status(200).json(mapTaskToFrontend(updatedTask));
  } catch (error) {
    next(error);
  }
});

// DELETE /api/tasks/:id - Delete a task
app.delete('/api/tasks/:id', async (req, res, next) => {
  try {
    const taskId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ error: 'Invalid Task ID format' });
    }

    const deletedTask = await Task.findByIdAndDelete(taskId);
    
    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Global error handling middleware
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
