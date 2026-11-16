let Redis = null;
try {
  const mod = await import('ioredis');
  Redis = mod.default || mod;
} catch {
  // ioredis package not installed or unavailable
}

import { logger } from './logger.js';

let redisClient = null;
let hasWarnedFallback = false;
let redisStatus = 'disabled';

function isEnabled() {
  if (!Redis) return false;
  const val = process.env.REDIS_ENABLED;
  if (val === 'false' || val === false) return false;
  // If in test mode and no explicit REDIS_URL or REDIS_TEST is set, default to false
  if (process.env.NODE_ENV === 'test' && !process.env.REDIS_URL && !process.env.ENABLE_REDIS_IN_TEST) {
    return false;
  }
  return true;
}

export function initRedis(customUrl) {
  if (redisClient) {
    return redisClient;
  }

  if (!isEnabled() || !Redis) {
    redisStatus = 'disabled';
    return null;
  }

  const url = customUrl || process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  try {
    redisClient = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      connectTimeout: 2000,
      retryStrategy: (times) => {
        if (times > 2) return null; // stop retrying quickly to fallback silently
        return Math.min(times * 200, 1000);
      },
    });

    redisClient.on('connect', () => {
      redisStatus = 'connected';
      logger.info('Redis cache connected successfully.');
    });

    redisClient.on('ready', () => {
      redisStatus = 'connected';
    });

    redisClient.on('error', (err) => {
      redisStatus = 'disconnected';
      if (!hasWarnedFallback) {
        hasWarnedFallback = true;
        logger.warn({ err: err?.message }, 'Redis is down or unreachable. Falling back silently to MongoDB.');
      }
    });

    redisClient.on('close', () => {
      redisStatus = 'disconnected';
    });

    redisClient.connect().catch((err) => {
      redisStatus = 'disconnected';
      if (!hasWarnedFallback) {
        hasWarnedFallback = true;
        logger.warn({ err: err?.message }, 'Initial Redis connection failed. Falling back to MongoDB.');
      }
    });
  } catch (err) {
    redisStatus = 'disconnected';
    if (!hasWarnedFallback) {
      hasWarnedFallback = true;
      logger.warn({ err: err?.message }, 'Failed to initialize Redis client. Falling back to MongoDB.');
    }
  }

  return redisClient;
}

// Auto-initialize if enabled
if (isEnabled()) {
  initRedis();
}

export function getRedisStatus() {
  if (!isEnabled() && !redisClient) return 'disabled';
  if (redisClient && (redisClient.status === 'ready' || redisClient.status === 'connected')) return 'connected';
  return redisStatus;
}

export function setRedisClientForTesting(client) {
  redisClient = client;
  redisStatus = client ? (client.status || 'connected') : 'disabled';
  hasWarnedFallback = false;
}

export function getRedisClient() {
  return redisClient;
}

export async function getOrSet(key, ttlSeconds = 300, loader) {
  if (typeof loader !== 'function') {
    throw new Error('Loader function must be provided to getOrSet');
  }

  const isReady = redisClient && (redisClient.status === 'ready' || redisClient.status === 'connected');
  if (!isReady) {
    return await loader();
  }

  try {
    const cached = await redisClient.get(key);
    if (cached !== null && cached !== undefined) {
      try {
        return JSON.parse(cached);
      } catch {
        return cached;
      }
    }
  } catch (err) {
    if (!hasWarnedFallback) {
      hasWarnedFallback = true;
      logger.warn({ err: err?.message }, 'Redis get error. Falling back to loader.');
    }
  }

  const result = await loader();

  if (result !== undefined && redisClient && (redisClient.status === 'ready' || redisClient.status === 'connected')) {
    try {
      const payload = typeof result === 'string' ? result : JSON.stringify(result);
      await redisClient.set(key, payload, 'EX', ttlSeconds);
    } catch (err) {
      // Ignore cache write failures silently
    }
  }

  return result;
}

export async function invalidate(prefix) {
  const isReady = redisClient && (redisClient.status === 'ready' || redisClient.status === 'connected');
  if (!isReady) {
    return;
  }

  try {
    const pattern = prefix.includes('*') ? prefix : `${prefix}*`;
    let cursor = '0';
    do {
      const [nextCursor, keys] = await redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } while (cursor !== '0');
  } catch (err) {
    // Invalidation failure should not break application logic
    logger.warn({ prefix, err: err?.message }, 'Failed to invalidate Redis cache pattern.');
  }
}

export async function closeRedis() {
  if (redisClient) {
    try {
      await redisClient.quit();
    } catch {
      redisClient.disconnect();
    }
    redisClient = null;
    redisStatus = 'disconnected';
    hasWarnedFallback = false;
  }
}
