import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  async getAllSubscriptions(@Req() req: any) {
    return this.subscriptionsService.getAllSubscriptions(req.user?.id || req.user?.userId || req.user?.sub);
  }

  @Get('upcoming')
  async getUpcomingSubscriptions(@Req() req: any) {
    return this.subscriptionsService.getUpcomingSubscriptions(req.user?.id || req.user?.userId || req.user?.sub);
  }

  @Post()
  async createSubscription(@Body() data: any) {
    return this.subscriptionsService.createSubscription(data);
  }

  @Patch(':id')
  async updateSubscription(@Param('id') id: string, @Body() data: any) {
    return this.subscriptionsService.updateSubscription(id, data);
  }

  @Delete(':id')
  async deleteSubscription(@Param('id') id: string) {
    return this.subscriptionsService.deleteSubscription(id);
  }
}
