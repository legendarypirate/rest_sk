import { HttpStatus } from '@nestjs/common';
import { resolveLocale, translateError, type Locale } from '@packages/i18n';
import { AppErrorCode } from '@packages/types';

export function localeFromHeaders(headers?: object | null): Locale {
  if (!headers) {
    return 'en';
  }

  const map = headers as Record<string, unknown>;
  return resolveLocale(
    headerValue(map['x-locale']) ?? headerValue(map['accept-language']),
  );
}

export function translatedMessage(code: string, locale: Locale): string {
  return translateError(code, locale) ?? code;
}

export function httpStatusToAppErrorCode(status: number): AppErrorCode {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return AppErrorCode.BAD_REQUEST;
    case HttpStatus.UNAUTHORIZED:
      return AppErrorCode.UNAUTHORIZED;
    case HttpStatus.FORBIDDEN:
      return AppErrorCode.FORBIDDEN;
    case HttpStatus.NOT_FOUND:
      return AppErrorCode.NOT_FOUND;
    case HttpStatus.CONFLICT:
      return AppErrorCode.CONFLICT;
    case HttpStatus.TOO_MANY_REQUESTS:
      return AppErrorCode.RATE_LIMITED;
    case HttpStatus.BAD_GATEWAY:
    case HttpStatus.SERVICE_UNAVAILABLE:
    case HttpStatus.GATEWAY_TIMEOUT:
      return AppErrorCode.INTEGRATION_ERROR;
    default:
      return status >= 500
        ? AppErrorCode.INTERNAL_SERVER_ERROR
        : AppErrorCode.BAD_REQUEST;
  }
}

function headerValue(value: unknown): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === 'string' && raw.trim() ? raw.trim() : undefined;
}
