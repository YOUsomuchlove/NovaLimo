import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { ApiError } from '@limousine-workspace/shared-types';
import type { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

const CODE_BY_STATUS: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  410: 'GONE',
  422: 'UNPROCESSABLE',
  429: 'TOO_MANY_REQUESTS',
};

/**
 * Uniform error body `{ statusCode, code, message, details? }`.
 * Database errors are translated (unique → 409) and never leak SQL to clients.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('HTTP');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const body = this.toBody(exception);
    if (body.statusCode >= 500) {
      this.logger.error({ err: exception, path: req.url }, 'Unhandled error');
    }
    res.status(body.statusCode).json(body);
  }

  private toBody(exception: unknown): ApiError {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const r = exception.getResponse() as
        | string
        | { message?: string | string[]; code?: string; details?: unknown };
      const raw = typeof r === 'string' ? r : (r.message ?? exception.message);
      const message = Array.isArray(raw) ? raw.join('; ') : raw;
      return {
        statusCode,
        code:
          (typeof r === 'object' && r.code) ||
          CODE_BY_STATUS[statusCode] ||
          'ERROR',
        message,
        ...(typeof r === 'object' && r.details !== undefined
          ? { details: r.details }
          : {}),
        ...(Array.isArray(raw) ? { details: raw } : {}),
      };
    }
    if (exception instanceof QueryFailedError) {
      const pg = exception.driverError as { code?: string; detail?: string };
      if (pg.code === '23505')
        return {
          statusCode: 409,
          code: 'DUPLICATE',
          message: 'Dữ liệu đã tồn tại',
        };
      if (pg.code === '23503')
        return {
          statusCode: 409,
          code: 'IN_USE',
          message: 'Dữ liệu đang được sử dụng ở nơi khác',
        };
      if (pg.code === '22P02')
        return {
          statusCode: 400,
          code: 'BAD_REQUEST',
          message: 'Giá trị không hợp lệ',
        };
    }
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL',
      message: 'Đã có lỗi hệ thống, vui lòng thử lại',
    };
  }
}

/** Domain error with a stable machine-readable code, e.g. `throw new DomainError(409, 'SEAT_TAKEN', 'Ghế A1 đã có người đặt')` */
export class DomainError extends HttpException {
  constructor(
    status: number,
    code: string,
    message: string,
    details?: unknown,
  ) {
    super({ code, message, details }, status);
  }
}
