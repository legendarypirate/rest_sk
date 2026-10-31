import { Injectable } from '@nestjs/common';
import { AuditAction, type Permission } from '@generated/prisma/client';

import { AuditCommandService } from '@/audit';
import {
  BadRequestAppException,
  ConflictAppException,
  ForbiddenAppException,
  NotFoundAppException,
} from '@/common/exceptions';
import { PrismaService } from '@/prisma/prisma.service';
import type { AuthRequestContext } from '../auth-request.context';
import type { AuthDb } from '../auth.authorization';
import type { AuthenticatedUser } from '../auth.types';
import {
  loadPermissionsByIds,
  loadPermissionsByKeys,
} from '../users/users.policy';
import type {
  GrantRolePermissionDto,
  ReplaceRolePermissionsDto,
} from './dto/role-permissions.dto';
import { RolePermissionsQueryService } from './role-permissions.query.service';

@Injectable()
export class RolePermissionsCommandService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queries: RolePermissionsQueryService,
    private readonly audit: AuditCommandService,
  ) {}

  async grant(
    actor: AuthenticatedUser,
    roleId: string,
    input: GrantRolePermissionDto,
    context: AuthRequestContext,
  ) {
    const permission = await this.resolveOne(input);

    await this.prisma.$transaction(async (tx) => {
      const role = await this.requireMutableRole(tx, roleId);
      const existing = await tx.rolePermission.findFirst({
        where: { roleId: role.id, permissionId: permission.id },
      });

      if (existing) {
        throw new ConflictAppException();
      }

      await tx.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });

      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.PERMISSION_GRANT,
        resourceType: 'role_permission',
        resourceId: role.id,
        after: { permissionId: permission.id, key: permission.key },
      });
    });

    return this.queries.getByRoleAndPermission(roleId, permission.id);
  }

  async replace(
    actor: AuthenticatedUser,
    roleId: string,
    input: ReplaceRolePermissionsDto,
    context: AuthRequestContext,
  ) {
    const permissions = await this.resolveMany(input);
    const nextIds = permissions.map((permission) => permission.id);

    await this.prisma.$transaction(async (tx) => {
      const role = await this.requireMutableRole(tx, roleId);
      const current = await tx.rolePermission.findMany({
        where: { roleId: role.id },
        select: { permissionId: true },
      });

      await tx.rolePermission.deleteMany({
        where: { roleId: role.id, permissionId: { notIn: nextIds } },
      });

      for (const permission of permissions) {
        await tx.rolePermission.upsert({
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

      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.UPDATE,
        resourceType: 'role_permission',
        resourceId: role.id,
        before: { permissionIds: current.map((row) => row.permissionId) },
        after: { permissionIds: nextIds },
      });
    });

    return this.queries.listByRoleId(roleId);
  }

  async revoke(
    actor: AuthenticatedUser,
    roleId: string,
    permissionId: string,
    context: AuthRequestContext,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await this.requireMutableRole(tx, roleId);

      const assignment = await tx.rolePermission.findFirst({
        where: { roleId, permissionId },
        include: { permission: true },
      });

      if (!assignment) {
        throw new NotFoundAppException();
      }

      await tx.rolePermission.delete({ where: { id: assignment.id } });

      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.PERMISSION_REVOKE,
        resourceType: 'role_permission',
        resourceId: roleId,
        before: {
          permissionId,
          key: assignment.permission.key,
        },
      });
    });
  }

  private async requireMutableRole(db: AuthDb, roleId: string) {
    const role = await db.role.findFirst({
      where: { id: roleId, deletedAt: null },
    });

    if (!role) {
      throw new NotFoundAppException();
    }

    if (role.isSystem) {
      throw new ForbiddenAppException();
    }

    return role;
  }

  private async resolveOne(input: GrantRolePermissionDto): Promise<Permission> {
    if (input.permissionId && input.permissionKey) {
      throw new BadRequestAppException();
    }

    if (input.permissionId) {
      const [permission] = await loadPermissionsByIds(this.prisma, [
        input.permissionId,
      ]);
      return permission;
    }

    if (input.permissionKey) {
      const [permission] = await loadPermissionsByKeys(this.prisma, [
        input.permissionKey,
      ]);
      return permission;
    }

    throw new BadRequestAppException();
  }

  private async resolveMany(input: ReplaceRolePermissionsDto): Promise<Permission[]> {
    const byId = await loadPermissionsByIds(this.prisma, input.permissionIds ?? []);
    const byKey = await loadPermissionsByKeys(
      this.prisma,
      input.permissionKeys ?? [],
    );
    const merged = new Map<string, Permission>();

    for (const permission of [...byId, ...byKey]) {
      merged.set(permission.id, permission);
    }

    return [...merged.values()];
  }
}
