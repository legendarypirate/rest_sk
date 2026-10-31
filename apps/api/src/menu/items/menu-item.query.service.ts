import { Injectable } from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';

import { NotFoundAppException } from '@/common/exceptions';
import { paginated, resolvePagination } from '@/common/utils/pagination';
import { PrismaService } from '@/prisma/prisma.service';

import type {
  ListMenuCategoryImagesQueryDto,
  ListMenuItemImagesQueryDto,
  ListMenuItemsQueryDto,
} from './dto/menu-item.dto';
import { toCategoryImage, toItemImage, toMenuItem } from './menu-item.mapper';

const itemInclude = {
  category: { select: { name: true } },
  _count: {
    select: {
      images: true,
    },
  },
} as const;

const assetSelect = {
  mediaAsset: {
    select: {
      storageUrl: true,
      thumbnailUrl: true,
      mimeType: true,
      originalFilename: true,
    },
  },
} as const;

@Injectable()
export class MenuItemQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async listItems(query: ListMenuItemsQueryDto) {
    const { page, limit, skip, take } = resolvePagination(query.page, query.limit);
    const search = query.search?.trim();
    const where: Prisma.MenuItemWhereInput = {
      deletedAt: null,
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.availability ? { availability: query.availability } : {}),
      ...(query.foodType ? { foodType: query.foodType } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.menuItem.findMany({
        where,
        include: itemInclude,
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        skip,
        take,
      }),
      this.prisma.menuItem.count({ where }),
    ]);
    return paginated(rows.map(toMenuItem), total, page, limit);
  }

  async getItem(id: string) {
    const row = await this.prisma.menuItem.findFirst({
      where: { id, deletedAt: null },
      include: itemInclude,
    });
    if (!row) throw new NotFoundAppException();
    return toMenuItem(row);
  }

  async listCategoryImages(query: ListMenuCategoryImagesQueryDto) {
    const { page, limit, skip, take } = resolvePagination(query.page, query.limit);
    const where: Prisma.MenuCategoryImageWhereInput = {
      menuCategory: { deletedAt: null },
      mediaAsset: { deletedAt: null },
      ...(query.menuCategoryId ? { menuCategoryId: query.menuCategoryId } : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.menuCategoryImage.findMany({
        where,
        include: assetSelect,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        skip,
        take,
      }),
      this.prisma.menuCategoryImage.count({ where }),
    ]);
    return paginated(rows.map(toCategoryImage), total, page, limit);
  }

  async getCategoryImage(id: string) {
    const row = await this.prisma.menuCategoryImage.findFirst({
      where: { id, menuCategory: { deletedAt: null }, mediaAsset: { deletedAt: null } },
      include: assetSelect,
    });
    if (!row) throw new NotFoundAppException();
    return toCategoryImage(row);
  }

  async listItemImages(query: ListMenuItemImagesQueryDto) {
    const { page, limit, skip, take } = resolvePagination(query.page, query.limit);
    const where: Prisma.MenuItemImageWhereInput = {
      menuItem: { deletedAt: null },
      mediaAsset: { deletedAt: null },
      ...(query.menuItemId ? { menuItemId: query.menuItemId } : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.menuItemImage.findMany({
        where,
        include: assetSelect,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        skip,
        take,
      }),
      this.prisma.menuItemImage.count({ where }),
    ]);
    return paginated(rows.map(toItemImage), total, page, limit);
  }

  async getItemImage(id: string) {
    const row = await this.prisma.menuItemImage.findFirst({
      where: { id, menuItem: { deletedAt: null }, mediaAsset: { deletedAt: null } },
      include: assetSelect,
    });
    if (!row) throw new NotFoundAppException();
    return toItemImage(row);
  }
}
