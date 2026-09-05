import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ReceiptsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async getAllReceipts(userId?: string) {
    let whereClause: any = {};

    if (userId && userId !== 'dev-user') {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true, email: true },
      });

      if (user?.companyId) {
        whereClause = {
          invoice: {
            client: {
              companyId: user.companyId
            }
          }
        };
      }
    }

    return this.prisma.receipt.findMany({
      where: whereClause,
      include: {
        invoice: {
          include: { client: true, project: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createReceipt(data: {
    invoiceId: string;
    amountPaid: number;
    paymentMethod?: string;
    paymentDate: string | Date;
  }) {
    const { invoiceId, amountPaid, paymentMethod, paymentDate } = data;
    
    const count = await this.prisma.receipt.count();
    const receiptRef = `RCP-${String(count + 1).padStart(4, '0')}`;

    const receipt = await this.prisma.receipt.create({
      data: {
        receiptRef,
        invoiceId,
        amountPaid: Number(amountPaid),
        paymentMethod: paymentMethod || 'Bank Transfer',
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      },
      include: {
        invoice: {
          include: { client: true }
        }
      }
    });

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'PAID' }
    });

    if (receipt.invoice?.client?.email) {
      await this.mailService.queuePaymentReceipt({
        clientEmail: receipt.invoice.client.email,
        clientName: receipt.invoice.client.name,
        invoiceRef: receipt.invoice.invoiceRef || undefined,
        amountPaid: `₦${Number(amountPaid).toLocaleString()}`,
      });
    }

    return receipt;
  }

  async updateReceipt(id: string, data: {
    amountPaid?: number;
    paymentMethod?: string;
    paymentDate?: string | Date;
  }) {
    const existing = await this.prisma.receipt.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Receipt not found');
    }

    const updateData: any = {};
    if (data.amountPaid !== undefined) updateData.amountPaid = Number(data.amountPaid);
    if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
    if (data.paymentDate !== undefined) updateData.paymentDate = new Date(data.paymentDate);

    return this.prisma.receipt.update({
      where: { id },
      data: updateData,
      include: {
        invoice: {
          include: { client: true }
        }
      }
    });
  }

  async deleteReceipt(id: string) {
    const existing = await this.prisma.receipt.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Receipt not found');
    }

    await this.prisma.receipt.delete({ where: { id } });
    return { success: true };
  }
}
