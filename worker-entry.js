import 'dotenv/config';
import { connectDB } from './src/config/db.js';
import { initReservationWorker } from './src/workers/reservation.worker.js';
import { initTicketWorker } from './src/workers/ticket.worker.js';
import { initDashboardWorker } from './src/workers/dashboard.worker.js';
import { initMessagingWorker } from './src/workers/messaging.worker.js';

const startWorker = async () => {
  try {
    await connectDB();
    console.log('Worker listo');

    initReservationWorker();
    initTicketWorker();
    initDashboardWorker();

    await initMessagingWorker();
  } catch (error) {
    console.error('No se pudo iniciar el Worker debido a la DB');
    console.error(error);
    process.exit(1);
  }
};

startWorker();