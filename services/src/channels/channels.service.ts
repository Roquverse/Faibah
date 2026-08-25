import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class ChannelsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway
  ) {}

  async getAllChannels() {
    return this.prisma.projectChannel.findMany({
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
