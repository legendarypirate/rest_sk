'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';

import { listResources } from '@/services/iam/resources.service';
import { getRole, listPermissionCatalog } from '@/services/iam/roles.service';

import {
  applyMatrixSelection,
  buildPermissionMatrix,
  filterMatrix,
  type MatrixFilters,
} from '../lib/matrix';
import { permissionsChanged } from './schema';
import { rolesQueryKey } from './use.roles';

export const defaultRoleResourcesFilters: MatrixFilters = {
  search: '',
  groupKey: '',
  grantedOnly: false,
};

export function useRoleResources(roleId: string) {
  const [draft, setDraft] = useState<MatrixFilters>(defaultRoleResourcesFilters);
  const [applied, setApplied] = useState<MatrixFilters>(
    defaultRoleResourcesFilters,
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [baselineIds, setBaselineIds] = useState<string[]>([]);
  const [syncedRoleId, setSyncedRoleId] = useState<string | null>(null);

  const roleQuery = useQuery({
    queryKey: [...rolesQueryKey, 'detail', roleId],
    queryFn: () => getRole(roleId),
    enabled: Boolean(roleId),
  });

  const catalogQuery = useQuery({
    queryKey: [...rolesQueryKey, 'permission-catalog'],
    queryFn: () => listPermissionCatalog({ page: 1, limit: '*' }),
    placeholderData: keepPreviousData,
  });

  const resourcesQuery = useQuery({
    queryKey: ['iam', 'resources', 'matrix'],
    queryFn: () =>
      listResources({
        page: 1,
        limit: '*',
        sortBy: 'sortOrder',
        sortDirection: 'asc',
      }),
    retry: false,
  });

  const grantedIds = useMemo(
    () => roleQuery.data?.permissions.map((permission) => permission.id) ?? [],
    [roleQuery.data],
  );

  useEffect(() => {
    if (!roleQuery.data || syncedRoleId === roleQuery.data.id) {
      return;
    }

    setSelectedIds(grantedIds);
    setBaselineIds(grantedIds);
    setSyncedRoleId(roleQuery.data.id);
  }, [grantedIds, roleQuery.data, syncedRoleId]);

  const matrix = useMemo(
    () =>
      buildPermissionMatrix(
        catalogQuery.data?.items ?? [],
        resourcesQuery.data?.items ?? [],
      ),
    [catalogQuery.data?.items, resourcesQuery.data?.items],
  );
  const matrixRef = useRef(matrix);
  matrixRef.current = matrix;

  const visible = useMemo(
    () => filterMatrix(matrix, applied, selectedIds),
    [applied, matrix, selectedIds],
  );

  const groupOptions = matrix.groups.map((group) => ({
    value: group.key,
    label: group.label,
  }));

  const dirty = permissionsChanged(baselineIds, selectedIds);
  const hasActiveFilters =
    applied.search !== '' ||
    applied.groupKey !== '' ||
    applied.grantedOnly;

  function applyFilters() {
    setApplied(draft);
  }

  function clearFilters() {
    setDraft(defaultRoleResourcesFilters);
    setApplied(defaultRoleResourcesFilters);
  }

  function reset() {
    setSelectedIds(baselineIds);
  }

  function markSaved() {
    setBaselineIds(selectedIds);
  }

  function setPermission(id: string, checked: boolean) {
    setSelectedIds((current) =>
      applyMatrixSelection(matrixRef.current, current, [id], checked),
    );
  }

  function setPermissions(ids: string[], checked: boolean) {
    setSelectedIds((current) =>
      applyMatrixSelection(matrixRef.current, current, ids, checked),
    );
  }

  return {
    roleQuery,
    catalogQuery,
    role: roleQuery.data,
    draft,
    setDraft,
    applied,
    visible,
    matrix,
    groupOptions,
    selectedIds,
    grantedIds,
    dirty,
    hasActiveFilters,
    applyFilters,
    clearFilters,
    reset,
    markSaved,
    setPermission,
    setPermissions,
  };
}
