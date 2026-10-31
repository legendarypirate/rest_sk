import { Injectable } from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';
import type { EmployeeListItem, EmployeeStatus, EmployeeVehicle, Paginated } from '@packages/types';

import { toIso } from '@/common/utils/date';
import { paginated, resolvePagination, resolveSort } from '@/common/utils/pagination';
import { PrismaService } from '@/prisma/prisma.service';

import type { ListEmployeesQueryDto } from './dto/employees.dto';

const EMPLOYEE_SORT = {
  createdAt: 'createdAt',
  employeeCode: 'employeeCode',
  firstName: 'firstName',
  lastName: 'lastName',
} as const;

@Injectable()
export class EmployeesQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListEmployeesQueryDto): Promise<Paginated<EmployeeListItem>> {
    const { page, limit, skip, take } = resolvePagination(query.page, query.limit);
    const { sortBy, sortDirection } = resolveSort(
      query.sortBy,
      ['createdAt', 'employeeCode', 'firstName', 'lastName'] as const,
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

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.employee.findMany({
        where,
        orderBy: { [EMPLOYEE_SORT[sortBy]]: sortDirection },
        skip,
        take,
      }),
      this.prisma.employee.count({ where }),
    ]);

    return paginated(rows.map(toEmployee), total, page, limit);
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
