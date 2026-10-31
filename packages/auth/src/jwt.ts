import { ACCESS_TOKEN_USE } from './constants';

export type AccessTokenClaims = {
  sub: string;
  jti: string;
  sid: string;
  org?: string | null;
  use: typeof ACCESS_TOKEN_USE;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string | string[];
};

export function isAccessTokenClaims(
  value: unknown,
): value is AccessTokenClaims {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const claims = value as Record<string, unknown>;

  return (
    typeof claims.sub === 'string' &&
    typeof claims.jti === 'string' &&
    typeof claims.sid === 'string' &&
    (claims.org === null ||
      claims.org === undefined ||
      typeof claims.org === 'string') &&
    claims.use === ACCESS_TOKEN_USE
  );
}

export function decodeJwtPayload(token: string): unknown | null {
  const parts = token.split('.');

  if (parts.length < 2) {
    return null;
  }

  try {
    const padded = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padLength = (4 - (padded.length % 4)) % 4;
    const json = atob(`${padded}${'='.repeat(padLength)}`);
    return JSON.parse(json) as unknown;
  } catch {
    return null;
  }
}
