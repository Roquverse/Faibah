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
    const { collaboratorEmails = [], clientContactIds = [] } = data;
    const projectMemberIds: string[] = [];

    // Process client contacts
    for (const contactId of clientContactIds) {
      let pm = await this.prisma.projectMember.findFirst({
        where: { projectId, clientContactId: contactId }
      });
      if (!pm) {
        pm = await this.prisma.projectMember.create({
          data: { projectId, clientContactId: contactId, memberType: 'CLIENT_CONTACT', role: 'VIEWER' }
        });
      }
      projectMemberIds.push(pm.id);
    }

    // Process collaborator emails
    for (const email of collaboratorEmails) {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail) continue;

      let user = await this.prisma.user.findUnique({ where: { email: cleanEmail } });
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email: cleanEmail,
            password: Math.random().toString(36).substring(7), // dummy password
            firstName: cleanEmail.split('@')[0],
          }
        });
      }

      let pm = await this.prisma.projectMember.findFirst({
        where: { projectId, userId: user.id }
      });
      if (!pm) {
        pm = await this.prisma.projectMember.create({
          data: { projectId, userId: user.id, memberType: 'TEAM_USER', role: 'CONTRACTOR' }
        });
      }
      projectMemberIds.push(pm.id);
    }

    const task = await this.prisma.task.create({
      data: {
        projectId,
        title: data.title,
        description: data.description,
        status: data.status || TaskStatus.TODO,
        labels: data.labels || [],
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        assignees: {
          create: projectMemberIds.map(pmId => ({ projectMemberId: pmId }))
        }
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
