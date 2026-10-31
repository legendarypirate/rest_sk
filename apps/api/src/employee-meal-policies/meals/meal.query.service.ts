import { Injectable } from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';
import type { EmployeeMealRecord } from '@packages/types';

import { NotFoundAppException } from '@/common/exceptions';
import { toIso } from '@/common/utils/date';
import { paginated, resolvePagination } from '@/common/utils/pagination';
import { PrismaService } from '@/prisma/prisma.service';

import type { ListEmployeeMealsQueryDto } from './dto/meal.dto';

const include = {
  employee: { select: { firstName: true, lastName: true } },
} as const;

function money(value: { toFixed: (digits: number) => string }) {
  return value.toFixed(2);
}

@Injectable()
export class MealQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListEmployeeMealsQueryDto) {
    const { page, limit, skip, take } = resolvePagination(query.page, query.limit);
    const where: Prisma.EmployeeMealWhereInput = {
      ...(query.employeeId ? { employeeId: query.employeeId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.employeeMeal.findMany({ where, include, orderBy: { consumedAt: 'desc' }, skip, take }),
      this.prisma.employeeMeal.count({ where }),
    ]);
    return paginated(rows.map(toMeal), total, page, limit);
  }

  async getById(id: string) {
    const row = await this.prisma.employeeMeal.findFirst({ where: { id }, include });
    if (!row) throw new NotFoundAppException();
    return toMeal(row);
  }
}

function toMeal(row: {
  id: string;
  employeeId: string;
  orderId: string | null;
  mealType: EmployeeMealRecord['mealType'];
  status: EmployeeMealRecord['status'];
  consumedAt: Date;
  currency: string;
  foodAmount: { toFixed: (digits: number) => string };
  subsidyAmount: { toFixed: (digits: number) => string };
  employeePaidAmount: { toFixed: (digits: number) => string };
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  employee: { firstName: string; lastName: string };
}): EmployeeMealRecord {
  return {
    id: row.id,
    employeeId: row.employeeId,
    employeeName: `${row.employee.lastName} ${row.employee.firstName}`.trim(),
    orderId: row.orderId,
    mealType: row.mealType,
    status: row.status,
    consumedAt: row.consumedAt.toISOString(),
    currency: row.currency,
    foodAmount: money(row.foodAmount),
    subsidyAmount: money(row.subsidyAmount),
    employeePaidAmount: money(row.employeePaidAmount),
    cancelledAt: toIso(row.cancelledAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
