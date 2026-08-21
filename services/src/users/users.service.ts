import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async completeOnboarding(payload: any) {
    const {
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
      invoiceRef,
      clientPhoneOnly
    } = payload;

    // In a real app, we would get the logged-in user ID from the JWT token.
    // Since we don't have full auth wired up, we'll just find the first user
    // or create a dummy user to attach this to, or assume a user email is passed in.
    
    // For MVP, let's look up the first user in the DB (or create one)
    let user = await this.prisma.user.findFirst();
    
    if (!user) {
      // Fallback if DB is empty
      user = await this.prisma.user.create({
        data: {
          email: 'test@faibah.com',
          password: 'hashedpassword',
          role: 'OWNER'
        }
      });
    }

    if (userType === 'professional') {
      let company;
      
      if (user.companyId) {
        company = await this.prisma.company.update({
          where: { id: user.companyId },
          data: {
            name: businessName || 'My Business',
            workType,
            billingModel,
            hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
            requireDeposit: Boolean(requireDeposit),
            depositPercent: depositPercent ? parseFloat(depositPercent) : null,
            teamSize,
            assignRoles: Boolean(assignRoles),
            multipleMilestones: Boolean(multipleMilestones),
            itemizeMaterials: Boolean(itemizeMaterials),
            defaultCurrency: currency,
            taxRegistered: Boolean(taxRegistered),
            taxRate: taxRate ? parseFloat(taxRate) : null,
            commPreference
          }
        });
      } else {
        company = await this.prisma.company.create({
          data: {
            name: businessName || 'My Business',
            workType,
            billingModel,
            hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
            requireDeposit: Boolean(requireDeposit),
            depositPercent: depositPercent ? parseFloat(depositPercent) : null,
            teamSize,
            assignRoles: Boolean(assignRoles),
            multipleMilestones: Boolean(multipleMilestones),
            itemizeMaterials: Boolean(itemizeMaterials),
            defaultCurrency: currency,
            taxRegistered: Boolean(taxRegistered),
            taxRate: taxRate ? parseFloat(taxRate) : null,
            commPreference
          }
        });
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: { 
          phone, 
          userType: 'PROFESSIONAL',
          companyId: company.id 
        }
      });

      return { success: true, user, company };
    } else if (userType === 'client') {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { 
          phone: clientPhoneOnly, 
          userType: 'CLIENT' 
        }
      });

      // Handle invoice linking here if invoiceRef is provided
      // (e.g. finding the invoice and updating its clientId to this user's id)

      return { success: true, user, invoiceRef };
    }

    throw new BadRequestException('Invalid userType');
  }
}
