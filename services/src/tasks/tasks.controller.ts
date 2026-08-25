import { Controller, Post, Patch, Body, Param, Get, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { TasksService } from './tasks.service';
import { TaskStatus } from '@prisma/client';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('project/:projectId')
  async getTasks(
    @Req() req: Request,
    @Param('projectId') projectId: string,
    @Query('assignedTo') assignedTo?: string
  ) {
    const userId = (req.user as any)?.userId || (req.user as any)?.sub || (req.user as any)?.id;
    return this.tasksService.getTasksForProject(projectId, userId, assignedTo);
  }

  @Get()
  async getAllTasks(
    @Req() req: Request,
    @Query('assignedTo') assignedTo?: string
  ) {
    const userId = (req.user as any)?.userId || (req.user as any)?.sub || (req.user as any)?.id;
    return this.tasksService.getTasksForProject('all', userId, assignedTo);
  }

  @Post()
  async createTask(@Body() body: any) {
    return this.tasksService.createTask(body.projectId, body);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: TaskStatus) {
    return this.tasksService.updateTaskStatus(id, status);
  }

  @Post(':id/assign')
  async assignUser(@Param('id') id: string, @Body('projectMemberId') projectMemberId: string) {
    return this.tasksService.assignUserToTask(id, projectMemberId);
  }
}
