import { Controller, Post, Get, Patch, Delete, Body, Param, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async createProject(@Req() req: Request, @Body() body: { clientId?: string, name: string }) {
    const userId = (req.user as any)?.userId || (req.user as any)?.sub || (req.user as any)?.id;
    return this.projectsService.createProject(userId, body.clientId, body.name);
  }

  @Get()
  async getAllProjects(@Req() req: Request) {
    const userId = (req.user as any)?.userId || (req.user as any)?.sub || (req.user as any)?.id;
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

  @Get('proposals/:proposalId')
  async getProposal(@Param('proposalId') proposalId: string) {
    return this.projectsService.getProposal(proposalId);
  }

  @Post(':id/proposals')
  async createProposal(@Param('id') id: string, @Body('content') content: string) {
    return this.projectsService.createProposal(id, content);
  }

  @Patch(':id/proposals/:proposalId')
  async updateProposal(@Param('id') id: string, @Param('proposalId') proposalId: string, @Body('content') content: string) {
    return this.projectsService.updateProposal(id, proposalId, content);
  }

  @Get('invitations/pending')
  async getPendingInvitations(@Req() req: Request) {
    const userId = (req.user as any)?.userId || (req.user as any)?.sub || (req.user as any)?.id;
    return this.projectsService.getPendingInvitations(userId);
  }

  @Patch('invitations/:memberId/accept')
  async acceptInvitation(@Param('memberId') memberId: string) {
    return this.projectsService.acceptInvitation(memberId);
  }

  @Delete('invitations/:memberId/decline')
  async declineInvitation(@Param('memberId') memberId: string) {
    return this.projectsService.declineInvitation(memberId);
  }

  @Get(':id/members')
  async getProjectMembers(@Param('id') id: string) {
    return this.projectsService.getProjectMembers(id);
  }

  @Post(':id/members/invite')
  async inviteMember(@Param('id') id: string, @Body() body: { email: string; role?: string }) {
    return this.projectsService.inviteMember(id, body.email, body.role);
  }

  @Delete('members/:memberId')
  async removeMember(@Param('memberId') memberId: string) {
    return this.projectsService.removeMember(memberId);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.projectsService.getOne(id);
  }

  @Patch(':id/name')
  async updateName(@Param('id') id: string, @Body('name') name: string) {
    return this.projectsService.updateProjectName(id, name);
  }

  @Post(':id/urls')
  async addUrl(@Param('id') id: string, @Body() body: { label: string; url: string }) {
    return this.projectsService.addProjectUrl(id, body.label, body.url);
  }

  @Delete('urls/:urlId')
  async deleteUrl(@Param('urlId') urlId: string) {
    return this.projectsService.deleteProjectUrl(urlId);
  }
}
