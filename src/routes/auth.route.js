import express from 'express';
import { login, register, logout, renovarToken, profile } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/renew-token', renovarToken);
router.post('/logout', verifyToken, logout);
router.get('/profile', verifyToken, profile);

export default router;