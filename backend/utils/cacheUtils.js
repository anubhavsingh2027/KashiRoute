const redisClient = require("../config/redis");

/**
 * Cache configuration with TTL (Time To Live) in seconds
 */
const CACHE_CONFIG = {
  carDetails: {
    key: "carDetails:all",
    ttl: 3600, // 1 hour
  },
  carDetailsById: {
    prefix: "carDetails:",
    ttl: 3600, // 1 hour
  },
  packageDetails: {
    key: "packageDetails:all",
    ttl: 3600, // 1 hour
  },
  packageDetailsById: {
    prefix: "packageDetails:",
    ttl: 3600, // 1 hour
  },
  userDetails: {
    key: "userDetails:all",
    ttl: 1800, // 30 minutes
  },
  userDetailsById: {
    prefix: "userDetails:",
    ttl: 1800, // 30 minutes
  },
  bookings: {
    key: "bookings:all",
    ttl: 900, // 15 minutes
  },
  bookingsById: {
    prefix: "bookings:",
    ttl: 900, // 15 minutes
  },
};

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {Promise<any>} - Cached value or null
 */
const getCache = async (key) => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    const data = await redisClient.get(key);
    if (data) {
      console.log(`Cache HIT for key: ${key}`);
      return JSON.parse(data);
    }
    console.log(`Cache MISS for key: ${key}`);
    return null;
  } catch (err) {
    console.error(`Error getting cache for key ${key}:`, err);
    return null; // Return null on error, fallback to DB
  }
};

/**
 * Set value in cache with TTL
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<boolean>} - Success status
 */
const setCache = async (key, value, ttl = 3600) => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    await redisClient.setEx(key, ttl, JSON.stringify(value));
    console.log(`Cache SET for key: ${key} with TTL: ${ttl}s`);
    return true;
  } catch (err) {
    console.error(`Error setting cache for key ${key}:`, err);
    return false;
  }
};

/**
 * Delete specific cache key
 * @param {string} key - Cache key to delete
 * @returns {Promise<boolean>} - Success status
 */
const deleteCache = async (key) => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    await redisClient.del(key);
    console.log(`Cache DELETED for key: ${key}`);
    return true;
  } catch (err) {
    console.error(`Error deleting cache for key ${key}:`, err);
    return false;
  }
};

/**
 * Delete multiple cache keys by pattern
 * @param {string} pattern - Key pattern (e.g., "carDetails:*")
 * @returns {Promise<boolean>} - Success status
 */
const deleteCacheByPattern = async (pattern) => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(
        `Cache DELETED ${keys.length} keys matching pattern: ${pattern}`,
      );
    }
    return true;
  } catch (err) {
    console.error(`Error deleting cache by pattern ${pattern}:`, err);
    return false;
  }
};

/**
 * Clear all cache
 * @returns {Promise<boolean>} - Success status
 */
const clearAllCache = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    await redisClient.flushDb();
    console.log("All cache CLEARED");
    return true;
  } catch (err) {
    console.error("Error clearing all cache:", err);
    return false;
  }
};

/**
 * Get cache statistics
 * @returns {Promise<object>} - Cache stats
 */
const getCacheStats = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    const info = await redisClient.info("stats");
    return info;
  } catch (err) {
    console.error("Error getting cache stats:", err);
    return null;
  }
};

module.exports = {
  getCache,
  setCache,
  deleteCache,
  deleteCacheByPattern,
  clearAllCache,
  getCacheStats,
  CACHE_CONFIG,
  redisClient,
};
