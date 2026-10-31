import type { AuthUser } from '@packages/auth';

export type AuthenticatedUser = AuthUser & {
  sessionId: string;
  accessTokenId: string;
  jti: string;
  impersonatedById: string | null;
};

export function primaryRole(user: AuthenticatedUser): string {
  return user.roles[0] ?? '';
}
