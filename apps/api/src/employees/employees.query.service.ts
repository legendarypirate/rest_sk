import { Injectable } from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';
import type { EmployeeListItem, EmployeeStatus, EmployeeVehicle, Paginated } from '@packages/types';

import { NotFoundAppException } from '@/common/exceptions';
import { toIso } from '@/common/utils/date';
import { paginated, resolvePagination, resolveSort } from '@/common/utils/pagination';
import { PrismaService } from '@/prisma/prisma.service';

import { EMPLOYEE_SORT_FIELDS, type ListEmployeesQueryDto } from './dto/employees.dto';

function employeeOrderBy(
  sortBy: Exclude<(typeof EMPLOYEE_SORT_FIELDS)[number], 'vehiclePlate'>,
  sortDirection: Prisma.SortOrder,
): Prisma.EmployeeOrderByWithRelationInput {
  return { [sortBy]: sortDirection };
}

function plateSortValue(vehicle: Prisma.JsonValue | null) {
  return plateOf(toVehicle(vehicle)) ?? '';
}

@Injectable()
export class EmployeesQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListEmployeesQueryDto): Promise<Paginated<EmployeeListItem>> {
    const { page, limit, skip, take } = resolvePagination(query.page, query.limit);
    const { sortBy, sortDirection } = resolveSort(
      query.sortBy,
      EMPLOYEE_SORT_FIELDS,
      'employeeCode',
      query.sortDirection,
    );
    const search = query.search?.trim();
    const where: Prisma.EmployeeWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(search
        ? {
            OR: [
              { employeeCode: { contains: search, mode: 'insensitive' } },
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { department: { contains: search, mode: 'insensitive' } },
              { position: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    if (sortBy === 'vehiclePlate') {
      const [matches, total] = await this.prisma.$transaction([
        this.prisma.employee.findMany({
          where,
          select: { id: true, vehicle: true },
        }),
        this.prisma.employee.count({ where }),
      ]);
      const pageIds = [...matches]
        .sort((left, right) => {
          const compared = plateSortValue(left.vehicle).localeCompare(
            plateSortValue(right.vehicle),
            'mn',
            { numeric: true, sensitivity: 'base' },
          );
          return sortDirection === 'asc' ? compared : -compared;
        })
        .slice(skip, take == null ? undefined : skip + take)
        .map((row) => row.id);
      const rows = pageIds.length
        ? await this.prisma.employee.findMany({ where: { id: { in: pageIds } } })
        : [];
      const byId = new Map(rows.map((row) => [row.id, row]));
      return paginated(
        pageIds.flatMap((id) => {
          const row = byId.get(id);
          return row ? [toEmployee(row)] : [];
        }),
        total,
        page,
        limit,
      );
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.employee.findMany({
        where,
        orderBy: employeeOrderBy(sortBy, sortDirection),
        skip,
        take,
      }),
      this.prisma.employee.count({ where }),
    ]);

    return paginated(rows.map(toEmployee), total, page, limit);
  }

  async getById(id: string): Promise<EmployeeListItem> {
    const row = await this.prisma.employee.findFirst({
      where: { id, deletedAt: null },
    });
    if (!row) {
      throw new NotFoundAppException();
    }
    return toEmployee(row);
  }
}

function toEmployee(row: {
  id: string;
  publicId: string;
  employeeCode: string | null;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  status: EmployeeStatus;
  externalId: string | null;
  vehicle: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}): EmployeeListItem {
  const vehicle = toVehicle(row.vehicle);
  return {
    id: row.id,
    publicId: row.publicId,
    employeeCode: row.employeeCode,
    firstName: row.firstName,
    lastName: row.lastName,
    department: row.department,
    position: row.position,
    status: row.status,
    externalId: row.externalId,
    vehiclePlate: plateOf(vehicle),
    vehicle,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    deletedAt: toIso(row.deletedAt),
  };
}

function toVehicle(vehicle: Prisma.JsonValue | null): EmployeeVehicle | null {
  if (!vehicle || typeof vehicle !== 'object' || Array.isArray(vehicle)) {
    return null;
  }
  return vehicle as EmployeeVehicle;
}

function plateOf(vehicle: EmployeeVehicle | null) {
  return vehicle?.plateNumber && vehicle.plateNumber.length > 0 ? vehicle.plateNumber : null;
}
