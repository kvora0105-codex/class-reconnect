import express from 'express';
const router = express.Router();
import qaController from '../controllers/qaController.js';

// Route for getting AI-powered answers
router.post('/answer', qaController.getAnswer);

export default router;
