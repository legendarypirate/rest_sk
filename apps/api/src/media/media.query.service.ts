import { Injectable } from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';
import type { MediaAssetDetail, Paginated } from '@packages/types';

import { NotFoundAppException } from '@/common/exceptions';
import {
  paginated,
  resolvePagination,
  resolveSort,
} from '@/common/utils/pagination';
import { PrismaService } from '@/prisma/prisma.service';

import type { ListMediaQueryDto } from './dto/media.dto';
import { toMediaAsset } from './media.mapper';

const MEDIA_SORT = {
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  originalFilename: 'originalFilename',
} as const;

@Injectable()
export class MediaQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListMediaQueryDto): Promise<Paginated<MediaAssetDetail>> {
    const { page, limit, skip, take } = resolvePagination(
      query.page,
      query.limit,
    );
    const { sortBy, sortDirection } = resolveSort(
      query.sortBy,
      ['createdAt', 'updatedAt', 'originalFilename'] as const,
      'createdAt',
      query.sortDirection,
    );
    const search = query.search?.trim();
    const where: Prisma.MediaAssetWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.status ? { status: query.status } : {}),
      ...(search
        ? {
            OR: [
              { originalFilename: { contains: search, mode: 'insensitive' } },
              { altText: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.mediaAsset.findMany({
        where,
        orderBy: { [MEDIA_SORT[sortBy]]: sortDirection },
        skip,
        take,
      }),
      this.prisma.mediaAsset.count({ where }),
    ]);

    return paginated(rows.map(toMediaAsset), total, page, limit);
  }

  async getById(id: string): Promise<MediaAssetDetail> {
    const row = await this.prisma.mediaAsset.findFirst({ where: { id } });

    if (!row) {
      throw new NotFoundAppException();
    }

    return toMediaAsset(row);
  }
}
