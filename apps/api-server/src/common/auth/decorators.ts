import type { Permission, UserKind } from '@limousine-workspace/shared-types';
import {
  type ExecutionContext,
  SetMetadata,
  applyDecorators,
  createParamDecorator,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import type { AuthUser } from './auth-user';

export const IS_PUBLIC = 'auth:public';
export const AUTH_RULE = 'auth:rule';

export interface AuthRule {
  kind: UserKind;
  /** Staff must hold ALL listed permissions */
  permissions?: Permission[];
}

/** No token required (a valid token is still decoded into `req.user` when present). */
export const Public = () => SetMetadata(IS_PUBLIC, true);

/** Staff endpoint, optionally requiring permissions: `@Staff('booking.write')` */
export const Staff = (...permissions: Permission[]) =>
  applyDecorators(
    SetMetadata(AUTH_RULE, { kind: 'STAFF', permissions } satisfies AuthRule),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token' }),
    ApiForbiddenResponse({ description: 'Không đủ quyền' }),
  );

/** Driver app endpoint */
export const Driver = () =>
  applyDecorators(
    SetMetadata(AUTH_RULE, { kind: 'DRIVER' } satisfies AuthRule),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token' }),
  );

/** Any signed-in user (staff or driver) */
export const Authenticated = () =>
  applyDecorators(ApiBearerAuth(), ApiUnauthorizedResponse());

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthUser => {
    const req = ctx.switchToHttp().getRequest<Request & { user: AuthUser }>();
    return req.user;
  },
);
