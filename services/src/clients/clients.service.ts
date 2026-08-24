import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  private async resolveCompanyId(userId?: string): Promise<string | null> {
    if (!userId) return null;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });
    return user?.companyId || null;
  }

  async getAllClients(userId?: string) {
    const companyId = await this.resolveCompanyId(userId);
    if (!companyId) return [];

    const clients = await this.prisma.client.findMany({
      where: { companyId },
      include: {
        projects: {
          include: {
            proposals: true,
            invoices: true,
          }
        },
        invoices: {
          include: {
            items: true,
            payments: true,
            project: true,
          }
        }
      }
    });

    return clients.map(client => {
      const activeProjects = client.projects.filter(p => p.status === 'ONGOING' || p.status === 'AWAITING_PAYMENT').length;

      let totalBilled = 0;
      let outstanding = 0;

      client.invoices.forEach(inv => {
        const invoiceTotal = inv.items.reduce((sum, item) => sum + (item.amount || 0), 0);
        totalBilled += invoiceTotal;

        if (inv.status !== 'PAID' && inv.status !== 'CANCELLED') {
          const paidAmount = inv.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
          outstanding += (invoiceTotal - paidAmount);
        }
      });

      return { ...client, activeProjects, totalBilled, outstanding };
    });
  }

  async createClient(userId: string | undefined, data: any) {
    let companyId = await this.resolveCompanyId(userId);
    if (!companyId) {
      const company = await this.prisma.company.findFirst();
      if (!company) throw new NotFoundException('Company not found. Please complete onboarding first.');
      companyId = company.id;
    }

    const contactName = data.name || (data.firstName ? `${data.firstName} ${data.lastName}`.trim() : 'Unknown Contact');

    return this.prisma.client.create({
      data: {
        clientType: data.clientType || 'INDIVIDUAL',
        companyName: data.companyName,
        name: contactName,
        email: data.email,
        whatsappNumber: data.whatsappNumber,
        country: data.country,
        notes: data.notes,
        taxId: data.taxId,
        logoUrl: data.logoUrl,
        address: data.address,
        city: data.city,
        preferredChannel: data.preferredChannel || null,
        referralSource: data.referralSource,
        companyId,
      },
    });
  }

  async getClientById(id: string) {
    return this.prisma.client.findUnique({
      where: { id },
      include: {
        contacts: true,
        projects: {
          include: {
            proposals: true,
            invoices: true,
          }
        },
        invoices: {
          include: {
            items: true,
            payments: true,
            project: true,
          }
        }
      }
    });
  }

  async updateClient(id: string, data: any) {
    return this.prisma.client.update({
      where: { id },
      data: {
        clientType: data.clientType,
        companyName: data.companyName,
        name: data.name,
        email: data.email,
        whatsappNumber: data.whatsappNumber,
        country: data.country,
        notes: data.notes,
        taxId: data.taxId,
        logoUrl: data.logoUrl,
        address: data.address,
        city: data.city,
        preferredChannel: data.preferredChannel,
        referralSource: data.referralSource,
      }
    });
  }

  async deleteClient(id: string) {
    return this.prisma.client.delete({ where: { id } });
  }

  async addContact(clientId: string, data: any) {
    if (data.isPrimary) {
      await this.prisma.clientContact.updateMany({
        where: { clientId },
        data: { isPrimary: false }
      });
    }
    return this.prisma.clientContact.create({
      data: {
        clientId,
        name: data.name,
        email: data.email,
        whatsappNumber: data.phone,
        role: data.role,
        isPrimary: data.isPrimary || false,
      }
    });
  }

  async updateContact(clientId: string, contactId: string, data: any) {
    if (data.isPrimary) {
      await this.prisma.clientContact.updateMany({
        where: { clientId, id: { not: contactId } },
        data: { isPrimary: false }
      });
    }
    return this.prisma.clientContact.update({
      where: { id: contactId, clientId },
      data: {
        name: data.name,
        email: data.email,
        whatsappNumber: data.phone,
        role: data.role,
        isPrimary: data.isPrimary,
      }
    });
  }

  async deleteContact(clientId: string, contactId: string) {
    return this.prisma.clientContact.delete({ where: { id: contactId, clientId } });
  }
}
