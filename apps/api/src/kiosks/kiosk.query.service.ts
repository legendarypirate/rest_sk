import { Injectable } from '@nestjs/common';
import {
  AvailabilityStatus,
  FoodType,
  Prisma,
  RecordStatus,
} from '@generated/prisma/client';
import type {
  DeviceEventItem,
  KioskCatalog,
  KioskDeviceItem,
  KioskSessionItem,
} from '@packages/types';

import { NotFoundAppException } from '@/common/exceptions';
import { toIso } from '@/common/utils/date';
import { paginated, resolvePagination } from '@/common/utils/pagination';
import { PrismaService } from '@/prisma/prisma.service';

import type { ListDeviceEventsQueryDto, ListKioskDevicesQueryDto, ListKioskSessionsQueryDto } from './dto/kiosk.dto';

function toDevice(row: {
  id: string;
  publicId: string;
  code: string;
  name: string;
  status: KioskDeviceItem['status'];
  appVersion: string | null;
  lastSeenAt: Date | null;
  ipAddress: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}): KioskDeviceItem {
  return {
    id: row.id,
    publicId: row.publicId,
    code: row.code,
    name: row.name,
    status: row.status,
    appVersion: row.appVersion,
    lastSeenAt: toIso(row.lastSeenAt),
    ipAddress: row.ipAddress,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    deletedAt: toIso(row.deletedAt),
  };
}

function toSession(row: {
  id: string;
  deviceId: string;
  employeeId: string | null;
  status: KioskSessionItem['status'];
  startedAt: Date;
  endedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  device: { name: string };
  employee: { firstName: string; lastName: string } | null;
}): KioskSessionItem {
  return {
    id: row.id,
    deviceId: row.deviceId,
    deviceName: row.device.name,
    employeeId: row.employeeId,
    employeeName: row.employee ? `${row.employee.lastName} ${row.employee.firstName}`.trim() : null,
    status: row.status,
    startedAt: row.startedAt.toISOString(),
    endedAt: toIso(row.endedAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toEvent(row: {
  id: string;
  deviceId: string;
  sessionId: string | null;
  type: DeviceEventItem['type'];
  message: string | null;
  occurredAt: Date;
  createdAt: Date;
  device: { name: string };
}): DeviceEventItem {
  return {
    id: row.id,
    deviceId: row.deviceId,
    deviceName: row.device.name,
    sessionId: row.sessionId,
    type: row.type,
    message: row.message,
    occurredAt: row.occurredAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

@Injectable()
export class KioskQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async listCatalog(): Promise<KioskCatalog> {
    const [categories, items] = await this.prisma.$transaction([
      this.prisma.menuCategory.findMany({
        where: {
          deletedAt: null,
          status: RecordStatus.ACTIVE,
          availability: AvailabilityStatus.AVAILABLE,
        },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true },
      }),
      this.prisma.menuItem.findMany({
        where: {
          deletedAt: null,
          status: RecordStatus.ACTIVE,
          availability: AvailabilityStatus.AVAILABLE,
          foodType: FoodType.ORDERED,
          category: {
            deletedAt: null,
            status: RecordStatus.ACTIVE,
            availability: AvailabilityStatus.AVAILABLE,
          },
        },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: {
          category: { select: { name: true } },
          images: {
            orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
            take: 1,
            include: {
              mediaAsset: { select: { storageUrl: true, thumbnailUrl: true } },
            },
          },
        },
      }),
    ]);
    const used = new Set(items.map((item) => item.category.name));
    return {
      categories: categories
        .map((category) => category.name)
        .filter((name) => used.has(name)),
      products: items.map((item) => {
        const image = item.images[0]?.mediaAsset;
        return {
          id: item.id,
          name: item.name,
          description: item.description ?? '',
          price: Number(item.price),
          category: item.category.name,
          imageUrl: image?.thumbnailUrl || image?.storageUrl || null,
          featured: item.sortOrder <= 2,
        };
      }),
    };
  }

  async listDevices(query: ListKioskDevicesQueryDto) {
    const { page, limit, skip, take } = resolvePagination(query.page, query.limit);
    const search = query.search?.trim();
    const where: Prisma.KioskDeviceWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
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
      this.prisma.kioskDevice.findMany({ where, orderBy: { name: 'asc' }, skip, take }),
      this.prisma.kioskDevice.count({ where }),
    ]);
    return paginated(rows.map(toDevice), total, page, limit);
  }

  async getDevice(id: string) {
    const row = await this.prisma.kioskDevice.findFirst({ where: { id, deletedAt: null } });
    if (!row) throw new NotFoundAppException();
    return toDevice(row);
  }

  async listSessions(query: ListKioskSessionsQueryDto) {
    const { page, limit, skip, take } = resolvePagination(query.page, query.limit);
    const where: Prisma.KioskSessionWhereInput = {
      device: { deletedAt: null },
      ...(query.deviceId ? { deviceId: query.deviceId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.kioskSession.findMany({
        where,
        include: {
          device: { select: { name: true } },
          employee: { select: { firstName: true, lastName: true } },
        },
        orderBy: { startedAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.kioskSession.count({ where }),
    ]);
    return paginated(rows.map(toSession), total, page, limit);
  }

  async getSession(id: string) {
    const row = await this.prisma.kioskSession.findFirst({
      where: { id, device: { deletedAt: null } },
      include: {
        device: { select: { name: true } },
        employee: { select: { firstName: true, lastName: true } },
      },
    });
    if (!row) throw new NotFoundAppException();
    return toSession(row);
  }

  async listEvents(query: ListDeviceEventsQueryDto) {
    const { page, limit, skip, take } = resolvePagination(query.page, query.limit);
    const where: Prisma.DeviceEventWhereInput = {
      device: { deletedAt: null },
      ...(query.deviceId ? { deviceId: query.deviceId } : {}),
      ...(query.sessionId ? { sessionId: query.sessionId } : {}),
      ...(query.type ? { type: query.type } : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.deviceEvent.findMany({
        where,
        include: { device: { select: { name: true } } },
        orderBy: { occurredAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.deviceEvent.count({ where }),
    ]);
    return paginated(rows.map(toEvent), total, page, limit);
  }

  async getEvent(id: string) {
    const row = await this.prisma.deviceEvent.findFirst({
      where: { id, device: { deletedAt: null } },
      include: { device: { select: { name: true } } },
    });
    if (!row) throw new NotFoundAppException();
    return toEvent(row);
  }
}
