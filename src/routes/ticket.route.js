import express from 'express';
import { isAdmin, verifyToken } from '../middlewares/auth.middleware.js';
import { associateUserTicket, calculateTicket, closeTicket, getTickets, getTicketsUser, payTicket, ticketOnly } from '../controllers/ticket.controller.js';

const router = express.Router();

router.get('/create-only-ticket', ticketOnly);
router.get('/', verifyToken, getTickets);
router.get('/:id', verifyToken, getTicketsUser);
router.post('/associate-user-ticket', 
    // verifyToken, 
    associateUserTicket);
router.post('/calculate', verifyToken, calculateTicket);
router.post('/pay', verifyToken, payTicket);
router.post('/close', verifyToken, closeTicket);

export default router;  