import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { requestLogger } from './middlewares/logger.js';
import { globalErrorHandler } from './middlewares/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { registerUser, loginUser } from './controllers/authController.js';
import { validateRegister, validateLogin } from './middlewares/validationMiddleware.js';
import { initNotificationListener, notificationHistory } from './listeners/notificationListener.js';

dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Event-Driven Background Notification Listener
initNotificationListener();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use(requestLogger);

// Root / Health Check Route
app.get(['/', '/api'], (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Task Management Backend API is running in Docker!',
    version: '1.0.0',
    endpoints: {
      tasks: '/api/tasks',
      notifications: '/api/notifications',
      auth: '/api/auth',
      ai: '/api/ai/generate-description'
    }
  });
});

// AI-Powered Assistant Routes
app.use('/api/ai', aiRoutes);

// Auth Routes
app.use('/api/auth', authRoutes);
app.post('/api/register', validateRegister, registerUser);
app.post('/api/login', validateLogin, loginUser);
app.post('/register', validateRegister, registerUser);
app.post('/login', validateLogin, loginUser);

// Task Routes (Protected by Auth Middleware inside taskRoutes)
app.use('/api/tasks', taskRoutes);
app.use('/tasks', taskRoutes);

// Notification History Routes
app.get(['/api/notifications', '/notifications'], (req, res) => {
  res.status(200).json({
    total: notificationHistory.length,
    notifications: notificationHistory,
  });
});

// Global error handling middleware
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
