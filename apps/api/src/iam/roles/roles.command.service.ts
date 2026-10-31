import { Injectable } from '@nestjs/common';
import { AuditAction, Prisma } from '@generated/prisma/client';

import { AuditCommandService } from '@/audit';
import {
  ConflictAppException,
  ForbiddenAppException,
  NotFoundAppException,
} from '@/common/exceptions';
import { PrismaService } from '@/prisma/prisma.service';
import { PLATFORM_SUPER_ADMIN_SLUG } from '@packages/types';
import type { AuthRequestContext } from '../auth-request.context';
import type { AuthDb } from '../auth.authorization';
import type { AuthenticatedUser } from '../auth.types';
import { loadPermissionsByIds } from '../users/users.policy';
import type { CreateRoleDto, UpdateRoleDto } from './dto/roles.dto';
import { RolesQueryService } from './roles.query.service';

@Injectable()
export class RolesCommandService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queries: RolesQueryService,
    private readonly audit: AuditCommandService,
  ) {}

  async create(
    actor: AuthenticatedUser,
    input: CreateRoleDto,
    context: AuthRequestContext,
  ) {
    const roleId = await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`auth:role:${input.slug}`}))`;
      await this.assertSlugAvailable(tx, input.slug);

      const permissions = await loadPermissionsByIds(tx, input.permissionIds ?? []);

      if (input.isDefault) {
        await this.clearDefault(tx, input.scope ?? 'PLATFORM');
      }

      const role = await tx.role.create({
        data: {
          slug: input.slug,
          name: input.name,
          description: input.description ?? null,
          scope: input.scope ?? 'PLATFORM',
          isDefault: input.isDefault ?? false,
          priority: input.priority ?? 0,
          createdById: actor.id,
        },
      });

      if (permissions.length > 0) {
        await tx.rolePermission.createMany({
          data: permissions.map((permission) => ({
            roleId: role.id,
            permissionId: permission.id,
          })),
        });
      }

      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.CREATE,
        resourceType: 'role',
        resourceId: role.id,
        after: {
          slug: role.slug,
          scope: role.scope,
          permissionIds: permissions.map((permission) => permission.id),
        },
      });

      return role.id;
    });

    return this.queries.getById(roleId);
  }

  async update(
    actor: AuthenticatedUser,
    id: string,
    input: UpdateRoleDto,
    context: AuthRequestContext,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.role.findFirst({ where: { id } });

      if (!existing || existing.deletedAt) {
        throw new NotFoundAppException();
      }

      if (existing.slug === PLATFORM_SUPER_ADMIN_SLUG) {
        throw new ForbiddenAppException();
      }

      if (existing.isSystem) {
        if (input.slug && input.slug !== existing.slug) {
          throw new ForbiddenAppException();
        }
        if (input.scope && input.scope !== existing.scope) {
          throw new ForbiddenAppException();
        }
      }

      if (input.slug && input.slug !== existing.slug) {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`auth:role:${input.slug}`}))`;
        await this.assertSlugAvailable(tx, input.slug, id);
      }

      const nextScope = input.scope ?? existing.scope;

      if (input.isDefault) {
        await this.clearDefault(tx, nextScope, id);
      }

      try {
        await tx.role.update({
          where: { id },
          data: {
            ...(input.slug ? { slug: input.slug } : {}),
            ...(input.name ? { name: input.name } : {}),
            ...(input.description !== undefined
              ? { description: input.description }
              : {}),
            ...(existing.isSystem ? {} : input.scope ? { scope: input.scope } : {}),
            ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
            ...(input.priority !== undefined ? { priority: input.priority } : {}),
          },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
        throw new ConflictAppException();
        }
        throw error;
      }

      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.UPDATE,
        resourceType: 'role',
        resourceId: id,
        before: {
          slug: existing.slug,
          name: existing.name,
          scope: existing.scope,
          isDefault: existing.isDefault,
          priority: existing.priority,
        },
        after: {
          slug: input.slug ?? existing.slug,
          name: input.name ?? existing.name,
          scope: nextScope,
          isDefault: input.isDefault ?? existing.isDefault,
          priority: input.priority ?? existing.priority,
        },
      });
    });

    return this.queries.getById(id);
  }

  async remove(
    actor: AuthenticatedUser,
    id: string,
    context: AuthRequestContext,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.role.findFirst({ where: { id } });

      if (!existing || existing.deletedAt) {
        throw new NotFoundAppException();
      }

      if (existing.isSystem) {
        throw new ForbiddenAppException();
      }

      const assigned = await tx.userRole.count({ where: { roleId: id } });

      if (assigned > 0) {
        throw new ConflictAppException();
      }

      await tx.rolePermission.deleteMany({ where: { roleId: id } });
      await tx.role.update({
        where: { id },
        data: { deletedAt: new Date(), isDefault: false },
      });

      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.DELETE,
        resourceType: 'role',
        resourceId: id,
        before: { slug: existing.slug, name: existing.name },
      });
    });
  }

  private async assertSlugAvailable(
    db: AuthDb,
    slug: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await db.role.findFirst({
      where: {
        slug,
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictAppException();
    }
  }

  private async clearDefault(
    db: AuthDb,
    scope: Prisma.RoleCreateInput['scope'],
    excludeId?: string,
  ): Promise<void> {
    await db.role.updateMany({
      where: {
        scope,
        isDefault: true,
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      data: { isDefault: false },
    });
  }
}
