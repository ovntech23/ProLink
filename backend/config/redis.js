const Redis = require('ioredis');

// Redis client configuration using environment variables
const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  // Add REDIS_URL support if available
  ...(process.env.REDIS_URL && { url: process.env.REDIS_URL }),
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false
};

const redisClient = new Redis(redisOptions);

// Redis pub/sub clients (separate connections for pub/sub)
const redisPub = new Redis(redisOptions);
const redisSub = new Redis(redisOptions);

// Error handling
redisClient.on('error', (err) => {
    console.error('❌ Redis Client Error:', err);
});

redisClient.on('connect', () => {
    console.log('✅ Redis Client Connected');
});

redisPub.on('error', (err) => {
    console.error('❌ Redis Pub Error:', err);
});

redisSub.on('error', (err) => {
    console.error('❌ Redis Sub Error:', err);
});

module.exports = {
    redisClient,
    redisPub,
    redisSub
};
