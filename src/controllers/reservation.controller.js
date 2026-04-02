import Reservation from '../models/Reservation.js';
import User from '../models/User.js';
export const createReservation = async (req, res) => {
    const { userId, placeId, carId, timeStart, timeEnd } = req.body;
    try {
        if (!userId || !placeId || !carId || !timeStart) {
            return res.status(400).json({ status: 'error', data: null, message: 'Todos los campos son requeridos'});
        }
        //const reservation = await Reservation.create({ userId, placeId, carId, timeStart, timeEnd });
        //return res.status(201).json(reservation);
        return res.status(201).json({ status: 'success', data: null, message: 'Reserva creada correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', data: null, message: 'Error al crear la reserva' });
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