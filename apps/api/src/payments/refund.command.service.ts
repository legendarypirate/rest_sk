import { Injectable } from '@nestjs/common';
import { AuditAction, Prisma, RefundStatus } from '@generated/prisma/client';

import { AuditCommandService } from '@/audit';
import { BadRequestAppException, ConflictAppException, NotFoundAppException } from '@/common/exceptions';
import type { AuthRequestContext } from '@/iam/auth-request.context';
import type { AuthenticatedUser } from '@/iam/auth.types';
import { PrismaService } from '@/prisma/prisma.service';

import type { UpsertRefundDto } from './dto/refund.dto';
import { RefundQueryService } from '@/payments/refund.query.service';

@Injectable()
export class RefundCommandService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queries: RefundQueryService,
    private readonly audit: AuditCommandService,
  ) {}

  async create(actor: AuthenticatedUser, input: UpsertRefundDto, context: AuthRequestContext) {
    const status = input.status ?? RefundStatus.PENDING;
    const amount = new Prisma.Decimal(input.amount);
    const id = await this.prisma
      .$transaction(async (tx) => {
        await this.assertAmount(tx, input, amount, null);
        const row = await tx.refund.create({
          data: {
            ...this.data(input, status, amount),
            createdByUserId: actor.id,
            refundedAt: this.refundedAt(status, null),
          },
        });
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.CREATE,
          resourceType: 'refund',
          resourceId: row.id,
          after: { orderId: row.orderId, amount: input.amount, status },
        });
        return row.id;
      })
      .catch(rethrowConflict);
    return this.queries.getById(id);
  }

  async update(actor: AuthenticatedUser, id: string, input: UpsertRefundDto, context: AuthRequestContext) {
    const amount = new Prisma.Decimal(input.amount);
    await this.prisma
      .$transaction(async (tx) => {
        const existing = await tx.refund.findFirst({ where: { id } });
        if (!existing) throw new NotFoundAppException();
        const status = input.status ?? existing.status;
        await this.assertAmount(tx, input, amount, id);
        await tx.refund.update({
          where: { id },
          data: {
            ...this.data(input, status, amount, existing.currency),
            refundedAt: this.refundedAt(status, existing.refundedAt),
            rowVersion: { increment: 1 },
          },
        });
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.UPDATE,
          resourceType: 'refund',
          resourceId: id,
          after: { orderId: input.orderId, amount: input.amount, status },
        });
      })
      .catch(rethrowConflict);
    return this.queries.getById(id);
  }

  async remove(actor: AuthenticatedUser, id: string, context: AuthRequestContext) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.refund.findFirst({ where: { id } });
      if (!existing) throw new NotFoundAppException();
      await tx.refund.delete({ where: { id } });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.DELETE,
        resourceType: 'refund',
        resourceId: id,
        before: { orderId: existing.orderId, amount: existing.amount.toFixed(2) },
      });
    });
  }

  private data(input: UpsertRefundDto, status: RefundStatus, amount: Prisma.Decimal, currency = 'MNT') {
    return {
      orderId: input.orderId,
      transactionId: input.transactionId,
      status,
      currency: input.currency ?? currency,
      amount,
      reason: input.reason,
      idempotencyKey: input.idempotencyKey,
      providerRefundId: input.providerRefundId,
    };
  }

  private refundedAt(status: RefundStatus, existing: Date | null) {
    if (status === RefundStatus.SUCCEEDED) return existing ?? new Date();
    if (status === RefundStatus.CANCELLED) return null;
    return existing;
  }

  private async assertAmount(tx: Prisma.TransactionClient, input: UpsertRefundDto, amount: Prisma.Decimal, exceptId: string | null) {
    if (amount.isZero() || amount.isNeg()) throw new BadRequestAppException();
    const order = await tx.order.findFirst({ where: { id: input.orderId }, select: { id: true } });
    if (!order) throw new NotFoundAppException();
    const transaction = await tx.paymentTransaction.findFirst({ where: { id: input.transactionId } });
    if (!transaction) throw new NotFoundAppException();
    if (transaction.orderId !== input.orderId) throw new BadRequestAppException();
    const others = await tx.refund.findMany({
      where: {
        transactionId: input.transactionId,
        status: { in: [RefundStatus.PENDING, RefundStatus.SUCCEEDED] },
        ...(exceptId ? { id: { not: exceptId } } : {}),
      },
      select: { amount: true },
    });
    const used = others.reduce((sum, row) => sum.plus(row.amount), new Prisma.Decimal(0));
    if (used.plus(amount).greaterThan(transaction.amount)) throw new BadRequestAppException();
  }
}

function rethrowConflict(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    throw new ConflictAppException();
  }
  throw error;
}
