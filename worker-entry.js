import { connectDB } from './src/config/db.js';
import { initReservationWorker } from './src/workers/reservation.worker.js';
import { initTicketWorker } from './src/workers/ticket.worker.js';
import 'dotenv/config';
const startWorker = async () => {
    try {
        await connectDB();
        console.log('Worker listo');
        initReservationWorker();
        initTicketWorker();
        
    } catch (error) {
        console.error('No se pudo iniciar el Worker debido a la DB');
        process.exit(1);
    }
};

startWorker();