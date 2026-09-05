import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  async getPayments(@Req() req: Request) {
    const userId = (req.user as any)?.userId || (req.user as any)?.sub || (req.user as any)?.id;
    return this.paymentsService.getPaymentsOverview(userId);
  }

  @Post()
  async createPayment(@Body() data: any) {
    return this.paymentsService.createPayment(data);
  }

  @Patch(':id')
  async updatePayment(@Param('id') id: string, @Body() data: any) {
    return this.paymentsService.updatePayment(id, data);
  }

  @Delete(':id')
  async deletePayment(@Param('id') id: string) {
    return this.paymentsService.deletePayment(id);
  }
}
