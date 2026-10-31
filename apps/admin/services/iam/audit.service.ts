import type {
  AuditDetail,
  AuditListItem,
  AuditVerifyResult,
  Paginated,
} from '@packages/types';

import { api } from '@/lib/api';
import { toSearchParams } from '@/lib/search-params';
import type { ListAuditQueryDto } from '@/types/iam/audit.dto';

export function listAudit(params: ListAuditQueryDto) {
  return api<Paginated<AuditListItem>>(
    `audit?${toSearchParams({
      page: params.page,
      limit: params.limit,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      requestId: params.requestId,
      from: params.from,
      to: params.to,
      sortDirection: params.sortDirection,
    })}`,
  );
}

export function getAudit(id: string) {
  return api<AuditDetail>(`audit/${id}`);
}

export function verifyAudit(id: string) {
  return api<AuditVerifyResult>(`audit/${id}/verify`);
}
