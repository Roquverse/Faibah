import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async getAllInvoices() {
    return this.prisma.invoice.findMany({
      include: {
        client: true,
        project: true,
        quotation: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createInvoice(data: {
    clientId: string;
    projectId?: string;
    quotationId?: string;
    currency?: string;
    taxRate?: number;
    dueDate?: Date;
    items: { description: string; quantity: number; unitPrice: number; amount: number }[];
  }) {
    const { clientId, projectId, quotationId, currency, taxRate, dueDate, items } = data;
    
    // Generate a simple Invoice Ref
    const count = await this.prisma.invoice.count();
    const invoiceRef = `INV-${String(count + 1).padStart(4, '0')}`;

    return this.prisma.invoice.create({
      data: {
        invoiceRef,
        clientId,
        projectId: projectId || null,
        quotationId: quotationId || null,
        currency: currency || 'NGN',
        taxRate,
        dueDate,
        items: {
          create: items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
          })),
        },
      },
      include: {
        items: true,
        client: true,
        project: true,
      }
    });
  }

  async getInvoiceById(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        project: true,
        items: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }
}
