import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TaskStatus } from '@prisma/client';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway
  ) {}

  async getTasksForProject(projectId: string) {
    return this.prisma.task.findMany({
      where: { projectId },
      include: {
        assignees: {
          include: { projectMember: { include: { user: true, clientContact: true } } }
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createTask(projectId: string, data: any) {
    const task = await this.prisma.task.create({
      data: {
        projectId,
        title: data.title,
        description: data.description,
        status: data.status || TaskStatus.TODO,
        labels: data.labels || [],
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
      include: {
        assignees: {
          include: { projectMember: { include: { user: true, clientContact: true } } }
        },
        _count: {
          select: { messages: true }
        }
      }
    });

    this.eventsGateway.broadcastToProject(projectId, 'task_created', task);
    return task;
  }

  async updateTaskStatus(id: string, status: TaskStatus) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: { status },
      include: {
        assignees: {
          include: { projectMember: { include: { user: true, clientContact: true } } }
        },
        _count: {
          select: { messages: true }
        }
      }
    });

    this.eventsGateway.broadcastToProject(updatedTask.projectId, 'task_status_changed', updatedTask);
    return updatedTask;
  }
}
