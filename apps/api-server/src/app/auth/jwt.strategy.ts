import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export type JwtPayload = { sub: string; role: 'ADMIN' | 'DRIVER' };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(cfg: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: cfg.get<string>('JWT_SECRET') || 'change-me-in-production',
    });
  }

  validate(payload: JwtPayload): { userId: string; role: 'ADMIN' | 'DRIVER' } {
    if (!payload?.sub || !payload?.role) {
      throw new UnauthorizedException();
    }
    if (payload.role !== 'ADMIN' && payload.role !== 'DRIVER') {
      throw new UnauthorizedException();
    }
    return { userId: payload.sub, role: payload.role };
  }
}
