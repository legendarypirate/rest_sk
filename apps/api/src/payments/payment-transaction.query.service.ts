import { Injectable } from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';
import type { PaymentEventItem, PaymentTransactionItem } from '@packages/types';

import { NotFoundAppException } from '@/common/exceptions';
import { toIso } from '@/common/utils/date';
import { paginated, resolvePagination } from '@/common/utils/pagination';
import { PrismaService } from '@/prisma/prisma.service';

import type { ListPaymentEventsQueryDto, ListPaymentTransactionsQueryDto } from './dto/transaction.dto';

function toTransaction(row: {
  id: string;
  publicId: string;
  orderId: string;
  method: PaymentTransactionItem['method'];
  payerRole: PaymentTransactionItem['payerRole'];
  status: PaymentTransactionItem['status'];
  currency: string;
  amount: { toFixed: (digits: number) => string };
  idempotencyKey: string;
  providerTransactionId: string | null;
  failureCode: string | null;
  failureMessage: string | null;
  authorizedAt: Date | null;
  capturedAt: Date | null;
  failedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): PaymentTransactionItem {
  return {
    id: row.id,
    publicId: row.publicId,
    orderId: row.orderId,
    method: row.method,
    payerRole: row.payerRole,
    status: row.status,
    currency: row.currency,
    amount: row.amount.toFixed(2),
    idempotencyKey: row.idempotencyKey,
    providerTransactionId: row.providerTransactionId,
    failureCode: row.failureCode,
    failureMessage: row.failureMessage,
    authorizedAt: toIso(row.authorizedAt),
    capturedAt: toIso(row.capturedAt),
    failedAt: toIso(row.failedAt),
    cancelledAt: toIso(row.cancelledAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toEvent(row: {
  id: string;
  transactionId: string;
  source: string;
  providerEventId: string;
  eventType: string;
  status: PaymentEventItem['status'];
  processedAt: Date | null;
  createdAt: Date;
}): PaymentEventItem {
  return {
    id: row.id,
    transactionId: row.transactionId,
    source: row.source,
    providerEventId: row.providerEventId,
    eventType: row.eventType,
    status: row.status,
    processedAt: toIso(row.processedAt),
    createdAt: row.createdAt.toISOString(),
  };
}

@Injectable()
export class PaymentTransactionQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async listTransactions(query: ListPaymentTransactionsQueryDto) {
    const { page, limit, skip, take } = resolvePagination(query.page, query.limit);
    const where: Prisma.PaymentTransactionWhereInput = {
      ...(query.orderId ? { orderId: query.orderId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.method ? { method: query.method } : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.paymentTransaction.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
      this.prisma.paymentTransaction.count({ where }),
    ]);
    return paginated(rows.map(toTransaction), total, page, limit);
  }

  async getTransaction(id: string) {
    const row = await this.prisma.paymentTransaction.findFirst({ where: { id } });
    if (!row) throw new NotFoundAppException();
    return toTransaction(row);
  }

  async listEvents(query: ListPaymentEventsQueryDto) {
    const { page, limit, skip, take } = resolvePagination(query.page, query.limit);
    const where: Prisma.PaymentEventWhereInput = query.transactionId ? { transactionId: query.transactionId } : {};
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.paymentEvent.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
      this.prisma.paymentEvent.count({ where }),
    ]);
    return paginated(rows.map(toEvent), total, page, limit);
  }

  async getEvent(id: string) {
    const row = await this.prisma.paymentEvent.findFirst({ where: { id } });
    if (!row) throw new NotFoundAppException();
    return toEvent(row);
  }
}
