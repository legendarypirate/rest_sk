import { Injectable } from '@nestjs/common';
import { ActorType, AuditAction, type Prisma } from '@generated/prisma/client';

import { PrismaService } from '@/prisma/prisma.service';
import type { AuthRequestContext } from '@/iam/auth-request.context';
import type { AuthenticatedUser } from '@/iam/auth.types';
import { hashAuditRecord } from './audit.hash';

export type AuditDb = PrismaService | Prisma.TransactionClient;

export type AuditRecordInput = {
  actor: AuthenticatedUser;
  context: AuthRequestContext;
  action: AuditAction;
  resourceType: string;
  resourceId?: string | null;
  targetUserId?: string | null;
  before?: Prisma.InputJsonValue | null;
  after?: Prisma.InputJsonValue | null;
  metadata?: Prisma.InputJsonValue;
};

@Injectable()
export class AuditCommandService {
  constructor(private readonly prisma: PrismaService) {}

  async record(db: AuditDb, input: AuditRecordInput): Promise<void> {
    if (db === this.prisma) {
      await this.prisma.$transaction((tx) => this.write(tx, input));
      return;
    }

    await this.write(db, input);
  }

  private async write(db: AuditDb, input: AuditRecordInput): Promise<void> {
    await db.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'audit:chain'}))`;

    const createdAt = new Date();
    const previous = await db.auditLog.findFirst({
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: { recordHash: true },
    });

    const previousHash = previous?.recordHash ?? null;
    const metadata = input.metadata ?? {};
    const before = input.before ?? null;
    const after = input.after ?? null;
    const actorType = input.actor.impersonatedById
      ? ActorType.IMPERSONATOR
      : ActorType.USER;

    const recordHash = hashAuditRecord({
      previousHash,
      actorType,
      actorUserId: input.actor.id,
      actorTokenId: input.actor.accessTokenId,
      impersonatorUserId: input.actor.impersonatedById,
      targetUserId: input.targetUserId ?? null,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId ?? null,
      before: before as Prisma.JsonValue | null,
      after: after as Prisma.JsonValue | null,
      metadata: metadata as Prisma.JsonValue,
      ipAddress: input.context.ipAddress ?? null,
      userAgent: input.context.userAgent ?? null,
      requestId: input.context.requestId ?? null,
      correlationId: null,
      createdAt: createdAt.toISOString(),
    });

    await db.auditLog.create({
      data: {
        actorType,
        actorUserId: input.actor.id,
        actorTokenId: input.actor.accessTokenId,
        impersonatorUserId: input.actor.impersonatedById,
        targetUserId: input.targetUserId ?? null,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId ?? null,
        before: before ?? undefined,
        after: after ?? undefined,
        metadata,
        ipAddress: input.context.ipAddress,
        userAgent: input.context.userAgent,
        requestId: input.context.requestId,
        previousHash,
        recordHash,
        createdAt,
      },
    });
  }
}
