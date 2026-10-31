import { Injectable } from '@nestjs/common';
import { AuditAction, PermissionScope } from '@generated/prisma/client';

import { AuditCommandService } from '@/audit';
import {
  ConflictAppException,
  ForbiddenAppException,
  NotFoundAppException,
} from '@/common/exceptions';
import { PrismaService } from '@/prisma/prisma.service';
import type { AuthRequestContext } from '../auth-request.context';
import type { AuthDb } from '../auth.authorization';
import type { AuthenticatedUser } from '../auth.types';
import type {
  CreateResourceDto,
  ResourceActionInputDto,
  UpdateResourceDto,
} from './dto/resources.dto';
import {
  isDangerousAction,
  permissionKey,
} from './resources.mapper';
import { ResourcesQueryService } from './resources.query.service';

@Injectable()
export class ResourcesCommandService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queries: ResourcesQueryService,
    private readonly audit: AuditCommandService,
  ) {}

  async create(
    actor: AuthenticatedUser,
    input: CreateResourceDto,
    context: AuthRequestContext,
  ) {
    const id = await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`auth:resource:${input.slug}`}))`;
      await this.assertSlugAvailable(tx, input.slug);
      await this.assertParent(tx, input.parentId);

      const groupKey = input.groupKey ?? null;
      const groupSortOrder = await this.resolveGroupSortOrder(
        tx,
        groupKey,
        input.groupSortOrder,
      );

      const resource = await tx.resource.create({
        data: {
          slug: input.slug,
          name: input.name,
          description: input.description ?? null,
          scope: input.scope ?? 'PLATFORM',
          path: input.path ?? null,
          icon: input.icon ?? null,
          groupKey,
          groupLabel: input.groupLabel ?? null,
          groupSortOrder,
          sortOrder: input.sortOrder ?? 0,
          isMenu: input.isMenu ?? true,
          menuExact: input.menuExact ?? false,
          parentId: input.parentId ?? null,
        },
      });

      await this.syncGroupSortOrder(tx, groupKey, groupSortOrder);

      await this.syncActions(
        tx,
        resource.id,
        resource.slug,
        resource.scope,
        input.actions ?? [],
      );

      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.CREATE,
        resourceType: 'resource',
        resourceId: resource.id,
        after: {
          slug: resource.slug,
          path: resource.path,
          actions: (input.actions ?? []).map((item) => item.action),
        },
      });

      return resource.id;
    });

    return this.queries.getById(id);
  }

  async update(
    actor: AuthenticatedUser,
    id: string,
    input: UpdateResourceDto,
    context: AuthRequestContext,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.resource.findFirst({ where: { id } });

      if (!existing || existing.deletedAt) {
        throw new NotFoundAppException();
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
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`auth:resource:${input.slug}`}))`;
        await this.assertSlugAvailable(tx, input.slug, id);
      }

      if (input.parentId !== undefined) {
        if (input.parentId === id) {
          throw new ConflictAppException();
        }
        await this.assertParent(tx, input.parentId);
      }

      const nextSlug = input.slug ?? existing.slug;
      const nextScope = input.scope ?? existing.scope;
      const nextGroupKey =
        input.groupKey !== undefined ? input.groupKey : existing.groupKey;
      const movedGroup =
        input.groupKey !== undefined && input.groupKey !== existing.groupKey;
      const nextGroupSortOrder = movedGroup && input.groupSortOrder === undefined
        ? await this.resolveGroupSortOrder(tx, nextGroupKey, undefined)
        : (input.groupSortOrder ?? existing.groupSortOrder);

      await tx.resource.update({
        where: { id },
        data: {
          ...(input.slug ? { slug: input.slug } : {}),
          ...(input.name ? { name: input.name } : {}),
          ...(input.description !== undefined
            ? { description: input.description }
            : {}),
          ...(input.scope ? { scope: input.scope } : {}),
          ...(input.path !== undefined ? { path: input.path } : {}),
          ...(input.icon !== undefined ? { icon: input.icon } : {}),
          ...(input.groupKey !== undefined ? { groupKey: input.groupKey } : {}),
          ...(input.groupLabel !== undefined
            ? { groupLabel: input.groupLabel }
            : {}),
          groupSortOrder: nextGroupSortOrder,
          ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
          ...(input.isMenu !== undefined ? { isMenu: input.isMenu } : {}),
          ...(input.menuExact !== undefined ? { menuExact: input.menuExact } : {}),
          ...(input.parentId !== undefined ? { parentId: input.parentId } : {}),
        },
      });

      if (
        input.groupSortOrder !== undefined ||
        movedGroup
      ) {
        await this.syncGroupSortOrder(tx, nextGroupKey, nextGroupSortOrder);
      }

      if (input.actions) {
        await this.syncActions(tx, id, nextSlug, nextScope, input.actions);
      } else if (input.slug && input.slug !== existing.slug) {
        await tx.permission.updateMany({
          where: { resourceId: id },
          data: { resource: nextSlug },
        });
      }

      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.UPDATE,
        resourceType: 'resource',
        resourceId: id,
        before: { slug: existing.slug, path: existing.path },
        after: { slug: nextSlug, path: input.path ?? existing.path },
      });
    });

    return this.queries.getById(id);
  }

  async remove(
    actor: AuthenticatedUser,
    id: string,
    context: AuthRequestContext,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.resource.findFirst({
        where: { id },
        include: { _count: { select: { children: true } } },
      });

      if (!existing || existing.deletedAt) {
        throw new NotFoundAppException();
      }

      if (existing.isSystem) {
        throw new ForbiddenAppException();
      }

      if (existing._count.children > 0) {
        throw new ConflictAppException();
      }

      const assigned = await tx.rolePermission.count({
        where: { permission: { resourceId: id } },
      });

      if (assigned > 0) {
        throw new ConflictAppException();
      }

      await tx.permission.deleteMany({ where: { resourceId: id } });
      await tx.resource.update({
        where: { id },
        data: { deletedAt: new Date(), isMenu: false },
      });

      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.DELETE,
        resourceType: 'resource',
        resourceId: id,
        before: { slug: existing.slug, name: existing.name },
      });
    });
  }

  private async syncActions(
    db: AuthDb,
    resourceId: string,
    slug: string,
    scope: PermissionScope,
    actions: ResourceActionInputDto[],
  ) {
    for (const item of actions) {
      const key = permissionKey(scope, slug, item.action);
      const name = item.name ?? `${item.action} ${slug}`;
      const isDangerous = item.isDangerous ?? isDangerousAction(item.action);

      await db.permission.upsert({
        where: { key },
        create: {
          key,
          name,
          description: name,
          resource: slug,
          action: item.action,
          scope,
          isDangerous,
          resourceId,
        },
        update: {
          name,
          description: name,
          resource: slug,
          action: item.action,
          scope,
          isDangerous,
          resourceId,
        },
      });
    }
  }

  private async assertSlugAvailable(
    db: AuthDb,
    slug: string,
    excludeId?: string,
  ) {
    const existing = await db.resource.findFirst({
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

  private async resolveGroupSortOrder(
    db: AuthDb,
    groupKey: string | null,
    explicit?: number,
  ) {
    if (explicit !== undefined) {
      return explicit;
    }

    if (!groupKey) {
      return 0;
    }

    const sibling = await db.resource.findFirst({
      where: { groupKey, deletedAt: null },
      select: { groupSortOrder: true },
      orderBy: { groupSortOrder: 'asc' },
    });

    return sibling?.groupSortOrder ?? 0;
  }

  private async syncGroupSortOrder(
    db: AuthDb,
    groupKey: string | null,
    groupSortOrder: number,
  ) {
    if (!groupKey) {
      return;
    }

    await db.resource.updateMany({
      where: { groupKey, deletedAt: null },
      data: { groupSortOrder },
    });
  }

  private async assertParent(db: AuthDb, parentId?: string | null) {
    if (!parentId) {
      return;
    }

    const parent = await db.resource.findFirst({
      where: { id: parentId, deletedAt: null },
      select: { id: true },
    });

    if (!parent) {
      throw new NotFoundAppException();
    }
  }
}
