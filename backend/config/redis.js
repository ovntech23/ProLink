const Redis = require('ioredis');

// Redis client configuration using environment variables
// Redis client configuration using environment variables
const redisCommonOptions = {
    retryStrategy: (times) => {
        // In development, if we can't connect quickly, stop retrying to avoid log spam/crashes
        if (process.env.NODE_ENV !== 'production' && times > 3) {
            return null; // Stop retrying
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true // Don't connect immediately on instantiation
};

let redisClient, redisPub, redisSub;

// Use Mock Redis in Development if configured or to prevent crashes
// We'll try to use real Redis, but if we strictly want to avoid crashes from the start:
// Since the user is struggling with Docker, let's FORCE mock in non-production for now to ensure startup.
// Or better: Create a safe wrapper.
// But given the constraints, I'll switch to a specialized Mock class for dev.

if (process.env.NODE_ENV === 'production') {
    if (process.env.REDIS_URL) {
        console.log('🔌 Connecting to Redis using REDIS_URL...');
        redisClient = new Redis(process.env.REDIS_URL, redisCommonOptions);
        redisPub = new Redis(process.env.REDIS_URL, redisCommonOptions);
        redisSub = new Redis(process.env.REDIS_URL, redisCommonOptions);
    } else {
        console.log('🔌 Connecting to Redis using host/port...');
        const redisOptions = {
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
            ...redisCommonOptions
        };
        redisClient = new Redis(redisOptions);
        redisPub = new Redis(redisOptions);
        redisSub = new Redis(redisOptions);
    }
} else {
    console.log('⚠️ Development Mode: Using Mock Redis Client to prevent connection errors.');

    // Simple Mock Class
    class MockRedis {
        constructor() {
            this.status = 'ready';
        }
        on(event, callback) { return this; }
        async get(key) { return null; }
        async set(key, value, ...args) { return 'OK'; }
        async del(key) { return 1; }
        async keys(pattern) { return []; }
        async publish(channel, message) { return 1; }
        async subscribe(channel) { return 1; }
        async psubscribe(pattern) { return 1; }
        async quit() { return 'OK'; }
        duplicate() { return new MockRedis(); }
    }

    redisClient = new MockRedis();
    redisPub = new MockRedis();
    redisSub = new MockRedis();
}

// Error handling (Only for real redis, but safe to attach to mock too due to .on stub)
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
