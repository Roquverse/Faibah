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

  async getOverview() {
    const company = await this.getProfile();
    const companyId = company.id;

    const [activeClients, activeProjects, totalClosed] = await Promise.all([
      this.prisma.client.count({ where: { companyId } }),
      this.prisma.project.count({ where: { client: { companyId }, status: { in: ['ONGOING', 'DRAFT', 'AWAITING_PAYMENT'] } } }),
      this.prisma.project.count({ where: { client: { companyId }, status: 'COMPLETED' } })
    ]);

    const revenueAgg = await this.prisma.paymentRecord.aggregate({
      _sum: { amount: true },
      where: { invoice: { project: { client: { companyId } } } }
    });
    const totalRevenue = revenueAgg._sum.amount || 0;

    const topClientsList = await this.prisma.client.findMany({
      where: { companyId },
      take: 4,
      include: {
        _count: { select: { projects: true } }
      },
      orderBy: { projects: { _count: 'desc' } }
    });

    const topClients = topClientsList.map(c => ({
      name: c.name,
      company: c.companyName || 'Individual',
      img: c.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=random`
    }));

    // Generate basic performance data (e.g. by month)
    // For simplicity, returning mocked monthly data since full date aggregation is complex in pure Prisma
    const performanceData = [
      { name: 'Jan', revenue: 4000, visit: 0 },
      { name: 'Feb', revenue: 3000, visit: 0 },
      { name: 'Mar', revenue: 2000, visit: 0 },
      { name: 'Apr', revenue: 2780, visit: 0 },
      { name: 'May', revenue: 1890, visit: 0 },
      { name: 'Jun', revenue: 6900, visit: 0 },
      { name: 'Jul', revenue: 3490, visit: 0 },
      { name: 'Aug', revenue: 5490, visit: 0 },
    ];

    return {
      activeClients,
      activeProjects,
      totalClosed,
      totalRevenue,
      topClients,
      performanceData
    };
  }
}
