import express from 'express';
import { generateTaskDescription, getAiServiceStatus } from '../controllers/aiController.js';

const router = express.Router();

// POST /api/ai/generate-description (Generates description + priority suggestion)
router.post('/generate-description', generateTaskDescription);

// GET /api/ai/status (Returns status without exposing API keys)
router.get('/status', getAiServiceStatus);

export default router;
