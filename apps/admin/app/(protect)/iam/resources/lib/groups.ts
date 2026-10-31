import type { ResourceListItem } from '@packages/types';

export type ResourceGroup = {
  key: string;
  label: string;
  sortOrder: number;
  items: ResourceListItem[];
};

const UNGROUPED = '__none__';

export function groupResources(items: ResourceListItem[]): ResourceGroup[] {
  const groups = new Map<string, ResourceGroup>();

  for (const item of items) {
    const key = item.groupKey?.trim() || UNGROUPED;
    const existing = groups.get(key);

    if (existing) {
      existing.items.push(item);
      continue;
    }

    groups.set(key, {
      key,
      label: item.groupLabel?.trim() || 'Бүлэггүй',
      sortOrder: item.groupSortOrder,
      items: [item],
    });
  }

  return [...groups.values()].sort(
    (left, right) =>
      left.sortOrder - right.sortOrder || left.label.localeCompare(right.label, 'mn'),
  );
}
