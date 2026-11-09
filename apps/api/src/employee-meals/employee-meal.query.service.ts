import { Injectable } from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';
import type { Paginated } from '@packages/types';

import { NotFoundAppException } from '@/common/exceptions';
import {
  buildMealOrderEmployeeIndex,
  employeeNameFromParts,
  readMetadataEmployeeName,
  resolveMealOrderEmployee,
} from './employee-meal-order-employee';
import { paginated, resolvePagination } from '@/common/utils/pagination';
import { PrismaService } from '@/prisma/prisma.service';

import type {
  ListEmployeeMealDaysQueryDto,
  ListEmployeeMealOrdersQueryDto,
  ListEmployeeMealTypesQueryDto,
  ListEmployeeOrderSchedulesQueryDto,
} from './dto/employee-meal.dto';
import {
  parseDateOnly,
  toMealDay,
  toMealOrder,
  toMealType,
  toSchedule,
  todayDateOnly,
} from './employee-meal.mapper';

const mealDayInclude = {
  mealType: true,
  orders: { select: { status: true } },
  menuItem: {
    include: {
      category: { select: { name: true } },
      images: {
        include: {
          mediaAsset: {
            select: { storageUrl: true, thumbnailUrl: true },
          },
        },
      },
    },
  },
} satisfies Prisma.EmployeeMealDayInclude;

function mealDayDateWhere(
  query: ListEmployeeMealDaysQueryDto,
): Prisma.EmployeeMealDayWhereInput {
  if (query.serviceDate) {
    return { serviceDate: parseDateOnly(query.serviceDate) };
  }
  if (query.from || query.to) {
    return {
      serviceDate: {
        ...(query.from ? { gte: parseDateOnly(query.from) } : {}),
        ...(query.to ? { lte: parseDateOnly(query.to) } : {}),
      },
    };
  }
  return { serviceDate: parseDateOnly(todayDateOnly()) };
}

