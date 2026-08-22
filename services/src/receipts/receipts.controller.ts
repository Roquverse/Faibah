import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ReceiptsService } from './receipts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('receipts')
@UseGuards(JwtAuthGuard)
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Get()
  async getAllReceipts() {
    return this.receiptsService.getAllReceipts();
  }

  @Post()
  async createReceipt(@Body() data: any) {
    return this.receiptsService.createReceipt(data);
  }
}
