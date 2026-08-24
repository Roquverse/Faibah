import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private readonly redisService: RedisService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // Run passport JWT validation first
    const result = await super.canActivate(context);
    if (!result) return false;

    // After JWT is validated, check if it was blacklisted (e.g. user logged out)
    const request = context.switchToHttp().getRequest();
    const user = request.user as { jti?: string };
    if (user?.jti) {
      const blacklisted = await this.redisService.isBlacklisted(user.jti);
      if (blacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }
    }

    return true;
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      console.error('JWT Auth Error:', err, info?.message, info);
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
