import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async getAllInvoices(userId?: string) {
    let whereClause: any = {};
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true },
      });
      if (user?.companyId) {
        whereClause = { client: { companyId: user.companyId } };
      }
    }

    return this.prisma.invoice.findMany({
      where: whereClause,
      include: {
        client: {
          include: {
            company: true
          }
        },
        project: true,
        items: true,
        receipts: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createInvoice(data: {
    clientId?: string;
    projectId?: string;
    currency?: string;
    taxRate?: number;
    dueDate?: Date | string;
    items: { description: string; quantity: number; unitPrice: number; amount: number }[];
  }) {
    const { clientId, projectId, currency, taxRate, dueDate, items } = data;
    
    let finalClientId = clientId;
    if ((!finalClientId || finalClientId === '') && projectId) {
      const project = await this.prisma.project.findUnique({ where: { id: projectId } });
      if (project) {
        finalClientId = project.clientId;
      }
    }

    if (!finalClientId) {
      const company = await this.prisma.company.findFirst();
      const firstClient = await this.prisma.client.findFirst({ where: { companyId: company?.id } });
      if (firstClient) {
        finalClientId = firstClient.id;
      } else {
        throw new NotFoundException('Client ID is required to create an invoice.');
      }
    }

    // Generate a simple Invoice Ref
    const count = await this.prisma.invoice.count();
    const invoiceRef = `INV-${String(count + 1).padStart(4, '0')}`;

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceRef,
        clientId: finalClientId,
        projectId: projectId || null,
        currency: currency || 'NGN',
        taxRate: taxRate || 0,
        dueDate: dueDate ? new Date(dueDate) : null,
        items: {
          create: (items || []).map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
          })),
        },
      },
      include: {
        items: true,
        receipts: true,
        client: {
          include: {
            company: true
          }
        },
        project: true,
      }
    });

    if (invoice.client?.email) {
      const totalAmt = invoice.items.reduce((s, i) => s + i.amount, 0);
      const formattedTotal = `₦${totalAmt.toLocaleString()}`;
      await this.mailService.queueInvoiceCreated({
        clientEmail: invoice.client.email,
        clientName: invoice.client.name,
        invoiceRef: invoice.invoiceRef || undefined,
        amount: formattedTotal,
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : undefined,
      });
    }

    return invoice;
  }

  async getInvoiceById(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        client: {
          include: {
            company: true
          }
        },
        project: true,
        items: true,
        receipts: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async deleteInvoice(id: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new NotFoundException(`Invoice with ID ${id} not found`);

    await this.prisma.invoiceItem.deleteMany({
      where: { invoiceId: id },
    });

    return this.prisma.invoice.delete({
      where: { id },
    });
  }
}
