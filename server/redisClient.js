import { createClient } from 'redis';

// Create ONE client for the whole application
const redisClient = createClient();

// Add a 'connect' listener
redisClient.on('connect', () => {
  console.log('✅ Redis client connected');
});

// Add an 'error' listener
redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

// Immediately connect.
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('❌ FAILED TO CONNECT TO REDIS:', err);
    process.exit(1); // Exit if we can't connect
  }
})();

// Export the single, connected client
export { redisClient };