import { Controller, Post, Get, Patch, Body, Param } from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async createProject(@Body() body: { clientId: string, name: string }) {
    return this.projectsService.createProject(body.clientId, body.name);
  }

  @Get()
  async getAllProjects() {
    return this.projectsService.getAllProjects();
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
