import { createClient } from 'redis';

const redisClient = createClient();

redisClient.on('connect', () => {
  console.log('✅ Redis client connected');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('❌ FAILED TO CONNECT TO REDIS:', err);
    process.exit(1); // Exit if we can't connect
  }
})();

export { redisClient };
