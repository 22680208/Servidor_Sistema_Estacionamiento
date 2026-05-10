import { Router } from 'express';
import {
  streamDashboard,
  streamReservation,
  streamTicket,
} from '../controllers/sse.controller.js';

const router = Router();

router.get('/dashboard', streamDashboard);
router.get('/reservation/:id', streamReservation);
router.get('/ticket/:id', streamTicket);

export default router;