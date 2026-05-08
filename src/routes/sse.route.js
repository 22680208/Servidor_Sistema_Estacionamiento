import { Router } from 'express';
import {
  streamDashboard,
  streamReservation,
} from '../controllers/sse.controller.js';

const router = Router();

router.get('/dashboard', streamDashboard);
router.get('/reservation/:id', streamReservation);

export default router;