import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Request, Response } from 'express';
import { type Observable, tap } from 'rxjs';
import type { Repository } from 'typeorm';
import { AuditLogEntity } from '../../database/entities';
import type { AuthUser } from '../auth/auth-user';

const SECRET_KEYS = /password|token|secret|otp|code_hash/i;

function redact(value: unknown, depth = 0): unknown {
  if (depth > 4 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value))
    return value.slice(0, 50).map((v) => redact(v, depth + 1));
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([k, v]) => [
      k,
      SECRET_KEYS.test(k) ? '[redacted]' : redact(v, depth + 1),
    ]),
  );
}

/**
 * Records every successful state-changing request made by staff (POST/PUT/PATCH/DELETE)
 * into `audit_logs` — server side, so the audit trail cannot be skipped by a client.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly logs: Repository<AuditLogEntity>,
  ) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (ctx.getType() !== 'http') return next.handle();
    const req = ctx.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    if (
      req.method === 'GET' ||
      req.method === 'HEAD' ||
      req.method === 'OPTIONS' ||
      req.user?.kind !== 'STAFF'
    ) {
      return next.handle();
    }
    return next.handle().pipe(
      tap((result) => {
        const res = ctx.switchToHttp().getResponse<Response>();
        const path = (req.route?.path as string | undefined) ?? req.path;
        const resource =
          path
            .replace(/^\/api\//, '')
            .split('/')
            .filter((s) => s && !s.startsWith(':') && s !== 'admin')[0] ??
          'unknown';
        const resourceId =
          (req.params?.id as string | undefined) ??
          (result && typeof result === 'object' && 'id' in result
            ? String((result as { id: unknown }).id)
            : null);
        void this.logs
          .save(
            this.logs.create({
              actor_user_id: req.user?.sub ?? null,
              action: `${req.method} ${path}`,
              resource,
              resource_id: resourceId,
              // jsonb column: TypeORM's deep-partial typing cannot express arbitrary JSON
              payload: redact(req.body) as never,
              status_code: res.statusCode,
              ip: req.ip ?? null,
            }),
          )
          .catch(() => undefined);
      }),
    );
  }
}
