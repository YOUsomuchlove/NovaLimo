import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exResponse = exception.getResponse();
      let message: string | string[] =
        typeof exResponse === 'string'
          ? exResponse
          : (exResponse as { message?: string | string[] }).message ||
            exception.message;
      if (Array.isArray(message)) message = message.join(', ');
      res.status(status).json({ message });
      return;
    }

    const msg =
      exception instanceof Error ? exception.message : 'Internal server error';
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: msg });
  }
}
