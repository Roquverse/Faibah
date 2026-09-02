import { Controller, Post, Body, Req, HttpException, HttpStatus } from '@nestjs/common';
import type { Request } from 'express';
import { AiService } from './ai.service';
import { PrismaService } from '../prisma.service';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly prisma: PrismaService
  ) {}

  private async getCompanyIdFromUserId(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true }
    });
    if (!user || !user.companyId) {
      throw new HttpException('User not associated with a company', HttpStatus.FORBIDDEN);
    }
    return user.companyId;
  }

  @Post('generate-proposal')
  async generateProposal(@Req() req: Request, @Body() body: { prompt: string }) {
    const userId = (req.user as any)?.userId || (req.user as any)?.sub || (req.user as any)?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    if (!body.prompt) {
      throw new HttpException('Prompt is required', HttpStatus.BAD_REQUEST);
    }

    const companyId = await this.getCompanyIdFromUserId(userId);
    return this.aiService.generateProposal(companyId, body.prompt);
  }

  @Post('top-up')
  async topUpTokens(@Req() req: Request, @Body() body: { amount?: number }) {
    const userId = (req.user as any)?.userId || (req.user as any)?.sub || (req.user as any)?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const companyId = await this.getCompanyIdFromUserId(userId);
    const amount = body.amount || 5; // Default mock top up amount
    return this.aiService.topUpTokens(companyId, amount);
  }
}
