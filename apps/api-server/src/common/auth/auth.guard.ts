import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { AuthUser } from './auth-user';
import { AUTH_RULE, type AuthRule, IS_PUBLIC } from './decorators';

/**
 * Global guard (APP_GUARD): every route requires a valid access token unless marked `@Public()`.
 * `@Staff(...perms)` / `@Driver()` additionally check the user kind and permissions → 403.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    if (ctx.getType() !== 'http') return true;
    const targets = [ctx.getHandler(), ctx.getClass()];
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC,
      targets,
    );
    const req = ctx.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const token = extractBearer(req);

    if (token) {
      try {
        req.user = await this.jwt.verifyAsync<AuthUser>(token);
      } catch {
        if (!isPublic)
          throw new UnauthorizedException({
            code: 'TOKEN_INVALID',
            message: 'Phiên đăng nhập hết hạn',
          });
      }
    }
    if (isPublic) return true;
    if (!req.user)
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Vui lòng đăng nhập',
      });

    const rule = this.reflector.getAllAndOverride<AuthRule | undefined>(
      AUTH_RULE,
      targets,
    );
    if (!rule) return true;
    if (req.user.kind !== rule.kind)
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Tài khoản không có quyền truy cập',
      });
    const missing = (rule.permissions ?? []).filter(
      (p) => !req.user?.perms.includes(p),
    );
    if (missing.length) {
      throw new ForbiddenException({
        code: 'MISSING_PERMISSION',
        message: 'Bạn không có quyền thực hiện thao tác này',
        details: missing,
      });
    }
    return true;
  }
}

export function extractBearer(
  req: Pick<Request, 'headers'>,
): string | undefined {
  const h = req.headers.authorization;
  return h?.startsWith('Bearer ') ? h.slice(7) : undefined;
}
