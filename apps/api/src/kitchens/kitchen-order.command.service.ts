import { Injectable } from '@nestjs/common';
import { AuditAction, KitchenOrderStatus, Prisma } from '@generated/prisma/client';

import { AuditCommandService } from '@/audit';
import { BadRequestAppException, ConflictAppException, NotFoundAppException } from '@/common/exceptions';
import type { AuthRequestContext } from '@/iam/auth-request.context';
import type { AuthenticatedUser } from '@/iam/auth.types';
import { PrismaService } from '@/prisma/prisma.service';

import type { UpsertKitchenOrderDto, UpsertKitchenOrderItemDto, UpsertKitchenTicketDto } from './dto/kitchen-order.dto';
import { KitchenOrderQueryService } from '@/kitchens/kitchen-order.query.service';

@Injectable()
export class KitchenOrderCommandService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queries: KitchenOrderQueryService,
    private readonly audit: AuditCommandService,
  ) {}

  async createOrder(actor: AuthenticatedUser, input: UpsertKitchenOrderDto, context: AuthRequestContext) {
    const status = input.status ?? KitchenOrderStatus.QUEUED;
    const id = await this.prisma
      .$transaction(async (tx) => {
        await this.assertKitchen(tx, input.kitchenId);
        await this.assertOrder(tx, input.orderId);
        const row = await tx.kitchenOrder.create({
          data: {
            kitchenId: input.kitchenId,
            orderId: input.orderId,
            status,
            priority: input.priority ?? 0,
            ...this.orderTimes(status, null),
          },
        });
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.CREATE,
          resourceType: 'kitchen_order',
          resourceId: row.id,
          after: { kitchenId: row.kitchenId, orderId: row.orderId, status },
        });
        return row.id;
      })
      .catch(rethrowConflict);
    return this.queries.getOrder(id);
  }

  async updateOrder(actor: AuthenticatedUser, id: string, input: UpsertKitchenOrderDto, context: AuthRequestContext) {
    await this.prisma
      .$transaction(async (tx) => {
        const existing = await tx.kitchenOrder.findFirst({ where: { id } });
        if (!existing) throw new NotFoundAppException();
        await this.assertKitchen(tx, input.kitchenId);
        await this.assertOrder(tx, input.orderId);
        const status = input.status ?? existing.status;
        await tx.kitchenOrder.update({
          where: { id },
          data: {
            kitchenId: input.kitchenId,
            orderId: input.orderId,
            status,
            priority: input.priority ?? existing.priority,
            ...this.orderTimes(status, existing),
            rowVersion: { increment: 1 },
          },
        });
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.UPDATE,
          resourceType: 'kitchen_order',
          resourceId: id,
          after: { kitchenId: input.kitchenId, orderId: input.orderId, status },
        });
      })
      .catch(rethrowConflict);
    return this.queries.getOrder(id);
  }

  async removeOrder(actor: AuthenticatedUser, id: string, context: AuthRequestContext) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.kitchenOrder.findFirst({ where: { id } });
      if (!existing) throw new NotFoundAppException();
      const items = await tx.kitchenOrderItem.count({ where: { kitchenOrderId: id } });
      const tickets = await tx.kitchenTicket.count({ where: { kitchenOrderId: id } });
      if (items > 0 || tickets > 0) throw new BadRequestAppException();
      await tx.kitchenOrder.delete({ where: { id } });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.DELETE,
        resourceType: 'kitchen_order',
        resourceId: id,
        before: { kitchenId: existing.kitchenId, orderId: existing.orderId },
      });
    });
  }

  async createItem(actor: AuthenticatedUser, input: UpsertKitchenOrderItemDto, context: AuthRequestContext) {
    const status = input.status ?? KitchenOrderStatus.QUEUED;
    const id = await this.prisma
      .$transaction(async (tx) => {
        await this.assertLine(tx, input);
        const row = await tx.kitchenOrderItem.create({
          data: {
            kitchenOrderId: input.kitchenOrderId,
            orderItemId: input.orderItemId,
            stationId: input.stationId,
            status,
            quantity: new Prisma.Decimal(input.quantity),
            ...this.lineTimes(status, null),
          },
        });
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.CREATE,
          resourceType: 'kitchen_order_item',
          resourceId: row.id,
          after: { kitchenOrderId: row.kitchenOrderId, quantity: input.quantity },
        });
        return row.id;
      })
      .catch(rethrowConflict);
    return this.queries.getItem(id);
  }

  async updateItem(actor: AuthenticatedUser, id: string, input: UpsertKitchenOrderItemDto, context: AuthRequestContext) {
    await this.prisma
      .$transaction(async (tx) => {
        const existing = await tx.kitchenOrderItem.findFirst({ where: { id } });
        if (!existing) throw new NotFoundAppException();
        await this.assertLine(tx, input);
        const status = input.status ?? existing.status;
        await tx.kitchenOrderItem.update({
          where: { id },
          data: {
            kitchenOrderId: input.kitchenOrderId,
            orderItemId: input.orderItemId,
            stationId: input.stationId,
            status,
            quantity: new Prisma.Decimal(input.quantity),
            ...this.lineTimes(status, existing),
          },
        });
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.UPDATE,
          resourceType: 'kitchen_order_item',
          resourceId: id,
          after: { kitchenOrderId: input.kitchenOrderId, quantity: input.quantity },
        });
      })
      .catch(rethrowConflict);
    return this.queries.getItem(id);
  }

  async removeItem(actor: AuthenticatedUser, id: string, context: AuthRequestContext) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.kitchenOrderItem.findFirst({ where: { id } });
      if (!existing) throw new NotFoundAppException();
      await tx.kitchenOrderItem.delete({ where: { id } });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.DELETE,
        resourceType: 'kitchen_order_item',
        resourceId: id,
        before: { kitchenOrderId: existing.kitchenOrderId, orderItemId: existing.orderItemId },
      });
    });
  }

  async createTicket(actor: AuthenticatedUser, input: UpsertKitchenTicketDto, context: AuthRequestContext) {
    const id = await this.prisma
      .$transaction(async (tx) => {
        await this.assertTicket(tx, input.kitchenOrderId, input.stationId);
        const row = await tx.kitchenTicket.create({ data: this.ticketData(input) });
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.CREATE,
          resourceType: 'kitchen_ticket',
          resourceId: row.id,
          after: { kitchenOrderId: row.kitchenOrderId, ticketNumber: row.ticketNumber },
        });
        return row.id;
      })
      .catch(rethrowConflict);
    return this.queries.getTicket(id);
  }

  async updateTicket(actor: AuthenticatedUser, id: string, input: UpsertKitchenTicketDto, context: AuthRequestContext) {
    await this.prisma
      .$transaction(async (tx) => {
        const existing = await tx.kitchenTicket.findFirst({ where: { id } });
        if (!existing) throw new NotFoundAppException();
        await this.assertTicket(tx, input.kitchenOrderId, input.stationId);
        await tx.kitchenTicket.update({
          where: { id },
          data: this.ticketData(input, existing.status, existing.priority),
        });
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.UPDATE,
          resourceType: 'kitchen_ticket',
          resourceId: id,
          after: { kitchenOrderId: input.kitchenOrderId, ticketNumber: input.ticketNumber },
        });
      })
      .catch(rethrowConflict);
    return this.queries.getTicket(id);
  }

  async removeTicket(actor: AuthenticatedUser, id: string, context: AuthRequestContext) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.kitchenTicket.findFirst({ where: { id } });
      if (!existing) throw new NotFoundAppException();
      await tx.kitchenTicket.delete({ where: { id } });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.DELETE,
        resourceType: 'kitchen_ticket',
        resourceId: id,
        before: { kitchenOrderId: existing.kitchenOrderId, ticketNumber: existing.ticketNumber },
      });
    });
  }

  private ticketData(input: UpsertKitchenTicketDto, status: KitchenOrderStatus = KitchenOrderStatus.QUEUED, priority = 0) {
    return {
      kitchenOrderId: input.kitchenOrderId,
      stationId: input.stationId,
      ticketNumber: input.ticketNumber,
      status: input.status ?? status,
      priority: input.priority ?? priority,
      printedAt: input.printedAt ? new Date(input.printedAt) : null,
    };
  }

  private orderTimes(
    status: KitchenOrderStatus,
    existing: {
      receivedAt: Date | null;
      startedAt: Date | null;
      readyAt: Date | null;
      completedAt: Date | null;
      cancelledAt: Date | null;
    } | null,
  ) {
    const now = new Date();
    const active =
      status === KitchenOrderStatus.RECEIVED ||
      status === KitchenOrderStatus.PREPARING ||
      status === KitchenOrderStatus.READY ||
      status === KitchenOrderStatus.COMPLETED;
    return {
      receivedAt: active ? (existing?.receivedAt ?? now) : (existing?.receivedAt ?? null),
      startedAt:
        status === KitchenOrderStatus.PREPARING || status === KitchenOrderStatus.READY || status === KitchenOrderStatus.COMPLETED
          ? (existing?.startedAt ?? now)
          : (existing?.startedAt ?? null),
      readyAt:
        status === KitchenOrderStatus.READY || status === KitchenOrderStatus.COMPLETED
          ? (existing?.readyAt ?? now)
          : (existing?.readyAt ?? null),
      completedAt: status === KitchenOrderStatus.COMPLETED ? (existing?.completedAt ?? now) : (existing?.completedAt ?? null),
      cancelledAt: status === KitchenOrderStatus.CANCELLED ? (existing?.cancelledAt ?? now) : null,
    };
  }

  private lineTimes(status: KitchenOrderStatus, existing: { startedAt: Date | null; readyAt: Date | null } | null) {
    const now = new Date();
    return {
      startedAt:
        status === KitchenOrderStatus.PREPARING || status === KitchenOrderStatus.READY || status === KitchenOrderStatus.COMPLETED
          ? (existing?.startedAt ?? now)
          : (existing?.startedAt ?? null),
      readyAt:
        status === KitchenOrderStatus.READY || status === KitchenOrderStatus.COMPLETED
          ? (existing?.readyAt ?? now)
          : (existing?.readyAt ?? null),
    };
  }

  private async assertKitchen(tx: Prisma.TransactionClient, id: string) {
    const row = await tx.kitchen.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
    if (!row) throw new NotFoundAppException();
  }

  private async assertOrder(tx: Prisma.TransactionClient, id: string) {
    const row = await tx.order.findFirst({ where: { id }, select: { id: true } });
    if (!row) throw new NotFoundAppException();
  }

  private async assertLine(tx: Prisma.TransactionClient, input: UpsertKitchenOrderItemDto) {
    const kitchenOrder = await tx.kitchenOrder.findFirst({ where: { id: input.kitchenOrderId }, select: { kitchenId: true, orderId: true } });
    if (!kitchenOrder) throw new NotFoundAppException();
    const station = await tx.kitchenStation.findFirst({
      where: { id: input.stationId, kitchenId: kitchenOrder.kitchenId, deletedAt: null },
      select: { id: true },
    });
    const item = await tx.orderItem.findFirst({
      where: { id: input.orderItemId, orderId: kitchenOrder.orderId },
      select: { id: true },
    });
    if (!station || !item) throw new BadRequestAppException();
    if (new Prisma.Decimal(input.quantity).isZero()) throw new BadRequestAppException();
  }

  private async assertTicket(tx: Prisma.TransactionClient, kitchenOrderId: string, stationId: string) {
    const kitchenOrder = await tx.kitchenOrder.findFirst({ where: { id: kitchenOrderId }, select: { kitchenId: true } });
    if (!kitchenOrder) throw new NotFoundAppException();
    const station = await tx.kitchenStation.findFirst({
      where: { id: stationId, kitchenId: kitchenOrder.kitchenId, deletedAt: null },
      select: { id: true },
    });
    if (!station) throw new BadRequestAppException();
  }
}

function rethrowConflict(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    throw new ConflictAppException();
  }
  throw error;
}
