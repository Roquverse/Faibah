import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const appointments = await this.prisma.appointment.findMany({
      orderBy: { date: 'asc' },
    });

    const pendingInvoices = await this.prisma.invoice.findMany({
      where: {
        status: { in: ['DRAFT', 'SENT'] },
        dueDate: { not: null },
      },
      include: {
        items: { select: { amount: true } }
      }
    });

    const invoiceItems = pendingInvoices.map(inv => {
      const totalAmount = inv.items.reduce((sum, item) => sum + item.amount, 0);
      return {
        id: inv.id,
        title: `Invoice ${inv.invoiceRef || 'INV-XXX'} Due`,
        description: `Awaiting Payment • ₦${(totalAmount / 1000000).toFixed(1)}M`, // Simple formatting for mockup
        date: inv.dueDate,
        startTime: '09:00',
        endTime: '17:00',
        type: 'INVOICE',
        amount: totalAmount,
      };
    });

    const pendingTasks = await this.prisma.task.findMany({
      where: {
        dueDate: { not: null },
        status: { not: 'DONE' },
      }
    });

    const taskItems = pendingTasks.map(task => ({
      id: task.id,
      title: task.title,
      description: 'Project Check-in',
      date: task.dueDate,
      startTime: '10:00',
      endTime: '11:00',
      type: 'MILESTONE',
    }));

    const unified = [...appointments, ...invoiceItems, ...taskItems];
    unified.sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime());

    return unified;
  }

  async create(data: any) {
    return this.prisma.appointment.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        type: data.type || 'MEETING',
      },
    });
  }

  async update(id: string, data: any) {
    const existing = await this.prisma.appointment.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Appointment not found');
    
    const updateData: any = { ...data };
    if (data.date) updateData.date = new Date(data.date);
    
    return this.prisma.appointment.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    return this.prisma.appointment.delete({
      where: { id },
    });
  }
}
