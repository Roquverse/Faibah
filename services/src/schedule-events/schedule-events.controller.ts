import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ScheduleEventsService } from './schedule-events.service';

@Controller('schedule-events')
export class ScheduleEventsController {
  constructor(private readonly scheduleEventsService: ScheduleEventsService) {}

  @Get()
  async getEvents(
    @Req() req: Request,
    @Query('projectId') projectId?: string
  ) {
    const userId = (req.user as any)?.userId || (req.user as any)?.sub || (req.user as any)?.id;
    return this.scheduleEventsService.getEvents(projectId, userId);
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
