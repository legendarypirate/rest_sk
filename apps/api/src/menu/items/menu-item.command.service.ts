import { Injectable } from '@nestjs/common';
import {
  AuditAction,
  AvailabilityStatus,
  FoodType,
  MediaUploadStatus,
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

import type {
  MapMenuCategoryImagesDto,
  MapMenuItemImagesDto,
  UpsertMenuCategoryImageDto,
  UpsertMenuItemDto,
  UpsertMenuItemImageDto,
} from './dto/menu-item.dto';
import { MenuItemQueryService } from './menu-item.query.service';

@Injectable()
export class MenuItemCommandService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queries: MenuItemQueryService,
    private readonly audit: AuditCommandService,
  ) {}

  async createItem(actor: AuthenticatedUser, input: UpsertMenuItemDto, context: AuthRequestContext) {
    const id = await this.prisma
      .$transaction(async (tx) => {
        await this.assertCategory(tx, input.categoryId);
        const row = await tx.menuItem.create({
          data: {
            categoryId: input.categoryId,
            sku: input.sku,
            name: input.name,
            description: input.description,
            foodType: input.foodType ?? FoodType.ORDERED,
            currency: input.currency ?? 'MNT',
            price: input.price,
            sortOrder: input.sortOrder ?? 0,
            status: input.status ?? RecordStatus.DRAFT,
            availability: input.availability ?? AvailabilityStatus.AVAILABLE,
          },
        });
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.CREATE,
          resourceType: 'menu_item',
          resourceId: row.id,
          after: { sku: row.sku, name: row.name, categoryId: row.categoryId },
        });
        return row.id;
      })
      .catch(rethrowConflict);
    return this.queries.getItem(id);
  }

  async updateItem(
    actor: AuthenticatedUser,
    id: string,
    input: UpsertMenuItemDto,
    context: AuthRequestContext,
  ) {
    await this.prisma
      .$transaction(async (tx) => {
        const existing = await tx.menuItem.findFirst({ where: { id, deletedAt: null } });
        if (!existing) throw new NotFoundAppException();
        await this.assertCategory(tx, input.categoryId);
        await tx.menuItem.update({
          where: { id },
          data: {
            categoryId: input.categoryId,
            sku: input.sku,
            name: input.name,
            description: input.description,
            foodType: input.foodType ?? existing.foodType,
            currency: input.currency ?? existing.currency,
            price: input.price,
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
          resourceType: 'menu_item',
          resourceId: id,
          before: { sku: existing.sku, name: existing.name },
          after: { sku: input.sku, name: input.name, categoryId: input.categoryId },
        });
      })
      .catch(rethrowConflict);
    return this.queries.getItem(id);
  }

  async removeItem(actor: AuthenticatedUser, id: string, context: AuthRequestContext) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.menuItem.findFirst({ where: { id, deletedAt: null } });
      if (!existing) throw new NotFoundAppException();
      const images = await tx.menuItemImage.count({ where: { menuItemId: id } });
      if (images > 0) {
        throw new BadRequestAppException();
      }
      await tx.menuItem.update({
        where: { id },
        data: { deletedAt: new Date(), rowVersion: { increment: 1 } },
      });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.DELETE,
        resourceType: 'menu_item',
        resourceId: id,
        before: { sku: existing.sku, name: existing.name },
      });
    });
  }

  async createCategoryImage(
    actor: AuthenticatedUser,
    input: UpsertMenuCategoryImageDto,
    context: AuthRequestContext,
  ) {
    const id = await this.prisma
      .$transaction(async (tx) => {
        await this.assertCategory(tx, input.menuCategoryId);
        await this.assertStoredMedia(tx, input.mediaAssetId);
        const row = await tx.menuCategoryImage.create({
          data: {
            menuCategoryId: input.menuCategoryId,
            mediaAssetId: input.mediaAssetId,
            sortOrder: input.sortOrder ?? 0,
            isPrimary: input.isPrimary ?? false,
            altText: input.altText,
          },
        });
        if (row.isPrimary) await this.clearPrimaryCategoryImages(tx, row.menuCategoryId, row.id);
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.CREATE,
          resourceType: 'menu_category_image',
          resourceId: row.id,
          after: { menuCategoryId: row.menuCategoryId, mediaAssetId: row.mediaAssetId },
        });
        return row.id;
      })
      .catch(rethrowConflict);
    return this.queries.getCategoryImage(id);
  }

  async mapCategoryImages(
    actor: AuthenticatedUser,
    input: MapMenuCategoryImagesDto,
    context: AuthRequestContext,
  ) {
    const ids = [...new Set(input.mediaAssetIds)];
    const created = await this.prisma
      .$transaction(async (tx) => {
        await this.assertCategory(tx, input.menuCategoryId);
        const existingCount = await tx.menuCategoryImage.count({
          where: { menuCategoryId: input.menuCategoryId },
        });
        const linked: string[] = [];
        for (const [index, mediaAssetId] of ids.entries()) {
          await this.assertStoredMedia(tx, mediaAssetId);
          const already = await tx.menuCategoryImage.findFirst({
            where: { menuCategoryId: input.menuCategoryId, mediaAssetId },
            select: { id: true },
          });
          if (already) {
            linked.push(already.id);
            continue;
          }
          const isPrimary = Boolean(input.firstIsPrimary) && existingCount === 0 && index === 0;
          const row = await tx.menuCategoryImage.create({
            data: {
              menuCategoryId: input.menuCategoryId,
              mediaAssetId,
              sortOrder: (input.sortOrder ?? 0) + index,
              isPrimary,
              altText: input.altText,
            },
          });
          if (row.isPrimary) await this.clearPrimaryCategoryImages(tx, row.menuCategoryId, row.id);
          await this.audit.record(tx, {
            actor,
            context,
            action: AuditAction.CREATE,
            resourceType: 'menu_category_image',
            resourceId: row.id,
            after: { menuCategoryId: row.menuCategoryId, mediaAssetId: row.mediaAssetId },
          });
          linked.push(row.id);
        }
        return linked;
      })
      .catch(rethrowConflict);
    return Promise.all(created.map((id) => this.queries.getCategoryImage(id)));
  }

  async updateCategoryImage(
    actor: AuthenticatedUser,
    id: string,
    input: UpsertMenuCategoryImageDto,
    context: AuthRequestContext,
  ) {
    await this.prisma
      .$transaction(async (tx) => {
        const existing = await tx.menuCategoryImage.findFirst({ where: { id } });
        if (!existing) throw new NotFoundAppException();
        await this.assertCategory(tx, input.menuCategoryId);
        await this.assertStoredMedia(tx, input.mediaAssetId);
        const isPrimary = input.isPrimary ?? existing.isPrimary;
        await tx.menuCategoryImage.update({
          where: { id },
          data: {
            menuCategoryId: input.menuCategoryId,
            mediaAssetId: input.mediaAssetId,
            sortOrder: input.sortOrder ?? existing.sortOrder,
            isPrimary,
            altText: input.altText,
          },
        });
        if (isPrimary) await this.clearPrimaryCategoryImages(tx, input.menuCategoryId, id);
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.UPDATE,
          resourceType: 'menu_category_image',
          resourceId: id,
          after: { menuCategoryId: input.menuCategoryId, mediaAssetId: input.mediaAssetId },
        });
      })
      .catch(rethrowConflict);
    return this.queries.getCategoryImage(id);
  }

  async removeCategoryImage(actor: AuthenticatedUser, id: string, context: AuthRequestContext) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.menuCategoryImage.findFirst({ where: { id } });
      if (!existing) throw new NotFoundAppException();
      await tx.menuCategoryImage.delete({ where: { id } });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.DELETE,
        resourceType: 'menu_category_image',
        resourceId: id,
        before: { menuCategoryId: existing.menuCategoryId, mediaAssetId: existing.mediaAssetId },
      });
    });
  }

  async createItemImage(
    actor: AuthenticatedUser,
    input: UpsertMenuItemImageDto,
    context: AuthRequestContext,
  ) {
    const id = await this.prisma
      .$transaction(async (tx) => {
        await this.assertItem(tx, input.menuItemId);
        await this.assertStoredMedia(tx, input.mediaAssetId);
        const row = await tx.menuItemImage.create({
          data: {
            menuItemId: input.menuItemId,
            mediaAssetId: input.mediaAssetId,
            sortOrder: input.sortOrder ?? 0,
            isPrimary: input.isPrimary ?? false,
            altText: input.altText,
          },
        });
        if (row.isPrimary) await this.clearPrimaryItemImages(tx, row.menuItemId, row.id);
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.CREATE,
          resourceType: 'menu_item_image',
          resourceId: row.id,
          after: { menuItemId: row.menuItemId, mediaAssetId: row.mediaAssetId },
        });
        return row.id;
      })
      .catch(rethrowConflict);
    return this.queries.getItemImage(id);
  }

  async mapItemImages(
    actor: AuthenticatedUser,
    input: MapMenuItemImagesDto,
    context: AuthRequestContext,
  ) {
    const ids = [...new Set(input.mediaAssetIds)];
    const created = await this.prisma
      .$transaction(async (tx) => {
        await this.assertItem(tx, input.menuItemId);
        const existingCount = await tx.menuItemImage.count({ where: { menuItemId: input.menuItemId } });
        const linked: string[] = [];
        for (const [index, mediaAssetId] of ids.entries()) {
          await this.assertStoredMedia(tx, mediaAssetId);
          const already = await tx.menuItemImage.findFirst({
            where: { menuItemId: input.menuItemId, mediaAssetId },
            select: { id: true },
          });
          if (already) {
            linked.push(already.id);
            continue;
          }
          const isPrimary = Boolean(input.firstIsPrimary) && existingCount === 0 && index === 0;
          const row = await tx.menuItemImage.create({
            data: {
              menuItemId: input.menuItemId,
              mediaAssetId,
              sortOrder: (input.sortOrder ?? 0) + index,
              isPrimary,
              altText: input.altText,
            },
          });
          if (row.isPrimary) await this.clearPrimaryItemImages(tx, row.menuItemId, row.id);
          await this.audit.record(tx, {
            actor,
            context,
            action: AuditAction.CREATE,
            resourceType: 'menu_item_image',
            resourceId: row.id,
            after: { menuItemId: row.menuItemId, mediaAssetId: row.mediaAssetId },
          });
          linked.push(row.id);
        }
        return linked;
      })
      .catch(rethrowConflict);
    return Promise.all(created.map((id) => this.queries.getItemImage(id)));
  }

  async updateItemImage(
    actor: AuthenticatedUser,
    id: string,
    input: UpsertMenuItemImageDto,
    context: AuthRequestContext,
  ) {
    await this.prisma
      .$transaction(async (tx) => {
        const existing = await tx.menuItemImage.findFirst({ where: { id } });
        if (!existing) throw new NotFoundAppException();
        await this.assertItem(tx, input.menuItemId);
        await this.assertStoredMedia(tx, input.mediaAssetId);
        const isPrimary = input.isPrimary ?? existing.isPrimary;
        await tx.menuItemImage.update({
          where: { id },
          data: {
            menuItemId: input.menuItemId,
            mediaAssetId: input.mediaAssetId,
            sortOrder: input.sortOrder ?? existing.sortOrder,
            isPrimary,
            altText: input.altText,
          },
        });
        if (isPrimary) await this.clearPrimaryItemImages(tx, input.menuItemId, id);
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.UPDATE,
          resourceType: 'menu_item_image',
          resourceId: id,
          after: { menuItemId: input.menuItemId, mediaAssetId: input.mediaAssetId },
        });
      })
      .catch(rethrowConflict);
    return this.queries.getItemImage(id);
  }

  async removeItemImage(actor: AuthenticatedUser, id: string, context: AuthRequestContext) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.menuItemImage.findFirst({ where: { id } });
      if (!existing) throw new NotFoundAppException();
      await tx.menuItemImage.delete({ where: { id } });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.DELETE,
        resourceType: 'menu_item_image',
        resourceId: id,
        before: { menuItemId: existing.menuItemId, mediaAssetId: existing.mediaAssetId },
      });
    });
  }

  private async assertCategory(tx: Prisma.TransactionClient, id: string) {
    const row = await tx.menuCategory.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!row) throw new NotFoundAppException();
  }

  private async assertItem(tx: Prisma.TransactionClient, id: string) {
    const row = await tx.menuItem.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!row) throw new NotFoundAppException();
  }

  private async assertStoredMedia(tx: Prisma.TransactionClient, id: string) {
    const row = await tx.mediaAsset.findFirst({
      where: { id, deletedAt: null, status: MediaUploadStatus.STORED },
      select: { id: true },
    });
    if (!row) throw new BadRequestAppException();
  }

  private async clearPrimaryCategoryImages(
    tx: Prisma.TransactionClient,
    menuCategoryId: string,
    exceptId: string,
  ) {
    await tx.menuCategoryImage.updateMany({
      where: { menuCategoryId, isPrimary: true, id: { not: exceptId } },
      data: { isPrimary: false },
    });
  }

  private async clearPrimaryItemImages(tx: Prisma.TransactionClient, menuItemId: string, exceptId: string) {
    await tx.menuItemImage.updateMany({
      where: { menuItemId, isPrimary: true, id: { not: exceptId } },
      data: { isPrimary: false },
    });
  }
}

function rethrowConflict(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    throw new ConflictAppException();
  }
  throw error;
}
