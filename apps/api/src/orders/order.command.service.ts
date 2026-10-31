import { Injectable } from '@nestjs/common';
import { AuditAction, OrderStatus, Prisma } from '@generated/prisma/client';

import { AuditCommandService } from '@/audit';
import { BadRequestAppException, ConflictAppException, NotFoundAppException } from '@/common/exceptions';
import type { AuthRequestContext } from '@/iam/auth-request.context';
import type { AuthenticatedUser } from '@/iam/auth.types';
import { PrismaService } from '@/prisma/prisma.service';

import type {
  CreateOrderStatusHistoryDto,
  UpsertOrderDto,
  UpsertOrderItemDto,
} from './dto/order.dto';
import { OrderQueryService } from '@/orders/order.query.service';

@Injectable()
export class OrderCommandService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queries: OrderQueryService,
    private readonly audit: AuditCommandService,
  ) {}

  async createOrder(actor: AuthenticatedUser, input: UpsertOrderDto, context: AuthRequestContext) {
    const status = input.status ?? OrderStatus.DRAFT;
    const restaurantId = await this.ensureRestaurantId();
    const id = await this.prisma
      .$transaction(async (tx) => {
        await this.assertLinks(tx, input);
        const row = await tx.order.create({
          data: {
            restaurantId,
            orderNumber: input.orderNumber,
            channel: input.channel,
            serviceType: input.serviceType,
            status,
            currency: input.currency ?? 'MNT',
            employeeId: input.employeeId,
            kioskDeviceId: input.kioskDeviceId,
            kioskSessionId: input.kioskSessionId,
            placedByUserId: actor.id,
            note: input.note,
            ...this.statusTimes(status, null),
          },
        });
        await tx.orderStatusHistory.create({
          data: { orderId: row.id, fromStatus: null, toStatus: status, changedByUserId: actor.id },
        });
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.CREATE,
          resourceType: 'order',
          resourceId: row.id,
          after: { orderNumber: row.orderNumber, status },
        });
        return row.id;
      })
      .catch(rethrowConflict);
    return this.queries.getOrder(id);
  }

  async updateOrder(actor: AuthenticatedUser, id: string, input: UpsertOrderDto, context: AuthRequestContext) {
    await this.prisma
      .$transaction(async (tx) => {
        const existing = await tx.order.findFirst({ where: { id } });
        if (!existing) throw new NotFoundAppException();
        await this.assertLinks(tx, input);
        const status = input.status ?? existing.status;
        await tx.order.update({
          where: { id },
          data: {
            orderNumber: input.orderNumber,
            channel: input.channel,
            serviceType: input.serviceType,
            status,
            currency: input.currency ?? existing.currency,
            employeeId: input.employeeId,
            kioskDeviceId: input.kioskDeviceId,
            kioskSessionId: input.kioskSessionId,
            note: input.note,
            ...this.statusTimes(status, existing),
            rowVersion: { increment: 1 },
          },
        });
        if (status !== existing.status) {
          await tx.orderStatusHistory.create({
            data: {
              orderId: id,
              fromStatus: existing.status,
              toStatus: status,
              changedByUserId: actor.id,
            },
          });
        }
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.UPDATE,
          resourceType: 'order',
          resourceId: id,
          before: { orderNumber: existing.orderNumber, status: existing.status },
          after: { orderNumber: input.orderNumber, status },
        });
      })
      .catch(rethrowConflict);
    return this.queries.getOrder(id);
  }

  async removeOrder(actor: AuthenticatedUser, id: string, context: AuthRequestContext) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.order.findFirst({ where: { id } });
      if (!existing) throw new NotFoundAppException();
      const items = await tx.orderItem.count({ where: { orderId: id } });
      const payments = await tx.paymentTransaction.count({ where: { orderId: id } });
      const refunds = await tx.refund.count({ where: { orderId: id } });
      const kitchen = await tx.kitchenOrder.count({ where: { orderId: id } });
      const meals = await tx.employeeMeal.count({ where: { orderId: id } });
      if (items > 0 || payments > 0 || refunds > 0 || kitchen > 0 || meals > 0) {
        throw new BadRequestAppException();
      }
      await tx.orderStatusHistory.deleteMany({ where: { orderId: id } });
      await tx.order.delete({ where: { id } });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.DELETE,
        resourceType: 'order',
        resourceId: id,
        before: { orderNumber: existing.orderNumber },
      });
    });
  }

  async createItem(actor: AuthenticatedUser, input: UpsertOrderItemDto, context: AuthRequestContext) {
    const lineTotal = this.lineTotal(input.quantity, input.unitPrice, input.discountAmount, input.subsidyAmount);
    const id = await this.prisma
      .$transaction(async (tx) => {
        await this.assertOrder(tx, input.orderId);
        await this.assertCatalog(tx, input.menuItemId);
        const row = await tx.orderItem.create({
          data: { ...this.itemData(input), lineTotal },
        });
        await this.recalculate(tx, input.orderId);
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.CREATE,
          resourceType: 'order_item',
          resourceId: row.id,
          after: { orderId: row.orderId, lineNumber: row.lineNumber, lineTotal: lineTotal.toFixed(2) },
        });
        return row.id;
      })
      .catch(rethrowConflict);
    return this.queries.getItem(id);
  }

  async updateItem(actor: AuthenticatedUser, id: string, input: UpsertOrderItemDto, context: AuthRequestContext) {
    const lineTotal = this.lineTotal(input.quantity, input.unitPrice, input.discountAmount, input.subsidyAmount);
    await this.prisma
      .$transaction(async (tx) => {
        const existing = await tx.orderItem.findFirst({ where: { id } });
        if (!existing) throw new NotFoundAppException();
        await this.assertOrder(tx, input.orderId);
        await this.assertCatalog(tx, input.menuItemId);
        await tx.orderItem.update({ where: { id }, data: { ...this.itemData(input), lineTotal } });
        await this.recalculate(tx, input.orderId);
        if (existing.orderId !== input.orderId) await this.recalculate(tx, existing.orderId);
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.UPDATE,
          resourceType: 'order_item',
          resourceId: id,
          after: { orderId: input.orderId, lineNumber: input.lineNumber },
        });
      })
      .catch(rethrowConflict);
    return this.queries.getItem(id);
  }

  async removeItem(actor: AuthenticatedUser, id: string, context: AuthRequestContext) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.orderItem.findFirst({ where: { id } });
      if (!existing) throw new NotFoundAppException();
      const kitchen = await tx.kitchenOrderItem.count({ where: { orderItemId: id } });
      if (kitchen > 0) throw new BadRequestAppException();
      await tx.orderItem.delete({ where: { id } });
      await this.recalculate(tx, existing.orderId);
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.DELETE,
        resourceType: 'order_item',
        resourceId: id,
        before: { orderId: existing.orderId, lineNumber: existing.lineNumber },
      });
    });
  }

  async createHistory(actor: AuthenticatedUser, input: CreateOrderStatusHistoryDto, context: AuthRequestContext) {
    const id = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({ where: { id: input.orderId } });
      if (!order) throw new NotFoundAppException();
      if (order.status === input.toStatus) throw new BadRequestAppException();
      const row = await tx.orderStatusHistory.create({
        data: {
          orderId: input.orderId,
          fromStatus: order.status,
          toStatus: input.toStatus,
          reason: input.reason,
          changedByUserId: actor.id,
        },
      });
      await tx.order.update({
        where: { id: order.id },
        data: { status: input.toStatus, ...this.statusTimes(input.toStatus, order), rowVersion: { increment: 1 } },
      });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.CREATE,
        resourceType: 'order_status_history',
        resourceId: row.id,
        after: { orderId: order.id, fromStatus: order.status, toStatus: input.toStatus },
      });
      return row.id;
    });
    return this.queries.getHistory(id);
  }

  async removeHistory(actor: AuthenticatedUser, id: string, context: AuthRequestContext) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.orderStatusHistory.findFirst({ where: { id } });
      if (!existing) throw new NotFoundAppException();
      await tx.orderStatusHistory.delete({ where: { id } });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.DELETE,
        resourceType: 'order_status_history',
        resourceId: id,
        before: { orderId: existing.orderId, toStatus: existing.toStatus },
      });
    });
  }

  private itemData(input: UpsertOrderItemDto) {
    return {
      orderId: input.orderId,
      menuItemId: input.menuItemId,
      lineNumber: input.lineNumber,
      nameSnapshot: input.nameSnapshot,
      skuSnapshot: input.skuSnapshot,
      variantSnapshot: input.variantSnapshot,
      quantity: new Prisma.Decimal(input.quantity),
      currency: input.currency ?? 'MNT',
      unitPrice: new Prisma.Decimal(input.unitPrice),
      discountAmount: new Prisma.Decimal(input.discountAmount ?? '0'),
      subsidyAmount: new Prisma.Decimal(input.subsidyAmount ?? '0'),
      note: input.note,
    };
  }

  private lineTotal(quantity: string, unitPrice: string, discount?: string, subsidy?: string) {
    const total = new Prisma.Decimal(unitPrice)
      .times(quantity)
      .minus(discount ?? '0')
      .minus(subsidy ?? '0')
      .toDecimalPlaces(2);
    if (total.isNeg()) throw new BadRequestAppException();
    return total;
  }

  private statusTimes(
    status: OrderStatus,
    existing: { confirmedAt: Date | null; completedAt: Date | null; cancelledAt: Date | null } | null,
  ) {
    const now = new Date();
    return {
      confirmedAt:
        status === OrderStatus.CONFIRMED || status === OrderStatus.KITCHEN_RECEIVED || status === OrderStatus.PREPARING || status === OrderStatus.READY || status === OrderStatus.COMPLETED
          ? (existing?.confirmedAt ?? now)
          : existing?.confirmedAt ?? null,
      completedAt: status === OrderStatus.COMPLETED ? (existing?.completedAt ?? now) : existing?.completedAt ?? null,
      cancelledAt: status === OrderStatus.CANCELLED ? (existing?.cancelledAt ?? now) : null,
    };
  }

  private async recalculate(tx: Prisma.TransactionClient, orderId: string) {
    const items = await tx.orderItem.findMany({ where: { orderId } });
    let subtotal = new Prisma.Decimal(0);
    let discountTotal = new Prisma.Decimal(0);
    let subsidyTotal = new Prisma.Decimal(0);
    for (const item of items) {
      subtotal = subtotal.plus(item.quantity.times(item.unitPrice));
      discountTotal = discountTotal.plus(item.discountAmount);
      subsidyTotal = subsidyTotal.plus(item.subsidyAmount);
    }
    const grandTotal = subtotal.minus(discountTotal).minus(subsidyTotal).toDecimalPlaces(2);
    if (grandTotal.isNeg()) throw new BadRequestAppException();
    await tx.order.update({
      where: { id: orderId },
      data: {
        subtotal: subtotal.toDecimalPlaces(2),
        discountTotal: discountTotal.toDecimalPlaces(2),
        subsidyTotal: subsidyTotal.toDecimalPlaces(2),
        grandTotal,
        rowVersion: { increment: 1 },
      },
    });
  }

  private async assertOrder(tx: Prisma.TransactionClient, id: string) {
    const row = await tx.order.findFirst({ where: { id }, select: { id: true } });
    if (!row) throw new NotFoundAppException();
  }

  private async assertCatalog(tx: Prisma.TransactionClient, menuItemId: string | null) {
    if (!menuItemId) return;
    const item = await tx.menuItem.findFirst({ where: { id: menuItemId, deletedAt: null }, select: { id: true } });
    if (!item) throw new NotFoundAppException();
  }

  private async assertLinks(tx: Prisma.TransactionClient, input: UpsertOrderDto) {
    if (input.employeeId) {
      const row = await tx.employee.findFirst({ where: { id: input.employeeId, deletedAt: null }, select: { id: true } });
      if (!row) throw new NotFoundAppException();
    }
    if (input.kioskDeviceId) {
      const row = await tx.kioskDevice.findFirst({
        where: { id: input.kioskDeviceId, deletedAt: null },
        select: { id: true },
      });
      if (!row) throw new NotFoundAppException();
    }
    if (!input.kioskSessionId) return;
    const session = await tx.kioskSession.findFirst({
      where: { id: input.kioskSessionId, ...(input.kioskDeviceId ? { deviceId: input.kioskDeviceId } : {}) },
      select: { id: true },
    });
    if (!session) throw new BadRequestAppException();
  }

  private async ensureRestaurantId() {
    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('restaurant:singleton'))`;
      const existing = await tx.restaurant.findFirst({
        where: { deletedAt: null },
        orderBy: { createdAt: 'asc' },
        select: { id: true },
      });
      if (existing) return existing.id;
      const restaurant = await tx.restaurant.create({
        data: { code: 'main', name: 'Restaurant', legalName: 'Restaurant', setting: { create: {} } },
        select: { id: true },
      });
      return restaurant.id;
    });
  }
}

function rethrowConflict(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    throw new ConflictAppException();
  }
  throw error;
}
