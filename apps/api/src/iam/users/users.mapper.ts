import type { Prisma, Role, User } from '@generated/prisma/client';
import type {
  UserDetail,
  UserListItem,
  UserRoleAssignment,
} from '@packages/types';

import { toIso } from '@/common/utils/date';

export type UserRoleRow = {
  id: string;
  userId: string;
  roleId: string;
  grantedById: string | null;
  grantedAt: Date;
  expiresAt: Date | null;
  role: Pick<Role, 'id' | 'slug' | 'name' | 'scope'>;
};

export type UserListRow = User & {
  security: { mfaEnabled: boolean } | null;
  userRoles: UserRoleRow[];
};

export const userListInclude = {
  security: { select: { mfaEnabled: true } },
  userRoles: {
    include: {
      role: { select: { id: true, slug: true, name: true, scope: true } },
    },
  },
} satisfies Prisma.UserInclude;

export function toUserRoleAssignment(row: UserRoleRow): UserRoleAssignment {
  return {
    id: row.id,
    userId: row.userId,
    roleId: row.roleId,
    slug: row.role.slug,
    name: row.role.name,
    scope: row.role.scope,
    grantedById: row.grantedById,
    grantedAt: row.grantedAt.toISOString(),
    expiresAt: toIso(row.expiresAt),
  };
}

export function toUserListItem(user: UserListRow, now = new Date()): UserListItem {
  const roles = user.userRoles
    .filter(
      (assignment) =>
        !assignment.expiresAt || assignment.expiresAt > now,
    )
    .map((assignment) => ({
      id: assignment.role.id,
      slug: assignment.role.slug,
      name: assignment.role.name,
      scope: assignment.role.scope,
    }));

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
    mfaEnabled: user.security?.mfaEnabled ?? false,
    isSystemUser: user.isSystemUser,
    lastLoginAt: toIso(user.lastLoginAt),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    deletedAt: toIso(user.deletedAt),
    roles,
  };
}

export function toUserDetail(user: UserListRow, now = new Date()): UserDetail {
  return {
    ...toUserListItem(user, now),
    phoneE164: user.phoneE164,
    locale: user.locale,
    timezone: user.timezone,
    lastSeenAt: toIso(user.lastSeenAt),
    deactivatedAt: toIso(user.deactivatedAt),
    deactivatedReason: user.deactivatedReason,
    rowVersion: user.rowVersion,
    assignments: user.userRoles.map(toUserRoleAssignment),
  };
}
