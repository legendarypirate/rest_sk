import { Injectable } from '@nestjs/common';
import {
  AuditAction,
  AvailabilityStatus,
  Prisma,
  RecordStatus,
} from '@generated/prisma/client';

import { AuditCommandService } from '@/audit';
import {
  BadRequestAppException,
  ConflictAppException,
  NotFoundAppException,
} from '@/common/exceptions';
import type { AuthRequestContext } from '@/iam/auth-request.context';
import type { AuthenticatedUser } from '@/iam/auth.types';
import { PrismaService } from '@/prisma/prisma.service';

import type { UpsertMenuCategoryDto } from './dto/menu.dto';
import { MenuQueryService } from './menu.query.service';

@Injectable()
export class MenuCommandService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queries: MenuQueryService,
    private readonly audit: AuditCommandService,
  ) {}

  async createCategory(
    actor: AuthenticatedUser,
    input: UpsertMenuCategoryDto,
    context: AuthRequestContext,
  ) {
    const restaurantId = await this.ensureRestaurantId();
    const id = await this.prisma
      .$transaction(async (tx) => {
        await this.assertParent(tx, null, restaurantId, input.parentId);
        const row = await tx.menuCategory.create({
          data: {
            restaurantId,
            parentId: input.parentId,
            code: input.code,
            name: input.name,
            description: input.description,
            sortOrder: input.sortOrder ?? 0,
            status: input.status ?? RecordStatus.DRAFT,
            availability: input.availability ?? AvailabilityStatus.AVAILABLE,
          },
        });
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.CREATE,
          resourceType: 'menu_category',
          resourceId: row.id,
          after: { code: row.code, name: row.name, restaurantId },
        });
        return row.id;
      })
      .catch(rethrowConflict);
    return this.queries.getCategory(id);
  }

  async updateCategory(
    actor: AuthenticatedUser,
    id: string,
    input: UpsertMenuCategoryDto,
    context: AuthRequestContext,
  ) {
    await this.prisma
      .$transaction(async (tx) => {
        const existing = await tx.menuCategory.findFirst({ where: { id, deletedAt: null } });
        if (!existing) throw new NotFoundAppException();
        await this.assertParent(tx, id, existing.restaurantId, input.parentId);
        await tx.menuCategory.update({
          where: { id },
          data: {
            parentId: input.parentId,
            code: input.code,
            name: input.name,
            description: input.description,
            sortOrder: input.sortOrder ?? existing.sortOrder,
            status: input.status ?? existing.status,
            availability: input.availability ?? existing.availability,
            rowVersion: { increment: 1 },
          },
        });
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.UPDATE,
          resourceType: 'menu_category',
          resourceId: id,
          before: { code: existing.code, name: existing.name },
          after: { code: input.code, name: input.name },
        });
      })
      .catch(rethrowConflict);
    return this.queries.getCategory(id);
  }

  async removeCategory(actor: AuthenticatedUser, id: string, context: AuthRequestContext) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.menuCategory.findFirst({ where: { id, deletedAt: null } });
      if (!existing) throw new NotFoundAppException();
      const children = await tx.menuCategory.count({
        where: { parentId: id, deletedAt: null },
      });
      const items = await tx.menuItem.count({ where: { categoryId: id, deletedAt: null } });
      const images = await tx.menuCategoryImage.count({ where: { menuCategoryId: id } });
      if (children > 0 || items > 0 || images > 0) throw new BadRequestAppException();
      await tx.menuCategory.update({
        where: { id },
        data: { deletedAt: new Date(), rowVersion: { increment: 1 } },
      });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.DELETE,
        resourceType: 'menu_category',
        resourceId: id,
        before: { code: existing.code, name: existing.name },
      });
    });
  }

  private async assertParent(
    tx: Prisma.TransactionClient,
    categoryId: string | null,
    restaurantId: string,
    parentId: string | null,
  ) {
    if (!parentId) return;
    if (parentId === categoryId) throw new BadRequestAppException();
    let current: string | null = parentId;
    const seen = new Set<string>();
    while (current) {
      if (seen.has(current) || current === categoryId) throw new BadRequestAppException();
      seen.add(current);
      const row: { parentId: string | null; restaurantId: string } | null =
        await tx.menuCategory.findFirst({
          where: { id: current, deletedAt: null },
          select: { parentId: true, restaurantId: true },
        });
      if (!row || row.restaurantId !== restaurantId) throw new BadRequestAppException();
      current = row.parentId;
    }
  }

  private async ensureRestaurantId() {
    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('restaurant:singleton'))`;
      const existing = await tx.restaurant.findFirst({
        where: { deletedAt: null },
        orderBy: { createdAt: 'asc' },
        select: { id: true },
      });
      if (existing) return existing.id;
      const restaurant = await tx.restaurant.create({
        data: {
          code: 'main',
          name: 'Restaurant',
          legalName: 'Restaurant',
          setting: { create: {} },
        },
        select: { id: true },
      });
      return restaurant.id;
    });
  }
}

function rethrowConflict(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    throw new ConflictAppException();
  }
  throw error;
}
