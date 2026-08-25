import { Controller, Post, Patch, Body, Param, Get, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TaskStatus } from '@prisma/client';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('project/:projectId')
  async getTasks(
    @Param('projectId') projectId: string,
    @Query('assignedTo') assignedTo?: string
  ) {
    return this.tasksService.getTasksForProject(projectId, assignedTo);
  }

  @Get()
  async getAllTasks(@Query('assignedTo') assignedTo?: string) {
    return this.tasksService.getTasksForProject('all', assignedTo);
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
