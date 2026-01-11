const { redisClient } = require('../config/redis');

// Cache expiration times (in seconds)
const CACHE_TTL = {
    CONVERSATION: 3600, // 1 hour
    MESSAGE: 1800, // 30 minutes
    USER_PRESENCE: 300 // 5 minutes
};

/**
 * Cache user conversations
 */
async function cacheConversation(userId, conversationData) {
    try {
        const key = `conversation:${userId}`;
        await redisClient.setex(key, CACHE_TTL.CONVERSATION, JSON.stringify(conversationData));
        return true;
    } catch (error) {
        console.error('Error caching conversation:', error);
        return false;
    }
}

/**
 * Get cached conversation
 */
async function getCachedConversation(userId) {
    try {
        const key = `conversation:${userId}`;
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error getting cached conversation:', error);
        return null;
    }
}

/**
 * Cache a message
 */
async function cacheMessage(messageId, messageData) {
    try {
        const key = `message:${messageId}`;
        await redisClient.setex(key, CACHE_TTL.MESSAGE, JSON.stringify(messageData));
        return true;
    } catch (error) {
        console.error('Error caching message:', error);
        return false;
    }
}

/**
 * Get cached message
 */
async function getCachedMessage(messageId) {
    try {
        const key = `message:${messageId}`;
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error getting cached message:', error);
        return null;
    }
}

/**
 * Set user as online
 */
async function setUserOnline(userId, socketId) {
    try {
        const key = `user:online:${userId}`;
        await redisClient.setex(key, CACHE_TTL.USER_PRESENCE, socketId);

        // Add to online users set
        await redisClient.sadd('users:online', userId);
        return true;
    } catch (error) {
        console.error('Error setting user online:', error);
        return false;
    }
}

/**
 * Set user as offline
 */
async function setUserOffline(userId) {
    try {
        const key = `user:online:${userId}`;
        await redisClient.del(key);

        // Remove from online users set
        await redisClient.srem('users:online', userId);
        return true;
    } catch (error) {
        console.error('Error setting user offline:', error);
        return false;
    }
}

/**
 * Check if user is online
 */
async function isUserOnline(userId) {
    try {
        const key = `user:online:${userId}`;
        const exists = await redisClient.exists(key);
        return exists === 1;
    } catch (error) {
        console.error('Error checking user online status:', error);
        return false;
    }
}

/**
 * Get all online users
 */
async function getOnlineUsers() {
    try {
        const userIds = await redisClient.smembers('users:online');
        return userIds;
    } catch (error) {
        console.error('Error getting online users:', error);
        return [];
    }
}

/**
 * Invalidate conversation cache
 */
async function invalidateConversationCache(userId) {
    try {
        const key = `conversation:${userId}`;
        await redisClient.del(key);
        return true;
    } catch (error) {
        console.error('Error invalidating conversation cache:', error);
        return false;
    }
}

module.exports = {
    cacheConversation,
    getCachedConversation,
    cacheMessage,
    getCachedMessage,
    setUserOnline,
    setUserOffline,
    isUserOnline,
    getOnlineUsers,
    invalidateConversationCache
};
