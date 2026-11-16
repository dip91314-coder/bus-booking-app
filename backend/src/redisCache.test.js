import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from './app.js';
import {
  getOrSet,
  invalidate,
  getRedisStatus,
  setRedisClientForTesting,
} from './config/redis.js';

describe('Redis Caching, Invalidation & Resilient Fallback', () => {
  let mongo;
  let app;
  let inMemoryCache;
  let mockRedisClient;

  beforeEach(async () => {
    inMemoryCache = new Map();

    mockRedisClient = {
      status: 'ready',
      get: vi.fn(async (key) => inMemoryCache.get(key) || null),
      set: vi.fn(async (key, value, _mode, _ttl) => {
        inMemoryCache.set(key, value);
        return 'OK';
      }),
      del: vi.fn(async (...keys) => {
        let count = 0;
        for (const k of keys) {
          if (inMemoryCache.delete(k)) count++;
        }
        return count;
      }),
      scan: vi.fn(async (_cursor, _match, pattern) => {
        const regex = new RegExp(`^${pattern.replace('*', '.*')}$`);
        const matchingKeys = Array.from(inMemoryCache.keys()).filter((k) => regex.test(k));
        return ['0', matchingKeys];
      }),
    };

    setRedisClientForTesting(mockRedisClient);
  });

  afterEach(() => {
    setRedisClientForTesting(null);
    vi.restoreAllMocks();
  });

  it('Cache Miss: loads data via loader and populates cache', async () => {
    const loader = vi.fn(async () => ({ message: 'from database' }));

    const result = await getOrSet('test:key:1', 60, loader);

    expect(result).toEqual({ message: 'from database' });
    expect(loader).toHaveBeenCalledTimes(1);
    expect(mockRedisClient.get).toHaveBeenCalledWith('test:key:1');
    expect(mockRedisClient.set).toHaveBeenCalledWith(
      'test:key:1',
      JSON.stringify({ message: 'from database' }),
      'EX',
      60
    );
  });

  it('Cache Hit: returns cached data without calling loader', async () => {
    inMemoryCache.set('test:key:hit', JSON.stringify({ message: 'cached data' }));
    const loader = vi.fn(async () => ({ message: 'should not be called' }));

    const result = await getOrSet('test:key:hit', 60, loader);

    expect(result).toEqual({ message: 'cached data' });
    expect(loader).not.toHaveBeenCalled();
    expect(mockRedisClient.get).toHaveBeenCalledWith('test:key:hit');
    expect(mockRedisClient.set).not.toHaveBeenCalled();
  });

  it('Cache Invalidation: removes all keys matching prefix', async () => {
    inMemoryCache.set('trips:search:kolkata:digha', JSON.stringify([{ id: 'trip1' }]));
    inMemoryCache.set('trips:search:delhi:jaipur', JSON.stringify([{ id: 'trip2' }]));
    inMemoryCache.set('offers:active', JSON.stringify([{ code: 'YATRAFIRST' }]));

    await invalidate('trips:');

    expect(inMemoryCache.has('trips:search:kolkata:digha')).toBe(false);
    expect(inMemoryCache.has('trips:search:delhi:jaipur')).toBe(false);
    expect(inMemoryCache.has('offers:active')).toBe(true); // untouched
  });

  it('Redis-Down Fallback: continues working and falls back to loader when Redis fails', async () => {
    // Simulate failing Redis client
    mockRedisClient.get.mockRejectedValueOnce(new Error('Connection lost'));
    mockRedisClient.set.mockRejectedValueOnce(new Error('Write error'));

    const loader = vi.fn(async () => ({ fallback: 'database value' }));

    const result = await getOrSet('test:failing:key', 60, loader);

    expect(result).toEqual({ fallback: 'database value' });
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('Redis-Disabled Fallback: getOrSet executes loader directly without throwing', async () => {
    setRedisClientForTesting(null);

    const loader = vi.fn(async () => ({ fresh: 'direct data' }));
    const result = await getOrSet('test:disabled:key', 60, loader);

    expect(result).toEqual({ fresh: 'direct data' });
    expect(loader).toHaveBeenCalledTimes(1);

    // Invalidate should also not throw when Redis is disabled
    await expect(invalidate('anything')).resolves.not.toThrow();
  });

  it('Health Check: GET /api/health reports MongoDB and Redis status', async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    app = createApp();

    const res = await request(app).get('/api/health').expect(200);

    expect(res.body.status).toBe('healthy');
    expect(res.body.mongo).toBe('connected');
    expect(res.body.redis).toBe('connected');

    // Simulate Redis disabled
    setRedisClientForTesting(null);
    expect(getRedisStatus()).toBe('disabled');

    const resDisabled = await request(app).get('/api/health').expect(200);
    expect(resDisabled.body.redis).toBe('disabled');

    await mongoose.disconnect();
    await mongo.stop();
  });
});
