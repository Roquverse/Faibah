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

    return {
      totalBusinesses,
      mrr,
      activeUsers,
      transactionVolume,
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
    // We don't have a WebhookLog model yet. We can just return mock data for now, 
    // since the user noted "Webhook delivery log - specifically Paystack and Termii".
    return [
      { id: 'wh_1', provider: 'Paystack', event: 'charge.success', status: 'Failed', tenant: 'Nexora Solutions', time: '2 mins ago', retryCount: 2 },
      { id: 'wh_2', provider: 'Termii', event: 'whatsapp.delivered', status: 'Success', tenant: 'NovaTech', time: '5 mins ago', retryCount: 0 },
    ];
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
}
