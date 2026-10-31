import {
  AUTH_ACCESS_COOKIE,
  AUTH_REFRESH_COOKIE,
  type AuthTokens,
} from '@packages/auth';
import type { CookieOptions, Response } from 'express';

export type AuthCookieOptions = {
  secure: boolean;
  domain?: string;
  accessMaxAgeMs: number;
  refreshMaxAgeMs: number;
};

function baseCookie(options: Pick<AuthCookieOptions, 'secure' | 'domain'>): CookieOptions {
  return {
    httpOnly: true,
    secure: options.secure,
    sameSite: 'lax',
    path: '/',
    domain: options.domain,
  };
}

export function setAuthCookies(
  response: Response,
  tokens: AuthTokens,
  options: AuthCookieOptions,
): void {
  const base = baseCookie(options);
  response.cookie(AUTH_ACCESS_COOKIE, tokens.accessToken, {
    ...base,
    maxAge: options.accessMaxAgeMs,
  });
  response.cookie(AUTH_REFRESH_COOKIE, tokens.refreshToken, {
    ...base,
    maxAge: options.refreshMaxAgeMs,
  });
}

export function clearAuthCookies(
  response: Response,
  options: Pick<AuthCookieOptions, 'secure' | 'domain'>,
): void {
  const base = baseCookie(options);
  response.clearCookie(AUTH_ACCESS_COOKIE, base);
  response.clearCookie(AUTH_REFRESH_COOKIE, base);
}
