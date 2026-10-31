import { Injectable } from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';
import type { KitchenOrderLineItem, KitchenOrderRecord, KitchenTicketItem } from '@packages/types';

import { NotFoundAppException } from '@/common/exceptions';
import { toIso } from '@/common/utils/date';
import { paginated, resolvePagination } from '@/common/utils/pagination';
import { PrismaService } from '@/prisma/prisma.service';

import type {
  ListKitchenOrderItemsQueryDto,
  ListKitchenOrdersQueryDto,
  ListKitchenTicketsQueryDto,
} from './dto/kitchen-order.dto';

const orderInclude = { kitchen: { select: { name: true } }, order: { select: { orderNumber: true } } } as const;
const lineInclude = { station: { select: { name: true } } } as const;

function qty(value: { toFixed: (digits: number) => string }) {
  return value.toFixed(3);
}

@Injectable()
export class KitchenOrderQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async listOrders(query: ListKitchenOrdersQueryDto) {
    const { page, limit, skip, take } = resolvePagination(query.page, query.limit);
    const where: Prisma.KitchenOrderWhereInput = {
      ...(query.kitchenId ? { kitchenId: query.kitchenId } : {}),
      ...(query.orderId ? { orderId: query.orderId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.kitchenOrder.findMany({ where, include: orderInclude, orderBy: { createdAt: 'desc' }, skip, take }),
      this.prisma.kitchenOrder.count({ where }),
    ]);
    return paginated(rows.map(toOrder), total, page, limit);
  }

  async getOrder(id: string) {
    const row = await this.prisma.kitchenOrder.findFirst({ where: { id }, include: orderInclude });
    if (!row) throw new NotFoundAppException();
    return toOrder(row);
  }

  async listItems(query: ListKitchenOrderItemsQueryDto) {
    const { page, limit, skip, take } = resolvePagination(query.page, query.limit);
    const where: Prisma.KitchenOrderItemWhereInput = {
      ...(query.kitchenOrderId ? { kitchenOrderId: query.kitchenOrderId } : {}),
      ...(query.stationId ? { stationId: query.stationId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.kitchenOrderItem.findMany({ where, include: lineInclude, orderBy: { createdAt: 'asc' }, skip, take }),
      this.prisma.kitchenOrderItem.count({ where }),
    ]);
    return paginated(rows.map(toLine), total, page, limit);
  }

  async getItem(id: string) {
    const row = await this.prisma.kitchenOrderItem.findFirst({ where: { id }, include: lineInclude });
    if (!row) throw new NotFoundAppException();
    return toLine(row);
  }

  async listTickets(query: ListKitchenTicketsQueryDto) {
    const { page, limit, skip, take } = resolvePagination(query.page, query.limit);
    const where: Prisma.KitchenTicketWhereInput = {
      ...(query.kitchenOrderId ? { kitchenOrderId: query.kitchenOrderId } : {}),
      ...(query.stationId ? { stationId: query.stationId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.kitchenTicket.findMany({ where, include: lineInclude, orderBy: { createdAt: 'desc' }, skip, take }),
      this.prisma.kitchenTicket.count({ where }),
    ]);
    return paginated(rows.map(toTicket), total, page, limit);
  }

  async getTicket(id: string) {
    const row = await this.prisma.kitchenTicket.findFirst({ where: { id }, include: lineInclude });
    if (!row) throw new NotFoundAppException();
    return toTicket(row);
  }
}

function toOrder(row: {
  id: string;
  kitchenId: string;
  orderId: string;
  status: KitchenOrderRecord['status'];
  priority: number;
  receivedAt: Date | null;
  startedAt: Date | null;
  readyAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  kitchen: { name: string };
  order: { orderNumber: string };
}): KitchenOrderRecord {
  return {
    id: row.id,
    kitchenId: row.kitchenId,
    kitchenName: row.kitchen.name,
    orderId: row.orderId,
    orderNumber: row.order.orderNumber,
    status: row.status,
    priority: row.priority,
    receivedAt: toIso(row.receivedAt),
    startedAt: toIso(row.startedAt),
    readyAt: toIso(row.readyAt),
    completedAt: toIso(row.completedAt),
    cancelledAt: toIso(row.cancelledAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toLine(row: {
  id: string;
  kitchenOrderId: string;
  orderItemId: string;
  stationId: string;
  status: KitchenOrderLineItem['status'];
  quantity: { toFixed: (digits: number) => string };
  startedAt: Date | null;
  readyAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  station: { name: string };
}): KitchenOrderLineItem {
  return {
    id: row.id,
    kitchenOrderId: row.kitchenOrderId,
    orderItemId: row.orderItemId,
    stationId: row.stationId,
    stationName: row.station.name,
    status: row.status,
    quantity: qty(row.quantity),
    startedAt: toIso(row.startedAt),
    readyAt: toIso(row.readyAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toTicket(row: {
  id: string;
  kitchenOrderId: string;
  stationId: string;
  ticketNumber: string;
  status: KitchenTicketItem['status'];
  priority: number;
  printedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  station: { name: string };
}): KitchenTicketItem {
  return {
    id: row.id,
    kitchenOrderId: row.kitchenOrderId,
    stationId: row.stationId,
    stationName: row.station.name,
    ticketNumber: row.ticketNumber,
    status: row.status,
    priority: row.priority,
    printedAt: toIso(row.printedAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
