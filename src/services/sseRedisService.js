import Redis from 'ioredis';
import redisConnection from '../config/redis.js';

export const createRedisSseHandler = (channel, fetchSnapshotFn) => {
  return async (req, res) => {
    console.log(`[SSE] Nueva conexión en canal ${channel}`);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const subscriber = redisConnection.duplicate();

    const send = payload => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    try {
      const initialData = await fetchSnapshotFn();
      send({
        data: initialData,
        message: 'Datos obtenidos correctamente',
      });

      await subscriber.subscribe(channel);

      subscriber.on('message', async (ch, message) => {
        if (ch !== channel) return;

        try {
          let parsed = message;

          if (typeof message === 'string') {
            try {
              parsed = JSON.parse(message);
            } catch {
              parsed = null;
            }
          }

          let dataToSend;

          if (
            parsed &&
            typeof parsed === 'object' &&
            parsed.summary &&
            parsed.parking_slots
          ) {
            dataToSend = parsed;
          }
          else if (
            parsed &&
            typeof parsed === 'object' &&
            parsed.data
          ) {
            dataToSend = parsed.data;
          }
          else {
            dataToSend = await fetchSnapshotFn();
          }

          send({
            data: dataToSend,
            message: 'Datos actualizados correctamente',
          });
        } catch (err) {
          console.error('Error procesando mensaje SSE:', err);
        }
      });

      req.on('close', async () => {
        try {
          await subscriber.unsubscribe(channel);
          await subscriber.quit();
        } catch (err) {
          console.error('Error cerrando subscriber SSE:', err);
        }
        res.end();
      });
    } catch (error) {
      console.error('Error en handler SSE:', error);
      try {
        await subscriber.quit();
      } catch {
      }
      res.end();
    }
  };
};