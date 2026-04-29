import Ticket from '../models/Ticket.js';
import Place from '../models/Place.js';
import { Queue } from 'bullmq';
import redisConnection from '../config/redis.js';
const ticketQueue = new Queue('ticket-queue', { connection: redisConnection });
import { customAlphabet } from 'nanoid';

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
        if (!existing) return res.status(200).json({ status: 'close', data: null, message: 'No hay lugares dsiponibles' });
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
        return res.status(200).json({ status: 'success', data: null, message: 'Ticket creado, esperando codigo' });
    } catch (error) {
        return res.status(500).json({ status: 'error', data: null, message: 'Error al crear Ticket' });
    }
}

export const associateUserTicket = async (req, res) => {
    try {
        const { userId, placeId, carId, code } = req.body;

        if (!userId || !placeId || !carId ) {
            return res.status(400).json({ status: 'error', data: null, message: 'Todos los campos son requeridos'});
        }

        const place = await Place.findOne({
            _id: placeId,
            state: 'ocupado'
        });
        if (place) {
            return res.status(404).json({ status: 'error', data: null, message: 'Lugar ocupado' });
        }

        const { startOfDay, endOfDay } = getDayRangeUTC();
        const ticket = await Ticket.findOne({
        code: code,
        createdAt: {
            $gte: startOfDay,
            $lte: endOfDay
        }
        });

        if (!ticket) return res.status(404).json({ status: 'error', data: null, message: 'Ticket no encontrada' });

        if (ticket.userId) return res.status(400).json({ status: 'error', data: null, message: 'Ticket ya asociado a un usuario' });

        ticket.placeId = placeId;
        ticket.carId = carId;
        ticket.userId = userId;

        ticket.save();
        return res.status(200).json({ status: 'success', data: null, message: 'Usuario asociado a Ticket correctamente' });
    } catch (error) {
        return res.status(500).json({ status: 'error', data: null, message: 'Error al crear el Ticket' });
    }
}

export const getTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await Ticket.findById(id).lean();
        if (!ticket) return res.status(404).json({ status: 'error', data: ticket, message: 'Ticket no encontrado' });

        return res.status(200).json({ status: 'success', data: ticket, message: 'Ticket encontrado' });
    } catch (error) {
        return res.status(500).json({ status: 'error', data: null, message: 'Error al buscar el Ticket' });
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

        return res.status(200).json({ status: 'success', data: ticketsData, message: 'Tickets encontrados' });
    } catch (error) {
        return res.status(500).json({ status: 'error', data: null, message: 'Error al buscar los Tickets' });
    }
}

export const getTicketsUser = async (req, res) => {
    try {
        const { id } = req.params;
        const tickets = await Ticket.find({userId: id}).lean();
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

        return res.status(200).json({ status: 'success', data: ticketsData, message: 'Tickets encontrados' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 'error', data: null, message: 'Error al buscar los Tickets' });
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
        if (!ticket) return res.status(404).json({ status: 'error', data: ticket, message: 'Ticket no encontrado' });

        const timeEnd = new Date();
        console.log(timeEnd)
        ticket.timeEnd = timeEnd;
        ticket.finalFee = calculateTotal(ticket.timeStart, timeEnd);
        ticket.save();
        return res.status(200).json({ status: 'success', data: ticket.finalFee, message: 'Pago caluculado' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 'error', data: null, message: 'Error al calcular el pago' });
    }
}

export const payTicket = async (req, res) => {
    try {
        const { code, payIsValid } = req.body;
        if (!payIsValid) return res.status(500).json({ status: 'error', data: false, message: 'Pago no validado' });
        const { startOfDay, endOfDay } = getDayRangeUTC();

        const ticket = await Ticket.findOne({
        code: code,
        createdAt: {
            $gte: startOfDay,
            $lte: endOfDay
        }
        });

        ticket.state = 'pagado';
        ticket.save();

        return res.status(200).json({ status: 'success', data: true, message: 'Ticket pagado' });
    } catch (error) {
        return res.status(500).json({ status: 'error', data: null, message: 'Error al pagar el Ticket' });
    }
}

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
        if (!ticket) return res.status(404).json({ status: 'error', data: ticket, message: 'Ticket no encontrado' });
        ticket.state = 'finalizado';
        ticket.save();
        await ticketQueue.add('leave-parking',
        {
            attempts: 3,
            backoff: 5000
        });
        return res.status(200).json({ status: 'success', data: true, message: 'Ticket finalizado' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 'error', data: null, message: 'Error al finalizar el Ticket o salir del estacionamiento' });
    }
}