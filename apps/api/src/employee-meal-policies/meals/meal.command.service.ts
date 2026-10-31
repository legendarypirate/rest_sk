import { Injectable } from '@nestjs/common';
import { AuditAction, EmployeeMealStatus, Prisma } from '@generated/prisma/client';

import { AuditCommandService } from '@/audit';
import { BadRequestAppException, ConflictAppException, NotFoundAppException } from '@/common/exceptions';
import type { AuthRequestContext } from '@/iam/auth-request.context';
import type { AuthenticatedUser } from '@/iam/auth.types';
import { PrismaService } from '@/prisma/prisma.service';

import type { UpsertEmployeeMealDto } from './dto/meal.dto';
import { MealQueryService } from '@/employee-meal-policies/meals/meal.query.service';

@Injectable()
export class MealCommandService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queries: MealQueryService,
    private readonly audit: AuditCommandService,
  ) {}

  async create(actor: AuthenticatedUser, input: UpsertEmployeeMealDto, context: AuthRequestContext) {
    this.assertAmounts(input);
    const status = input.status ?? EmployeeMealStatus.CONSUMED;
    const id = await this.prisma
      .$transaction(async (tx) => {
        await this.assertLinks(tx, input);
        const row = await tx.employeeMeal.create({ data: this.data(input, status) });
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.CREATE,
          resourceType: 'employee_meal',
          resourceId: row.id,
          after: { employeeId: row.employeeId, foodAmount: input.foodAmount },
        });
        return row.id;
      })
      .catch(rethrowConflict);
    return this.queries.getById(id);
  }

  async update(actor: AuthenticatedUser, id: string, input: UpsertEmployeeMealDto, context: AuthRequestContext) {
    this.assertAmounts(input);
    await this.prisma
      .$transaction(async (tx) => {
        const existing = await tx.employeeMeal.findFirst({ where: { id } });
        if (!existing) throw new NotFoundAppException();
        await this.assertLinks(tx, input);
        await tx.employeeMeal.update({
          where: { id },
          data: this.data(input, input.status ?? existing.status, existing.currency, existing.cancelledAt),
        });
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.UPDATE,
          resourceType: 'employee_meal',
          resourceId: id,
          after: { employeeId: input.employeeId, foodAmount: input.foodAmount },
        });
      })
      .catch(rethrowConflict);
    return this.queries.getById(id);
  }

  async remove(actor: AuthenticatedUser, id: string, context: AuthRequestContext) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.employeeMeal.findFirst({ where: { id } });
      if (!existing) throw new NotFoundAppException();
      await tx.employeeMeal.delete({ where: { id } });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.DELETE,
        resourceType: 'employee_meal',
        resourceId: id,
        before: { employeeId: existing.employeeId },
      });
    });
  }

  private data(input: UpsertEmployeeMealDto, status: EmployeeMealStatus, currency = 'MNT', cancelledAt: Date | null = null) {
    return {
      employeeId: input.employeeId,
      orderId: input.orderId,
      mealType: input.mealType,
      status,
      consumedAt: new Date(input.consumedAt),
      currency: input.currency ?? currency,
      foodAmount: new Prisma.Decimal(input.foodAmount),
      subsidyAmount: new Prisma.Decimal(input.subsidyAmount),
      employeePaidAmount: new Prisma.Decimal(input.employeePaidAmount),
      cancelledAt: status === EmployeeMealStatus.CANCELLED ? (cancelledAt ?? new Date()) : null,
    };
  }

  private assertAmounts(input: UpsertEmployeeMealDto) {
    const food = new Prisma.Decimal(input.foodAmount);
    const parts = new Prisma.Decimal(input.subsidyAmount).plus(input.employeePaidAmount);
    if (!food.equals(parts)) throw new BadRequestAppException();
  }

  private async assertLinks(tx: Prisma.TransactionClient, input: UpsertEmployeeMealDto) {
    const employee = await tx.employee.findFirst({ where: { id: input.employeeId, deletedAt: null }, select: { id: true } });
    if (!employee) throw new NotFoundAppException();
    if (!input.orderId) return;
    const order = await tx.order.findFirst({ where: { id: input.orderId }, select: { id: true } });
    if (!order) throw new NotFoundAppException();
  }
}

function rethrowConflict(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    throw new ConflictAppException();
  }
  throw error;
}
