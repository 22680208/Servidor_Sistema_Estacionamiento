import Ticket from "../../models/Ticket.js";
import { publishSalida } from "../../services/mqttPublish.service.js";
import { publishRealtimeEvent } from "../../services/realtime-pubsub.service.js";
import { ticketsSummary } from "../../utils/structureForResponse.js";

const getDayRangeUTC = () => {
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

    return { startOfDay, endOfDay };
};
export async function handleTicketMessage(payload) {
  try {
    const code = String(payload).trim();
    const { startOfDay, endOfDay } = getDayRangeUTC();
    const ticket = await Ticket.findOne({
    code: code,
    state: 'pagado',
    createdAt: {
        $gte: startOfDay,
        $lte: endOfDay
    }
    });
    if (!ticket) {
      await publishSalida('CLOSE');
      return;
    }
    ticket.state = 'finalizado';
    await ticket.save();
    if (ticket.userId) {
      const ticketsData = await ticketsSummary(ticket.userId);
      await publishRealtimeEvent({
          channel: 'ticket',
          event: 'ticket.updated',
          payload: {
              message: 'ticket actualizado',
              data: ticketsData,
          },
      });
    }
    await publishSalida('OPEN');
  } catch (error) {
    await publishSalida('CLOSE');
    console.log(error)
    console.error('Error handleTicketMessage:', error);
  }
}