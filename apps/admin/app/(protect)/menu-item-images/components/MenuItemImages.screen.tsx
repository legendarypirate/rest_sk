'use client';

import { CreateButton } from '@packages/ui/main/MButtons';
import { useDialog } from '@packages/ui/main/MDialog.context';
import { TableFooter } from '@packages/ui/main/MTable.footer';
import type { MenuItemImageItem } from '@packages/types';
import { useState } from 'react';

import { usePermission } from '@/hooks/use.permission';
import { getApiErrorMessage } from '@/lib/api-error';
import { PlatformPermission } from '@/types/routes';

import { useMenuItemImages } from '../hooks';
import { MenuItemImageDelete } from './MenuItemImage.delete';
import { MenuItemImageForm } from './MenuItemImage.form';
import { MenuItemImagesFilters } from './MenuItemImages.filters';
import { MenuItemImagesTable } from './MenuItemImages.table';

export function MenuItemImagesScreen() {
  const { showDialog } = useDialog();
  const { can } = usePermission();
  const list = useMenuItemImages();
  const [deleting, setDeleting] = useState<MenuItemImageItem | null>(null);
  const items = list.query.data?.items ?? [];
  const meta = list.query.data?.meta;

  return (
    <div className="min-h-0 flex flex-1 flex-col">
      <div className="gap-3 px-4 py-3 flex items-center justify-between border-b">
        <div>
          <h1 className="text-lg font-semibold">Хоолны зураг</h1>
          <p className="text-sm text-muted-foreground">Хоолд зураг холбох</p>
        </div>
        {can(PlatformPermission.MenuItemImagesAdd) ? (
          <CreateButton
            text="Бүртгэх"
            tooltip={false}
            onClick={() =>
              showDialog({
                title: 'Зураг бүртгэх',
                class: 'sm:max-w-3xl',
                content: <MenuItemImageForm mode="add" onSuccess={() => list.setPage(1)} />,
              })
            }
          />
        ) : null}
      </div>
      <div className="px-4 pt-4">
        <MenuItemImagesFilters
          values={list.draft}
          onChange={(key, value) => list.setDraft((current) => ({ ...current, [key]: String(value ?? '') }))}
          onSearch={list.apply}
          onClear={list.clear}
          hasActiveFilters={list.hasActiveFilters}
        />
      </div>
      <div className="min-h-0 px-4 flex-1 overflow-auto">
        <MenuItemImagesTable
          items={items}
          isLoading={list.query.isPending}
          errorMessage={list.query.isError ? getApiErrorMessage(list.query.error) : undefined}
          canEdit={can(PlatformPermission.MenuItemImagesEdit)}
          canDelete={can(PlatformPermission.MenuItemImagesDelete)}
          onEdit={(item) =>
            showDialog({
              title: 'Зураг засах',
              class: 'sm:max-w-3xl',
              content: <MenuItemImageForm mode="edit" item={item} />,
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
      <MenuItemImageDelete item={deleting} open={Boolean(deleting)} onClose={() => setDeleting(null)} />
    </div>
  );
}
