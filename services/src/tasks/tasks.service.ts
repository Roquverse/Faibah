import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TaskStatus, TaskPriority } from '@prisma/client';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway
  ) {}

  private async getAccessibleProjectIds(currentUserId?: string): Promise<string[]> {
    if (!currentUserId) return [];

    const user = await this.prisma.user.findUnique({
      where: { id: currentUserId },
      select: { id: true, email: true, companyId: true },
    });

    const clientContact = await this.prisma.clientContact.findFirst({
      where: { OR: [{ id: currentUserId }, { email: user?.email || currentUserId }] },
      select: { id: true, clientId: true, email: true },
    });

    const projectConditions: any[] = [];
    if (user?.companyId) {
      projectConditions.push({ client: { companyId: user.companyId } });
      projectConditions.push({ members: { some: { userId: user.id } } });
    }
    if (clientContact) {
      projectConditions.push({ clientId: clientContact.clientId });
      projectConditions.push({ client: { email: clientContact.email } });
      projectConditions.push({ members: { some: { clientContactId: clientContact.id } } });
      projectConditions.push({ members: { some: { user: { email: clientContact.email } } } });
    }
    if (user?.email) {
      projectConditions.push({ client: { email: user.email } });
      projectConditions.push({ client: { contacts: { some: { email: user.email } } } });
      projectConditions.push({ members: { some: { user: { email: user.email } } } });
    }

    if (projectConditions.length === 0) return [];

    const allowedProjects = await this.prisma.project.findMany({
      where: { OR: projectConditions },
      select: { id: true },
    });

    return allowedProjects.map(p => p.id);
  }

  async getTasksForProject(projectId: string, currentUserId?: string, assignedToMeUserId?: string) {
    const where: any = {};

    if (currentUserId) {
      const allowedIds = await this.getAccessibleProjectIds(currentUserId);
      if (projectId !== 'all') {
        if (!allowedIds.includes(projectId)) {
          return [];
        }
        where.projectId = projectId;
      } else {
        where.projectId = { in: allowedIds };
      }
    } else if (projectId !== 'all') {
      where.projectId = projectId;
    }

    if (assignedToMeUserId) {
      where.assignees = {
        some: {
          projectMember: {
            userId: assignedToMeUserId
          }
        }
      };
    }

    return this.prisma.task.findMany({
      where,
      include: {
        project: {
          select: { id: true, name: true }
        },
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
    const { collaboratorEmails = [], clientContactIds = [], priority = 'MEDIUM' } = data;
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
        priority: (priority as TaskPriority) || TaskPriority.MEDIUM,
        labels: data.labels || [],
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        assignees: {
          create: projectMemberIds.map(pmId => ({ projectMemberId: pmId }))
        }
      },
      include: {
        project: {
          select: { id: true, name: true }
        },
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
        project: {
          select: { id: true, name: true }
        },
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

  async assignUserToTask(taskId: string, projectMemberId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    
    const existing = await this.prisma.taskAssignee.findFirst({
      where: { taskId, projectMemberId }
    });
    if (existing) return task;

    await this.prisma.taskAssignee.create({
      data: { taskId, projectMemberId }
    });

    const updatedTask = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: { id: true, name: true }
        },
        assignees: {
          include: { projectMember: { include: { user: true, clientContact: true } } }
        },
        _count: {
          select: { messages: true }
        }
      }
    });
    
    if (updatedTask) {
      this.eventsGateway.broadcastToProject(updatedTask.projectId, 'task_status_changed', updatedTask);
    }
    return updatedTask;
  }
}
