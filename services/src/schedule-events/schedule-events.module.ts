import { Module } from '@nestjs/common';
import { ScheduleEventsController } from './schedule-events.controller';
import { ScheduleEventsService } from './schedule-events.service';
import { PrismaModule } from '../prisma.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [PrismaModule, EventsModule],
  controllers: [ScheduleEventsController],
  providers: [ScheduleEventsService],
  exports: [ScheduleEventsService],
})
export class ScheduleEventsModule {}
