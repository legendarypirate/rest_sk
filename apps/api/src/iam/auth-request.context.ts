import { isIP } from 'node:net';

import {
  AUTH_FINGERPRINT_HEADER,
  AUTH_REQUEST_ID_HEADER,
} from '@packages/auth';
import type { Request } from 'express';

import { clientMeta } from '../common/utils/request';

export type AuthRequestContext = {
  ipAddress?: string;
  userAgent?: string;
  fingerprint?: string;
  requestId?: string;
};

function headerValue(
  headers: Request['headers'],
  name: string,
): string | undefined {
  const value = headers[name];
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed || undefined;
}

export function toInet(ip?: string): string | undefined {
  if (!ip || isIP(ip) === 0) {
    return undefined;
  }

  return ip;
}

export function authRequestContext(
  request: Request,
  fingerprint?: string,
): AuthRequestContext {
  const { ipAddress, userAgent } = clientMeta(request.headers);
  const resolvedIp = toInet(ipAddress ?? request.ip);

  return {
    ipAddress: resolvedIp,
    userAgent,
    fingerprint:
      fingerprint?.trim() ||
      headerValue(request.headers, AUTH_FINGERPRINT_HEADER),
    requestId: headerValue(request.headers, AUTH_REQUEST_ID_HEADER),
  };
}
