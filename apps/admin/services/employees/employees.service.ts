import type { EmployeeListItem, EmployeeSyncAllResult, Paginated } from '@packages/types';

import { api } from '@/lib/api';
import { toSearchParams } from '@/lib/search-params';
import { syncAllIntegrationEmployees } from '@/services/integrations/integrations.service';
import type {
  ListEmployeesQueryDto,
  UpdateEmployeeStatusDto,
} from '@/types/employees/employee.dto';

export function listEmployees(params: ListEmployeesQueryDto = {}) {
  return api<Paginated<EmployeeListItem>>(
    `employees?${toSearchParams({
      page: params.page,
      limit: params.limit,
      search: params.search,
      status: params.status,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
    })}`,
  );
}

export function syncEmployees(): Promise<EmployeeSyncAllResult> {
  return syncAllIntegrationEmployees();
}

export function updateEmployeeStatus(id: string, dto: UpdateEmployeeStatusDto) {
  return api<EmployeeListItem>(`employees/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  });
}
