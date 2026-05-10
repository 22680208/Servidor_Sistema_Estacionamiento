import { Queue } from 'bullmq';
import Reservation from '../models/Reservation.js';
import Place from '../models/Place.js';
import redisConnection from '../config/redis.js';
import { ticketReservation } from './ticket.controller.js'
import { parkingSummary, reservationSummary } from '../utils/structureForResponse.js';
import { publishRealtimeEvent } from '../services/realtime-pubsub.service.js';
import Car from '../models/Car.js';

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
        if (!userId || !placeId || !time ) {
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
                state: 'reservado'
            }
        });

        if (place.modifiedCount === 0) {
            return res.status(400).json({ message: 'Este lugar ya no está disponible'});
        }
        const dashboardData = await parkingSummary();
        await publishRealtimeEvent({
            channel: 'dashboard',
            event: 'dashboard.updated',
            payload: {
                message: 'nueva reserva',
                data: dashboardData,
            },
        });
        const timeReservation = new Date(timeEnd).getTime() - Date.now();

        const newReservation = await Reservation.create({
            userId: userId,
            carId: carId,
            placeId: placeId,
            timeStart,
            timeEnd,
        });

        await reservationQueue.add('generate-access-code', {
            reservationId: newReservation._id,
            userId: userId
        }, {
            attempts: 3,
            backoff: 5000
        });

        await reservationQueue.add('auto-cancel-reservation', { 
                userId: userId,
                reservationId: newReservation._id, 
                placeId 
            }, { 
                jobId: "auto-cancel-" + newReservation._id,
                delay: timeReservation,
                removeOnComplete: true,
                removeOnFail: 1000
            }
        );

        const placeD = await Place.findById(placeId).lean()
        const car = await Car.findById(carId);
    
        const reservation = {
            _id: newReservation._id,
            userId: newReservation.userId,
		    placeId: newReservation.placeId,
            place: placeD.number,
		    carId: newReservation.carId,
            car: car || "Sin Carro",
		    timeStart: newReservation.timeStart,
		    timeEnd: newReservation.timeEnd,
		    state: newReservation.state,
            code: newReservation.code || null
        }
        return res.status(202).json( reservation );
    } catch (error) {
        console.log(error)
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
        const { id } = req.params;
        const reservations = await reservationSummary(id)
        return res.status(200).json( reservations );
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener las reservas' });
    }
}

export const deleteResertvation = async (req, res) => {
    try {
        const { id } = req.params;
        const reservation = await Reservation.findByIdAndDelete(id);
    
        if (!reservation) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        if (reservation.state === 'pendiente') await Place.findByIdAndUpdate(reservation.placeId, { state: 'disponible' })
    
        const dashboardData = await parkingSummary();
        await publishRealtimeEvent({
            channel: 'dashboard',
            event: 'dashboard.updated',
            payload: {
                message: 'reserva eliminada',
                data: dashboardData,
            },
        });

        const reservationData = await reservationSummary(reservation.userId);
        await publishRealtimeEvent({
            channel: 'reservation',
            event: 'reservation.updated',
            payload: {
                message: 'reserva eliminada',
                data: reservationData,
            },
        });
        
        const jobId = `auto-cancel-${id}`; 
        const reservationWorker = await reservationQueue.getJob(jobId);
        if (reservationWorker) await reservationWorker.remove();
        return res.sendStatus(200);
    } catch (error) {
        console.error(error)
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
        return res.status(200).json( reservation.code );
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

        reservation.state = 'completada';
        reservation.save();
    
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
        return res.status(200).json({ message: 'Validacion de codigo correcto y ticket creado correctamente' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error al validar la reserva' });
    }
}