import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const totalBusinesses = await this.prisma.company.count();
    
    // Calculate MRR from active monthly subscriptions
    const subscriptions = await this.prisma.subscription.findMany({
      where: { status: 'ACTIVE', frequency: 'MONTHLY' },
    });
    const mrr = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);

    const activeUsers = await this.prisma.user.count();
    
    // Calculate total transaction volume from successful payment records
    const payments = await this.prisma.paymentRecord.findMany();
    const transactionVolume = payments.reduce((sum, p) => sum + p.amount, 0);

    const recentSignups = await this.prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        users: { take: 1, orderBy: { createdAt: 'asc' } },
        subscriptions: { take: 1, orderBy: { createdAt: 'desc' } }
      }
    });

    // Calculate users by country
    // Since users don't have country directly, we can aggregate by Company.country or Client.country
    // We will do a generic distribution across a few known countries for now since it's hard to aggregate deeply nested optional fields without raw SQL,
    // Or we group by Company.country where not null.
    const companies = await this.prisma.company.findMany({
      where: { country: { not: null } },
      select: { country: true }
    });
    
    const countryCount: Record<string, number> = {};
    companies.forEach(c => {
      if (c.country) {
        countryCount[c.country] = (countryCount[c.country] || 0) + 1;
      }
    });

    // Recent activity logs
    const recentActivity = await this.prisma.activityEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Mockup for Revenue Chart (Area Chart) and Top Channels (Donut) until we build a full timeseries aggregator
    // For now, we will return some structural data so the frontend can map it dynamically, but we will seed the DB later.
    const revenueChartData = [
      { date: 'May 12', value: 10000 },
      { date: 'May 19', value: 15000 },
      { date: 'May 26', value: Math.floor(mrr * 0.7) },
      { date: 'Jun 02', value: 12000 },
      { date: 'Jun 09', value: mrr },
    ];

    const topChannels = [
      { name: 'Pro Plan', value: Math.floor(mrr * 0.6), color: '#3B82F6' },
      { name: 'Basic Plan', value: Math.floor(mrr * 0.3), color: '#10B981' },
      { name: 'Enterprise', value: Math.floor(mrr * 0.1), color: '#F59E0B' },
    ];

    return {
      totalBusinesses,
      mrr,
      activeUsers,
      transactionVolume,
      revenueChartData,
      topChannels,
      recentActivity: recentActivity.map(a => ({
        id: a.id,
        title: a.type.toString().replace('_', ' '),
        message: a.message,
        time: a.createdAt.toISOString()
      })),
      usersByCountry: Object.entries(countryCount).map(([country, count]) => ({ country, count })).sort((a,b) => b.count - a.count).slice(0, 5),
      recentSignups: recentSignups.map(c => ({
        id: c.id,
        name: c.name,
        plan: c.subscriptions?.[0]?.name || 'Free',
        owner: c.users?.[0]?.firstName ? `${c.users[0].firstName} ${c.users[0].lastName || ''}` : 'Unknown',
        date: c.createdAt.toISOString()
      }))
    };
  }

  async getBusinesses() {
    const companies = await this.prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        users: { orderBy: { createdAt: 'asc' } },
        clients: true,
        subscriptions: { orderBy: { createdAt: 'desc' } }
      }
    });

    return companies.map(c => {
      const owner = c.users?.[0];
      const activeSub = c.subscriptions.find(s => s.status === 'ACTIVE');
      return {
        id: c.id,
        name: c.name,
        owner: owner ? `${owner.firstName} ${owner.lastName || ''}` : 'Unknown',
        email: owner?.email || 'N/A',
        plan: activeSub?.name || 'Free',
        mrr: activeSub?.amount || 0,
        team: c.users.length,
        clients: c.clients.length,
        status: activeSub ? 'Active' : (c.subscriptions.length > 0 ? 'Suspended' : 'Trial'), // simplified logic
        date: c.createdAt.toISOString().split('T')[0]
      };
    });
  }

  async getBusinessDetail(id: string) {
    const c = await this.prisma.company.findUnique({
      where: { id },
      include: {
        users: { orderBy: { createdAt: 'asc' } },
        clients: true,
        subscriptions: { orderBy: { createdAt: 'desc' } }
      }
    });
    
    if (!c) return null;
    
    const owner = c.users?.[0];
    const activeSub = c.subscriptions.find(s => s.status === 'ACTIVE');

    // Stats
    const mrr = activeSub?.amount || 0;
    const team = c.users.length;
    
    // Total invoices and volume processed across all clients
    const invoices = await this.prisma.invoice.findMany({
      where: { clientId: { in: c.clients.map(cl => cl.id) } },
      include: { items: true, payments: true }
    });
    
    const invoicesSent = invoices.length;
    const volProcessed = invoices.reduce((sum, inv) => {
      return sum + inv.payments.reduce((pSum, p) => pSum + p.amount, 0);
    }, 0);

    return {
      id: c.id,
      name: c.name,
      owner: owner ? `${owner.firstName} ${owner.lastName || ''}` : 'Unknown',
      email: owner?.email || 'N/A',
      status: activeSub ? 'Active' : 'Trial',
      mrr,
      team,
      invoicesSent,
      volProcessed,
      billingHistory: c.subscriptions.map(s => ({
        date: s.createdAt.toISOString().split('T')[0],
        plan: `${s.name} (${s.frequency})`,
        amount: s.amount,
        status: s.status
      }))
    };
  }

  async getWebhookLogs() {
    const logs = await this.prisma.webhookLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { company: { select: { name: true } } }
    });

    return logs.map(l => ({
      id: l.id,
      provider: l.provider,
      event: l.event,
      status: l.status,
      tenant: l.company?.name || 'Unknown',
      time: l.createdAt.toISOString(),
      retryCount: l.retryCount
    }));
  }

  async getUsers() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        company: { select: { name: true } }
      }
    });

    return users.map(u => ({
      id: u.id,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown',
      email: u.email,
      type: u.userType || 'UNKNOWN',
      company: u.company?.name || 'N/A',
      date: u.createdAt.toISOString().split('T')[0]
    }));
  }

  async getSubscriptions() {
    const subs = await this.prisma.subscription.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        company: { select: { name: true } }
      }
    });

    return subs.map(s => ({
      id: s.id,
      tenant: s.company?.name || 'Unknown',
      plan: s.name,
      amount: s.amount,
      frequency: s.frequency,
      status: s.status,
      nextBilling: s.nextBillingDate.toISOString().split('T')[0]
    }));
  }

  async getAuditLogs() {
    const logs = await this.prisma.activityEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return logs.map(l => ({
      id: l.id,
      action: l.type,
      message: l.message,
      date: l.createdAt.toISOString()
    }));
  }

  async getTeam() {
    const admins = await this.prisma.user.findMany({
      where: { isSuperAdmin: true },
      orderBy: { createdAt: 'desc' }
    });

    return admins.map(a => ({
      id: a.id,
      name: `${a.firstName || ''} ${a.lastName || ''}`.trim() || 'Unknown',
      email: a.email,
      date: a.createdAt.toISOString().split('T')[0]
    }));
  }

  async getSupportTickets() {
    const tickets = await this.prisma.supportTicket.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { company: { select: { name: true } } }
    });

    return tickets.map(t => ({
      id: t.id,
      subject: t.subject,
      tenant: t.company?.name || 'Unknown',
      priority: t.priority,
      status: t.status,
      time: t.createdAt.toISOString(),
      message: t.message
    }));
  }

  async getFeatureFlags() {
    const flags = await this.prisma.featureFlag.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return flags.map(f => ({
      id: f.id,
      key: f.key,
      name: f.name,
      description: f.description,
      enabled: f.enabled,
      date: f.createdAt.toISOString().split('T')[0]
    }));
  }
}
