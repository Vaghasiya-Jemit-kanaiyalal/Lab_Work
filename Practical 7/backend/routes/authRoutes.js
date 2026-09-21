import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validateRegister, validateLogin } from '../middlewares/validationMiddleware.js';

const router = express.Router();

// POST /register -> validate -> hash password -> save User -> 201
router.post('/register', validateRegister, registerUser);

// POST /login -> validate -> verify password -> sign JWT -> return token
router.post('/login', validateLogin, loginUser);

// GET /me -> protect -> return user details
router.get('/me', protect, getMe);

export default router;
