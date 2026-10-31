'use client';

import { useQuery } from '@tanstack/react-query';
import { MFilters } from '@packages/ui/main/MFilters';

import { listMenuCategories } from '@/services/menus/menus.service';

import type { MenuCategoryImageFilters } from '../hooks';

export function MenuCategoryImagesFilters({
  values,
  onChange,
  onSearch,
  onClear,
  hasActiveFilters,
}: {
  values: MenuCategoryImageFilters;
  onChange: (key: string, value: unknown) => void;
  onSearch: () => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}) {
  const categories = useQuery({
    queryKey: ['menu-categories', 'options'],
    queryFn: () => listMenuCategories({ page: 1, limit: '*' }),
  });
  return (
    <MFilters
      title="Ангиллын зураг хайх"
      values={values}
      onChange={onChange}
      onSearch={onSearch}
      onClear={onClear}
      hasActiveFilters={hasActiveFilters}
      fields={[
        {
          key: 'menuCategoryId',
          type: 'select',
          label: 'Ангилал',
          placeholder: 'Бүгд',
          options: (categories.data?.items ?? []).map((row) => ({ value: row.id, label: row.name })),
        },
      ]}
    />
  );
}
