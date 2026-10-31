import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuditAction, PaymentEventStatus, PaymentMethodKind, PaymentStatus, Prisma } from '@generated/prisma/client';

import { AuditCommandService } from '@/audit';
import { BadRequestAppException, ConflictAppException, NotFoundAppException } from '@/common/exceptions';
import type { AuthRequestContext } from '@/iam/auth-request.context';
import type { AuthenticatedUser } from '@/iam/auth.types';
import { PrismaService } from '@/prisma/prisma.service';

import type { UpsertPaymentEventDto, UpsertPaymentTransactionDto } from './dto/transaction.dto';
import { PaymentTransactionQueryService } from '@/payments/payment-transaction.query.service';

@Injectable()
export class PaymentTransactionCommandService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queries: PaymentTransactionQueryService,
    private readonly audit: AuditCommandService,
    private readonly config: ConfigService,
  ) {}

  async createTransaction(actor: AuthenticatedUser, input: UpsertPaymentTransactionDto, context: AuthRequestContext) {
    this.assertAllowedMethod(input.method);
    const status = input.status ?? PaymentStatus.PENDING;
    const id = await this.prisma
      .$transaction(async (tx) => {
        await this.assertOrder(tx, input.orderId);
        const row = await tx.paymentTransaction.create({
          data: {
            ...this.transactionData(input, status),
            ...this.statusTimes(status, null),
          },
        });
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.CREATE,
          resourceType: 'payment_transaction',
          resourceId: row.id,
          after: { orderId: row.orderId, method: row.method, amount: input.amount, status },
        });
        return row.id;
      })
      .catch(rethrowConflict);
    return this.queries.getTransaction(id);
  }

  async updateTransaction(
    actor: AuthenticatedUser,
    id: string,
    input: UpsertPaymentTransactionDto,
    context: AuthRequestContext,
  ) {
    this.assertAllowedMethod(input.method);
    await this.prisma
      .$transaction(async (tx) => {
        const existing = await tx.paymentTransaction.findFirst({ where: { id } });
        if (!existing) throw new NotFoundAppException();
        await this.assertOrder(tx, input.orderId);
        const status = input.status ?? existing.status;
        await tx.paymentTransaction.update({
          where: { id },
          data: {
            ...this.transactionData(input, status, existing.currency),
            ...this.statusTimes(status, existing),
            rowVersion: { increment: 1 },
          },
        });
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.UPDATE,
          resourceType: 'payment_transaction',
          resourceId: id,
          after: { orderId: input.orderId, method: input.method, amount: input.amount, status },
        });
      })
      .catch(rethrowConflict);
    return this.queries.getTransaction(id);
  }

  async removeTransaction(actor: AuthenticatedUser, id: string, context: AuthRequestContext) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.paymentTransaction.findFirst({ where: { id } });
      if (!existing) throw new NotFoundAppException();
      const events = await tx.paymentEvent.count({ where: { transactionId: id } });
      const refunds = await tx.refund.count({ where: { transactionId: id } });
      if (events > 0 || refunds > 0) throw new BadRequestAppException();
      await tx.paymentTransaction.delete({ where: { id } });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.DELETE,
        resourceType: 'payment_transaction',
        resourceId: id,
        before: { orderId: existing.orderId, amount: existing.amount.toFixed(2) },
      });
    });
  }

  async createEvent(actor: AuthenticatedUser, input: UpsertPaymentEventDto, context: AuthRequestContext) {
    const id = await this.prisma
      .$transaction(async (tx) => {
        await this.assertTransaction(tx, input.transactionId);
        const row = await tx.paymentEvent.create({
          data: {
            transactionId: input.transactionId,
            source: input.source ?? 'QPAY',
            providerEventId: input.providerEventId,
            eventType: input.eventType,
            status: input.status ?? PaymentEventStatus.RECEIVED,
            payload: (input.payload ?? {}) as Prisma.InputJsonValue,
            processedAt: input.processedAt ? new Date(input.processedAt) : null,
          },
        });
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.CREATE,
          resourceType: 'payment_event',
          resourceId: row.id,
          after: { transactionId: row.transactionId, eventType: row.eventType },
        });
        return row.id;
      })
      .catch(rethrowConflict);
    return this.queries.getEvent(id);
  }

  async updateEvent(actor: AuthenticatedUser, id: string, input: UpsertPaymentEventDto, context: AuthRequestContext) {
    await this.prisma
      .$transaction(async (tx) => {
        const existing = await tx.paymentEvent.findFirst({ where: { id } });
        if (!existing) throw new NotFoundAppException();
        await this.assertTransaction(tx, input.transactionId);
        await tx.paymentEvent.update({
          where: { id },
          data: {
            transactionId: input.transactionId,
            source: input.source ?? existing.source,
            providerEventId: input.providerEventId,
            eventType: input.eventType,
            status: input.status ?? existing.status,
            payload: (input.payload ?? existing.payload) as Prisma.InputJsonValue,
            processedAt: input.processedAt ? new Date(input.processedAt) : null,
          },
        });
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.UPDATE,
          resourceType: 'payment_event',
          resourceId: id,
          after: { transactionId: input.transactionId, eventType: input.eventType },
        });
      })
      .catch(rethrowConflict);
    return this.queries.getEvent(id);
  }

  async removeEvent(actor: AuthenticatedUser, id: string, context: AuthRequestContext) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.paymentEvent.findFirst({ where: { id } });
      if (!existing) throw new NotFoundAppException();
      await tx.paymentEvent.delete({ where: { id } });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.DELETE,
        resourceType: 'payment_event',
        resourceId: id,
        before: { transactionId: existing.transactionId, providerEventId: existing.providerEventId },
      });
    });
  }

  private transactionData(input: UpsertPaymentTransactionDto, status: PaymentStatus, currency = 'MNT') {
    return {
      orderId: input.orderId,
      method: input.method,
      payerRole: input.payerRole,
      status,
      currency: input.currency ?? currency,
      amount: new Prisma.Decimal(input.amount),
      idempotencyKey: input.idempotencyKey,
      providerTransactionId: input.providerTransactionId,
      failureCode: input.failureCode,
      failureMessage: input.failureMessage,
    };
  }

  private statusTimes(
    status: PaymentStatus,
    existing: { authorizedAt: Date | null; capturedAt: Date | null; failedAt: Date | null; cancelledAt: Date | null } | null,
  ) {
    const now = new Date();
    return {
      authorizedAt:
        status === PaymentStatus.AUTHORIZED || status === PaymentStatus.CAPTURED
          ? (existing?.authorizedAt ?? now)
          : (existing?.authorizedAt ?? null),
      capturedAt: status === PaymentStatus.CAPTURED ? (existing?.capturedAt ?? now) : (existing?.capturedAt ?? null),
      failedAt: status === PaymentStatus.FAILED ? (existing?.failedAt ?? now) : (existing?.failedAt ?? null),
      cancelledAt: status === PaymentStatus.CANCELLED ? (existing?.cancelledAt ?? now) : null,
    };
  }

  private assertAllowedMethod(method: PaymentMethodKind) {
    const methods = this.config.get<string[]>('payment.methods') ?? ['QPAY', 'CARD'];
    if (!methods.includes(method)) {
      throw new BadRequestAppException();
    }
  }

  private async assertOrder(tx: Prisma.TransactionClient, id: string) {
    const row = await tx.order.findFirst({ where: { id }, select: { id: true } });
    if (!row) throw new NotFoundAppException();
  }

  private async assertTransaction(tx: Prisma.TransactionClient, id: string) {
    const row = await tx.paymentTransaction.findFirst({ where: { id }, select: { id: true } });
    if (!row) throw new NotFoundAppException();
  }
}

function rethrowConflict(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    throw new ConflictAppException();
  }
  throw error;
}
