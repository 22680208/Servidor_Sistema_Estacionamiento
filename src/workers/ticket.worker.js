import { Worker } from "bullmq";
import redisConnection from "../config/redis.js";
import Ticket from '../models/Ticket.js';
import { customAlphabet } from 'nanoid';
import { sendAuthCode, sendLeave } from '../services/mqttService.js';
import { ticketsSummary } from "../utils/structureForResponse.js";
import { publishDisplay } from "../services/mqttPublish.service.js";

const TOPIC_ESP32 = 'parking/v1/esp32/access';
const LEAVE_ESP32 = 'parking/v1/esp32/leave';
const nanoid = customAlphabet('1234567890', 6);

export const initTicketWorker = () => {
    const worker = new Worker(
        "ticket-queue",
		async (job) => {
			console.log("[Worker] Procesando tarea:", job.name);
            if (job.name === "generate-access-code") {
                const { ticketId } = job.data;
                const code = nanoid();
                let ticket;
                do{
                    const inicioHoy = new Date();
                    inicioHoy.setHours(0, 0, 0, 0);

                    const finHoy = new Date(inicioHoy);
                    finHoy.setDate(inicioHoy.getDate() + 1);

                    ticket = await Ticket.findOne({
                        code: code,
                        createdAt: {
                            $gte: inicioHoy,
                            $lt: finHoy
                        }
                    }).lean();
                }while(ticket);

                await Ticket.findByIdAndUpdate(ticketId, { code });
                const ticketsData = await ticketsSummary(userId);
                await publishRealtimeEvent({
                    channel: 'ticket',
                    event: 'ticket.updated',
                    payload: {
                        message: 'ticket actualizado',
                        data: ticketsData,
                    },
                });
                console.log(
                    `[Worker] Código ${code} asignado a ticket ${ticketId}`,
                );
            }
            if (job.name === "generate-access-code-ticket-only") {
                const { ticketId } = job.data;
                const code = nanoid();
                let ticket;
                do{
                    const inicioHoy = new Date();
                    inicioHoy.setHours(0, 0, 0, 0);

                    const finHoy = new Date(inicioHoy);
                    finHoy.setDate(inicioHoy.getDate() + 1);

                    ticket = await Ticket.findOne({
                        code: code,
                        createdAt: {
                            $gte: inicioHoy,
                            $lt: finHoy
                        }
                    }).lean();
                }while(ticket);

                await Ticket.findByIdAndUpdate(ticketId, { code });

                await publishDisplay(code)
                
                console.log(
                    `[Worker] Código ${code} asignado a ticket ${ticketId}`,
                );
            }
        },
        { connection: redisConnection }
	);
	worker.on("failed", (job, err) => console.error(`Job ${job.id} falló: ${err.message}`));
}