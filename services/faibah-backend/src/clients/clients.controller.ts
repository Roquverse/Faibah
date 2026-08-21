import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ClientsService } from './clients.service';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  getAllClients() {
    return this.clientsService.getAllClients();
  }
  
  @Get(':id')
  getClientById(@Param('id') id: string) {
    return this.clientsService.getClientById(id);
  }

  @Post()
  createClient(@Body() data: any) {
    return this.clientsService.createClient(data);
  }
  
  @Patch(':id')
  updateClient(@Param('id') id: string, @Body() data: any) {
    return this.clientsService.updateClient(id, data);
  }
  
  @Post(':id/contacts')
  addContact(@Param('id') id: string, @Body() data: any) {
    return this.clientsService.addContact(id, data);
  }
  
  @Patch(':id/contacts/:contactId')
  updateContact(
    @Param('id') id: string,
    @Param('contactId') contactId: string,
    @Body() data: any
  ) {
    return this.clientsService.updateContact(id, contactId, data);
  }
  
  @Delete(':id/contacts/:contactId')
  deleteContact(
    @Param('id') id: string,
    @Param('contactId') contactId: string
  ) {
    return this.clientsService.deleteContact(id, contactId);
  }
}
