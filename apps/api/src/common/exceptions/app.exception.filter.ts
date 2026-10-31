import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AppErrorCode } from '@packages/types';
import type { Request, Response } from 'express';

import { AppException } from './app.exception';
import {
  httpStatusToAppErrorCode,
  localeFromHeaders,
  translatedMessage,
} from './error-response';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const locale = localeFromHeaders(request.headers);
    const where = `${request.method} ${request.originalUrl ?? request.url}`;

    if (exception instanceof AppException) {
      this.logger.warn(`${where} → ${exception.code}`);
      response.status(exception.getStatus()).json({
        statusCode: exception.getStatus(),
        code: exception.code,
        message: translatedMessage(exception.code, locale),
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const code = codeFromHttpException(exception) ?? httpStatusToAppErrorCode(status);
      if (status >= 500) {
        this.logger.error(`${where} → ${code}`, exception.stack);
      } else {
        this.logger.warn(`${where} → ${status} ${code}`);
      }

      response.status(status).json({
        statusCode: status,
        code,
        message: translatedMessage(code, locale),
      });
      return;
    }

    this.logger.error(
      `${where} → unhandled`,
      exception instanceof Error ? exception.stack : String(exception),
    );
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: AppErrorCode.INTERNAL_SERVER_ERROR,
      message: translatedMessage(AppErrorCode.INTERNAL_SERVER_ERROR, locale),
    });
  }
}

function codeFromHttpException(exception: HttpException): string | undefined {
  const body = exception.getResponse();
  if (typeof body !== 'object' || body === null) {
    return undefined;
  }

  const code = (body as Record<string, unknown>).code;
  return typeof code === 'string' && code.length > 0 ? code : undefined;
}
