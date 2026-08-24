import { Controller, Get, Post, Patch, Delete, Body, Param, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ClientsService } from './clients.service';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  getAllClients(@Req() req: Request) {
    const userId = (req.user as any)?.userId;
    return this.clientsService.getAllClients(userId);
  }
  
  @Get(':id')
  getClientById(@Param('id') id: string) {
    return this.clientsService.getClientById(id);
  }

  @Post()
  createClient(@Req() req: Request, @Body() data: any) {
    const userId = (req.user as any)?.userId;
    return this.clientsService.createClient(userId, data);
  }
  
  @Patch(':id')
  updateClient(@Param('id') id: string, @Body() data: any) {
    return this.clientsService.updateClient(id, data);
  }

  @Delete(':id')
  deleteClient(@Param('id') id: string) {
    return this.clientsService.deleteClient(id);
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
