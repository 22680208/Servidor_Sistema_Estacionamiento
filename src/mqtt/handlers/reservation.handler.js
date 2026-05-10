import redisConnection from "../../config/redis.js";
import { ticketReservation } from "../../controllers/ticket.controller.js";
import Reservation from "../../models/Reservation.js";
import { publishEntrada } from "../../services/mqttPublish.service.js"
import { publishRealtimeEvent } from "../../services/realtime-pubsub.service.js";
const reservationQueue = new Queue('reservation-queue', { connection: redisConnection });
import { Queue } from 'bullmq';
import { reservationSummary } from "../../utils/structureForResponse.js";

export async function handleReservationMessage(payload) {
  try {
    const code = String(payload).trim();
    const ahora = new Date();

    const startOfDay = new Date(Date.UTC(
        ahora.getUTCFullYear(), 
        ahora.getUTCMonth(), 
        ahora.getUTCDate(), 
        0, 0, 0, 0
    ));

    const endOfDay = new Date(Date.UTC(
        ahora.getUTCFullYear(), 
        ahora.getUTCMonth(), 
        ahora.getUTCDate(), 
        23, 59, 59, 999
    ));

    const reservation = await Reservation.findOne({
      state: 'pendiente',
      code: code,
      createdAt: {
          $gte: startOfDay,
          $lte: endOfDay
      }
    });

    if (!reservation) {
      await publishEntrada('CLOSE');
      return;
    }

    const jobId = `auto-cancel-${reservation._id}`; 
    const reservationWorker = await reservationQueue.getJob(jobId);
    if (reservationWorker) await reservationWorker.remove();

    reservation.state = 'completada';
    await reservation.save();

    const reservationDataforTicket = reservation.toObject();
    const ticketValidation = ticketReservation(reservationDataforTicket);
    if (!ticketValidation) return res.status(200).json({ message: 'Error al crear el Ticket' });
    const reservationData = await reservationSummary(reservation.userId);
    await publishRealtimeEvent({
        channel: 'reservation',
        event: 'reservation.updated',
        payload: {
            message: 'reserva completada',
            data: reservationData,
        },
    });

    await publishEntrada('OPEN');
  } catch (error) {
    await publishEntrada('CLOSE');
    console.error('Error handleReservationMessage:', error);
  }
}