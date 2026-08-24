import { Controller, Get, Patch, Body, Req } from '@nestjs/common';
import type { Request } from 'express';
import { CompanyService } from './company.service';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('profile')
  getProfile(@Req() req: Request) {
    const userId = (req.user as any)?.userId;
    return this.companyService.getProfile(userId);
  }

  @Patch('profile')
  updateProfile(@Req() req: Request, @Body() body: any) {
    const userId = (req.user as any)?.userId;
    return this.companyService.updateProfile(userId, body);
  }

  @Get('overview')
  getOverview(@Req() req: Request) {
    const userId = (req.user as any)?.userId;
    return this.companyService.getOverview(userId);
  }
}
