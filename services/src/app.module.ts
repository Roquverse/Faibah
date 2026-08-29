import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { TimeLogsModule } from './time-logs/time-logs.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma.module';
import { CompanyModule } from './company/company.module';
import { ProjectsModule } from './projects/projects.module';
import { ClientsModule } from './clients/clients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ChannelsModule } from './channels/channels.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { UploadModule } from './upload/upload.module';
import { EventsModule } from './events/events.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ReceiptsModule } from './receipts/receipts.module';
import { AdminModule } from './admin/admin.module';
import { ScheduleEventsModule } from './schedule-events/schedule-events.module';
import { RedisModule } from './redis/redis.module';
import { RedisThrottlerStorage } from './redis/redis-throttler.storage';
import { BullConfigModule } from './bull/bull-config.module';
import { REDIS_CLIENT } from './redis/redis.constants';
import { MailModule } from './mail/mail.module';
import { PaymentsModule } from './payments/payments.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

@Module({
  imports: [
    // ─── Redis (global) ────────────────────────────────────────────────
    RedisModule,

    // ─── Rate Limiting — Redis-backed (shared across instances) ────────
    ThrottlerModule.forRootAsync({
      inject: [REDIS_CLIENT],
      useFactory: (redis) => ({
        throttlers: [{ ttl: 60000, limit: 100 }],
        storage: new RedisThrottlerStorage(redis),
      }),
    }),

    // ─── Background Job Queues & Mail ─────────────────────────────────
    BullConfigModule,
    MailModule,

    // ─── App Modules ──────────────────────────────────────────────────
    PrismaModule,
    AuthModule,
    UsersModule,
    CompanyModule,
    ClientsModule,
    ProjectsModule,
    TasksModule,
    ScheduleEventsModule,
    TimeLogsModule,
    AppointmentsModule,
    ChannelsModule,
    UploadModule,
    EventsModule,
    InvoicesModule,
    ReceiptsModule,
    PaymentsModule,
    AdminModule,
    SubscriptionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
