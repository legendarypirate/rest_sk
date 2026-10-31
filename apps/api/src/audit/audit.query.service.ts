import { Injectable } from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';
import type {
  AuditDetail,
  AuditListItem,
  AuditVerifyResult,
  Paginated,
} from '@packages/types';

import { NotFoundAppException } from '@/common/exceptions';
import { paginated, resolvePagination } from '@/common/utils/pagination';
import { PrismaService } from '@/prisma/prisma.service';
import { hashAuditRecord, type AuditHashPayload } from './audit.hash';
import {
  auditListInclude,
  toAuditDetail,
  toAuditListItem,
  type AuditListRow,
} from './audit.mapper';
import type { ListAuditQueryDto } from './dto/audit.dto';

@Injectable()
export class AuditQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListAuditQueryDto): Promise<Paginated<AuditListItem>> {
    const { page, limit, skip, take } = resolvePagination(
      query.page,
      query.limit,
    );
    const where = this.where(query);

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        include: auditListInclude,
        orderBy: { createdAt: query.sortDirection ?? 'desc' },
        skip,
        take,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return paginated(
      (rows as AuditListRow[]).map((row) => toAuditListItem(row)),
      total,
      page,
      limit,
    );
  }

  async getById(id: string): Promise<AuditDetail> {
    const row = await this.prisma.auditLog.findFirst({
      where: { id },
      include: auditListInclude,
    });

    if (!row) {
      throw new NotFoundAppException();
    }

    return toAuditDetail(row as AuditListRow);
  }

  async verify(id: string): Promise<AuditVerifyResult> {
    const row = await this.prisma.auditLog.findFirst({ where: { id } });

    if (!row) {
      throw new NotFoundAppException();
    }

    const expectedHash = hashAuditRecord(this.payloadOf(row));
    const previousExists = row.previousHash
      ? !!(await this.prisma.auditLog.findFirst({
          where: { recordHash: row.previousHash },
          select: { id: true },
        }))
      : true;

    return {
      id: row.id,
      valid: expectedHash === row.recordHash && previousExists,
      recordHash: row.recordHash,
      expectedHash,
      previousHash: row.previousHash,
      previousExists,
    };
  }

  private where(query: ListAuditQueryDto): Prisma.AuditLogWhereInput {
    return {
      ...(query.action ? { action: query.action } : {}),
      ...(query.resourceType ? { resourceType: query.resourceType } : {}),
      ...(query.resourceId ? { resourceId: query.resourceId } : {}),
      ...(query.actorUserId ? { actorUserId: query.actorUserId } : {}),
      ...(query.targetUserId ? { targetUserId: query.targetUserId } : {}),
      ...(query.requestId ? { requestId: query.requestId } : {}),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: query.from } : {}),
              ...(query.to ? { lte: query.to } : {}),
            },
          }
        : {}),
    };
  }

  private payloadOf(row: {
    previousHash: string | null;
    actorType: string;
    actorUserId: string | null;
    actorTokenId: string | null;
    impersonatorUserId: string | null;
    targetUserId: string | null;
    action: string;
    resourceType: string;
    resourceId: string | null;
    before: Prisma.JsonValue | null;
    after: Prisma.JsonValue | null;
    metadata: Prisma.JsonValue;
    ipAddress: string | null;
    userAgent: string | null;
    requestId: string | null;
    correlationId: string | null;
    createdAt: Date;
  }): AuditHashPayload {
    return {
      previousHash: row.previousHash,
      actorType: row.actorType,
      actorUserId: row.actorUserId,
      actorTokenId: row.actorTokenId,
      impersonatorUserId: row.impersonatorUserId,
      targetUserId: row.targetUserId,
      action: row.action,
      resourceType: row.resourceType,
      resourceId: row.resourceId,
      before: row.before,
      after: row.after,
      metadata: row.metadata,
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      requestId: row.requestId,
      correlationId: row.correlationId,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
