import { Controller, Post, Body, Req } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('onboarding')
  async completeOnboarding(@Body() payload: any, @Req() req: any) {
    // req.user is set by JwtAuthGuard after verifying the Supabase token
    const supabaseUserId = req.user?.userId;
    return this.usersService.completeOnboarding(payload, supabaseUserId);
  }
}

