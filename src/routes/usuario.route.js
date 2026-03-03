import { Router } from 'express';
import { deleteProfile, getProfile, updateProfile } from '../controllers/usuario.controller.js';

const router = Router();

router.get('/:id', getProfile);
router.put('/:id', updateProfile);
router.delete('/:id', deleteProfile); 

export default router;