import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { requestLogger } from './middlewares/logger.js';
import { globalErrorHandler } from './middlewares/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { registerUser, loginUser } from './controllers/authController.js';
import { validateRegister, validateLogin } from './middlewares/validationMiddleware.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use(requestLogger);

// Auth Routes
app.use('/api/auth', authRoutes);
app.post('/api/register', validateRegister, registerUser);
app.post('/api/login', validateLogin, loginUser);
app.post('/register', validateRegister, registerUser);
app.post('/login', validateLogin, loginUser);

// Task Routes (Protected by Auth Middleware inside taskRoutes)
app.use('/api/tasks', taskRoutes);

// Global error handling middleware
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
