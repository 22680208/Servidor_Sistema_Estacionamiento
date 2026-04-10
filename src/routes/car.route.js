import express from 'express';
import { createCar, getCarsForUser, updateCar, deleteCar, updateMainCar } from '../controllers/car.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', verifyToken, createCar);
router.get('/:userId', verifyToken, getCarsForUser);
router.put('/:id', verifyToken, updateCar);
router.delete('/:id', verifyToken, deleteCar);
router.patch('/:id', verifyToken, updateMainCar);

export default router;