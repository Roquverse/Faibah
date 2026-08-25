import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class ChannelsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway
  ) {}

  async getAllChannels(userId?: string) {
    let whereClause: any = {};

    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, companyId: true, userType: true },
      });

      const clientContact = await this.prisma.clientContact.findFirst({
        where: { OR: [{ id: userId }, { email: user?.email || userId }] },
        select: { id: true, clientId: true, email: true },
      });

      const projectConditions: any[] = [];
      if (user?.userType !== 'CLIENT' && user?.companyId) {
        projectConditions.push({ client: { companyId: user.companyId } });
        projectConditions.push({ members: { some: { userId: user.id } } });
      }
      if (clientContact) {
        projectConditions.push({ clientId: clientContact.clientId });
        projectConditions.push({ client: { email: clientContact.email } });
        projectConditions.push({ members: { some: { clientContactId: clientContact.id } } });
      }
      if (user?.email) {
        if (user.userType === 'CLIENT' || !user.companyId) {
          projectConditions.push({ client: { email: user.email } });
          projectConditions.push({ client: { contacts: { some: { email: user.email } } } });
        }
        projectConditions.push({ members: { some: { user: { email: user.email } } } });
        projectConditions.push({ members: { some: { clientContact: { email: user.email } } } });
      }

      if (projectConditions.length > 0) {
        whereClause = {
          project: {
            OR: projectConditions
          }
        };
      } else {
        whereClause = { id: 'impossible-id' };
      }
    }

    return this.prisma.projectChannel.findMany({
      where: whereClause,
      include: {
        project: {
          include: { client: true }
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createChannel(projectId: string, channelName: string) {
    return this.prisma.projectChannel.create({
      data: { projectId, name: channelName },
      include: { 
        project: {
          include: { client: true }
        },
        _count: {
          select: { messages: true }
        }
      }
    });
  }

  async getChannelForProject(projectId: string, channelName: string = 'general') {
    let channel: any = await this.prisma.projectChannel.findFirst({
      where: { projectId, name: channelName },
      include: {
        project: {
          include: { client: true }
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            mentions: true,
            reactions: true,
          }
        },
      },
    });

    if (!channel) {
      channel = await this.prisma.projectChannel.create({
        data: { projectId, name: channelName },
        include: {
          project: {
            include: { client: true }
          },
          messages: true
        },
      });
    }

    return channel;
  }

  async postMessage(projectId: string, data: any) {
    const channelName = data.channelName || 'general';
    const channel = await this.getChannelForProject(projectId, channelName);

    const message = await this.prisma.channelMessage.create({
      data: {
        channelId: channel.id,
        senderId: data.senderId || 'SYS',
        senderType: data.senderType || 'TEAM',
        content: data.content,
        attachmentUrl: data.attachmentUrl,
        visibility: data.visibility || 'CLIENT_VISIBLE',
        messageType: data.messageType || 'TEXT',
        reviewStatus: data.messageType === 'REVIEW_REQUEST' ? 'PENDING' : null,
        topic: data.topic || null,
        taskId: data.taskId || null,
        mentions: data.mentions && data.mentions.length > 0 ? {
          create: data.mentions.map((m: any) => ({
            mentionedUserId: m.type === 'TEAM' ? m.id : null,
            mentionedClientId: m.type === 'CLIENT' ? m.id : null,
          }))
        } : undefined,
      },
      include: {
        mentions: true,
        reactions: true,
      }
    });
    
    this.eventsGateway.broadcastToProject(projectId, 'new_message', message);
    return message;
  }

  async updateReviewStatus(messageId: string, status: 'APPROVED' | 'CHANGES_REQUESTED') {
    return this.prisma.channelMessage.update({
      where: { id: messageId },
      data: { reviewStatus: status },
      include: { mentions: true, reactions: true }
    });
  }

  async toggleReaction(messageId: string, data: { reactorId: string, reactorType: 'TEAM' | 'CLIENT', emoji: string }) {
    const existingReaction = await this.prisma.channelReaction.findFirst({
      where: {
        messageId,
        reactorId: data.reactorId,
        emoji: data.emoji,
      },
    });

    if (existingReaction) {
      await this.prisma.channelReaction.delete({ where: { id: existingReaction.id } });
    } else {
      await this.prisma.channelReaction.create({
        data: {
          messageId,
          reactorId: data.reactorId,
          reactorType: data.reactorType,
          emoji: data.emoji,
        },
      });
    }

    return this.prisma.channelMessage.findUnique({
      where: { id: messageId },
      include: { mentions: true, reactions: true },
    });
  }
}
