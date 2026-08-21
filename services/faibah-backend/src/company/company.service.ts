import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async getProfile() {
    // For MVP, return the first company found since there's no auth context yet
    const company = await this.prisma.company.findFirst();
    if (!company) {
      // Auto-create a default company if none exists
      return this.prisma.company.create({
        data: {
          name: 'Faiba Pro',
          workType: 'Design Agency',
          defaultCurrency: 'NGN',
          taxRate: 7.5,
          requireDeposit: true,
          depositPercent: 50,
          teamSize: 'Just me (Solo)'
        }
      });
    }
    return company;
  }

  async updateProfile(data: any) {
    const company = await this.getProfile();
    return this.prisma.company.update({
      where: { id: company.id },
      data,
    });
  }
}
