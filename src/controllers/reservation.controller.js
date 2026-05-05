import { Queue } from 'bullmq';
import Reservation from '../models/Reservation.js';
import Place from '../models/Place.js';
import redisConnection from '../config/redis.js';
import { ticketReservation } from './ticket.controller.js'

const reservationQueue = new Queue('reservation-queue', { connection: redisConnection });
const dashboardQueue = new Queue("dashboard-queue", { connection: redisConnection });

const addMinutes = (dateString, minutes) => {
    try {
        const date = new Date(dateString);
        const newDate = new Date(date.getTime() + (minutes * 60000));
        return newDate.toISOString();
    } catch (error) {
        console.error("Error adding minutes to date string:", error);
        return null;
    }
};

export const createReservation = async (req, res) => {
    const { userId, placeId, carId, time } = req.body;
    try {
        if (!userId || !placeId || !carId || !time ) {
            return res.status(400).json({ message: 'Todos los campos son requeridos'});
        }
        const timeStart = new Date().toISOString();
        const timeEnd = addMinutes(timeStart, time);

        const place = await Place.updateOne({ 
            _id: placeId, 
            state: 'disponible'
        },
        {
            $set: {
                state: 'ocupado'
            }
        });

        if (place.modifiedCount === 0) {
            return res.status(400).json({ message: 'Este lugar ya no está disponible'});
        }
        await dashboardQueue.add("update-dashboard-stats", { reason: "new-reservation" });
        
        const timeReservation = new Date(timeEnd).getTime() - Date.now();

        const newReservation = await Reservation.create({
            userId: userId,
            carId: carId,
            placeId: placeId,
            timeStart,
            timeEnd,
        });

        await reservationQueue.add('generate-access-code', {
            reservationId: newReservation._id
        }, {
            attempts: 3,
            backoff: 5000
        });

        await reservationQueue.add('auto-cancel-reservation', { 
                reservationId: newReservation._id, 
                placeId 
            }, { 
                jobId: "auto-cancel-" + newReservation._id,
                delay: timeReservation,
                removeOnComplete: true,
                removeOnFail: 1000
            }
        );

        return res.status(202).json({ message: 'Reserva creada correctamente' });
    } catch (error) {
        return res.status(500).json({ message: 'Error al crear la reserva' });
    }
}

export const adjustReservation = async (req, res) => {
    try {
        const { minutesAdjust } = req.body;
        const { id } = req.params;
        const reservation = await Reservation.findById(id);
        if (!reservation) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }
        const jobId = `auto-cancel-${id}`; 
        const currentJob = await reservationQueue.getJob(jobId);

        let newDelay = minutesAdjust * 60000;

        if (currentJob) {
            const timestampCreacion = currentJob.timestamp;
            const delayOriginal = currentJob.opts.delay || 0;
            const tiempoTranscurrido = Date.now() - timestampCreacion;
            
            newDelay = Math.max(0, (delayOriginal - tiempoTranscurrido) + (minutesAdjust * 60000));
            
            await currentJob.remove();
        }

        await reservationQueue.add('auto-cancel-reservation', { 
            reservationId: id,
            placeId: reservation.placeId
        }, { 
            jobId: jobId,
            delay: newDelay,
            removeOnComplete: true,
            removeOnFail: 1000
        });

        return res.status(200).json({ 
            status: 'success',
            data: null,
            message: 'tiempo ajustado' 
        });

    } catch (error) {
        console.error("Error en adjustReservation:", error);
        return res.status(500).json({ message: 'Error al ajustar el límite' });
    }
}

export const getReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find().lean();
        return res.status(200).json({ data: reservations, message: 'Reservas obtenidas correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener las reservas' });
    }
}

export const deleteResertvation = async (req, res) => {
    try {
        const { id } = req.params;
        const reservation = await Reservation.findById(id);
        if (!reservation) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }
        await reservationQueue.add('cancel-reservation', { 
            reservationId: id,
            placeId: reservation.placeId
        });
        const jobId = `auto-cancel-${id}`; 
        const reservationWorker = await reservationQueue.getJob(jobId);
        if (reservationWorker) await reservationWorker.remove();
        return res.status(200).json({ message: 'Reserva eliminada correctamente'});
    } catch (error) {
        return res.status(500).json({ message: 'Error al eliminar la reserva' });
    }
}

export const getCodeReservation = async (req, res) => {
    try {
        const { id } = req.params;

        const reservation = await Reservation.findById(id).lean()
        if (!reservation) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }
        return res.status(200).json({ data: reservation.code, message: 'Codigo de reserva encontrado' });
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener el codigo'})
    }
}

export const validationReservation = async (req, res) => {
    try {
        const { code } = req.params;
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
        code: code,
        createdAt: {
            $gte: startOfDay,
            $lte: endOfDay
        }
        });
        if (!reservation) return res.status(404).json({ message: 'Reserva no encontrada' });

        const jobId = `auto-cancel-${reservation._id}`; 
        const reservationWorker = await reservationQueue.getJob(jobId);
        if (reservationWorker) await reservationWorker.remove();

        reservation.state = 'activa';
        reservation.save();
    
        const reservationData = reservation.toObject();
        const ticketValidation = ticketReservation(reservationData);
        if (!ticketValidation) return res.status(200).json({ message: 'Error al crear el Ticket' });

        return res.status(200).json({ message: 'Validacion de codigo correcto y ticket creado correctamente' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error al validar la reserva' });
    }
}