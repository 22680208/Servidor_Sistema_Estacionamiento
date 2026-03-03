import express from 'express';
import { 
    createLugar, 
    getLugares, 
    getLugarById, 
    updateLugar, 
    deleteLugar 
} from '../controllers/lugar.controller.js';

const router = express.Router();

router.post('/', createLugar);
router.get('/', getLugares);
router.get('/:id', getLugarById);
router.put('/:id', updateLugar);
router.delete('/:id', deleteLugar);

export default router;