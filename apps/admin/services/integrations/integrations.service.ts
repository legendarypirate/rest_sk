import type {
  EmployeeSyncAllResult,
  EmployeeSyncResult,
  IntegrationDetail,
  Paginated,
} from '@packages/types';

import { api } from '@/lib/api';
import { toSearchParams } from '@/lib/search-params';
import type {
  ListIntegrationsQueryDto,
  UpsertIntegrationDto,
} from '@/types/integrations/integration.dto';

export function listIntegrations(params: ListIntegrationsQueryDto = {}) {
  return api<Paginated<IntegrationDetail>>(
    `integrations?${toSearchParams({
      page: params.page,
      limit: params.limit,
      search: params.search,
      sortDirection: params.sortDirection,
    })}`,
  );
}

export function createIntegration(dto: UpsertIntegrationDto) {
  return api<IntegrationDetail>('integrations', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export function updateIntegration(id: string, dto: UpsertIntegrationDto) {
  return api<IntegrationDetail>(`integrations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  });
}

export function deleteIntegration(id: string) {
  return api<void>(`integrations/${id}`, { method: 'DELETE' });
}

export function syncIntegrationEmployees(id: string) {
  return api<EmployeeSyncResult>(`integrations/${id}/sync-employees`, {
    method: 'POST',
  });
}

export function syncAllIntegrationEmployees() {
  return api<EmployeeSyncAllResult>('integrations/sync-employees', {
    method: 'POST',
  });
}
