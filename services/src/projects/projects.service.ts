import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async createProject(clientId: string | undefined, name: string) {
    let client;
    if (clientId) {
      client = await this.prisma.client.findUnique({ where: { id: clientId } });
    }

    if (!client) {
      // Auto-create a default client for MVP
      const company = await this.prisma.company.findFirst();
      if (!company) throw new NotFoundException('Company not found (go to Settings first)');

      client = await this.prisma.client.findFirst();
      if (!client) {
        client = await this.prisma.client.create({
          data: { name: 'Acme Corporation', companyId: company.id }
        });
      }
    }

    return this.prisma.project.create({
      data: {
        name,
        clientId: client.id,
        currency: client.currency
      }
    });
  }

  async getProjectByClient(clientId: string) {
    const projects = await this.prisma.project.findMany({
      where: { clientId },
      include: {
        tasks: true,
        proposals: true,
        quotations: true,
        invoices: true,
        client: true, // Need to include client for the frontend to show client name/avatar
      }
    });
    
    return projects;
  }

  async getAllProjects() {
    return this.prisma.project.findMany({
      include: {
        client: {
          include: { contacts: true }
        },
      }
    });
  }

  async updateProjectStatus(id: string, status: any) {
    return this.prisma.project.update({
      where: { id },
      data: { status }
    });
  }

  async createProposal(projectId: string, content: string) {
    return this.prisma.proposal.create({
      data: {
        projectId,
        content
      }
    });
  }
}
