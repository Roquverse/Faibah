import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AppointmentsService } from './appointments.service';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(@Req() req: Request, @Body() data: any) {
    const userId = (req.user as any)?.userId;
    return this.appointmentsService.create(userId, data);
  }

  @Get()
  findAll(@Req() req: Request) {
    const userId = (req.user as any)?.userId;
    return this.appointmentsService.findAll(userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.appointmentsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
