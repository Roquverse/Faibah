import { Controller, Get, Post, Body, Param, Delete, Req, Patch } from '@nestjs/common';
import type { Request } from 'express';
import { InvoicesService } from './invoices.service';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  async getAllInvoices(@Req() req: Request) {
    const userId = (req.user as any)?.userId;
    return this.invoicesService.getAllInvoices(userId);
  }

  @Post()
  async createInvoice(@Body() body: any) {
    return this.invoicesService.createInvoice(body);
  }

  @Get(':id')
  async getInvoiceById(@Param('id') id: string) {
    return this.invoicesService.getInvoiceById(id);
  }

  @Delete(':id')
  async deleteInvoice(@Param('id') id: string) {
    return this.invoicesService.deleteInvoice(id);
  }

  @Patch(':id')
  async updateInvoice(@Param('id') id: string, @Body() body: any) {
    return this.invoicesService.updateInvoice(id, body);
  }
}
