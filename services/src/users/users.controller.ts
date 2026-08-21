import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { Public } from '../auth/public.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post('onboarding')
  async completeOnboarding(@Body() payload: any) {
    return this.usersService.completeOnboarding(payload);
  }
}
