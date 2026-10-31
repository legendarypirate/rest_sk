import { Injectable } from '@nestjs/common';
import type { RolePermissionAssignment } from '@packages/types';

import { NotFoundAppException } from '@/common/exceptions';
import { PrismaService } from '@/prisma/prisma.service';
import { toRolePermissionAssignment } from './roles.mapper';

@Injectable()
export class RolePermissionsQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async listByRoleId(roleId: string): Promise<RolePermissionAssignment[]> {
    const role = await this.prisma.role.findFirst({
      where: { id: roleId },
      select: { id: true },
    });

    if (!role) {
      throw new NotFoundAppException();
    }

    const rows = await this.prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
      orderBy: { permission: { key: 'asc' } },
    });

    return rows.map(toRolePermissionAssignment);
  }

  async getByRoleAndPermission(
    roleId: string,
    permissionId: string,
  ): Promise<RolePermissionAssignment> {
    const row = await this.prisma.rolePermission.findFirst({
      where: { roleId, permissionId },
      include: { permission: true },
    });

    if (!row) {
      throw new NotFoundAppException();
    }

    return toRolePermissionAssignment(row);
  }
}
