'use client';

import { CreateButton } from '@packages/ui/main/MButtons';
import { useDialog } from '@packages/ui/main/MDialog.context';
import { TableFooter } from '@packages/ui/main/MTable.footer';
import type { RestaurantListItem } from '@packages/types';
import { useState } from 'react';

import { usePermission } from '@/hooks/use.permission';
import { getApiErrorMessage } from '@/lib/api-error';
import { PlatformPermission } from '@/types/routes';

import { useRestaurants } from '../hooks';
import { RestaurantDelete } from './Restaurant.delete';
import { RestaurantForm } from './Restaurant.form';
import { RestaurantsFilters } from './Restaurants.filters';
import { RestaurantsTable } from './Restaurants.table';

const FORM_DIALOG_CLASS = 'min-w-[640px] sm:max-w-2xl';

export function RestaurantsScreen() {
  const { showDialog } = useDialog();
  const { can } = usePermission();
  const list = useRestaurants();
  const [deleting, setDeleting] = useState<RestaurantListItem | null>(null);
  const items = list.query.data?.items ?? [];
  const meta = list.query.data?.meta;

  return (
    <div className="min-h-0 flex flex-1 flex-col">
      <div className="gap-3 px-4 py-3 flex items-center justify-between border-b">
        <div>
          <h1 className="text-lg font-semibold">Ресторан</h1>
          <p className="text-sm text-muted-foreground">Ресторан болон түүний тохиргоо</p>
        </div>
        {can(PlatformPermission.RestaurantsAdd) ? (
          <CreateButton
            text="Бүртгэх"
            tooltip={false}
            onClick={() =>
              showDialog({
                title: 'Ресторан бүртгэх',
                content: <RestaurantForm mode="add" onSuccess={() => list.setPage(1)} />,
                class: FORM_DIALOG_CLASS,
              })
            }
          />
        ) : null}
      </div>
      <div className="px-4 pt-4">
        <RestaurantsFilters
          values={list.draft}
          onChange={(key, value) => list.setDraft((current) => ({ ...current, [key]: String(value ?? '') }))}
          onSearch={list.apply}
          onClear={list.clear}
          hasActiveFilters={list.hasActiveFilters}
        />
      </div>
      <div className="min-h-0 px-4 flex-1 overflow-auto">
        <RestaurantsTable
          items={items}
          isLoading={list.query.isPending}
          errorMessage={list.query.isError ? getApiErrorMessage(list.query.error) : undefined}
          canEdit={can(PlatformPermission.RestaurantsEdit)}
          canDelete={can(PlatformPermission.RestaurantsDelete)}
          onEdit={(item) =>
            showDialog({
              title: 'Ресторан засах',
              content: <RestaurantForm mode="edit" item={item} />,
              class: FORM_DIALOG_CLASS,
            })
          }
          onDelete={setDeleting}
        />
      </div>
      {meta ? (
        <TableFooter
          meta={{
            total: meta.total,
            page: meta.page,
            limit: typeof meta.limit === 'number' ? meta.limit : list.limit,
            totalPages: meta.totalPages,
          }}
          limit={list.limit}
          onLimitChange={list.setLimit}
          onPageChange={list.setPage}
          isVisible={meta.totalPages > 1}
        />
      ) : null}
      <RestaurantDelete item={deleting} open={Boolean(deleting)} onClose={() => setDeleting(null)} />
    </div>
  );
}
