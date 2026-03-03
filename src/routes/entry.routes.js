import express from 'express';
import { registrarEntrada } from '../controllers/entry.controller.js';

const router = express.Router();

router.post('/ingreso', registrarEntrada);

export default router;