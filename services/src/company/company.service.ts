import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId?: string) {
    if (!userId) return null;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });

    if (!user?.companyId) {
      return null;
    }

    return this.prisma.company.findUnique({
      where: { id: user.companyId },
    });
  }

  async updateProfile(userId: string | undefined, data: any) {
    if (!userId) throw new Error('User not authenticated');
    const company = await this.getProfile(userId);
    if (!company) throw new Error('Company not found for this user');
    return this.prisma.company.update({
      where: { id: company.id },
      data,
    });
  }

  async getOverview(userId?: string) {
    const emptyOverview = {
      activeClients: 0,
      activeProjects: 0,
      totalClosed: 0,
      totalRevenue: 0,
      topClients: [],
      performanceData: [],
      subscriptions: [],
      reminders: [],
    };

    if (!userId) return emptyOverview;

    const company = await this.getProfile(userId);
    if (!company) return emptyOverview;

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

    const subscriptions = await this.prisma.subscription.findMany({
      where: { companyId, status: 'ACTIVE' },
      include: { client: { select: { name: true } } },
      orderBy: { nextBillingDate: 'asc' },
      take: 3,
    });

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

  async getTeamMembers(userId?: string) {
    if (!userId) return [];
    const company = await this.getProfile(userId);
    if (!company) return [];

    return this.prisma.user.findMany({
      where: { companyId: company.id },
      select: { id: true, email: true, firstName: true, lastName: true, userType: true, createdAt: true },
    });
  }

  async inviteTeamMember(userId: string | undefined, email: string, role?: string) {
    if (!userId) throw new Error('User not authenticated');
    const company = await this.getProfile(userId);
    if (!company) throw new Error('Company not found for this user');

    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase admin credentials are not configured. Cannot send email invite.');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);
    if (error) {
      throw new Error(`Failed to invite user: ${error.message}`);
    }

    const newUserId = data.user.id;
    const existing = await this.prisma.user.findUnique({ where: { id: newUserId } });
    
    if (existing) {
      await this.prisma.user.update({
        where: { id: newUserId },
        data: { companyId: company.id, userType: 'PROFESSIONAL' }
      });
    } else {
      await this.prisma.user.create({
        data: {
          id: newUserId,
          email,
          password: Math.random().toString(36).slice(-10),
          companyId: company.id,
          userType: 'PROFESSIONAL',
        }
      });
    }

    return { success: true, message: 'Invitation sent', userId: newUserId };
  }
}
