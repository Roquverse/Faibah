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
    let whereClause: any = {};

    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, companyId: true, userType: true },
      });

      const clientContact = await this.prisma.clientContact.findFirst({
        where: { OR: [{ id: userId }, { email: user?.email || userId }] },
        select: { id: true, clientId: true, email: true },
      });

      const conditions: any[] = [];

      // Agency team members (userType !== 'CLIENT') get company-wide project access
      if (user?.userType !== 'CLIENT' && user?.companyId) {
        conditions.push({ client: { companyId: user.companyId } });
        conditions.push({ members: { some: { userId: user.id } } });
      }

      if (clientContact) {
        conditions.push({ clientId: clientContact.clientId });
        conditions.push({ client: { email: clientContact.email } });
        conditions.push({ members: { some: { clientContactId: clientContact.id } } });
        conditions.push({ members: { some: { user: { email: clientContact.email } } } });
      }

      if (user?.email) {
        if (user.userType === 'CLIENT' || !user.companyId) {
          conditions.push({ client: { email: user.email } });
          conditions.push({ client: { contacts: { some: { email: user.email } } } });
        }
        conditions.push({ members: { some: { user: { email: user.email } } } });
        conditions.push({ members: { some: { clientContact: { email: user.email } } } });
      }

      if (conditions.length > 0) {
        whereClause = { OR: conditions };
      } else {
        whereClause = { id: 'impossible-id' };
      }
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
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: {
          include: {
            contacts: true,
            company: {
              include: { users: true }
            }
          }
        },
        members: {
          include: {
            user: true,
            clientContact: true,
          }
        }
      }
    });

    if (!project) return [];

    const memberList = [...project.members];
    const existingUserIds = new Set(memberList.map(m => m.userId).filter(Boolean));
    const existingContactIds = new Set(memberList.map(m => m.clientContactId).filter(Boolean));

    // 1. Include Company Users (Owners/Team)
    if (project.client?.company?.users) {
      for (const u of project.client.company.users) {
        if (!existingUserIds.has(u.id)) {
          memberList.push({
            id: `company-user-${u.id}`,
            projectId,
            memberType: 'TEAM_USER',
            userId: u.id,
            user: u,
            clientContactId: null,
            clientContact: null,
            role: 'OWNER',
            status: 'ACTIVE',
          } as any);
          existingUserIds.add(u.id);
        }
      }
    }

    // 2. Include Client Contacts / Client Person
    if (project.client) {
      if (project.client.contacts && project.client.contacts.length > 0) {
        for (const cc of project.client.contacts) {
          if (!existingContactIds.has(cc.id)) {
            memberList.push({
              id: `client-contact-${cc.id}`,
              projectId,
              memberType: 'CLIENT_CONTACT',
              userId: null,
              user: null,
              clientContactId: cc.id,
              clientContact: cc,
              role: 'PRIMARY_CONTACT',
              status: 'ACTIVE',
            } as any);
            existingContactIds.add(cc.id);
          }
        }
      } else {
        const syntheticContactId = `client-${project.client.id}`;
        if (!existingContactIds.has(syntheticContactId)) {
          memberList.push({
            id: syntheticContactId,
            projectId,
            memberType: 'CLIENT_CONTACT',
            userId: null,
            user: null,
            clientContactId: project.client.id,
            clientContact: {
              id: project.client.id,
              name: project.client.name,
              email: project.client.email,
              whatsappNumber: project.client.whatsappNumber,
              role: 'Client Contact',
            },
            role: 'PRIMARY_CONTACT',
            status: 'ACTIVE',
          } as any);
        }
      }
    }

    return memberList;
  }

  async inviteMember(projectId: string, email: string, role?: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { client: { include: { company: true } } }
    });
    if (!project) throw new NotFoundException('Project not found');

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await this.prisma.user.findUnique({ where: { email: cleanEmail } });

    if (existingUser) {
      const existingMember = await this.prisma.projectMember.findFirst({
        where: { projectId, userId: existingUser.id }
      });

      let member;
      if (existingMember) {
        member = await this.prisma.projectMember.update({
          where: { id: existingMember.id },
          data: { status: 'INVITED' },
          include: { user: true }
        });
      } else {
        member = await this.prisma.projectMember.create({
          data: {
            projectId,
            userId: existingUser.id,
            memberType: 'TEAM_USER',
            role: (role as any) || 'CONTRACTOR',
            status: 'INVITED',
          },
          include: { user: true }
        });
      }

      await this.mailService.queueActivityNotice({
        recipientEmail: cleanEmail,
        recipientName: existingUser.firstName || 'User',
        title: `Project Channel Invitation: ${project.name}`,
        message: `You have been invited to join the project channel for "${project.name}". Log in to accept your channel request.`,
        actionUrl: `${process.env.NEXT_PUBLIC_MAIN_APP_URL || 'https://app.faibah.com'}/channels`,
        actionText: 'View Channel Request'
      });

      return { success: true, isRegistered: true, member };
    } else {
      await this.mailService.queueActivityNotice({
        recipientEmail: cleanEmail,
        title: `Invitation to join "${project.name}" on Faiba`,
        message: `You have been invited to collaborate on the project "${project.name}". Click below to sign up and join the channel.`,
        actionUrl: `${process.env.NEXT_PUBLIC_AUTH_APP_URL || 'https://auth.faibah.com'}/login`,
        actionText: 'Sign Up & Join'
      });

      return { success: true, isRegistered: false, message: `Invitation email sent to ${cleanEmail}` };
    }
  }

  async getPendingInvitations(userId: string) {
    if (!userId) return [];
    return this.prisma.projectMember.findMany({
      where: {
        userId,
        status: 'INVITED',
      },
      include: {
        project: {
          include: { client: true }
        }
      }
    });
  }

  async acceptInvitation(memberId: string) {
    const member = await this.prisma.projectMember.findUnique({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Invitation not found');

    const updated = await this.prisma.projectMember.update({
      where: { id: memberId },
      data: { status: 'ACTIVE' },
      include: { user: true, project: true }
    });

    return { success: true, member: updated };
  }

  async declineInvitation(memberId: string) {
    await this.prisma.projectMember.delete({ where: { id: memberId } });
    return { success: true };
  }

  async removeMember(memberId: string) {
    await this.prisma.projectMember.delete({ where: { id: memberId } });
    return { success: true };
  }
}
