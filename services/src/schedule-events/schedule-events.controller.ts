import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ScheduleEventsService } from './schedule-events.service';

@Controller('schedule-events')
export class ScheduleEventsController {
  constructor(private readonly scheduleEventsService: ScheduleEventsService) {}

  @Get()
  async getEvents(@Query('projectId') projectId?: string) {
    return this.scheduleEventsService.getEvents(projectId);
  }

  @Post()
  async createEvent(@Body() body: any) {
    return this.scheduleEventsService.createEvent(body);
  }

  @Patch(':id')
  async updateEvent(@Param('id') id: string, @Body() body: any) {
    return this.scheduleEventsService.updateEvent(id, body);
  }

  @Delete(':id')
  async deleteEvent(@Param('id') id: string) {
    return this.scheduleEventsService.deleteEvent(id);
  }
}
