import {
  EXTRA_RESOURCE_ACTIONS,
  STANDARD_RESOURCE_ACTIONS,
  type Permission,
  type ResourceListItem,
} from '@packages/types';

import { resourceActionLabel } from '@/lib/resource-actions';

export const ACTION_ORDER = [
  ...STANDARD_RESOURCE_ACTIONS,
  ...EXTRA_RESOURCE_ACTIONS,
] as const;

export type MatrixCell = {
  id: string;
  key: string;
  name: string;
  action: string;
  isDangerous: boolean;
};

export type MatrixRow = {
  key: string;
  slug: string;
  name: string;
  description: string | null;
  groupKey: string;
  groupLabel: string;
  groupSortOrder: number;
  sortOrder: number;
  icon: string | null;
  scope: Permission['scope'];
  cells: Record<string, MatrixCell>;
};

export type MatrixGroup = {
  key: string;
  label: string;
  rows: MatrixRow[];
};

export type PermissionMatrix = {
  actions: string[];
  groups: MatrixGroup[];
  rows: MatrixRow[];
};

export type MatrixFilters = {
  search: string;
  groupKey: string;
  grantedOnly: boolean;
};

function actionRank(action: string) {
  const index = ACTION_ORDER.indexOf(action as (typeof ACTION_ORDER)[number]);
  return index === -1 ? ACTION_ORDER.length : index;
}

export function buildPermissionMatrix(
  permissions: Permission[],
  resources: ResourceListItem[] = [],
): PermissionMatrix {
  const resourcesById = new Map(resources.map((item) => [item.id, item]));
  const resourcesBySlug = new Map(resources.map((item) => [item.slug, item]));
  const rowsByKey = new Map<string, MatrixRow>();
  const actions = new Set<string>(STANDARD_RESOURCE_ACTIONS);

  for (const permission of permissions) {
    const catalog =
      (permission.resourceId
        ? resourcesById.get(permission.resourceId)
        : undefined) ?? resourcesBySlug.get(permission.resource);
    const slug = catalog?.slug ?? permission.resource;
    const rowKey = catalog?.id ?? `slug:${slug}`;

    let row = rowsByKey.get(rowKey);
    if (!row) {
      row = {
        key: rowKey,
        slug,
        name: catalog?.name ?? slug,
        description: catalog?.description ?? permission.description,
        groupKey: catalog?.groupKey ?? 'other',
        groupLabel: catalog?.groupLabel ?? 'Бусад',
        groupSortOrder: catalog?.groupSortOrder ?? 9_999,
        sortOrder: catalog?.sortOrder ?? 9_999,
        icon: catalog?.icon ?? null,
        scope: catalog?.scope ?? permission.scope,
        cells: {},
      };
      rowsByKey.set(rowKey, row);
    }

    actions.add(permission.action);
    row.cells[permission.action] = {
      id: permission.id,
      key: permission.key,
      name: permission.name,
      action: permission.action,
      isDangerous: permission.isDangerous,
    };
  }

  const sortedActions = [...actions].sort((left, right) => {
    const rank = actionRank(left) - actionRank(right);
    return rank !== 0 ? rank : left.localeCompare(right);
  });

  const rows = [...rowsByKey.values()].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }
    return left.name.localeCompare(right.name, 'mn');
  });

  const groupsMap = new Map<string, MatrixGroup>();
  for (const row of rows) {
    const existing = groupsMap.get(row.groupKey);
    if (existing) {
      existing.rows.push(row);
    } else {
      groupsMap.set(row.groupKey, {
        key: row.groupKey,
        label: row.groupLabel,
        rows: [row],
      });
    }
  }

  const groups = [...groupsMap.values()].sort((left, right) => {
    const leftOrder = Math.min(...left.rows.map((row) => row.groupSortOrder));
    const rightOrder = Math.min(...right.rows.map((row) => row.groupSortOrder));
    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }
    return left.label.localeCompare(right.label, 'mn');
  });

  return { actions: sortedActions, groups, rows };
}

export function filterMatrix(
  matrix: PermissionMatrix,
  filters: MatrixFilters,
  selectedIds: string[],
): PermissionMatrix {
  const search = filters.search.trim().toLowerCase();
  const selected = new Set(selectedIds);

  const rows = matrix.rows.filter((row) => {
    if (filters.groupKey && row.groupKey !== filters.groupKey) {
      return false;
    }

    if (filters.grantedOnly) {
      const granted = Object.values(row.cells).some((cell) =>
        selected.has(cell.id),
      );
      if (!granted) {
        return false;
      }
    }

    if (!search) {
      return true;
    }

    const haystack = [
      row.name,
      row.slug,
      row.description ?? '',
      ...Object.values(row.cells).flatMap((cell) => [cell.key, cell.name]),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(search);
  });

  const visibleKeys = new Set(rows.map((row) => row.groupKey));
  const groups = matrix.groups
    .filter((group) => visibleKeys.has(group.key))
    .map((group) => ({
      ...group,
      rows: rows.filter((row) => row.groupKey === group.key),
    }));

  return { ...matrix, rows, groups };
}

export function rowPermissionIds(row: MatrixRow) {
  return Object.values(row.cells).map((cell) => cell.id);
}

export function actionPermissionIds(rows: MatrixRow[], action: string) {
  return rows.flatMap((row) => {
    const cell = row.cells[action];
    return cell ? [cell.id] : [];
  });
}

export function toggleIds(
  current: string[],
  targetIds: string[],
  checked: boolean,
) {
  const next = new Set(current);

  for (const id of targetIds) {
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
  }

  return [...next];
}

export function rowReadCell(row: MatrixRow) {
  return (
    row.cells.read ??
    Object.values(row.cells).find((cell) => cell.action === 'read')
  );
}

export function implyReadPermissions(matrix: PermissionMatrix, ids: string[]) {
  const selected = new Set(ids);

  for (const row of matrix.rows) {
    const readCell = rowReadCell(row);
    if (!readCell) {
      continue;
    }

    const hasAction = Object.values(row.cells).some(
      (cell) => cell.action !== 'read' && selected.has(cell.id),
    );

    if (hasAction) {
      selected.add(readCell.id);
    }
  }

  return [...selected];
}

export function applyMatrixSelection(
  matrix: PermissionMatrix,
  current: string[],
  targetIds: string[],
  checked: boolean,
) {
  const target = new Set(targetIds);
  const next = new Set(toggleIds(current, targetIds, checked));

  if (!checked) {
    for (const row of matrix.rows) {
      const readCell = rowReadCell(row);
      if (!readCell || !target.has(readCell.id)) {
        continue;
      }

      for (const cell of Object.values(row.cells)) {
        next.delete(cell.id);
      }
    }
  }

  return implyReadPermissions(matrix, [...next]);
}

export function allSelected(current: string[], targetIds: string[]) {
  return (
    targetIds.length > 0 && targetIds.every((id) => current.includes(id))
  );
}
