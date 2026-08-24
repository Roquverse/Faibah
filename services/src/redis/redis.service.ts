import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  /**
   * Blacklist a JWT by its JTI (JWT ID) until it expires.
   * @param jti - The JWT's unique identifier (jti claim)
   * @param ttlSeconds - Seconds until the token naturally expires
   */
  async blacklistToken(jti: string, ttlSeconds: number): Promise<void> {
    await this.redis.set(`bl:${jti}`, '1', 'EX', ttlSeconds);
  }

  /**
   * Check if a JWT JTI has been blacklisted (i.e. the user logged out).
   */
  async isBlacklisted(jti: string): Promise<boolean> {
    const result = await this.redis.get(`bl:${jti}`);
    return result === '1';
  }

  /**
   * Generic cache get.
   */
  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  /**
   * Generic cache set with optional TTL in seconds.
   */
  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await this.redis.set(key, serialized, 'EX', ttlSeconds);
    } else {
      await this.redis.set(key, serialized);
    }
  }

  /**
   * Delete a cache key.
   */
  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  /**
   * Delete all keys matching a pattern (e.g. invalidate a resource's cache).
   */
  async delByPattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
