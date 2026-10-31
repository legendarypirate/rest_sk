import type { AuditLog, User } from '@generated/prisma/client';
import type {
  AuditActorSummary,
  AuditDetail,
  AuditListItem,
} from '@packages/types';

type AuditUser = Pick<User, 'id' | 'email' | 'username' | 'displayName'>;

export type AuditListRow = AuditLog & {
  actorUser: AuditUser | null;
  targetUser: AuditUser | null;
};

export const auditUserSelect = {
  id: true,
  email: true,
  username: true,
  displayName: true,
} as const;

export const auditListInclude = {
  actorUser: { select: auditUserSelect },
  targetUser: { select: auditUserSelect },
} as const;

function toActor(user: AuditUser | null): AuditActorSummary {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
  };
}

export function toAuditListItem(row: AuditListRow): AuditListItem {
  return {
    id: row.id,
    actorType: row.actorType,
    actorUserId: row.actorUserId,
    actor: toActor(row.actorUser),
    impersonatorUserId: row.impersonatorUserId,
    targetUserId: row.targetUserId,
    target: toActor(row.targetUser),
    action: row.action,
    resourceType: row.resourceType,
    resourceId: row.resourceId,
    ipAddress: row.ipAddress,
    requestId: row.requestId,
    createdAt: row.createdAt.toISOString(),
  };
}

export function toAuditDetail(row: AuditListRow): AuditDetail {
  return {
    ...toAuditListItem(row),
    actorTokenId: row.actorTokenId,
    before: row.before,
    after: row.after,
    metadata: row.metadata,
    userAgent: row.userAgent,
    correlationId: row.correlationId,
    previousHash: row.previousHash,
    recordHash: row.recordHash,
  };
}
