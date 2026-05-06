
export async function handleReservationMessage(payload) {
  try {
    const reservationCode = String(payload).trim();

    console.log('Reservation recibida:', reservationCode);


  } catch (error) {
    console.error('Error handleReservationMessage:', error);
  }
}