import { Queue } from 'bullmq';
import Reservation from '../models/Reservation.js';
import Place from '../models/Place.js';
import redisConnection from '../config/redis.js';

const reservationQueue = new Queue('reservation-queue', { connection: redisConnection });

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
            return res.status(400).json({ status: 'error', data: null, message: 'Todos los campos son requeridos'});
        }
        const timeStart = new Date().toISOString();
        const timeEnd = addMinutes(timeStart, time);

        const existing = await Place.findOne({ placeId: placeId, state: 'ocupado' });
        if (existing) {
            return res.status(400).json({ message: 'Este lugar ya no está disponible' });
        }

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

        return res.status(202).json({ status: 'success', data: null, message: 'Reserva creada correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', data: null, message: 'Error al crear la reserva' });
    }
}

export const adjustReservation = async (req, res) => {
    try {
        const { minutesAdjust } = req.body;
        const { id } = req.params;
        const reservation = await Reservation.findById(id);
        if (!reservation) {
            return res.status(404).json({ status: 'error', message: 'Reserva no encontrada' });
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
            message: 'Delay ajustado' 
        });

    } catch (error) {
        console.error("Error en adjustReservation:", error);
        return res.status(500).json({ status: 'error', data: null, message: 'Error al ajustar el límite' });
    }
}

export const getReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find();
        return res.status(200).json({ status: 'success', data: reservations, message: 'Reservas obtenidas correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', data: null, message: 'Error al obtener las reservas' });
    }
}