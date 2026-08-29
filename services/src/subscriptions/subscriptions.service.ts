import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SubscriptionFrequency } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async getAllSubscriptions(userId?: string) {
    let whereClause: any = {};

    if (userId) {
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

  async createSubscription(data: any) {
    return this.prisma.subscription.create({ data });
  }

  async getUpcomingSubscriptions(userId?: string) {
    const subscriptions = await this.getAllSubscriptions(userId);
    // Sort by nextBillingDate ascending and return those that are active
    return subscriptions
      .filter(sub => sub.status === 'ACTIVE' && sub.nextBillingDate)
      .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime());
  }
}
