import { Worker } from 'bullmq';
import redisConnection from '../config/redis.js';
import { summary } from '../utils/structureForResponse.js';

export const initDashboardWorker = () => {
    const worker = new Worker( 'dashboard-queue', async job => {
        if (job.name === 'update-dashboard-stats') {
            console.log('[Dashboard Worker] Recalculando estadísticas...');

            const freshData = await summary();

            const subscribers = await redisConnection.publish(
                'parking_updates',
                JSON.stringify(freshData),
            );

            console.log(
                `[Dashboard Worker] Notificación enviada a ${subscribers} suscriptores SSE`,
            );
        }
    },
    { connection: redisConnection },
    );

    worker.on('completed', job => {
        console.log(`[Dashboard Worker] Job ${job.id} completado`);
    });

    worker.on('failed', (job, err) => {
        console.error(
        `[Dashboard Worker] Job ${job?.id} falló:`,
        err?.message || err,
        );
    });
};