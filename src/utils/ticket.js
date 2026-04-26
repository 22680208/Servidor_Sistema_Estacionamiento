import Ticket from '../models/Ticket.js';
import { Queue } from 'bullmq';
import redisConnection from '../config/redis.js';
const ticketQueue = new Queue('ticket-queue', { connection: redisConnection });

export const ticketReservation = async (reservation) => {
    try {
        const newticket = await Ticket.create({
            placeId: reservation.placeId,
            carId: reservation.carId,
            userId: reservation.userId,
            reservationId: reservation._id,
            state: 'activo',
            validationIn: true,
        });
        await ticketQueue.add('generate-access-code', {
            ticketId: newticket._id
        }, {
            attempts: 3,
            backoff: 5000
        });
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}