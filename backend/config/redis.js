const Redis = require('ioredis');

// Redis client configuration using environment variables
// Redis client configuration using environment variables
// Redis client configuration
const redisCommonOptions = {
    retryStrategy: (times) => {
        if (process.env.NODE_ENV !== 'production' && times > 3) {
            return null;
        }
        return Math.min(times * 50, 2000);
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true
};

let redisClient, redisPub, redisSub;

if (process.env.NODE_ENV === 'production') {
    try {
        if (process.env.REDIS_URL) {
            const redisUrl = new URL(process.env.REDIS_URL);
            console.log('🔌 Found REDIS_URL');

            // Check if URL has credentials
            if (redisUrl.password) {
                console.log('🔒 Using credentials from REDIS_URL');
                // Pass URL directly, options will merge but we won't manually inject password
                redisClient = new Redis(process.env.REDIS_URL, redisCommonOptions);
                redisPub = new Redis(process.env.REDIS_URL, redisCommonOptions);
                redisSub = new Redis(process.env.REDIS_URL, redisCommonOptions);
            } else {
                console.log('🔑 REDIS_URL missing password, using REDIS_PASSWORD env var');
                const options = {
                    ...redisCommonOptions,
                    password: process.env.REDIS_PASSWORD || undefined
                };
                redisClient = new Redis(process.env.REDIS_URL, options);
                redisPub = new Redis(process.env.REDIS_URL, options);
                redisSub = new Redis(process.env.REDIS_URL, options);
            }
        } else {
            console.log('🔌 No REDIS_URL, connecting via host/port');
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
    } catch (error) {
        console.error('❌ Error parsing REDIS_URL:', error.message);
        console.log('⚠️ Falling back to simple connection string');
        // Fallback or re-throw? better to attempt basic connect with what we have
        const options = {
            ...redisCommonOptions,
            password: process.env.REDIS_PASSWORD
        };
        // If URL parsing failed, we might still want to try passing the raw string if it's not totally broken
        // But safer to assume maybe we should just rely on options if URL text is garbage?
        // Actually, if URL parsing fails, ioredis might verify it better.
        // Let's just try direct pass logic as last resort
        if (process.env.REDIS_URL) {
            redisClient = new Redis(process.env.REDIS_URL, options);
            redisPub = new Redis(process.env.REDIS_URL, options);
            redisSub = new Redis(process.env.REDIS_URL, options);
        } else {
            // Fallback to defaults
            redisClient = new Redis(options);
            redisPub = new Redis(options);
            redisSub = new Redis(options);
        }
    }
} else {
    console.log('⚠️ Development Mode: Using Mock Redis Client.');

    class MockRedis {
        constructor() { this.status = 'ready'; }
        on(event, callback) { return this; }
        async get() { return null; }
        async set() { return 'OK'; }
        async del() { return 1; }
        async keys() { return []; }
        async publish() { return 1; }
        async subscribe() { return 1; }
        async psubscribe() { return 1; }
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
