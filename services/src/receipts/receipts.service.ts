import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReceiptsService {
  constructor(private prisma: PrismaService) {}

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
    
    // Generate a simple Receipt Ref
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
        invoice: true
      }
    });

    // Optionally mark the invoice as PAID if it's fully paid here.
    // For now, let's just mark it as PAID unconditionally for simplicity, 
    // or compare amountPaid against total if needed.
    // Let's just update the status to PAID to keep it simple as discussed.
    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'PAID' }
    });

    return receipt;
  }
}
