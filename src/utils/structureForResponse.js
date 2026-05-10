import Car from '../models/Car.js';
import Place from '../models/Place.js';
import Reservation from '../models/Reservation.js';
import Ticket from '../models/Ticket.js';

export const parkingSummary = async () => {
  const places = await Place.find().lean();
  const data = {
    summary: {
      total_slots: places.length,
      available_slots: places.filter(p => p.state === 'disponible').length,
      occupied_slots: places.filter(p => p.state === 'ocupado' || p.state === 'reservado' || p.state === 'mantenimiento' ).length,
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
          code: reservation.code || null,
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


export const ticketsSummary = async (id) => {
  try {
    const tickets = await Ticket.find({ userId: id }).lean();

    const result = await Promise.all(
      tickets.map(async (ticket) => {
        const [place, car] = await Promise.all([
          ticket.placeId ? Place.findById(ticket.placeId).lean() : null,
          ticket.carId ? Car.findById(ticket.carId).lean() : null,
        ]);

        const item = {
          _id: ticket._id,
          userId: ticket.userId,
          reservation: ticket.reservationId ? "fue reservado" : "no fue reservado",
          placeId: ticket.placeId ?? null,
          place: place?.number ?? "Sin lugar",
          carId: ticket.carId ?? null,
          car: car?.plate ?? "Sin carro",
          timeStart: ticket.timeStart,
          timeEnd: ticket.timeEnd || "No definido",
          state: ticket.state,
          code: ticket.code ?? null,
          baseFee: Number(ticket.baseFee.toString()),
          finalFee: Number(ticket.finalFee.toString()),
          discountType: ticket.discountType,
          validationIn: ticket.validationIn,
          validationOut: ticket.validationOut,
          folio: ticket.folio,
        };

        return item;
      })
    );
    return result;
  } catch (error) {
    console.error("Error en ticketSummary:", error.message);
    throw error;
  }
} 