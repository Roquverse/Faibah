import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ReceiptsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async getAllReceipts() {
    return this.prisma.receipt.findMany({
      include: {
        invoice: {
          include: { client: true }
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
        amountPaid,
        paymentMethod,
        paymentDate: new Date(paymentDate),
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
        amountPaid: `₦${amountPaid.toLocaleString()}`,
      });
    }

    return receipt;
  }
}
