import Place from "../../models/Place.js";
import Ticket from "../../models/Ticket.js";
import { Queue } from 'bullmq';
import redisConnection from '../../config/redis.js';
import { publishEntrada } from "../../services/mqttPublish.service.js";
const ticketQueue = new Queue('ticket-queue', { connection: redisConnection });

export async function handleTicketMessage(payload) {
  try {
    const newticket = await Ticket.create({
        state: 'activo',
        validationIn: true,
    });
      await ticketQueue.add('generate-access-code-ticket-only', {
        ticketId: newticket._id
    }, {
        attempts: 3,
        backoff: 5000
    });
    await publishEntrada('OPEN');
  } catch (error) {
    await publishEntrada('CLOSE');
    console.error('Error handleTicketMessage:', error);
  }
}