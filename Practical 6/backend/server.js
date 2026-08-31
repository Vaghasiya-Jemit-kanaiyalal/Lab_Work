import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Task from './models/Task.js';
import { requestLogger } from './middlewares/logger.js';
import { globalErrorHandler } from './middlewares/errorHandler.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use(requestLogger);

// GET /api/tasks - Read all tasks
app.get('/api/tasks', async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks - Create a new task
app.post('/api/tasks', async (req, res, next) => {
  try {
    const { title, desc, priority, date } = req.body;
    
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Title is required and must be a string' });
    }
    if (!desc || typeof desc !== 'string' || !desc.trim()) {
      return res.status(400).json({ error: 'Description is required and must be a string' });
    }
    if (priority && !['high', 'medium', 'low', 'urgent'].includes(priority)) {
      return res.status(400).json({ error: 'Priority must be high, medium, low, or urgent' });
    }

    let formattedDate = date;
    if (date) {
      const d = new Date(date);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
      }
    } else {
      formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    const newTask = await Task.create({
      title: title.trim(),
      desc: desc.trim(),
      priority: priority || 'medium',
      date: formattedDate,
      status: 'in-progress'
    });

    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
});

// PUT /api/tasks/:id - Update an existing task
app.put('/api/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // If date is updated, re-format if necessary
    if (req.body.date && req.body.date.includes('-')) {
      const d = new Date(req.body.date);
      if (!isNaN(d.getTime())) {
        req.body.date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    
    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/tasks/:id - Delete a task
app.delete('/api/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedTask = await Task.findByIdAndDelete(id);
    
    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.status(200).json({ message: 'Task deleted successfully', id });
  } catch (error) {
    next(error);
  }
});

// Global error handling middleware
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
