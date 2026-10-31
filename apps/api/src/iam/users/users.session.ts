import {
  SessionStatus,
  TokenStatus,
} from '@generated/prisma/client';

import type { AuthDb } from '../auth.authorization';

export async function forceLogoutUser(
  db: AuthDb,
  userId: string,
  now: Date,
  reason: string,
): Promise<void> {
  await db.userSession.updateMany({
    where: { userId, status: SessionStatus.ACTIVE },
    data: {
      status: SessionStatus.FORCED_LOGOUT,
      revokedAt: now,
      revokeReason: reason,
    },
  });
  await db.accessToken.updateMany({
    where: { userId, status: TokenStatus.ACTIVE },
    data: {
      status: TokenStatus.REVOKED,
      revokedAt: now,
      revokeReason: reason,
    },
  });
  await db.refreshToken.updateMany({
    where: { userId, status: TokenStatus.ACTIVE },
    data: {
      status: TokenStatus.REVOKED,
      revokedAt: now,
    },
  });
}
