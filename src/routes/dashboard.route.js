import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { getParkingSummary } from '../controllers/dashboard.controller.js';
import { createRedisSseHandler } from '../services/sseRedisService.js';
import { summary } from '../utils/structureForResponse.js';

const router = express.Router();

router.get('/', verifyToken, getParkingSummary);
router.get('/stream', verifyToken, createRedisSseHandler('parking_updates', summary));

export default router;