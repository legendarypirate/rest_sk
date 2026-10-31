import { Injectable } from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';
import type { Paginated } from '@packages/types';

import { NotFoundAppException } from '@/common/exceptions';
import { paginated, resolvePagination } from '@/common/utils/pagination';
import { PrismaService } from '@/prisma/prisma.service';

import type { ListRestaurantsQueryDto } from './dto/restaurant.dto';
import { toRestaurantDetail, toRestaurantList } from './restaurant.mapper';

const detailInclude = { setting: true } as const;

@Injectable()
export class RestaurantQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListRestaurantsQueryDto): Promise<Paginated<ReturnType<typeof toRestaurantList>>> {
    const { page, limit, skip, take } = resolvePagination(query.page, query.limit);
    const search = query.search?.trim();
    const where: Prisma.RestaurantWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { legalName: { contains: search, mode: 'insensitive' } },
              { code: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.restaurant.findMany({
        where,
        include: detailInclude,
        orderBy: { createdAt: 'asc' },
        skip,
        take,
      }),
      this.prisma.restaurant.count({ where }),
    ]);
    return paginated(rows.map(toRestaurantList), total, page, limit);
  }

  async getById(id: string) {
    const row = await this.prisma.restaurant.findFirst({
      where: { id, deletedAt: null },
      include: detailInclude,
    });
    if (!row?.setting) throw new NotFoundAppException();
    return toRestaurantDetail({ ...row, setting: row.setting });
  }
}
