import { Injectable, Logger } from '@nestjs/common';
import {
  AuditAction,
  EmployeeMealOrderStatus,
  FoodType,
  Prisma,
} from '@generated/prisma/client';

import { AuditCommandService } from '@/audit';
import {
  BadRequestAppException,
  ConflictAppException,
  ErrorCode,
  NotFoundAppException,
} from '@/common/exceptions';
import type { AuthRequestContext } from '@/iam/auth-request.context';
import type { AuthenticatedUser } from '@/iam/auth.types';
import { PrismaService } from '@/prisma/prisma.service';
import { RealtimeService } from '@/realtime';

import type {
  CreateEmployeeMealOrderDto,
  UpdateEmployeeMealOrderDto,
  UpsertEmployeeMealDayDto,
  UpsertEmployeeMealTypeDto,
  UpsertEmployeeOrderScheduleDto,
} from './dto/employee-meal.dto';
import {
  parseDateOnly,
  parseTime,
  todayDateOnly,
  toTimeString,
} from './employee-meal.mapper';
import { EmployeeMealQueryService } from './employee-meal.query.service';

function normalizeOptional(value?: string | null) {
  const next = value?.trim() ?? '';
  return next.length > 0 ? next : null;
}

function resolveFulfillment(input: CreateEmployeeMealOrderDto): {
  type: 'CAMP' | 'DELIVERY' | null;
  location: string | null;
} {
  const type = input.fulfillmentType ?? null;
  const location = normalizeOptional(input.deliveryLocation);
  if (type === 'DELIVERY') {
    if (!location) {
      throw new BadRequestAppException();
    }
    return { type, location };
  }
  if (type === 'CAMP') {
    return { type, location: null };
  }
  return { type: null, location: null };
}

@Injectable()
export class EmployeeMealCommandService {
  private readonly logger = new Logger(EmployeeMealCommandService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly queries: EmployeeMealQueryService,
    private readonly audit: AuditCommandService,
    private readonly realtime: RealtimeService,
  ) {}

