import { PLATFORM_SUPER_ADMIN_SLUG } from '@packages/types';
import { RoleScope } from '../../src/generated/prisma/client.js';

import type { Permission, Role, SeedClient } from './client';

export async function seedRoles(
  db: SeedClient,
  permissions: Permission[],
): Promise<Role> {
  const role = await db.role.upsert({
    where: { slug: PLATFORM_SUPER_ADMIN_SLUG },
    create: {
      slug: PLATFORM_SUPER_ADMIN_SLUG,
      name: 'Platform Super Admin',
      description: 'Full platform access. System role — do not delete.',
      scope: RoleScope.PLATFORM,
      isSystem: true,
      isDefault: false,
      priority: 1000,
    },
    update: {
      name: 'Platform Super Admin',
      scope: RoleScope.PLATFORM,
      isSystem: true,
      priority: 1000,
      deletedAt: null,
    },
  });

  for (const permission of permissions) {
    await db.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: role.id,
          permissionId: permission.id,
        },
      },
      create: {
        roleId: role.id,
        permissionId: permission.id,
      },
      update: {},
    });
  }

  return role;
}
