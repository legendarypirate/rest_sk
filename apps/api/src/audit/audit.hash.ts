import { createHash } from 'node:crypto';
import type { Prisma } from '@generated/prisma/client';

export type AuditHashPayload = {
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
  createdAt: string;
};

export function hashAuditRecord(payload: AuditHashPayload): string {
  return createHash('sha256').update(stableJson(payload)).digest('hex');
}

function stableJson(value: unknown): string {
  if (value === undefined || value === null) {
    return 'null';
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return JSON.stringify(value);
  }

  if (typeof value === 'string') {
    return JSON.stringify(value);
  }

  if (value instanceof Date) {
    return JSON.stringify(value.toISOString());
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableJson(item)).join(',')}]`;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(
      ([left], [right]) => left.localeCompare(right),
    );
    return `{${entries
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
      .join(',')}}`;
  }

  return JSON.stringify(String(value));
}
