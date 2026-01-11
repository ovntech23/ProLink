const Redis = require('ioredis');

// Redis client configuration
const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false
});

// Redis pub/sub clients (separate connections for pub/sub)
const redisPub = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const redisSub = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

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
