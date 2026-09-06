import { Controller, Get, Patch, Body, Req, Post } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import type { Request } from 'express';
import { CompanyService } from './company.service';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('profile')
  getProfile(@Req() req: Request) {
    const userId = (req.user as any)?.userId || (req.user as any)?.sub || (req.user as any)?.id;
    return this.companyService.getProfile(userId);
  }

  @Patch('profile')
  updateProfile(@Req() req: Request, @Body() body: any) {
    const userId = (req.user as any)?.userId || (req.user as any)?.sub || (req.user as any)?.id;
    return this.companyService.updateProfile(userId, body);
  }

  @Get('team')
  getTeamMembers(@Req() req: Request) {
    const userId = (req.user as any)?.userId || (req.user as any)?.sub || (req.user as any)?.id;
    return this.companyService.getTeamMembers(userId);
  }

  @Post('invite')
  inviteTeamMember(@Req() req: Request, @Body() body: { email: string; role?: string }) {
    const userId = (req.user as any)?.userId || (req.user as any)?.sub || (req.user as any)?.id;
    return this.companyService.inviteTeamMember(userId, body.email, body.role);
  }

  @Get('overview')
  async getOverview(@Req() req: Request) {
    let userId = (req.user as any)?.userId || (req.user as any)?.sub || (req.user as any)?.id;
    return this.companyService.getOverview(userId);
  }
}
