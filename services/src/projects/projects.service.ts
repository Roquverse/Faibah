import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  private async resolveCompanyId(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });
    if (!user?.companyId) throw new NotFoundException('Company not found. Please complete onboarding first.');
    return user.companyId;
  }

  async createProject(userId: string, clientId: string | undefined, name: string) {
    const companyId = await this.resolveCompanyId(userId);

    let client;
    if (clientId) {
      client = await this.prisma.client.findFirst({ where: { id: clientId, companyId } });
    }

    if (!client) {
      client = await this.prisma.client.findFirst({ where: { companyId } });
      if (!client) {
        client = await this.prisma.client.create({
          data: { name: 'Default Client', companyId }
        });
      }
    }

    return this.prisma.project.create({
      data: {
        name,
        clientId: client.id,
        currency: client.currency || 'NGN'
      }
    });
  }

  async getProjectByClient(clientId: string) {
    const projects = await this.prisma.project.findMany({
      where: { clientId },
      include: {
        tasks: true,
        proposals: true,
        invoices: true,
        client: true,
      }
    });
    
    return projects;
  }

  async getAllProjects(userId: string) {
    const companyId = await this.resolveCompanyId(userId);

    return this.prisma.project.findMany({
      where: {
        client: { companyId }
      },
      include: {
        client: {
          include: { contacts: true }
        },
        tasks: true,
        invoices: {
          include: { items: true }
        },
        members: {
          include: { user: true, clientContact: true }
        }
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

  async getProjectMembers(projectId: string) {
    return this.prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: true,
        clientContact: true,
      }
    });
  }
}
