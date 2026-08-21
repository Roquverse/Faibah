import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async getAllClients() {
    // Make sure we have a default company to attach the client to for MVP
    let company = await this.prisma.company.findFirst();
    if (!company) {
      company = await this.prisma.company.create({
        data: {
          name: 'Faiba Pro',
          workType: 'Design Agency',
        },
      });
    }

    const clients = await this.prisma.client.findMany({
      include: {
        projects: true,
        invoices: {
          include: {
            items: true,
            payments: true,
          }
        }
      }
    });
    
    // Auto-create a mock client if none exist so the frontend dropdown isn't empty
    if (clients.length === 0) {
      const defaultClient = await this.prisma.client.create({
        data: {
          name: 'Acme Corporation',
          currency: 'NGN',
          companyId: company.id,
        },
      });
      return [
        {
          ...defaultClient,
          activeProjects: 0,
          totalBilled: 0,
          outstanding: 0,
        }
      ];
    }
    
    // Compute dynamic fields
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

      return {
        ...client,
        activeProjects,
        totalBilled,
        outstanding
      };
    });
  }

  async createClient(data: any) {
    // Get default company for MVP
    let company = await this.prisma.company.findFirst();
    
    if (!company) {
      company = await this.prisma.company.create({
        data: {
          name: 'Faiba Pro',
          workType: 'Design Agency',
        },
      });
    }

    // Prepare default name if not provided
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
        companyId: company.id,
      },
    });
  }

  async getClientById(id: string) {
    return this.prisma.client.findUnique({
      where: { id },
      include: {
        contacts: true,
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

  async addContact(clientId: string, data: any) {
    // If setting as primary, unset other primary contacts first
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
    // If setting as primary, unset other primary contacts first
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
    return this.prisma.clientContact.delete({
      where: { id: contactId, clientId }
    });
  }
}
