import express from 'express';
import { createCar, getCars, updateCar } from '../controllers/car.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', verifyToken, createCar);
router.get('/:userId', verifyToken, getCars);
router.put('/:id', verifyToken, updateCar);

export default router;