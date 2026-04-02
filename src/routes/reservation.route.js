import express from 'express';
import { isAdmin, verifyToken } from '../middlewares/auth.middleware.js';
import { createReservation, getReservations } from '../controllers/reservation.controller.js';
const router = express.Router();

router.post('/', verifyToken,createReservation);
router.get('/reservations', isAdmin, getReservations);

export default router;