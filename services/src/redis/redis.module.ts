import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisService } from './redis.service';
import { REDIS_CLIENT } from './redis.constants';

export { REDIS_CLIENT } from './redis.constants';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        const client = new Redis(
          process.env.REDIS_URL || 'redis://localhost:6380',
          {
            maxRetriesPerRequest: null,
            lazyConnect: false,
          },
        );
        client.on('connect', () => console.log('[Redis] Connected'));
        client.on('error', (err) => console.error('[Redis] Error:', err));
        return client;
      },
    },
    RedisService,
  ],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule {}
