import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async createTask(projectId: string, title: string, billable: boolean = true) {
    return this.prisma.task.create({
      data: {
        title,
        projectId,
        billable,
        status: TaskStatus.TODO
      }
    });
  }

  async updateTaskStatus(id: string, status: TaskStatus) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.task.update({
      where: { id },
      data: { status }
    });
  }
}
