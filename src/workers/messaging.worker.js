import { startRedisSubscriber } from '../redis/subscriber.js';
import { startMqttSubscriber } from '../mqtt/subscriber.js';

export async function initMessagingWorker() {
  await startRedisSubscriber();
  startMqttSubscriber();
  console.log('Messaging worker listo');
}