  async createType(
    actor: AuthenticatedUser,
    input: UpsertEmployeeMealTypeDto,
    context: AuthRequestContext,
  ) {
    const restaurantId = await this.ensureRestaurantId();
    const id = await this.prisma.$transaction(async (tx) => {
      const row = await tx.employeeMealType.create({
        data: {
          restaurantId,
          kind: input.kind,
          code: input.code,
          name: input.name,
          sortOrder: input.sortOrder ?? 0,
          isEnabled: input.isEnabled ?? true,
        },
      });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.CREATE,
        resourceType: 'employee_meal_type',
        resourceId: row.id,
        after: { kind: row.kind, code: row.code, name: row.name },
      });
      return row.id;
    });
    return this.queries.getType(id);
  }

  async updateType(
    actor: AuthenticatedUser,
    id: string,
    input: UpsertEmployeeMealTypeDto,
    context: AuthRequestContext,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.employeeMealType.findFirst({ where: { id } });
      if (!existing || existing.deletedAt) {
        throw new NotFoundAppException();
      }
      await tx.employeeMealType.update({
        where: { id },
        data: {
          kind: input.kind,
          code: input.code,
          name: input.name,
          sortOrder: input.sortOrder ?? existing.sortOrder,
          isEnabled: input.isEnabled ?? existing.isEnabled,
          rowVersion: { increment: 1 },
        },
      });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.UPDATE,
        resourceType: 'employee_meal_type',
        resourceId: id,
        after: { name: input.name, kind: input.kind },
      });
    });
    return this.queries.getType(id);
  }

  async removeType(actor: AuthenticatedUser, id: string, context: AuthRequestContext) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.employeeMealType.findFirst({ where: { id } });
      if (!existing || existing.deletedAt) throw new NotFoundAppException();
      await tx.employeeMealType.update({
        where: { id },
        data: { deletedAt: new Date(), rowVersion: { increment: 1 } },
      });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.DELETE,
        resourceType: 'employee_meal_type',
        resourceId: id,
      });
    });
  }

  async createSchedule(
    actor: AuthenticatedUser,
    input: UpsertEmployeeOrderScheduleDto,
    context: AuthRequestContext,
  ) {
    this.assertWindow(input.opensAt, input.closesAt);
    const restaurantId = await this.ensureRestaurantId();
    await this.queries.getType(input.mealTypeId);
    const id = await this.prisma.$transaction(async (tx) => {
      const row = await tx.employeeOrderSchedule.create({
        data: {
          restaurantId,
          mealTypeId: input.mealTypeId,
          name: input.name,
          timezone: input.timezone ?? 'Asia/Ulaanbaatar',
          weekdays: input.weekdays,
          opensAt: parseTime(input.opensAt),
          closesAt: parseTime(input.closesAt),
          validFrom: this.openEndedFrom(),
          validTo: null,
          isEnabled: input.isEnabled ?? true,
        },
      });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.CREATE,
        resourceType: 'employee_order_schedule',
        resourceId: row.id,
        after: { name: row.name, mealTypeId: row.mealTypeId },
      });
      return row.id;
    });
    return this.queries.getSchedule(id);
  }

  async updateSchedule(
    actor: AuthenticatedUser,
    id: string,
    input: UpsertEmployeeOrderScheduleDto,
    context: AuthRequestContext,
  ) {
    this.assertWindow(input.opensAt, input.closesAt);
    await this.queries.getType(input.mealTypeId);
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.employeeOrderSchedule.findFirst({ where: { id } });
      if (!existing || existing.deletedAt) {
        throw new NotFoundAppException();
      }
      await tx.employeeOrderSchedule.update({
        where: { id },
        data: {
          mealTypeId: input.mealTypeId,
          name: input.name,
          timezone: input.timezone ?? existing.timezone,
          weekdays: input.weekdays,
          opensAt: parseTime(input.opensAt),
          closesAt: parseTime(input.closesAt),
          validFrom: this.openEndedFrom(),
          validTo: null,
          isEnabled: input.isEnabled ?? existing.isEnabled,
          rowVersion: { increment: 1 },
        },
      });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.UPDATE,
        resourceType: 'employee_order_schedule',
        resourceId: id,
        after: { name: input.name },
      });
    });
    return this.queries.getSchedule(id);
  }

  async removeSchedule(actor: AuthenticatedUser, id: string, context: AuthRequestContext) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.employeeOrderSchedule.findFirst({ where: { id } });
      if (!existing || existing.deletedAt) throw new NotFoundAppException();
      await tx.employeeOrderSchedule.update({
        where: { id },
        data: { deletedAt: new Date(), rowVersion: { increment: 1 } },
      });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.DELETE,
        resourceType: 'employee_order_schedule',
        resourceId: id,
      });
    });
  }

  async createDay(
    actor: AuthenticatedUser,
    input: UpsertEmployeeMealDayDto,
    context: AuthRequestContext,
  ) {
    const restaurantId = await this.ensureRestaurantId();
    await this.queries.getType(input.mealTypeId);
    const id = await this.prisma.$transaction(async (tx) => {
      const menuItem = await this.assertEFoodItem(tx, input.menuItemId);
      const row = await tx.employeeMealDay.create({
        data: {
          restaurantId,
          mealTypeId: input.mealTypeId,
          serviceDate: parseDateOnly(input.serviceDate),
          menuItemId: menuItem.id,
          name: menuItem.name,
          status: input.status ?? 'SCHEDULED',
        },
      });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.CREATE,
        resourceType: 'employee_meal',
        resourceId: row.id,
        after: { serviceDate: input.serviceDate, mealTypeId: input.mealTypeId },
      });
      return row.id;
    }).catch((error: unknown) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictAppException();
      }
      throw error;
    });
    return this.queries.getDay(id);
  }

  async updateDay(
    actor: AuthenticatedUser,
    id: string,
    input: UpsertEmployeeMealDayDto,
    context: AuthRequestContext,
  ) {
    await this.queries.getType(input.mealTypeId);
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.employeeMealDay.findFirst({ where: { id } });
      if (!existing || existing.deletedAt) {
        throw new NotFoundAppException();
      }
      const menuItem = await this.assertEFoodItem(tx, input.menuItemId);
      await tx.employeeMealDay.update({
        where: { id },
        data: {
          mealTypeId: input.mealTypeId,
          serviceDate: parseDateOnly(input.serviceDate),
          menuItemId: menuItem.id,
          name: menuItem.name,
          status: input.status ?? existing.status,
          rowVersion: { increment: 1 },
        },
      });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.UPDATE,
        resourceType: 'employee_meal',
        resourceId: id,
        after: { serviceDate: input.serviceDate, status: input.status },
      });
    }).catch((error: unknown) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictAppException();
      }
      throw error;
    });
    return this.queries.getDay(id);
  }

  async removeDay(actor: AuthenticatedUser, id: string, context: AuthRequestContext) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.employeeMealDay.findFirst({ where: { id } });
      if (!existing || existing.deletedAt) throw new NotFoundAppException();
      await tx.employeeMealDay.update({
        where: { id },
        data: { deletedAt: new Date(), rowVersion: { increment: 1 } },
      });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.DELETE,
        resourceType: 'employee_meal',
        resourceId: id,
      });
    });
  }

  async createOrder(
    actor: AuthenticatedUser | undefined,
    input: CreateEmployeeMealOrderDto,
    context: AuthRequestContext,
  ) {
    const day = await this.prisma.employeeMealDay.findFirst({
      where: { id: input.mealDayId, deletedAt: null },
      include: { mealType: true },
    });
    if (!day || day.status === 'CANCELLED' || day.status === 'CLOSED') {
      throw new NotFoundAppException();
    }
    const code = input.employeeCode.trim();
    if (!code) {
      throw new BadRequestAppException();
    }
    if (!actor) {
      await this.assertOpenWindow(day.mealTypeId, day.restaurantId);
    }
    const employee = await this.prisma.employee.findFirst({
      where: { restaurantId: day.restaurantId, employeeCode: code, deletedAt: null },
      select: { id: true },
    });

    const fulfillment = resolveFulfillment(input);
    const id = await this.prisma.$transaction(async (tx) => {
      const row = await tx.employeeMealOrder.create({
        data: {
          mealDayId: day.id,
          employeeCode: code,
          employeeId: employee?.id ?? null,
          status: EmployeeMealOrderStatus.ORDERED,
          plateNumber: normalizeOptional(input.plateNumber),
          fulfillmentType: fulfillment.type,
          deliveryLocation: fulfillment.location,
        },
      });
      if (actor) {
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.CREATE,
          resourceType: 'employee_meal_order',
          resourceId: row.id,
          after: { mealDayId: day.id, employeeCode: code },
        });
      }
      return row.id;
    }).catch((error: unknown) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictAppException();
      }
      this.logPrismaFailure('createOrder', error);
      throw error;
    });
    this.realtime.emitOrgMealOrderUpdate({
      orderId: id,
      action: 'created',
      employeeCode: code,
      employeeId: employee?.id,
      menuId: day.id,
    });
    return this.queries.getOrder(id);
  }

  async requestOrder(input: CreateEmployeeMealOrderDto) {
    const code = input.employeeCode.trim();
    if (!code) {
      throw new BadRequestAppException();
    }
    const day = await this.prisma.employeeMealDay.findFirst({
      where: { id: input.mealDayId, deletedAt: null },
    });
    if (!day || day.status === 'CANCELLED' || day.status === 'CLOSED') {
      throw new NotFoundAppException();
    }
    await this.assertOpenWindow(day.mealTypeId, day.restaurantId);
    const employee = await this.prisma.employee.findFirst({
      where: { restaurantId: day.restaurantId, employeeCode: code, deletedAt: null },
      select: { id: true },
    });
    const fulfillment = resolveFulfillment(input);
    const id = await this.createEmployeeOrderRow({
      mealDayId: day.id,
      employeeCode: code,
      employeeId: employee?.id ?? null,
      plateNumber: normalizeOptional(input.plateNumber),
      fulfillmentType: fulfillment.type,
      deliveryLocation: fulfillment.location,
    });
    this.realtime.emitOrgMealOrderUpdate({
      orderId: id,
      action: 'created',
      employeeCode: code,
      employeeId: employee?.id,
      menuId: day.id,
    });
    return this.queries.getOrder(id);
  }

  async updateOrder(
    actor: AuthenticatedUser,
    id: string,
    input: UpdateEmployeeMealOrderDto,
    context: AuthRequestContext,
  ) {
    let employeeCode = '';
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.employeeMealOrder.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundAppException();
      }
      employeeCode = existing.employeeCode;
      await tx.employeeMealOrder.update({
        where: { id },
        data: {
          status: input.status,
          cancelledAt: input.status === 'CANCELLED' ? new Date() : null,
          consumedAt: input.status === 'CONSUMED' ? new Date() : null,
          rowVersion: { increment: 1 },
        },
      });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.UPDATE,
        resourceType: 'employee_meal_order',
        resourceId: id,
        before: { status: existing.status },
        after: { status: input.status },
      });
    });
    this.realtime.emitOrgMealOrderUpdate({
      orderId: id,
      action: 'updated',
      employeeCode,
    });
    return this.queries.getOrder(id);
  }

  async removeOrder(actor: AuthenticatedUser, id: string, context: AuthRequestContext) {
    let employeeCode = '';
    let employeeId: string | undefined;
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.employeeMealOrder.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundAppException();
      }
      employeeCode = existing.employeeCode;
      employeeId = existing.employeeId ?? undefined;
      await tx.employeeMealOrder.delete({ where: { id } });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.DELETE,
        resourceType: 'employee_meal_order',
        resourceId: id,
        before: { employeeId: existing.employeeId, status: existing.status },
      });
    });
    this.realtime.emitOrgMealOrderUpdate({
      orderId: id,
      action: 'deleted',
      employeeCode,
      employeeId,
    });
  }

  private async createEmployeeOrderRow(input: {
    mealDayId: string;
    employeeCode: string;
    employeeId: string | null;
    plateNumber: string | null;
    fulfillmentType: 'CAMP' | 'DELIVERY' | null;
    deliveryLocation: string | null;
  }): Promise<string> {
    try {
      const row = await this.prisma.employeeMealOrder.create({
        data: {
          mealDayId: input.mealDayId,
          employeeCode: input.employeeCode,
          employeeId: input.employeeId,
          status: EmployeeMealOrderStatus.ORDERED,
          plateNumber: input.plateNumber,
          fulfillmentType: input.fulfillmentType,
          deliveryLocation: input.deliveryLocation,
        },
        select: { id: true },
      });
      return row.id;
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictAppException();
      }
      this.logPrismaFailure('requestOrder', error);
      throw error;
    }
  }

  private logPrismaFailure(action: string, error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      this.logger.error(
        `${action} prisma ${error.code} ${error.message}`,
        JSON.stringify(error.meta ?? {}),
      );
      return;
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
      this.logger.error(`${action} prisma validation ${error.message}`);
      return;
    }
    this.logger.error(
      `${action} failed`,
      error instanceof Error ? error.stack : String(error),
    );
  }

  private assertWindow(opensAt: string, closesAt: string) {
    if (opensAt >= closesAt) {
      throw new BadRequestAppException();
    }
  }

  private openEndedFrom() {
    return parseDateOnly('1970-01-01');
  }

  private async assertOpenWindow(mealTypeId: string, restaurantId: string) {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Ulaanbaatar',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      weekday: 'short',
    }).formatToParts(now);
    const pick = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((part) => part.type === type)?.value ?? '';
    const clock = `${pick('hour')}:${pick('minute')}`;
    const weekdayMap: Record<string, number> = {
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
      Sun: 7,
    };
    const weekday = weekdayMap[pick('weekday')] ?? 0;
    const schedules = await this.prisma.employeeOrderSchedule.findMany({
      where: {
        restaurantId,
        mealTypeId,
        deletedAt: null,
        isEnabled: true,
        weekdays: { has: weekday },
      },
    });
    const today = parseDateOnly(todayDateOnly());
    const open = schedules.some((schedule) => {
      if (schedule.validFrom > today) {
        return false;
      }
      if (schedule.validTo && schedule.validTo < today) {
        return false;
      }
      const opens = toTimeString(schedule.opensAt);
      const closes = toTimeString(schedule.closesAt);
      return clock >= opens && clock < closes;
    });
    if (!open) {
      throw new BadRequestAppException(ErrorCode.MEAL_WINDOW_CLOSED);
    }
  }

  private async assertEFoodItem(tx: Prisma.TransactionClient, id: string) {
    const row = await tx.menuItem.findFirst({
      where: { id, deletedAt: null, foodType: FoodType.E_FOOD },
      select: { id: true, name: true },
    });
    if (!row) throw new BadRequestAppException();
    return row;
  }

  private async ensureRestaurantId() {
    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('restaurant:singleton'))`;
      const existing = await tx.restaurant.findFirst({
        where: { deletedAt: null },
        orderBy: { createdAt: 'asc' },
        select: { id: true },
      });
      if (existing) {
        return existing.id;
      }
      const created = await tx.restaurant.create({
        data: {
          code: 'main',
          name: 'Restaurant',
          legalName: 'Restaurant',
          setting: { create: {} },
        },
        select: { id: true },
      });
      return created.id;
    });
  }
}
