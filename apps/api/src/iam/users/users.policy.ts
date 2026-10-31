import { RoleScope, UserStatus } from '@generated/prisma/client';

import {
  BadRequestAppException,
  ForbiddenAppException,
  NotFoundAppException,
} from '@/common/exceptions';
import type { AuthDb } from '../auth.authorization';

export async function userHoldsSystemRole(
  db: AuthDb,
  userId: string,
  now = new Date(),
): Promise<boolean> {
  const row = await db.userRole.findFirst({
    where: {
      userId,
      role: { isSystem: true, deletedAt: null },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    select: { id: true },
  });

  return !!row;
}

export async function assertNotLastSystemAdmin(
  db: AuthDb,
  userId: string,
  now = new Date(),
): Promise<void> {
  if (!(await userHoldsSystemRole(db, userId, now))) {
    return;
  }

  const remaining = await db.userRole.count({
    where: {
      role: { isSystem: true, deletedAt: null },
      user: {
        id: { not: userId },
        deletedAt: null,
        status: UserStatus.ACTIVE,
      },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
  });

  if (remaining < 1) {
    throw new ForbiddenAppException();
  }
}

export async function loadAssignableRoles(db: AuthDb, roleIds: string[]) {
  const unique = [...new Set(roleIds)];

  if (unique.length === 0) {
    return [];
  }

  const roles = await db.role.findMany({
    where: { id: { in: unique }, deletedAt: null },
  });

  if (roles.length !== unique.length) {
    throw new NotFoundAppException();
  }

  if (roles.some((role) => role.scope !== RoleScope.PLATFORM)) {
    throw new BadRequestAppException();
  }

  return roles;
}

export async function loadPermissionsByIds(db: AuthDb, permissionIds: string[]) {
  const unique = [...new Set(permissionIds)];

  if (unique.length === 0) {
    return [];
  }

  const permissions = await db.permission.findMany({
    where: { id: { in: unique } },
  });

  if (permissions.length !== unique.length) {
    throw new NotFoundAppException();
  }

  return permissions;
}

export async function loadPermissionsByKeys(db: AuthDb, keys: string[]) {
  const unique = [...new Set(keys.map((key) => key.trim()).filter(Boolean))];

  if (unique.length === 0) {
    return [];
  }

  const permissions = await db.permission.findMany({
    where: { key: { in: unique } },
  });

  if (permissions.length !== unique.length) {
    throw new NotFoundAppException();
  }

  return permissions;
}
