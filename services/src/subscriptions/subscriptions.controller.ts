import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  async getAllSubscriptions(@Req() req: any) {
    return this.subscriptionsService.getAllSubscriptions(req.user?.id);
  }

  @Get('upcoming')
  async getUpcomingSubscriptions(@Req() req: any) {
    return this.subscriptionsService.getUpcomingSubscriptions(req.user?.id);
  }
}
