import Ticket from '../models/Ticket.js';
import Place from '../models/Place.js';
import { Queue } from 'bullmq';
import redisConnection from '../config/redis.js';
const ticketQueue = new Queue('ticket-queue', { connection: redisConnection });
import { customAlphabet } from 'nanoid';
import { ticketsSummary } from '../utils/structureForResponse.js';
import { publishRealtimeEvent } from '../services/realtime-pubsub.service.js';
import Reservation from '../models/Reservation.js';

const nanoid = customAlphabet('1234567890', 6);

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
        return false;
    }
}

export const ticketOnly = async (req, res) => {
    try {
        const existing = await Place.findOne({state: 'disponible'})
        if (!existing) return res.status(200).json({ message: 'No hay lugares dsiponibles' });
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
        return res.sendStatus(200);
    } catch (error) {
        return res.status(500).json({ message: 'Error al crear Ticket' });
    }
}

export const associateUserTicket = async (req, res) => {
    try {
        const { userId, placeId, carId, code } = req.body;

        if (!userId || !placeId ) {
            return res.status(400).json({ message: 'Todos los campos son requeridos'});
        }

        const placeUsed = await Ticket.distinct('placeId');
        const list = await Place.find({
            _id: { $nin: placeUsed },
            state: 'ocupado'
        })

        const exist = list.some(place => place._id.equals(placeId));
        if (!exist) {
            return res.status(404).json({ message: 'Lugar libre' });
        }

        const { startOfDay, endOfDay } = getDayRangeUTC();
        const ticket = await Ticket.findOne({
        code: code,
        createdAt: {
            $gte: startOfDay,
            $lte: endOfDay
        }
        });

        if (!ticket) return res.status(404).json({ message: 'Ticket no encontrada' });

        if (ticket.userId) return res.status(400).json({ message: 'Ticket ya asociado a un usuario' });

        ticket.placeId = placeId;
        ticket.carId = carId;
        ticket.userId = userId;

        await ticket.save();

        const ticketsData = await ticketsSummary(ticket.userId);
        await publishRealtimeEvent({
            channel: 'ticket',
            event: 'ticket.updated',
            payload: {
                message: 'ticket actualizado',
                data: ticketsData,
            },
        });

        
        return res.sendStatus(200);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Error al crear el Ticket' });
    }
}

export const getTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find().lean();
        const ticketsData = tickets.map(ticket => {
            return {
                id: ticket._id,
                folio: ticket.folio,
                state: ticket.state,
                baseFee: ticket.baseFee,
                discountType: ticket.discountType,
                validationIn: ticket.validationIn,
                validationOut: ticket.validationOut
            }
        });

        return res.status(200).json({ data: ticketsData, message: 'Tickets encontrados' });
    } catch (error) {
        return res.status(500).json({ message: 'Error al buscar los Tickets' });
    }
}
//sse
export const getTicketsUser = async (req, res) => {
    try {
        const { id } = req.params;
        const tickets = await ticketsSummary(id);

        return res.status(200).json(tickets);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error al buscar los Tickets' });
    }
}

const calculateTotal = (timeStart, timeEnd) => {
    const diffMs = timeEnd - new Date(timeStart);
    const hourtoDecimal = diffMs / 3600000;
    const total = 50 + hourtoDecimal * 20;
    return total.toFixed(2);
};

export const calculateTicket  = async (req, res) => {
    try {
        const { code } = req.body;
        const { startOfDay, endOfDay } = getDayRangeUTC();


        const ticket = await Ticket.findOne({
        code: code,
        createdAt: {
            $gte: startOfDay,
            $lte: endOfDay
        }
        });
        if (!ticket) return res.status(404).json({ message: 'Ticket no encontrado' });

        const timeEnd = new Date();
        ticket.timeEnd = timeEnd;
        ticket.finalFee = calculateTotal(ticket.timeStart, timeEnd);
        ticket.save();

        console.log(ticket.finalFee)
        return res.status(200).json({ finalFee: Number(ticket.finalFee.toString())});
    } catch (error) {
        return res.status(500).json({ message: 'Error al calcular el pago' });
    }
}

export const payTicket = async (req, res) => {
    try {
        const { code, payIsValid } = req.body;
        if (!payIsValid) return res.status(500).json({ message: 'Pago no validado' });
        const { startOfDay, endOfDay } = getDayRangeUTC();

        const ticket = await Ticket.findOne({
        code: code,
        createdAt: {
            $gte: startOfDay,
            $lte: endOfDay
        }
        });

        ticket.state = 'pagado';
        await ticket.save();
        const ticketsData = await ticketsSummary(ticket.userId);
        await publishRealtimeEvent({
            channel: 'ticket',
            event: 'ticket.updated',
            payload: {
                message: 'ticket actualizado',
                data: ticketsData,
            },
        });
        return res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error al pagar el Ticket' });
    }
}
//mqtt
export const closeTicket = async (req, res) => {
    try {
        const { code } = req.body;
        const { startOfDay, endOfDay } = getDayRangeUTC();
        const ticket = await Ticket.findOne({
        code: code,
        state: 'pagado',
        createdAt: {
            $gte: startOfDay,
            $lte: endOfDay
        }
        });
        if (!ticket) return res.status(404).json({ data: ticket, message: 'Ticket no encontrado' });
        ticket.state = 'finalizado';
        await ticket.save();
        return res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error al finalizar el Ticket o salir del estacionamiento' });
    }
}