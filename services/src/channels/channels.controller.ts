import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { ChannelsService } from './channels.service';

@Controller('projects/:projectId/channel')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get()
  async getChannel(@Param('projectId') projectId: string, @Query('channel') channelName?: string) {
    return this.channelsService.getChannelForProject(projectId, channelName);
  }

  @Post('messages')
  async postMessage(@Param('projectId') projectId: string, @Body() data: any) {
    return this.channelsService.postMessage(projectId, data);
  }

  @Patch('messages/:messageId/review')
  async updateReviewStatus(
    @Param('messageId') messageId: string,
    @Body('status') status: 'APPROVED' | 'CHANGES_REQUESTED',
  ) {
    return this.channelsService.updateReviewStatus(messageId, status);
  }

  @Post('messages/:messageId/reactions')
  async toggleReaction(
    @Param('messageId') messageId: string,
    @Body() data: { reactorId: string; reactorType: 'TEAM' | 'CLIENT'; emoji: string }
  ) {
    return this.channelsService.toggleReaction(messageId, data);
  }
}
