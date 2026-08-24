import { Injectable, Inject } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.module';

// Mirror of @nestjs/throttler ThrottlerStorageRecord (not publicly exported)
interface ThrottlerRecord {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
}

/**
 * Redis-backed throttler storage — compatible with @nestjs/throttler v6 / NestJS v11.
 * Replaces the default in-memory store so rate limits persist across restarts
 * and are shared between multiple service instances.
 */
@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerRecord> {
    const redisKey = `throttle:${throttlerName}:${key}`;
    const blockKey = `throttle:block:${throttlerName}:${key}`;

    // Check if currently blocked
    const blocked = await this.redis.get(blockKey);
    if (blocked) {
      const blockTtl = await this.redis.ttl(blockKey);
      return {
        totalHits: limit + 1,
        timeToExpire: ttl,
        isBlocked: true,
        timeToBlockExpire: Math.max(blockTtl, 0),
      };
    }

    const pipeline = this.redis.pipeline();
    pipeline.incr(redisKey);
    pipeline.pttl(redisKey);
    const results = await pipeline.exec();

    const totalHits = (results?.[0]?.[1] as number) ?? 1;
    let pttlMs = (results?.[1]?.[1] as number) ?? -1;

    // Set expiry on first hit (or if somehow missing)
    if (totalHits === 1 || pttlMs < 0) {
      await this.redis.pexpire(redisKey, ttl * 1000);
      pttlMs = ttl * 1000;
    }

    const timeToExpire = Math.ceil(pttlMs / 1000);

    let isBlocked = false;
    let timeToBlockExpire = 0;

    if (totalHits > limit) {
      await this.redis.set(blockKey, '1', 'EX', blockDuration);
      isBlocked = true;
      timeToBlockExpire = blockDuration;
    }

    return { totalHits, timeToExpire, isBlocked, timeToBlockExpire };
  }
}
