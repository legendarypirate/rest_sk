import { Injectable, OnModuleInit } from '@nestjs/common';
import { AuditAction, MediaUploadStatus } from '@generated/prisma/client';
import { ConfigService } from '@nestjs/config';

import { AuditCommandService } from '@/audit';
import {
  BadGatewayAppException,
  BadRequestAppException,
  ConflictAppException,
  ForbiddenAppException,
  NotFoundAppException,
} from '@/common/exceptions';
import type { AuthRequestContext } from '@/iam/auth-request.context';
import type { AuthenticatedUser } from '@/iam/auth.types';
import { PrismaService } from '@/prisma/prisma.service';

import type { UpdateMediaDto } from './dto/media.dto';
import { MediaQueryService } from './media.query.service';
import {
  cloudinaryConfigured,
  configureCloudinary,
  destroyStoredImage,
  isAllowedImage,
  storeImage,
  type MediaUploadFile,
} from './media.storage';

@Injectable()
export class MediaCommandService implements OnModuleInit {
  private readonly folder: string;

  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly queries: MediaQueryService,
    private readonly audit: AuditCommandService,
  ) {
    configureCloudinary({
      cloudName: config.get<string>('cloudinary.cloudName') ?? '',
      apiKey: config.get<string>('cloudinary.apiKey') ?? '',
      apiSecret: config.get<string>('cloudinary.apiSecret') ?? '',
    });
    this.folder = `${config.get<string>('cloudinary.folder') ?? 'restaurant'}/media`;
  }

  async onModuleInit() {
    await this.prisma.mediaAsset.updateMany({
      where: { status: MediaUploadStatus.PENDING, deletedAt: null },
      data: { status: MediaUploadStatus.STORED },
    });
  }

  async upload(
    actor: AuthenticatedUser,
    file: MediaUploadFile | undefined,
    altText: string | undefined,
    context: AuthRequestContext,
  ) {
    if (!file || !isAllowedImage(file)) {
      throw new BadRequestAppException();
    }

    if (!cloudinaryConfigured()) {
      throw new BadGatewayAppException();
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestAppException();
    }

    const restaurantId = await this.ensureRestaurantId();
    const stored = await storeImage(file, this.folder).catch(() => {
      throw new BadGatewayAppException();
    });

    try {
      const id = await this.prisma.$transaction(async (tx) => {
        const asset = await tx.mediaAsset.create({
          data: {
            restaurantId,
            uploadedByUserId: actor.id,
            originalFilename: sanitizeFilename(file.originalname),
            mimeType: stored.mimeType,
            byteSize: stored.byteSize,
            storageKey: stored.storageKey,
            storageUrl: stored.storageUrl,
            thumbnailUrl: stored.thumbnailUrl,
            width: stored.width,
            height: stored.height,
            altText: altText ?? null,
            checksum: stored.checksum,
            status: MediaUploadStatus.STORED,
          },
        });

        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.CREATE,
          resourceType: 'media_asset',
          resourceId: asset.id,
          after: {
            storageKey: asset.storageKey,
            originalFilename: asset.originalFilename,
            status: asset.status,
          },
        });

        return asset.id;
      });

      return this.queries.getById(id);
    } catch (error) {
      await destroyStoredImage(stored.storageKey).catch(() => undefined);
      throw error;
    }
  }

  async update(
    actor: AuthenticatedUser,
    id: string,
    input: UpdateMediaDto,
    context: AuthRequestContext,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.mediaAsset.findFirst({ where: { id } });

      if (!existing || existing.deletedAt) {
        throw new NotFoundAppException();
      }

      await tx.mediaAsset.update({
        where: { id },
        data: {
          ...(input.altText !== undefined ? { altText: input.altText } : {}),
          ...(existing.status === MediaUploadStatus.PENDING
            ? { status: MediaUploadStatus.STORED }
            : {}),
          rowVersion: { increment: 1 },
        },
      });

      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.UPDATE,
        resourceType: 'media_asset',
        resourceId: id,
        before: { altText: existing.altText },
        after: {
          altText: input.altText !== undefined ? input.altText : existing.altText,
        },
      });
    });

    return this.queries.getById(id);
  }

  async remove(
    actor: AuthenticatedUser,
    id: string,
    context: AuthRequestContext,
  ) {
    const existing = await this.prisma.mediaAsset.findFirst({
      where: { id },
      include: {
        _count: { select: { menuItemImages: true, menuCategoryImages: true } },
      },
    });

    if (!existing || existing.deletedAt) {
      throw new NotFoundAppException();
    }

    if (existing._count.menuItemImages > 0 || existing._count.menuCategoryImages > 0) {
      throw new ConflictAppException();
    }

    await destroyStoredImage(existing.storageKey).catch(() => {
      throw new BadGatewayAppException();
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.mediaAsset.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          rowVersion: { increment: 1 },
        },
      });

      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.DELETE,
        resourceType: 'media_asset',
        resourceId: id,
        before: {
          storageKey: existing.storageKey,
          originalFilename: existing.originalFilename,
        },
      });
    });
  }

  async discardDraft(actor: AuthenticatedUser, id: string) {
    const existing = await this.prisma.mediaAsset.findFirst({ where: { id } });

    if (!existing || existing.deletedAt) {
      throw new NotFoundAppException();
    }

    if (existing.status !== MediaUploadStatus.PENDING) {
      throw new ConflictAppException();
    }

    if (existing.uploadedByUserId && existing.uploadedByUserId !== actor.id) {
      throw new ForbiddenAppException();
    }

    await destroyStoredImage(existing.storageKey).catch(() => {
      throw new BadGatewayAppException();
    });

    await this.prisma.mediaAsset.delete({ where: { id } });
  }

  private async ensureRestaurantId(): Promise<string> {
    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('restaurant:singleton'))`;

      const existing = await tx.restaurant.findFirst({
        where: { deletedAt: null },
        orderBy: { createdAt: 'asc' },
        select: { id: true },
      });

      if (existing) {
        return existing.id;
      }

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

function sanitizeFilename(name: string): string {
  const trimmed = name.trim().replace(/[\\/]/g, '');
  return (trimmed || 'image').slice(0, 255);
}
