import express from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validateTask } from '../middlewares/validationMiddleware.js';

const router = express.Router();

// Apply auth middleware to protect all task routes
router.use(protect);

// GET /api/tasks -> [Auth Middleware] -> getTasks Controller
router.get('/', getTasks);

// POST /api/tasks -> [Auth Middleware] -> [Validation Middleware] -> createTask Controller
router.post('/', validateTask, createTask);

// PUT /api/tasks/:id -> [Auth Middleware] -> updateTask Controller
router.put('/:id', updateTask);

// DELETE /api/tasks/:id -> [Auth Middleware] -> deleteTask Controller
router.delete('/:id', deleteTask);

export default router;
