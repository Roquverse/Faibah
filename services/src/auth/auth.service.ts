import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthService {
  constructor(private readonly redisService: RedisService) {}

  /**
   * Blacklist a JWT so it can't be used after logout.
   * @param jti - The JWT's unique identifier claim
   * @param exp - The JWT's expiration Unix timestamp (seconds)
   */
  async logout(jti: string, exp: number): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    const ttl = Math.max(exp - now, 0);
    if (ttl > 0) {
      await this.redisService.blacklistToken(jti, ttl);
    }
  }
}
