import express from 'express';
import cors from 'cors';
import { requestLogger } from './middlewares/logger.js';
import { globalErrorHandler } from './middlewares/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use(requestLogger);

// In-memory array
let tasks = [];

// GET /api/tasks - Read all tasks
app.get('/api/tasks', (req, res, next) => {
  try {
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks - Create a new task
app.post('/api/tasks', (req, res, next) => {
  try {
    const { title, desc, priority, date } = req.body;
    
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title is required and must be a string' });
    }
    if (!desc || typeof desc !== 'string') {
      return res.status(400).json({ error: 'Description is required and must be a string' });
    }
    if (!['high', 'medium', 'low', 'urgent'].includes(priority)) {
      return res.status(400).json({ error: 'Priority must be high, medium, low, or urgent' });
    }

    let formattedDate = date;
    if (date) {
      const d = new Date(date);
      formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    } else {
      formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    const newTask = {
      id: Date.now(),
      title,
      desc,
      priority,
      date: formattedDate,
      status: 'in-progress'
    };
    tasks.push(newTask);
    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
});

// PUT /api/tasks/:id - Update an existing task
app.put('/api/tasks/:id', (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
    res.status(200).json(tasks[taskIndex]);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/tasks/:id - Delete a task
app.delete('/api/tasks/:id', (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id);
    const initialLength = tasks.length;
    tasks = tasks.filter(t => t.id !== taskId);
    
    if (tasks.length === initialLength) {
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
