import { redisPub, redisSub } from '../config/redis.js';
import { sendToChannel } from './sse.service.js';

const REALTIME_CHANNEL = 'realtime:sse';

export const publishRealtimeEvent = async ({ channel, event, payload }) => {
  await redisPub.publish(
    REALTIME_CHANNEL,
    JSON.stringify({ channel, event, payload })
  );
};

export const subscribeRealtimeEvents = async () => {
  await redisSub.subscribe(REALTIME_CHANNEL);

  redisSub.on('message', (redisChannel, message) => {
    if (redisChannel !== REALTIME_CHANNEL) return;

    try {
      const parsed = JSON.parse(message);
      const { channel, event, payload } = parsed;

      if (!channel || !event) return;

      sendToChannel(channel, event, payload);
    } catch (error) {
      console.error('Error parsing realtime event:', error);
    }
  });
};