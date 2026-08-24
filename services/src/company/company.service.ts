import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    // Find company through the authenticated user's companyId
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });

    if (!user?.companyId) {
      return null; // User hasn't completed onboarding yet
    }

    const company = await this.prisma.company.findUnique({
      where: { id: user.companyId },
    });

    return company;
  }

  async updateProfile(userId: string, data: any) {
    const company = await this.getProfile(userId);
    if (!company) throw new Error('Company not found for this user');
    return this.prisma.company.update({
      where: { id: company.id },
      data,
    });
  }

  async getOverview(userId: string) {
    const company = await this.getProfile(userId);
    if (!company) {
      return {
        activeClients: 0,
        activeProjects: 0,
        totalClosed: 0,
        totalRevenue: 0,
        topClients: [],
        performanceData: [],
        subscriptions: [],
        reminders: [],
      };
    }
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

    // Generate performance data
    const currentYear = new Date().getFullYear();
    const payments = await this.prisma.paymentRecord.findMany({
      where: {
        invoice: { project: { client: { companyId } } },
        createdAt: { gte: new Date(`${currentYear}-01-01T00:00:00.000Z`) }
      },
      select: { amount: true, createdAt: true }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const performanceData = months.map(m => ({ name: m, revenue: 0, visit: 0 }));
    
    payments.forEach(p => {
      const monthIndex = p.createdAt.getMonth();
      performanceData[monthIndex].revenue += p.amount;
    });

    // Subscriptions
    const subscriptions = await this.prisma.subscription.findMany({
      where: { companyId, status: 'ACTIVE' },
      include: { client: { select: { name: true } } },
      orderBy: { nextBillingDate: 'asc' },
      take: 3,
    });

    // Reminders
    const reminders = await this.prisma.reminder.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      activeClients,
      activeProjects,
      totalClosed,
      totalRevenue,
      topClients,
      performanceData,
      subscriptions,
      reminders
    };
  }
}
