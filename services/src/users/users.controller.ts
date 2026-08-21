import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('onboarding')
  async completeOnboarding(@Body() payload: any) {
    return this.usersService.completeOnboarding(payload);
  }
}
