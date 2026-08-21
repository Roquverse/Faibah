import { Controller, Post, Patch, Get, Body, Param } from '@nestjs/common';
import { TimeLogsService } from './time-logs.service';

@Controller('tasks/:taskId/time-logs')
export class TimeLogsController {
  constructor(private readonly timeLogsService: TimeLogsService) {}

  @Post('start')
  async start(@Param('taskId') taskId: string, @Body('userId') userId: string) {
    return this.timeLogsService.startTimeLog(taskId, userId);
  }

  @Patch('stop')
  async stop(@Param('taskId') taskId: string, @Body('userId') userId: string) {
    return this.timeLogsService.stopTimeLog(taskId, userId);
  }

  @Get()
  async getLogs(@Param('taskId') taskId: string) {
    return this.timeLogsService.getTimeLogsByTask(taskId);
  }
}
