import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPaymentsOverview(userId?: string) {
    let companyId: string | null = null;
    
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true },
      });
      companyId = user?.companyId || null;
    }

    const whereClause: any = companyId ? { invoice: { client: { companyId } } } : {};

    const receipts = await this.prisma.receipt.findMany({
      where: whereClause,
      include: {
        invoice: {
          include: { client: true }
        }
      },
      orderBy: { paymentDate: 'desc' }
    });

    const totalReceived = receipts.reduce((sum, r) => sum + r.amountPaid, 0);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const receivedThisMonth = receipts
      .filter(r => new Date(r.paymentDate) >= startOfMonth)
      .reduce((sum, r) => sum + r.amountPaid, 0);

    // Calculate pending invoice amount for user's company
    const unpaidInvoices = await this.prisma.invoice.findMany({
      where: companyId ? { client: { companyId }, status: { in: ['DRAFT', 'SENT'] } } : { status: { in: ['DRAFT', 'SENT'] } },
      include: { items: true }
    });

    const pendingClearance = unpaidInvoices.reduce((total, inv) => {
      const invTotal = inv.items.reduce((s, i) => s + i.amount, 0);
      return total + invTotal;
    }, 0);

    const paymentsList = receipts.map(r => ({
      id: r.receiptRef || `RCP-${r.id.slice(0, 6).toUpperCase()}`,
      rawId: r.id,
      date: new Date(r.paymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      client: r.invoice?.client?.name || 'Unknown Client',
      invoice: r.invoice?.invoiceRef || `INV-${r.invoiceId.slice(0, 6).toUpperCase()}`,
      amount: `${r.invoice?.currency === 'USD' ? '$' : '₦'}${r.amountPaid.toLocaleString()}`,
      numericAmount: r.amountPaid,
      method: r.paymentMethod || 'Bank Transfer'
    }));

    return {
      totalReceived,
      receivedThisMonth,
      pendingClearance,
      payments: paymentsList
    };
  }
}
