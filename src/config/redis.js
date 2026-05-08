import IORedis from 'ioredis';

const redisConnection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null, 
});

export const redisPub = new IORedis(process.env.REDIS_URL);
export const redisSub = new IORedis(process.env.REDIS_URL);

redisConnection.on('error', (err) => console.error('Redis Error:', err));

export default redisConnection;