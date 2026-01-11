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
    if (!redisClient) return false;
    try {
        const key = `conversation:${userId}`;
        await redisClient.setex(key, CACHE_TTL.CONVERSATION, JSON.stringify(conversationData));
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Get cached conversation
 */
async function getCachedConversation(userId) {
    if (!redisClient) return null;
    try {
        const key = `conversation:${userId}`;
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        return null;
    }
}

/**
 * Cache a message
 */
async function cacheMessage(messageId, messageData) {
    if (!redisClient) return false;
    try {
        const key = `message:${messageId}`;
        await redisClient.setex(key, CACHE_TTL.MESSAGE, JSON.stringify(messageData));
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Get cached message
 */
async function getCachedMessage(messageId) {
    if (!redisClient) return null;
    try {
        const key = `message:${messageId}`;
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        return null;
    }
}

/**
 * Set user as online
 */
async function setUserOnline(userId, socketId) {
    if (!redisClient) return false;
    try {
        const key = `user:online:${userId}`;
        await redisClient.setex(key, CACHE_TTL.USER_PRESENCE, socketId);
        await redisClient.sadd('users:online', userId);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Set user as offline
 */
async function setUserOffline(userId) {
    if (!redisClient) return false;
    try {
        const key = `user:online:${userId}`;
        await redisClient.del(key);
        await redisClient.srem('users:online', userId);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Check if user is online
 */
async function isUserOnline(userId) {
    if (!redisClient) return false;
    try {
        const key = `user:online:${userId}`;
        const exists = await redisClient.exists(key);
        return exists === 1;
    } catch (error) {
        return false;
    }
}

/**
 * Get all online users
 */
async function getOnlineUsers() {
    if (!redisClient) return [];
    try {
        const userIds = await redisClient.smembers('users:online');
        return userIds;
    } catch (error) {
        return [];
    }
}

/**
 * Invalidate conversation cache
 */
async function invalidateConversationCache(userId) {
    if (!redisClient) return false;
    try {
        const key = `conversation:${userId}`;
        await redisClient.del(key);
        return true;
    } catch (error) {
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
