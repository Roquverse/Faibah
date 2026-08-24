import { Controller, Post, Get, Patch, Body, Param, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async createProject(@Req() req: Request, @Body() body: { clientId: string, name: string }) {
    const userId = (req.user as any)?.userId;
    return this.projectsService.createProject(userId, body.clientId, body.name);
  }

  @Get()
  async getAllProjects(@Req() req: Request) {
    const userId = (req.user as any)?.userId;
    return this.projectsService.getAllProjects(userId);
  }

  @Get('client/:clientId')
  async getProjectByClient(@Param('clientId') clientId: string) {
    return this.projectsService.getProjectByClient(clientId);
  }

  @Patch(':id/status')
  async updateProjectStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.projectsService.updateProjectStatus(id, status);
  }

  @Post(':id/proposals')
  async createProposal(@Param('id') id: string, @Body('content') content: string) {
    return this.projectsService.createProposal(id, content);
  }

  @Get(':id/members')
  async getProjectMembers(@Param('id') id: string) {
    return this.projectsService.getProjectMembers(id);
  }
}
