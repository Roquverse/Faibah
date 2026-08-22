import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { QuotationsService } from './quotations.service';

@Controller('quotations')
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Get()
  async getAllQuotations() {
    return this.quotationsService.getAllQuotations();
  }

  @Post()
  async createQuotation(@Body() body: any) {
    return this.quotationsService.createQuotation(body);
  }

  @Get(':id')
  async getQuotationById(@Param('id') id: string) {
    return this.quotationsService.getQuotationById(id);
  }
}
