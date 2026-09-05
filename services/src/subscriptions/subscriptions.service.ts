import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SubscriptionFrequency } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async getAllSubscriptions(userId?: string) {
    let whereClause: any = {};

    if (userId && userId !== 'dev-user') {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, companyId: true, userType: true, email: true },
      });

      const clientContact = await this.prisma.clientContact.findFirst({
        where: { OR: [{ id: userId }, { email: user?.email || userId }] },
        select: { id: true, clientId: true, email: true },
      });

      if (user?.userType === 'CLIENT' || !user?.companyId || clientContact) {
        if (clientContact) {
          whereClause = { clientId: clientContact.clientId };
        } else if (user?.email) {
          whereClause = { client: { email: user.email } };
        } else {
          whereClause = { id: 'impossible-id' };
        }
      } else if (user?.companyId) {
        whereClause = { companyId: user.companyId };
      }
    }

    return this.prisma.subscription.findMany({
      where: whereClause,
      include: {
        client: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSubscription(data: {
    name: string;
    amount: number;
    frequency: SubscriptionFrequency;
    nextBillingDate: string | Date;
    clientId?: string;
  }) {
    let finalClientId = data.clientId;
    if (!finalClientId) {
      const company = await this.prisma.company.findFirst();
      const firstClient = await this.prisma.client.findFirst({ where: { companyId: company?.id } });
      if (firstClient) finalClientId = firstClient.id;
    }
    
    if (!finalClientId) throw new NotFoundException('Client not found');

    const client = await this.prisma.client.findUnique({ where: { id: finalClientId } });
    if (!client) throw new NotFoundException('Client not found');

    return this.prisma.subscription.create({
      data: {
        name: data.name,
        amount: Number(data.amount),
        frequency: data.frequency,
        nextBillingDate: new Date(data.nextBillingDate),
        clientId: finalClientId,
        companyId: client.companyId,
      },
      include: { client: true }
    });
  }

  async updateSubscription(id: string, data: Partial<{ name: string; amount: number; frequency: SubscriptionFrequency; nextBillingDate: string | Date; status: any }>) {
    const existing = await this.prisma.subscription.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Subscription not found');

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.amount !== undefined) updateData.amount = Number(data.amount);
    if (data.frequency !== undefined) updateData.frequency = data.frequency;
    if (data.nextBillingDate !== undefined) updateData.nextBillingDate = new Date(data.nextBillingDate);
    if (data.status !== undefined) updateData.status = data.status;

    return this.prisma.subscription.update({
      where: { id },
      data: updateData,
      include: { client: true }
    });
  }

  async deleteSubscription(id: string) {
    const existing = await this.prisma.subscription.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Subscription not found');
    await this.prisma.subscription.delete({ where: { id } });
    return { success: true };
  }

  async getUpcomingSubscriptions(userId?: string) {
    const subscriptions = await this.getAllSubscriptions(userId);
    // Sort by nextBillingDate ascending and return those that are active
    return subscriptions
      .filter(sub => sub.status === 'ACTIVE' && sub.nextBillingDate)
      .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime());
  }
}
