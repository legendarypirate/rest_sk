import type {
  Paginated,
  Permission,
  RoleDetail,
  RoleListItem,
} from '@packages/types';

import { api } from '@/lib/api';
import { toSearchParams } from '@/lib/search-params';
import type {
  CreateRoleDto,
  ListPermissionsQueryDto,
  ListRolesQueryDto,
  ReplaceRolePermissionsDto,
  UpdateRoleDto,
} from '@/types/iam/role.dto';

export function listRoles(params: ListRolesQueryDto) {
  return api<Paginated<RoleListItem>>(
    `auth/roles?${toSearchParams({
      page: params.page,
      limit: params.limit,
      search: params.search,
      scope: params.scope,
      isSystem: params.isSystem,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
      includeDeleted: params.includeDeleted || undefined,
    })}`,
  );
}

export function listRolesPicker() {
  return listRoles({
    page: 1,
    limit: '*',
    sortBy: 'name',
    sortDirection: 'asc',
  });
}

export function getRole(id: string) {
  return api<RoleDetail>(`auth/roles/${id}`);
}

export function createRole(dto: CreateRoleDto) {
  return api<RoleDetail>('auth/roles', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export function updateRole(id: string, dto: UpdateRoleDto) {
  return api<RoleDetail>(`auth/roles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  });
}

export function deleteRole(id: string) {
  return api<void>(`auth/roles/${id}`, {
    method: 'DELETE',
  });
}

export function listPermissionCatalog(
  params: ListPermissionsQueryDto = { page: 1, limit: '*' },
) {
  return api<Paginated<Permission>>(
    `auth/roles/permission-catalog?${toSearchParams({
      page: params.page,
      limit: params.limit,
      search: params.search,
      scope: params.scope,
      resource: params.resource,
    })}`,
  );
}

export function replaceRolePermissions(
  id: string,
  dto: ReplaceRolePermissionsDto,
) {
  return api<unknown>(`auth/roles/${id}/permissions`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  });
}
