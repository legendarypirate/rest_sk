import { Injectable } from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';
import type {
  Paginated,
  ResourceDetail,
  ResourceListItem,
  ResourceMenuGroup,
} from '@packages/types';

import { NotFoundAppException } from '@/common/exceptions';
import {
  paginated,
  resolvePagination,
  resolveSort,
} from '@/common/utils/pagination';
import { PrismaService } from '@/prisma/prisma.service';
import type { ListResourcesQueryDto } from './dto/resources.dto';
import {
  resourceDetailInclude,
  resourceListInclude,
  resourceMenuInclude,
  toResourceDetail,
  toResourceListItem,
  toResourceMenu,
  type ResourceDetailRow,
  type ResourceListRow,
  type ResourceMenuRow,
} from './resources.mapper';

const RESOURCE_SORT = {
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  name: 'name',
  slug: 'slug',
  sortOrder: 'sortOrder',
  groupSortOrder: 'groupSortOrder',
} as const;

@Injectable()
export class ResourcesQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    query: ListResourcesQueryDto,
  ): Promise<Paginated<ResourceListItem>> {
    const { page, limit, skip, take } = resolvePagination(
      query.page,
      query.limit,
    );
    const { sortBy, sortDirection } = resolveSort(
      query.sortBy,
      [
        'createdAt',
        'updatedAt',
        'name',
        'slug',
        'sortOrder',
        'groupSortOrder',
      ] as const,
      'groupSortOrder',
      query.sortDirection,
    );
    const search = query.search?.trim();
    const where: Prisma.ResourceWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.scope ? { scope: query.scope } : {}),
      ...(query.isSystem === undefined ? {} : { isSystem: query.isSystem }),
      ...(query.isMenu === undefined ? {} : { isMenu: query.isMenu }),
      ...(search
        ? {
            OR: [
              { slug: { contains: search, mode: 'insensitive' } },
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { path: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.resource.findMany({
        where,
        include: resourceListInclude,
        orderBy: { [RESOURCE_SORT[sortBy]]: sortDirection },
        skip,
        take,
      }),
      this.prisma.resource.count({ where }),
    ]);

    return paginated(
      (rows as ResourceListRow[]).map(toResourceListItem),
      total,
      page,
      limit,
    );
  }

  async getById(id: string): Promise<ResourceDetail> {
    const row = await this.prisma.resource.findFirst({
      where: { id },
      include: resourceDetailInclude,
    });

    if (!row) {
      throw new NotFoundAppException();
    }

    return toResourceDetail(row as ResourceDetailRow);
  }

  async menu(granted: readonly string[]): Promise<ResourceMenuGroup[]> {
    const rows = await this.prisma.resource.findMany({
      where: { deletedAt: null, isMenu: true, path: { not: null } },
      include: resourceMenuInclude,
      orderBy: [
        { groupSortOrder: 'asc' },
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    return toResourceMenu(rows as ResourceMenuRow[], granted);
  }
}
