export type ActorType =
  | 'USER'
  | 'SYSTEM'
  | 'API_KEY'
  | 'SERVICE_ACCOUNT'
  | 'IMPERSONATOR'
  | 'ANONYMOUS';

export type AuditAction =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'EXPORT'
  | 'INVITE'
  | 'REVOKE'
  | 'IMPERSONATE'
  | 'PERMISSION_GRANT'
  | 'PERMISSION_REVOKE';

export type AuditActorSummary = {
  id: string;
  email: string | null;
  username: string | null;
  displayName: string | null;
} | null;

export type AuditListItem = {
  id: string;
  actorType: ActorType;
  actorUserId: string | null;
  actor: AuditActorSummary;
  impersonatorUserId: string | null;
  targetUserId: string | null;
  target: AuditActorSummary;
  action: AuditAction;
  resourceType: string;
  resourceId: string | null;
  ipAddress: string | null;
  requestId: string | null;
  createdAt: string;
};

export type AuditDetail = AuditListItem & {
  actorTokenId: string | null;
  before: unknown;
  after: unknown;
  metadata: unknown;
  userAgent: string | null;
  correlationId: string | null;
  previousHash: string | null;
  recordHash: string;
};

export type AuditVerifyResult = {
  id: string;
  valid: boolean;
  recordHash: string;
  expectedHash: string;
  previousHash: string | null;
  previousExists: boolean;
};
