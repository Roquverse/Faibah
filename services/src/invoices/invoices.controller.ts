import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { InvoicesService } from './invoices.service';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  async getAllInvoices() {
    return this.invoicesService.getAllInvoices();
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
}
