import { Controller, Post, Body, Req, Get, Patch } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('onboarding')
  async completeOnboarding(@Body() payload: any, @Req() req: any) {
    const supabaseUserId = req.user?.userId;
    return this.usersService.completeOnboarding(payload, supabaseUserId);
  }

  @Get('profile')
  async getProfile(@Req() req: any) {
    const supabaseUserId = req.user?.userId;
    return this.usersService.getProfile(supabaseUserId);
  }

  @Patch('profile')
  async updateProfile(@Body() payload: any, @Req() req: any) {
    const supabaseUserId = req.user?.userId;
    return this.usersService.updateProfile(supabaseUserId, payload);
  }
}
