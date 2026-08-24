import {
  Controller,
  Post,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';

interface JwtUser {
  userId: string;
  email: string;
  role: string;
  jti?: string;
  exp?: number;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/logout
   * Blacklists the current JWT so it cannot be reused after logout.
   * The client should discard the token locally after calling this.
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request): Promise<{ message: string }> {
    const user = req.user as JwtUser;

    if (!user?.jti || !user?.exp) {
      // Token has no jti/exp (e.g. legacy Supabase token) — still succeed
      return { message: 'Logged out' };
    }

    await this.authService.logout(user.jti, user.exp);
    return { message: 'Logged out successfully' };
  }
}
