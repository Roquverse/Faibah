import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    // Supabase now uses ES256 (asymmetric) by default for newer projects.
    // We must verify using JWKS (public keys) from Supabase's well-known endpoint.
    const jwksUri = `${SUPABASE_URL}/auth/v1/.well-known/jwks.json`;
    console.log('[JwtStrategy] Using JWKS URI:', jwksUri);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri,
      }),
      algorithms: ['ES256', 'HS256'], // support both old and new Supabase projects
    });
  }

  async validate(payload: any) {
    if (!payload.sub) {
      throw new UnauthorizedException();
    }
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      companyId: payload.companyId,
      // Expose jti and exp so the auth guard can check the blacklist
      jti: payload.jti,
      exp: payload.exp,
    };
  }
}
