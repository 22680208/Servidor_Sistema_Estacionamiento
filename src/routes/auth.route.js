import express from 'express';
import { login, register, logout, renovarToken } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/renew-token', renovarToken);
router.post('/logout', verifyToken, logout);

export default router;