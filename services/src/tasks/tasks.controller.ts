import { Controller, Post, Patch, Body, Param, Get } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TaskStatus } from '@prisma/client';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('project/:projectId')
  async getTasks(@Param('projectId') projectId: string) {
    return this.tasksService.getTasksForProject(projectId);
  }

  @Post()
  async createTask(@Body() body: any) {
    return this.tasksService.createTask(body.projectId, body);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: TaskStatus) {
    return this.tasksService.updateTaskStatus(id, status);
  }
}
