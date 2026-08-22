import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class QuotationsService {
  constructor(private prisma: PrismaService) {}

  async getAllQuotations() {
    return this.prisma.quotation.findMany({
      include: {
        client: true,
        project: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createQuotation(data: {
    clientId: string;
    projectId?: string;
    currency?: string;
    taxRate?: number;
    items: { description: string; quantity: number; unitPrice: number; amount: number }[];
  }) {
    const { clientId, projectId, currency, taxRate, items } = data;
    return this.prisma.quotation.create({
      data: {
        clientId,
        projectId: projectId || null,
        currency: currency || 'NGN',
        taxRate,
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

  async getQuotationById(id: string) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id },
      include: {
        client: true,
        project: true,
        items: true,
      },
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }

    return quotation;
  }
}
