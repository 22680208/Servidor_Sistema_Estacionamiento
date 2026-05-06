import IORedis from 'ioredis';
import { REDIS_CHANNELS } from './channels.js';
import {
  publishEntrada,
  publishSalida,
  publishLed1,
  publishLed2,
  publishDisplay,
} from '../services/mqttPublish.service.js';

const redisSub = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redisSub.on('error', (err) => {
  console.error('Redis Subscriber Error:', err);
});

export async function startRedisSubscriber() {
  await redisSub.subscribe(
    REDIS_CHANNELS.mqttEntrada,
    REDIS_CHANNELS.mqttSalida,
    REDIS_CHANNELS.mqttLed1,
    REDIS_CHANNELS.mqttLed2,
    REDIS_CHANNELS.mqttDisplay
  );

  console.log('Redis subscriber listo');

  redisSub.on('message', async (channel, message) => {
    try {
      if (channel === REDIS_CHANNELS.mqttEntrada) {
        await publishEntrada(message);
      } else if (channel === REDIS_CHANNELS.mqttSalida) {
        await publishSalida(message);
      } else if (channel === REDIS_CHANNELS.mqttLed1) {
        await publishLed1(message);
      } else if (channel === REDIS_CHANNELS.mqttLed2) {
        await publishLed2(message);
      } else if (channel === REDIS_CHANNELS.mqttDisplay) {
        await publishDisplay(message);
      }
    } catch (error) {
      console.error('Error procesando Redis -> MQTT:', error);
    }
  });
}