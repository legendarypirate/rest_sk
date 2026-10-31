import { Injectable } from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';
import type { RefundItem } from '@packages/types';

import { NotFoundAppException } from '@/common/exceptions';
import { toIso } from '@/common/utils/date';
import { paginated, resolvePagination } from '@/common/utils/pagination';
import { PrismaService } from '@/prisma/prisma.service';

import type { ListRefundsQueryDto } from './dto/refund.dto';

function toRefund(row: {
  id: string;
  publicId: string;
  orderId: string;
  transactionId: string;
  createdByUserId: string | null;
  status: RefundItem['status'];
  currency: string;
  amount: { toFixed: (digits: number) => string };
  reason: string | null;
  idempotencyKey: string;
  providerRefundId: string | null;
  refundedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): RefundItem {
  return {
    id: row.id,
    publicId: row.publicId,
    orderId: row.orderId,
    transactionId: row.transactionId,
    createdByUserId: row.createdByUserId,
    status: row.status,
    currency: row.currency,
    amount: row.amount.toFixed(2),
    reason: row.reason,
    idempotencyKey: row.idempotencyKey,
    providerRefundId: row.providerRefundId,
    refundedAt: toIso(row.refundedAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

@Injectable()
export class RefundQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListRefundsQueryDto) {
    const { page, limit, skip, take } = resolvePagination(query.page, query.limit);
    const where: Prisma.RefundWhereInput = {
      ...(query.orderId ? { orderId: query.orderId } : {}),
      ...(query.transactionId ? { transactionId: query.transactionId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.refund.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
      this.prisma.refund.count({ where }),
    ]);
    return paginated(rows.map(toRefund), total, page, limit);
  }

  async getById(id: string) {
    const row = await this.prisma.refund.findFirst({ where: { id } });
    if (!row) throw new NotFoundAppException();
    return toRefund(row);
  }
}
