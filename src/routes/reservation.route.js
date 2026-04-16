import express from 'express';
import { isAdmin, verifyToken } from '../middlewares/auth.middleware.js';
import { createReservation, getReservations, adjustReservation } from '../controllers/reservation.controller.js';
const router = express.Router();

router.post('/', verifyToken, createReservation);
router.patch('/:id/adjust', verifyToken, adjustReservation);
router.get('/', verifyToken, getReservations);
// router.delete('/:id')

export default router;  