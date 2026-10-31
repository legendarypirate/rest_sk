import type { AuditAction } from '@packages/types';

export type ListAuditQueryDto = {
  page: number;
  limit: number;
  action?: AuditAction;
  resourceType?: string;
  resourceId?: string;
  requestId?: string;
  from?: string;
  to?: string;
  sortDirection?: 'asc' | 'desc';
};
