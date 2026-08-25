import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { ReceiptsService } from './receipts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('receipts')
@UseGuards(JwtAuthGuard)
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Get()
  async getAllReceipts(@Req() req: Request) {
    const userId = (req.user as any)?.userId || (req.user as any)?.sub || (req.user as any)?.id;
    return this.receiptsService.getAllReceipts(userId);
  }

  @Post()
  async createReceipt(@Body() data: any) {
    return this.receiptsService.createReceipt(data);
  }

  @Delete(':id')
  async deleteReceipt(@Param('id') id: string) {
    return this.receiptsService.deleteReceipt(id);
  }
}
