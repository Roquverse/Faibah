import { Controller, Get, Patch, Body } from '@nestjs/common';
import { CompanyService } from './company.service';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('profile')
  getProfile() {
    return this.companyService.getProfile();
  }

  @Patch('profile')
  updateProfile(@Body() body: any) {
    return this.companyService.updateProfile(body);
  }
}
