import { ArgumentsHost, Catch, HttpException, Logger } from '@nestjs/common';
import { type Locale } from '@packages/i18n';
import { AppErrorCode } from '@packages/types';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

import {
  AppException,
  httpStatusToAppErrorCode,
  localeFromHeaders,
  translatedMessage,
} from '@/common/exceptions';

import {
  SERVER_EVENTS,
  type AppSocket,
  type WsErrorPayload,
} from '../types/realtime.types';

function toWsError(exception: unknown, locale: Locale): WsErrorPayload {
  if (exception instanceof AppException) {
    return {
      code: exception.code,
      message: translatedMessage(exception.code, locale),
    };
  }

  if (exception instanceof WsException) {
    const err = exception.getError();
    const code =
      typeof err === 'string'
        ? err
        : typeof (err as Record<string, unknown>).code === 'string'
          ? ((err as Record<string, unknown>).code as string)
          : AppErrorCode.INTERNAL_SERVER_ERROR;

    return { code, message: translatedMessage(code, locale) };
  }

  if (exception instanceof HttpException) {
    const body = exception.getResponse();
    const codeFromBody =
      typeof body === 'object' &&
      body !== null &&
      typeof (body as Record<string, unknown>).code === 'string'
        ? ((body as Record<string, unknown>).code as string)
        : undefined;
    const code = codeFromBody ?? httpStatusToAppErrorCode(exception.getStatus());

    return { code, message: translatedMessage(code, locale) };
  }

  return {
    code: AppErrorCode.INTERNAL_SERVER_ERROR,
    message: translatedMessage(AppErrorCode.INTERNAL_SERVER_ERROR, locale),
  };
}

@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger(WsExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const client = host.switchToWs().getClient<AppSocket>();
    const locale = localeFromHeaders(client.handshake.headers);
    const payload = toWsError(exception, locale);

    if (
      payload.code === AppErrorCode.INTERNAL_SERVER_ERROR &&
      exception instanceof Error
    ) {
      this.logger.error(exception.message, exception.stack);
    }

    client.emit(SERVER_EVENTS.error, payload);
  }
}
