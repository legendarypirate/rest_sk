import { Injectable } from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';
import type { KitchenItem, KitchenStationItem } from '@packages/types';

import { NotFoundAppException } from '@/common/exceptions';
import { toIso } from '@/common/utils/date';
import { paginated, resolvePagination } from '@/common/utils/pagination';
import { PrismaService } from '@/prisma/prisma.service';

import type { ListKitchenStationsQueryDto, ListKitchensQueryDto } from './dto/kitchen.dto';

function toKitchen(row: {
  id: string;
  publicId: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  _count: { stations: number };
}): KitchenItem {
  return {
    id: row.id,
    publicId: row.publicId,
    code: row.code,
    name: row.name,
    isActive: row.isActive,
    stationCount: row._count.stations,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    deletedAt: toIso(row.deletedAt),
  };
}

function toStation(row: {
  id: string;
  kitchenId: string;
  code: string;
  name: string;
  stationType: KitchenStationItem['stationType'];
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  kitchen: { name: string };
}): KitchenStationItem {
  return {
    id: row.id,
    kitchenId: row.kitchenId,
    kitchenName: row.kitchen.name,
    code: row.code,
    name: row.name,
    stationType: row.stationType,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    deletedAt: toIso(row.deletedAt),
  };
}

const kitchenInclude = { _count: { select: { stations: { where: { deletedAt: null } } } } } as const;

@Injectable()
export class KitchenQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async listKitchens(query: ListKitchensQueryDto) {
    const { page, limit, skip, take } = resolvePagination(query.page, query.limit);
    const search = query.search?.trim();
    const where: Prisma.KitchenWhereInput = {
      deletedAt: null,
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
      this.prisma.kitchen.findMany({
        where,
        include: kitchenInclude,
        orderBy: { name: 'asc' },
        skip,
        take,
      }),
      this.prisma.kitchen.count({ where }),
    ]);
    return paginated(rows.map(toKitchen), total, page, limit);
  }

  async getKitchen(id: string) {
    const row = await this.prisma.kitchen.findFirst({
      where: { id, deletedAt: null },
      include: kitchenInclude,
    });
    if (!row) throw new NotFoundAppException();
    return toKitchen(row);
  }

  async listStations(query: ListKitchenStationsQueryDto) {
    const { page, limit, skip, take } = resolvePagination(query.page, query.limit);
    const search = query.search?.trim();
    const where: Prisma.KitchenStationWhereInput = {
      deletedAt: null,
      kitchen: { deletedAt: null },
      ...(query.kitchenId ? { kitchenId: query.kitchenId } : {}),
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
      this.prisma.kitchenStation.findMany({
        where,
        include: { kitchen: { select: { name: true } } },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        skip,
        take,
      }),
      this.prisma.kitchenStation.count({ where }),
    ]);
    return paginated(rows.map(toStation), total, page, limit);
  }

  async getStation(id: string) {
    const row = await this.prisma.kitchenStation.findFirst({
      where: { id, deletedAt: null, kitchen: { deletedAt: null } },
      include: { kitchen: { select: { name: true } } },
    });
    if (!row) throw new NotFoundAppException();
    return toStation(row);
  }
}
