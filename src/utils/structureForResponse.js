import Car from '../models/Car.js';
import Place from '../models/Place.js';
import Reservation from '../models/Reservation.js';

export const parkingSummary = async () => {
  const places = await Place.find().lean();
  const data = {
    summary: {
      total_slots: places.length,
      available_slots: places.filter(p => p.state === 'disponible').length,
      occupied_slots: places.filter(p => p.state === 'ocupado').length,
    },
    parking_slots: places.map(p => ({
      id: p._id,
      name: p.number,
      state: p.state,
    })),
  }
  return data;
};

export const reservationSummary = async (id) => {
  try {
    const reservations = await Reservation.find({ userId: id }).lean();

    const result = await Promise.all(
      reservations.map(async (reservation) => {
        const [place, car] = await Promise.all([
          reservation.placeId ? Place.findById(reservation.placeId).lean() : null,
          reservation.carId ? Car.findById(reservation.carId).lean() : null,
        ]);

        const item = {
          _id: reservation._id,
          userId: reservation.userId,
          placeId: reservation.placeId ?? null,
          place: place?.number ?? "Sin lugar",
          carId: reservation.carId ?? null,
          car: car?.plate ?? "Sin carro",
          timeStart: reservation.timeStart,
          timeEnd: reservation.timeEnd,
          state: reservation.state,
          code: reservation.code,
        };

        return item;
      })
    );
    return result;
  } catch (error) {
    console.error("Error en reservationSummary:", error.message);
    throw error;
  }
};