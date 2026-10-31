import type { AuthUser } from '@packages/auth';
import {
  ALL_PERMISSIONS,
  PLATFORM_SUPER_ADMIN_SLUG,
} from '@packages/types';
import { CredentialType } from '@generated/prisma/client';
import type { Prisma } from '@generated/prisma/client';

import type { PrismaService } from '../prisma/prisma.service';

export type AuthDb = PrismaService | Prisma.TransactionClient;

export type AuthorizationSnapshot = {
  roles: string[];
  permissions: string[];
  mustChangePassword: boolean;
  mfaEnabled: boolean;
};

type UserAuthRow = {
  id: string;
  publicId: string;
  email: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  status: AuthUser['status'];
  emailVerifiedAt: Date | null;
  userRoles: Array<{
    expiresAt: Date | null;
    role: {
      slug: string;
      deletedAt: Date | null;
      permissions: Array<{ permission: { key: string } }>;
    };
  }>;
  credentials: Array<{
    mustChangePassword: boolean;
    passwordExpiresAt: Date | null;
  }>;
  security: {
    mfaEnabled: boolean;
    backupCodesHash: string[];
    totpSecretEncrypted: string | null;
  } | null;
};

export const userAuthInclude = {
  userRoles: {
    include: {
      role: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
    },
  },
  credentials: {
    where: {
      type: CredentialType.PASSWORD,
      isActive: true,
      deletedAt: null,
    },
    take: 1,
  },
  security: true,
} satisfies Prisma.UserInclude;

export function authorizationOf(
  user: UserAuthRow,
  now = new Date(),
): AuthorizationSnapshot {
  const roles = new Set<string>();
  const permissions = new Set<string>();

  for (const assignment of user.userRoles) {
    if (assignment.expiresAt && assignment.expiresAt <= now) {
      continue;
    }

    if (assignment.role.deletedAt) {
      continue;
    }

    roles.add(assignment.role.slug);

    if (assignment.role.slug === PLATFORM_SUPER_ADMIN_SLUG) {
      permissions.add(ALL_PERMISSIONS);
    }

    for (const link of assignment.role.permissions) {
      permissions.add(link.permission.key);
    }
  }

  const credential = user.credentials[0];
  const expired =
    !!credential?.passwordExpiresAt && credential.passwordExpiresAt <= now;

  return {
    roles: [...roles],
    permissions: [...permissions],
    mustChangePassword: !!credential?.mustChangePassword || expired,
    mfaEnabled: user.security?.mfaEnabled ?? false,
  };
}

export function toAuthUser(
  user: UserAuthRow,
  authz: AuthorizationSnapshot,
): AuthUser {
  return {
    id: user.id,
    publicId: user.publicId,
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    status: user.status,
    emailVerified: !!user.emailVerifiedAt,
    roles: authz.roles,
    permissions: authz.permissions,
    mustChangePassword: authz.mustChangePassword,
    mfaEnabled: authz.mfaEnabled,
  };
}

export async function loadUserAuth(
  db: AuthDb,
  userId: string,
): Promise<UserAuthRow | null> {
  return db.user.findFirst({
    where: { id: userId, deletedAt: null },
    include: userAuthInclude,
  });
}
