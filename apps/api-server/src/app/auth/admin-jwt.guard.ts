import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AdminJwtGuard extends AuthGuard('jwt') {
  override handleRequest<TUser = { userId: string; role: string }>(
    err: unknown,
    user: TUser,
  ): TUser {
    const u = user as { role?: string } | undefined;
    if (err || !u || u.role !== 'ADMIN') {
      throw new UnauthorizedException();
    }
    return user;
  }
}
