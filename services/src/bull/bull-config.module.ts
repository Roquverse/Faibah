import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

/**
 * Global BullMQ configuration module.
 * Import BullModule.registerQueue({ name: 'my-queue' }) in feature modules to create queues.
 * Example:
 *   BullModule.registerQueue({ name: 'notifications' })
 */
@Global()
@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        // Parses REDIS_URL env var (e.g. redis://localhost:6380 or Railway's REDIS_URL)
        ...(process.env.REDIS_URL
          ? (() => {
              const url = new URL(process.env.REDIS_URL);
              return {
                host: url.hostname,
                port: Number(url.port) || 6379,
                password: url.password || undefined,
                tls: url.protocol === 'rediss:' ? {} : undefined,
              };
            })()
          : { host: 'localhost', port: 6380 }),
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: 100, // keep last 100 completed jobs
        removeOnFail: 50,      // keep last 50 failed jobs
      },
    }),
  ],
  exports: [BullModule],
})
export class BullConfigModule {}
