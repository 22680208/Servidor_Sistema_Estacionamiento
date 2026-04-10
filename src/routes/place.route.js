import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { createPlace, getPlaces, getPlace, updatePlace, deletePlace, updateSensor } from '../controllers/place.controller.js';

const router = express.Router();

router.post('/', verifyToken, createPlace);
router.get('/', verifyToken, getPlaces);
router.get('/:id', verifyToken, getPlace);
router.put('/:id', verifyToken, updatePlace);
router.put('/sensor/:id', verifyToken, updateSensor)
router.delete('/:id', verifyToken, deletePlace);

export default router;