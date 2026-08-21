import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = process.env.JWT_SECRET || 'supersecret_mvp_key';
    console.log('[JwtStrategy] Using secret (first 10 chars):', secret.substring(0, 10));
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    console.log('[JwtStrategy] validate() called with payload:', JSON.stringify(payload).substring(0, 100));
    if (!payload.sub) {
      throw new UnauthorizedException();
    }
    return { 
      userId: payload.sub, 
      email: payload.email, 
      role: payload.role, 
      companyId: payload.companyId 
    };
  }
}
