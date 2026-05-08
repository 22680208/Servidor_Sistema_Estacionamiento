import express from 'express';
import { isAdmin, verifyToken } from '../middlewares/auth.middleware.js';
import { createReservation, getReservations, adjustReservation, deleteResertvation, getCodeReservation, validationReservation } from '../controllers/reservation.controller.js';
const router = express.Router();

router.post('/', verifyToken, createReservation);
router.patch('/:id/adjust', verifyToken, adjustReservation);
router.get('/:id', verifyToken, getReservations);
router.delete('/:id', verifyToken, deleteResertvation);
router.get('/:id/code', verifyToken, getCodeReservation);
router.post('/validation/:code', verifyToken, validationReservation);

export default router;  