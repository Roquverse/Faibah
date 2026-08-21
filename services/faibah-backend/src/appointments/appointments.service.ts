import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.appointment.findMany({
      orderBy: { date: 'asc' },
    });
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
