import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  private async resolveCompanyId(userId?: string): Promise<string | null> {
    if (!userId) return null;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });
    return user?.companyId || null;
  }

  async createProject(userId: string | undefined, clientId: string | undefined, name: string) {
    let companyId = await this.resolveCompanyId(userId);

    let client;
    if (clientId) {
      client = await this.prisma.client.findUnique({
        where: { id: clientId },
        include: { company: true },
      });
    }

    if (!client) {
      if (!companyId) {
        const company = await this.prisma.company.findFirst();
        if (!company) throw new NotFoundException('Company not found (go to Settings first)');
        companyId = company.id;
      }
      client = await this.prisma.client.findFirst({
        where: { companyId },
        include: { company: true },
      });
      if (!client) {
        client = await this.prisma.client.create({
          data: { name: 'Default Client', companyId },
          include: { company: true },
        });
      }
    }

    const project = await this.prisma.project.create({
      data: {
        name: name || 'Untitled Project',
        clientId: client.id,
        currency: client.currency || 'NGN'
      },
      include: {
        client: {
          include: { company: true }
        }
      }
    });

    if (client?.email) {
      await this.mailService.queueProjectApproval({
        clientEmail: client.email,
        clientName: client.name,
        projectName: project.name,
        companyName: client.company?.name || 'Faiba Platform',
      });
    }

    return project;
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

  async getAllProjects(userId?: string) {
    const companyId = await this.resolveCompanyId(userId);
    let whereClause: any = {};
    if (companyId) {
      whereClause = { client: { companyId } };
    }

    return this.prisma.project.findMany({
      where: whereClause,
      include: {
        client: {
          include: { contacts: true }
        },
        tasks: true,
        proposals: true,
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
    const project = await this.prisma.project.update({
      where: { id },
      data: { status },
      include: { client: { include: { company: true } } }
    });

    if (project?.client?.email) {
      await this.mailService.queueActivityNotice({
        recipientEmail: project.client.email,
        recipientName: project.client.name,
        title: `Project "${project.name}" Status Updated`,
        message: `Your project "${project.name}" status has been updated to ${status}.`,
      });
    }

    return project;
  }

  async createProposal(projectId: string, content: string) {
    const proposal = await this.prisma.proposal.create({
      data: {
        projectId,
        content
      }
    });

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { client: { include: { company: true } } }
    });

    if (project?.client?.email) {
      let totalStr = '';
      try {
        const parsed = JSON.parse(content);
        if (parsed.financials?.total) {
          totalStr = `₦${parsed.financials.total.toLocaleString()}`;
        }
      } catch (e) {}

      await this.mailService.queueProjectApproval({
        clientEmail: project.client.email,
        clientName: project.client.name,
        projectName: project.name,
        companyName: project.client.company?.name || 'Faiba Platform',
        totalAmount: totalStr,
      });
    }

    return proposal;
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
