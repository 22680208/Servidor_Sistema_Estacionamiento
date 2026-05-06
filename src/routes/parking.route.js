import { Router } from 'express';
import { validatePin } from '../controllers/access.controller.js';

const router = Router();

router.post('/validate-pin', validatePin);

export default router;