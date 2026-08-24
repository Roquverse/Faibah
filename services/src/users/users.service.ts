import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async completeOnboarding(payload: any, supabaseUserId: string) {
    const {
      firstName,
      lastName,
      userType,
      businessName,
      phone,
      workType,
      billingModel,
      hourlyRate,
      requireDeposit,
      depositPercent,
      teamSize,
      assignRoles,
      multipleMilestones,
      itemizeMaterials,
      currency,
      taxRegistered,
      taxRate,
      commPreference,
      clientName,
      clientEmail,
      projectTitle,
      invoiceRef,
      clientPhoneOnly
    } = payload;

    if (!supabaseUserId) {
      throw new BadRequestException('User not authenticated');
    }

    // Upsert the user record using their Supabase ID as the primary key
    let user = await this.prisma.user.upsert({
      where: { id: supabaseUserId },
      create: {
        id: supabaseUserId,
        email: payload.email || `${supabaseUserId}@faibah.user`,
        password: '', // No local password - auth is handled by Supabase
        firstName: firstName || null,
        lastName: lastName || null,
        userType: userType === 'professional' ? 'PROFESSIONAL' : 'CLIENT',
        phone: userType === 'professional' ? phone : clientPhoneOnly,
      },
      update: {
        firstName: firstName || null,
        lastName: lastName || null,
        userType: userType === 'professional' ? 'PROFESSIONAL' : 'CLIENT',
        phone: userType === 'professional' ? phone : clientPhoneOnly,
      }
    });

    if (userType === 'professional') {
      let company;
      const companyData = {
        name: businessName || 'My Business',
        workType,
        billingModel,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        requireDeposit: Boolean(requireDeposit),
        depositPercent: depositPercent ? parseFloat(depositPercent) : null,
        teamSize: teamSize === 'solo' ? 'Just me (Solo)' : teamSize === '2-5' ? '2-5 people' : '6+ people',
        assignRoles: Boolean(assignRoles),
        multipleMilestones: Boolean(multipleMilestones),
        itemizeMaterials: Boolean(itemizeMaterials),
        defaultCurrency: currency || 'NGN',
        taxRegistered: Boolean(taxRegistered),
        taxRate: taxRate ? parseFloat(taxRate) : null,
        commPreference,
      };

      if (user.companyId) {
        // Update existing company
        company = await this.prisma.company.update({
          where: { id: user.companyId },
          data: companyData,
        });
      } else {
        // Create new company and link to user
        company = await this.prisma.company.create({
          data: {
            ...companyData,
            users: { connect: { id: user.id } }
          }
        });

        // Link user to company
        await this.prisma.user.update({
          where: { id: user.id },
          data: { companyId: company.id }
        });
      }

      // If quick-start client + project were provided, create them
      if (clientName) {
        const client = await this.prisma.client.create({
          data: {
            name: clientName,
            email: clientEmail || null,
            companyId: company.id,
            currency: currency || 'NGN',
          }
        });

        if (projectTitle) {
          await this.prisma.project.create({
            data: {
              name: projectTitle,
              clientId: client.id,
              currency: currency || 'NGN',
            }
          });
        }
      }

      return { success: true, companyId: company.id };
    } else if (userType === 'client') {
      return { success: true, invoiceRef };
    }

    throw new BadRequestException('Invalid userType');
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: true
      }
    });
    return user || {};
  }

  async updateProfile(userId: string, data: any) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new BadRequestException('User does not exist in the database. Please complete onboarding first.');
      }
      return await this.prisma.user.update({
        where: { id: userId },
        data,
      });
    } catch (error: any) {
      console.error('[UsersService] Error updating profile:', error);
      throw new BadRequestException(error.message || 'Failed to update profile');
    }
  }
}
