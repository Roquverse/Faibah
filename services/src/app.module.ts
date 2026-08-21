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

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    CompanyModule,
    ClientsModule,
    ProjectsModule,
    TasksModule,
    TimeLogsModule,
    AppointmentsModule,
    ChannelsModule,
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
