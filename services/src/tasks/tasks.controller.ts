import { Controller, Post, Patch, Body, Param } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TaskStatus } from '@prisma/client';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async createTask(@Body() body: { projectId: string, title: string, billable?: boolean }) {
    return this.tasksService.createTask(body.projectId, body.title, body.billable);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: TaskStatus) {
    return this.tasksService.updateTaskStatus(id, status);
  }
}