@Injectable()
export class EmployeeMealQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async listTypes(query: ListEmployeeMealTypesQueryDto) {
    const { page, limit, skip, take } = resolvePagination(
      query.page,
      query.limit,
    );
    const search = query.search?.trim();
    const where: Prisma.EmployeeMealTypeWhereInput = {
      deletedAt: null,
      ...(query.isEnabled === undefined ? {} : { isEnabled: query.isEnabled }),
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
      this.prisma.employeeMealType.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        skip,
        take,
      }),
      this.prisma.employeeMealType.count({ where }),
    ]);
    return paginated(rows.map(toMealType), total, page, limit);
  }

  async getType(id: string) {
    const row = await this.prisma.employeeMealType.findFirst({ where: { id } });
    if (!row || row.deletedAt) {
      throw new NotFoundAppException();
    }
    return toMealType(row);
  }

  async listSchedules(query: ListEmployeeOrderSchedulesQueryDto) {
    const { page, limit, skip, take } = resolvePagination(
      query.page,
      query.limit,
    );
    const where: Prisma.EmployeeOrderScheduleWhereInput = {
      deletedAt: null,
      ...(query.mealTypeId ? { mealTypeId: query.mealTypeId } : {}),
      ...(query.isEnabled === undefined ? {} : { isEnabled: query.isEnabled }),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.employeeOrderSchedule.findMany({
        where,
        include: { mealType: true },
        orderBy: { opensAt: 'asc' },
        skip,
        take,
      }),
      this.prisma.employeeOrderSchedule.count({ where }),
    ]);
    return paginated(rows.map(toSchedule), total, page, limit);
  }

  async getSchedule(id: string) {
    const row = await this.prisma.employeeOrderSchedule.findFirst({
      where: { id },
      include: { mealType: true },
    });
    if (!row || row.deletedAt) {
      throw new NotFoundAppException();
    }
    return toSchedule(row);
  }

  async listDays(query: ListEmployeeMealDaysQueryDto) {
    const { page, limit, skip, take } = resolvePagination(
      query.page,
      query.limit,
    );
    const where: Prisma.EmployeeMealDayWhereInput = {
      deletedAt: null,
      ...(query.mealTypeId ? { mealTypeId: query.mealTypeId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...mealDayDateWhere(query),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.employeeMealDay.findMany({
        where,
        include: mealDayInclude,
        orderBy: [{ serviceDate: 'desc' }, { mealType: { sortOrder: 'asc' } }],
        skip,
        take,
      }),
      this.prisma.employeeMealDay.count({ where }),
    ]);
    return paginated(
      rows.map((row) => toMealDay(row)),
      total,
      page,
      limit,
    );
  }

  async getDay(id: string) {
    const row = await this.prisma.employeeMealDay.findFirst({
      where: { id },
      include: mealDayInclude,
    });
    if (!row || row.deletedAt) {
      throw new NotFoundAppException();
    }
    return toMealDay(row);
  }

  async listOrders(
    query: ListEmployeeMealOrdersQueryDto,
  ): Promise<Paginated<ReturnType<typeof toMealOrder>>> {
    const { page, limit, skip, take } = resolvePagination(
      query.page,
      query.limit,
    );
    const search = query.search?.trim();
    const where: Prisma.EmployeeMealOrderWhereInput = {
      ...(query.mealDayId ? { mealDayId: query.mealDayId } : {}),
      ...(query.employeeCode ? { employeeCode: query.employeeCode } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.from || query.to
        ? {
            mealDay: {
              serviceDate: {
                ...(query.from ? { gte: parseDateOnly(query.from) } : {}),
                ...(query.to ? { lte: parseDateOnly(query.to) } : {}),
              },
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { employeeCode: { contains: search, mode: 'insensitive' } },
              {
                employee: {
                  OR: [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                  ],
                },
              },
            ],
          }
        : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.employeeMealOrder.findMany({
        where,
        include: {
          mealDay: { include: { mealType: true } },
          employee: true,
        },
        orderBy: { orderedAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.employeeMealOrder.count({ where }),
    ]);
    const extras = await this.loadDriverFields(rows.map((row) => row.id));
    const index = await this.mealOrderEmployeeIndex(rows);
    const relink: Array<{
      orderId: string;
      employeeId: string;
      displayName: string;
    }> = [];
    const mapped = rows.map((row) => {
      const resolved = resolveMealOrderEmployee({
        employeeId: row.employeeId,
        employeeCode: row.employeeCode,
        employee: row.employee,
        index,
      });
      const linked = resolved
        ? {
            firstName: resolved.firstName,
            lastName: resolved.lastName,
            vehicle: resolved.vehicle,
          }
        : row.employee;
      const displayName = resolved ? employeeNameFromParts(resolved) : null;
      if (
        resolved?.id &&
        displayName &&
        (!row.employeeId || !readMetadataEmployeeName(row.metadata))
      ) {
        relink.push({
          orderId: row.id,
          employeeId: resolved.id,
          displayName,
        });
      }
      return toMealOrder({
        ...row,
        employee: linked,
        employeeId: row.employeeId ?? resolved?.id ?? null,
        metadata: mergeMealOrderMetadata(row.metadata, displayName),
        ...extras.get(row.id),
      });
    });
    if (relink.length > 0) {
      void this.relinkMealOrderEmployees(relink);
    }
    return paginated(mapped, total, page, limit);
  }

  private async relinkMealOrderEmployees(
    rows: Array<{ orderId: string; employeeId: string; displayName: string }>,
  ) {
    for (const row of rows) {
      try {
        await this.prisma.employeeMealOrder.updateMany({
          where: { id: row.orderId },
          data: {
            employeeId: row.employeeId,
            metadata: { employeeDisplayName: row.displayName },
          },
        });
      } catch {
        // best-effort while listing
      }
    }
  }

  private async mealOrderEmployeeIndex(
    rows: { mealDay: { restaurantId: string } }[],
  ) {
    const restaurantId = rows[0]?.mealDay.restaurantId;
    if (!restaurantId) {
      return buildMealOrderEmployeeIndex([]);
    }
    const employees = await this.prisma.employee.findMany({
      where: { restaurantId, deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeCode: true,
        vehicle: true,
      },
    });
    return buildMealOrderEmployeeIndex(employees);
  }

  async getOrder(id: string) {
    const row = await this.prisma.employeeMealOrder.findFirst({
      where: { id },
      include: { mealDay: { include: { mealType: true } }, employee: true },
    });
    if (!row) {
      throw new NotFoundAppException();
    }
    const extras = await this.loadDriverFields([id]);
    const index = await this.mealOrderEmployeeIndex([row]);
    const resolved = resolveMealOrderEmployee({
      employeeId: row.employeeId,
      employeeCode: row.employeeCode,
      employee: row.employee,
      index,
    });
    const linked = resolved
      ? {
          firstName: resolved.firstName,
          lastName: resolved.lastName,
          vehicle: resolved.vehicle,
        }
      : row.employee;
    const displayName = resolved ? employeeNameFromParts(resolved) : null;
    return toMealOrder({
      ...row,
      employee: linked,
      employeeId: row.employeeId ?? resolved?.id ?? null,
      metadata: mergeMealOrderMetadata(row.metadata, displayName),
      ...extras.get(id),
    });
  }

  private async loadDriverFields(ids: string[]) {
    const empty = new Map<
      string,
      {
        plateNumber?: string | null;
        fulfillmentType?: 'CAMP' | 'DELIVERY' | null;
        deliveryLocation?: string | null;
      }
    >();
    if (ids.length === 0) return empty;
    try {
      const rows = await this.prisma.$queryRaw<
        Array<{
          id: string;
          plate_number: string | null;
          fulfillment_type: 'CAMP' | 'DELIVERY' | null;
          delivery_location: string | null;
        }>
      >`
        SELECT
          id::text AS id,
          plate_number,
          fulfillment_type::text AS fulfillment_type,
          delivery_location
        FROM employee_meal.employee_meal_order
        WHERE id IN (${Prisma.join(ids.map((id) => Prisma.sql`CAST(${id} AS uuid)`))})
      `;
      return new Map(
        rows.map((row) => [
          row.id,
          {
            plateNumber: row.plate_number,
            fulfillmentType: row.fulfillment_type,
            deliveryLocation: row.delivery_location,
          },
        ]),
      );
    } catch {
      return empty;
    }
  }
}

function mergeMealOrderMetadata(metadata: unknown, displayName: string | null) {
  if (!displayName || readMetadataEmployeeName(metadata)) {
    return metadata;
  }
  const base =
    metadata && typeof metadata === 'object' && !Array.isArray(metadata)
      ? { ...(metadata as Record<string, unknown>) }
      : {};
  return { ...base, employeeDisplayName: displayName };
}
