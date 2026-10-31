'use client';

import { CreateButton } from '@packages/ui/main/MButtons';
import { useDialog } from '@packages/ui/main/MDialog.context';
import { TableFooter } from '@packages/ui/main/MTable.footer';
import type { MenuCategoryListItem } from '@packages/types';
import { useState } from 'react';

import { usePermission } from '@/hooks/use.permission';
import { getApiErrorMessage } from '@/lib/api-error';
import { PlatformPermission } from '@/types/routes';

import { useMenuCategories } from '../hooks';
import { MenuCategoriesFilters } from './MenuCategories.filters';
import { MenuCategoriesTable } from './MenuCategories.table';
import { MenuCategoryDelete } from './MenuCategory.delete';
import { MenuCategoryForm } from './MenuCategory.form';

const FORM_DIALOG_CLASS = 'min-w-[640px] sm:max-w-2xl';

export function MenuCategoriesScreen() {
  const { showDialog } = useDialog();
  const { can } = usePermission();
  const list = useMenuCategories();
  const [deleting, setDeleting] = useState<MenuCategoryListItem | null>(null);
  const items = list.query.data?.items ?? [];
  const meta = list.query.data?.meta;

  return (
    <div className="min-h-0 flex flex-1 flex-col">
      <div className="gap-3 px-4 py-3 flex items-center justify-between border-b">
        <div>
          <h1 className="text-lg font-semibold">Цэсний ангилал</h1>
          <p className="text-sm text-muted-foreground">Хоолны ангилал, эцэг ангилал</p>
        </div>
        {can(PlatformPermission.MenuCategoriesAdd) ? (
          <CreateButton
            text="Бүртгэх"
            tooltip={false}
            onClick={() =>
              showDialog({
                title: 'Ангилал бүртгэх',
                content: <MenuCategoryForm mode="add" onSuccess={() => list.setPage(1)} />,
                class: FORM_DIALOG_CLASS,
              })
            }
          />
        ) : null}
      </div>
      <div className="px-4 pt-4">
        <MenuCategoriesFilters
          values={list.draft}
          onChange={(key, value) =>
            list.setDraft((current) => ({ ...current, [key]: String(value ?? '') }))
          }
          onSearch={list.apply}
          onClear={list.clear}
          hasActiveFilters={list.hasActiveFilters}
        />
      </div>
      <div className="min-h-0 px-4 flex-1 overflow-auto">
        <MenuCategoriesTable
          items={items}
          isLoading={list.query.isPending}
          errorMessage={list.query.isError ? getApiErrorMessage(list.query.error) : undefined}
          canEdit={can(PlatformPermission.MenuCategoriesEdit)}
          canDelete={can(PlatformPermission.MenuCategoriesDelete)}
          onEdit={(item) =>
            showDialog({
              title: 'Ангилал засах',
              content: <MenuCategoryForm mode="edit" item={item} />,
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
      <MenuCategoryDelete item={deleting} open={Boolean(deleting)} onClose={() => setDeleting(null)} />
    </div>
  );
}
