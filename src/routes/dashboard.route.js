import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { getParkingSummary } from '../controllers/dashboard.controller.js';

const router = express.Router();

router.get('/', verifyToken, getParkingSummary);

export default router;