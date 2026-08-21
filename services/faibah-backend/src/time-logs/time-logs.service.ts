import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TimeLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async startTimeLog(taskId: string, userId: string) {
    const existingActiveLog = await this.prisma.timeLog.findFirst({
      where: {
        taskId,
        userId,
        endTime: null
      }
    });

    if (existingActiveLog) {
      throw new ConflictException('A time log is already running for this task and user.');
    }

    return this.prisma.timeLog.create({
      data: {
        taskId,
        userId,
        startTime: new Date(),
      }
    });
  }

  async stopTimeLog(taskId: string, userId: string) {
    const activeLog = await this.prisma.timeLog.findFirst({
      where: {
        taskId,
        userId,
        endTime: null
      }
    });

    if (!activeLog) {
      throw new NotFoundException('No active time log found for this task and user.');
    }

    return this.prisma.timeLog.update({
      where: { id: activeLog.id },
      data: { endTime: new Date() }
    });
  }

  async getTimeLogsByTask(taskId: string) {
    return this.prisma.timeLog.findMany({
      where: { taskId },
      orderBy: { startTime: 'desc' }
    });
  }
}
