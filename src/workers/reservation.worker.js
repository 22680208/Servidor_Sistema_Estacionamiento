import { Worker } from "bullmq";
import redisConnection from "../config/redis.js";
import Reservation from "../models/Reservation.js";
import Place from "../models/Place.js";
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890', 6);
export const initReservationWorker = () => {
	const worker = new Worker(
		"reservation-queue",
		async (job) => {
			console.log("[Worker] Procesando tarea:", job.name);

			if (job.name === "generate-access-code") {
				const { reservationId } = job.data;
				const code = nanoid();
				let reservation;
				do{
					const inicioHoy = new Date();
					inicioHoy.setHours(0, 0, 0, 0);

					const finHoy = new Date(inicioHoy);
					finHoy.setDate(inicioHoy.getDate() + 1);

					reservation = await Reservation.findOne({
						code: code,
						createdAt: {
							$gte: inicioHoy,
							$lt: finHoy
						}
					}).lean();
				}while(reservation);

				await Reservation.findByIdAndUpdate(reservationId, { code });
				console.log(
					`[Worker] Código ${code} asignado a reserva ${reservationId}`,
				);
			}

			if (job.name === 'auto-cancel-reservation') {
				const { reservationId, placeId } = job.data;
				try {
					const res = await Reservation.findById(reservationId);
					if (!res) {
						console.log(`[Worker] Tarea abortada: No existe la reserva ${reservationId}`);
						return;
					}
					if (res.state === 'pendiente') {
						console.log(`[Worker] Expiró el tiempo. Cancelando reserva ${reservationId}`);

						await Promise.all([
							Reservation.findByIdAndUpdate(reservationId, { state: 'cancelada' }),
							Place.findByIdAndUpdate(placeId, { state: 'disponible' })
						]);

						console.log(`[Worker] Lugar ${placeId} liberado y reserva finalizada.`);
					} else {
					console.log(`[Worker] La reserva ${reservationId} está en estado '${res.state}', no se cancela.`);
					}
					return;
				} catch (error) {
					console.error(`[Worker] Error procesando auto-cancelación: ${error.message}`);
					throw error; 
				}
			}

			if (job.name === 'cancel-reservation') {
				try {
					
				} catch (error) {
					console.error(`[Worker] Error procesando cancelación: ${error.message}`);
					throw error; 
				}
			}

		},
		{ connection: redisConnection },
	);
	worker.on("failed", (job, err) => console.error(`Job ${job.id} falló: ${err.message}`));
};
