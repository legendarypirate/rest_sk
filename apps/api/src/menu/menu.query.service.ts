import { Injectable } from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';

import { NotFoundAppException } from '@/common/exceptions';
import { paginated, resolvePagination } from '@/common/utils/pagination';
import { PrismaService } from '@/prisma/prisma.service';

import type { ListMenuCategoriesQueryDto } from './dto/menu.dto';
import { toCategory } from './menu.mapper';

const categoryInclude = {
  restaurant: { select: { name: true } },
  parent: { select: { name: true } },
} as const;

@Injectable()
export class MenuQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async listCategories(query: ListMenuCategoriesQueryDto) {
    const { page, limit, skip, take } = resolvePagination(query.page, query.limit);
    const search = query.search?.trim();
    const where: Prisma.MenuCategoryWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.availability ? { availability: query.availability } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { code: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.menuCategory.findMany({
        where,
        include: categoryInclude,
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        skip,
        take,
      }),
      this.prisma.menuCategory.count({ where }),
    ]);
    return paginated(rows.map(toCategory), total, page, limit);
  }

  async getCategory(id: string) {
    const row = await this.prisma.menuCategory.findFirst({
      where: { id, deletedAt: null },
      include: categoryInclude,
    });
    if (!row) throw new NotFoundAppException();
    return toCategory(row);
  }
}
