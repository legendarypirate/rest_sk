import { Injectable } from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';
import type { IntegrationDetail, Paginated } from '@packages/types';

import { NotFoundAppException } from '@/common/exceptions';
import { paginated, resolvePagination, resolveSort } from '@/common/utils/pagination';
import { PrismaService } from '@/prisma/prisma.service';

import type { ListIntegrationsQueryDto } from './dto/integration.dto';
import { toIntegration, type IntegrationRow } from './integration.mapper';

@Injectable()
export class IntegrationsQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListIntegrationsQueryDto): Promise<Paginated<IntegrationDetail>> {
    const { page, limit, skip, take } = resolvePagination(query.page, query.limit);
    const { sortDirection } = resolveSort(
      'createdAt',
      ['createdAt'] as const,
      'createdAt',
      query.sortDirection,
    );
    const search = query.search?.trim();
    const where: Prisma.IntegrationWhereInput = {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { clientId: { contains: search, mode: 'insensitive' } },
              { baseUrl: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.integration.findMany({
        where,
        include: { apis: { orderBy: { path: 'asc' } } },
        orderBy: { createdAt: sortDirection },
        skip,
        take,
      }),
      this.prisma.integration.count({ where }),
    ]);

    return paginated(
      (rows as IntegrationRow[]).map(toIntegration),
      total,
      page,
      limit,
    );
  }

  async getById(id: string) {
    const row = await this.prisma.integration.findFirst({
      where: { id },
      include: { apis: { orderBy: { path: 'asc' } } },
    });

    if (!row || row.deletedAt) {
      throw new NotFoundAppException();
    }

    return toIntegration(row);
  }
}
