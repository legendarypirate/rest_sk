import { Injectable } from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';
import type {
  OrderItem,
  OrderLineItem,
  OrderStatusHistoryItem,
} from '@packages/types';

import { NotFoundAppException } from '@/common/exceptions';
import { toIso } from '@/common/utils/date';
import { paginated, resolvePagination } from '@/common/utils/pagination';
import { PrismaService } from '@/prisma/prisma.service';

import type {
  ListOrderItemsQueryDto,
  ListOrderStatusHistoryQueryDto,
  ListOrdersQueryDto,
} from './dto/order.dto';

function money(value: { toFixed: (digits: number) => string }) {
  return value.toFixed(2);
}

function qty(value: { toFixed: (digits: number) => string }) {
  return value.toFixed(3);
}

function toOrder(row: {
  id: string;
  publicId: string;
  orderNumber: string;
  channel: OrderItem['channel'];
  serviceType: OrderItem['serviceType'];
  status: OrderItem['status'];
  currency: string;
  employeeId: string | null;
  kioskDeviceId: string | null;
  kioskSessionId: string | null;
  subtotal: { toFixed: (digits: number) => string };
  discountTotal: { toFixed: (digits: number) => string };
  subsidyTotal: { toFixed: (digits: number) => string };
  grandTotal: { toFixed: (digits: number) => string };
  note: string | null;
  openedAt: Date;
  confirmedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): OrderItem {
  return {
    id: row.id,
    publicId: row.publicId,
    orderNumber: row.orderNumber,
    channel: row.channel,
    serviceType: row.serviceType,
    status: row.status,
    currency: row.currency,
    employeeId: row.employeeId,
    kioskDeviceId: row.kioskDeviceId,
    kioskSessionId: row.kioskSessionId,
    subtotal: money(row.subtotal),
    discountTotal: money(row.discountTotal),
    subsidyTotal: money(row.subsidyTotal),
    grandTotal: money(row.grandTotal),
    note: row.note,
    openedAt: row.openedAt.toISOString(),
    confirmedAt: toIso(row.confirmedAt),
    completedAt: toIso(row.completedAt),
    cancelledAt: toIso(row.cancelledAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toLine(row: {
  id: string;
  orderId: string;
  menuItemId: string | null;
  lineNumber: number;
  nameSnapshot: string;
  skuSnapshot: string;
  variantSnapshot: string | null;
  quantity: { toFixed: (digits: number) => string };
  currency: string;
  unitPrice: { toFixed: (digits: number) => string };
  discountAmount: { toFixed: (digits: number) => string };
  subsidyAmount: { toFixed: (digits: number) => string };
  lineTotal: { toFixed: (digits: number) => string };
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}): OrderLineItem {
  return {
    id: row.id,
    orderId: row.orderId,
    menuItemId: row.menuItemId,
    lineNumber: row.lineNumber,
    nameSnapshot: row.nameSnapshot,
    skuSnapshot: row.skuSnapshot,
    variantSnapshot: row.variantSnapshot,
    quantity: qty(row.quantity),
    currency: row.currency,
    unitPrice: money(row.unitPrice),
    discountAmount: money(row.discountAmount),
    subsidyAmount: money(row.subsidyAmount),
    lineTotal: money(row.lineTotal),
    note: row.note,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

@Injectable()
export class OrderQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async listOrders(query: ListOrdersQueryDto) {
    const { page, limit, skip, take } = resolvePagination(query.page, query.limit);
    const search = query.search?.trim();
    const where: Prisma.OrderWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.channel ? { channel: query.channel } : {}),
      ...(search ? { orderNumber: { contains: search, mode: 'insensitive' } } : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({ where, orderBy: { openedAt: 'desc' }, skip, take }),
      this.prisma.order.count({ where }),
    ]);
    return paginated(rows.map(toOrder), total, page, limit);
  }

  async getOrder(id: string) {
    const row = await this.prisma.order.findFirst({ where: { id } });
    if (!row) throw new NotFoundAppException();
    return toOrder(row);
  }

  async listItems(query: ListOrderItemsQueryDto) {
    const { page, limit, skip, take } = resolvePagination(query.page, query.limit);
    const where: Prisma.OrderItemWhereInput = query.orderId ? { orderId: query.orderId } : {};
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.orderItem.findMany({ where, orderBy: { lineNumber: 'asc' }, skip, take }),
      this.prisma.orderItem.count({ where }),
    ]);
    return paginated(rows.map(toLine), total, page, limit);
  }

  async getItem(id: string) {
    const row = await this.prisma.orderItem.findFirst({ where: { id } });
    if (!row) throw new NotFoundAppException();
    return toLine(row);
  }

  async listHistory(query: ListOrderStatusHistoryQueryDto) {
    const { page, limit, skip, take } = resolvePagination(query.page, query.limit);
    const where: Prisma.OrderStatusHistoryWhereInput = query.orderId ? { orderId: query.orderId } : {};
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.orderStatusHistory.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
      this.prisma.orderStatusHistory.count({ where }),
    ]);
    return paginated(
      rows.map(
        (row): OrderStatusHistoryItem => ({
          id: row.id,
          orderId: row.orderId,
          fromStatus: row.fromStatus,
          toStatus: row.toStatus,
          reason: row.reason,
          changedByUserId: row.changedByUserId,
          createdAt: row.createdAt.toISOString(),
        }),
      ),
      total,
      page,
      limit,
    );
  }

  async getHistory(id: string) {
    const row = await this.prisma.orderStatusHistory.findFirst({ where: { id } });
    if (!row) throw new NotFoundAppException();
    return {
      id: row.id,
      orderId: row.orderId,
      fromStatus: row.fromStatus,
      toStatus: row.toStatus,
      reason: row.reason,
      changedByUserId: row.changedByUserId,
      createdAt: row.createdAt.toISOString(),
    } satisfies OrderStatusHistoryItem;
  }
}
