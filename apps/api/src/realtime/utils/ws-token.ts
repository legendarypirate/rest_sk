import type { AppSocket } from '../types/realtime.types';

const BEARER_RE = /^Bearer\s+/i;

/**
 * Extracts the access token from a socket handshake. Supports, in order:
 *   1. `auth: { token }` (recommended socket.io client option)
 *   2. `Authorization: Bearer <token>` header
 *   3. `?token=` query param
 */
export function extractWsToken(socket: AppSocket): string | null {
  const auth = socket.handshake.auth as { token?: unknown } | undefined;
  if (typeof auth?.token === 'string' && auth.token.trim()) {
    return auth.token.replace(BEARER_RE, '').trim();
  }

  const header = socket.handshake.headers.authorization;
  if (typeof header === 'string' && header.trim()) {
    return header.replace(BEARER_RE, '').trim();
  }

  const queryToken = socket.handshake.query.token;
  if (typeof queryToken === 'string' && queryToken.trim()) {
    return queryToken.replace(BEARER_RE, '').trim();
  }

  return null;
}
