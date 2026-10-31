import type {
  Paginated,
  ResourceDetail,
  ResourceListItem,
  ResourceMenuGroup,
} from '@packages/types';

import { api } from '@/lib/api';
import { toSearchParams } from '@/lib/search-params';
import type {
  CreateResourceDto,
  ListResourcesQueryDto,
  UpdateResourceDto,
} from '@/types/iam/resource.dto';

export function listResources(params: ListResourcesQueryDto) {
  return api<Paginated<ResourceListItem>>(
    `auth/resources?${toSearchParams({
      page: params.page,
      limit: params.limit,
      search: params.search,
      scope: params.scope,
      isSystem: params.isSystem,
      isMenu: params.isMenu,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
      includeDeleted: params.includeDeleted || undefined,
    })}`,
  );
}

export function listResourceMenu() {
  return api<ResourceMenuGroup[]>('auth/resources/menu');
}

export function getResource(id: string) {
  return api<ResourceDetail>(`auth/resources/${id}`);
}

export function createResource(dto: CreateResourceDto) {
  return api<ResourceDetail>('auth/resources', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export function updateResource(id: string, dto: UpdateResourceDto) {
  return api<ResourceDetail>(`auth/resources/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  });
}

export function deleteResource(id: string) {
  return api<void>(`auth/resources/${id}`, {
    method: 'DELETE',
  });
}
