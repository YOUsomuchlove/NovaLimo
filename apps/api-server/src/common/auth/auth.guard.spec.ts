import {
  ForbiddenException,
  UnauthorizedException,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { AUTH_RULE, type AuthRule, IS_PUBLIC } from './decorators';

const jwt = new JwtService({
  secret: 'test-secret-test-secret-test-secret',
  signOptions: { issuer: 'novalimo-api' },
  verifyOptions: { issuer: 'novalimo-api' },
});

function ctx(meta: { public?: boolean; rule?: AuthRule }, token?: string) {
  const req: Record<string, unknown> = {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  };
  const handler = () => undefined;
  if (meta.public) Reflect.defineMetadata(IS_PUBLIC, true, handler);
  if (meta.rule) Reflect.defineMetadata(AUTH_RULE, meta.rule, handler);
  return {
    req,
    context: {
      getType: () => 'http',
      getHandler: () => handler,
      getClass: () => class {},
      switchToHttp: () => ({ getRequest: () => req }),
    } as unknown as ExecutionContext,
  };
}

describe('AuthGuard', () => {
  const guard = new AuthGuard(new Reflector(), jwt);

  it('lets public routes through without a token', async () => {
    await expect(
      guard.canActivate(ctx({ public: true }).context),
    ).resolves.toBe(true);
  });

  it('requires a token elsewhere', async () => {
    await expect(guard.canActivate(ctx({}).context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('checks kind and permissions', async () => {
    const staff = await jwt.signAsync({
      sub: 'u1',
      kind: 'STAFF',
      perms: ['booking.read'],
    });
    const driver = await jwt.signAsync({
      sub: 'd1',
      kind: 'DRIVER',
      perms: [],
    });

    const ok = ctx(
      { rule: { kind: 'STAFF', permissions: ['booking.read'] } },
      staff,
    );
    await expect(guard.canActivate(ok.context)).resolves.toBe(true);
    expect(ok.req.user).toEqual({
      sub: 'u1',
      kind: 'STAFF',
      perms: ['booking.read'],
    });

    await expect(
      guard.canActivate(
        ctx({ rule: { kind: 'STAFF', permissions: ['finance.write'] } }, staff)
          .context,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      guard.canActivate(ctx({ rule: { kind: 'STAFF' } }, driver).context),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects tokens that are not access tokens (e.g. OTP lookup tokens)', async () => {
    const lookup = await jwt.signAsync(
      { phone: '0912345678' },
      { audience: 'booking-lookup' },
    );
    await expect(
      guard.canActivate(ctx({}, lookup).context),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects tampered tokens', async () => {
    const staff = await jwt.signAsync({ sub: 'u1', kind: 'STAFF', perms: [] });
    await expect(
      guard.canActivate(ctx({}, `${staff.slice(0, -2)}xx`).context),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
