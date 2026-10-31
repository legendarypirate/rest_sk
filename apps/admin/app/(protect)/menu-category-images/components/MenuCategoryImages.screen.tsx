'use client';

import { CreateButton } from '@packages/ui/main/MButtons';
import { useDialog } from '@packages/ui/main/MDialog.context';
import { TableFooter } from '@packages/ui/main/MTable.footer';
import type { MenuCategoryImageItem } from '@packages/types';
import { useState } from 'react';

import { usePermission } from '@/hooks/use.permission';
import { getApiErrorMessage } from '@/lib/api-error';
import { PlatformPermission } from '@/types/routes';

import { useMenuCategoryImages } from '../hooks';
import { MenuCategoryImageDelete } from './MenuCategoryImage.delete';
import { MenuCategoryImageForm } from './MenuCategoryImage.form';
import { MenuCategoryImagesFilters } from './MenuCategoryImages.filters';
import { MenuCategoryImagesTable } from './MenuCategoryImages.table';

export function MenuCategoryImagesScreen() {
  const { showDialog } = useDialog();
  const { can } = usePermission();
  const list = useMenuCategoryImages();
  const [deleting, setDeleting] = useState<MenuCategoryImageItem | null>(null);
  const items = list.query.data?.items ?? [];
  const meta = list.query.data?.meta;

  return (
    <div className="min-h-0 flex flex-1 flex-col">
      <div className="gap-3 px-4 py-3 flex items-center justify-between border-b">
        <div>
          <h1 className="text-lg font-semibold">Ангиллын зураг</h1>
          <p className="text-sm text-muted-foreground">Цэсний ангилалд зураг холбох</p>
        </div>
        {can(PlatformPermission.MenuCategoryImagesAdd) ? (
          <CreateButton
            text="Бүртгэх"
            tooltip={false}
            onClick={() =>
              showDialog({
                title: 'Зураг бүртгэх',
                class: 'sm:max-w-3xl',
                content: <MenuCategoryImageForm mode="add" onSuccess={() => list.setPage(1)} />,
              })
            }
          />
        ) : null}
      </div>
      <div className="px-4 pt-4">
        <MenuCategoryImagesFilters
          values={list.draft}
          onChange={(key, value) => list.setDraft((current) => ({ ...current, [key]: String(value ?? '') }))}
          onSearch={list.apply}
          onClear={list.clear}
          hasActiveFilters={list.hasActiveFilters}
        />
      </div>
      <div className="min-h-0 px-4 flex-1 overflow-auto">
        <MenuCategoryImagesTable
          items={items}
          isLoading={list.query.isPending}
          errorMessage={list.query.isError ? getApiErrorMessage(list.query.error) : undefined}
          canEdit={can(PlatformPermission.MenuCategoryImagesEdit)}
          canDelete={can(PlatformPermission.MenuCategoryImagesDelete)}
          onEdit={(item) =>
            showDialog({
              title: 'Зураг засах',
              class: 'sm:max-w-3xl',
              content: <MenuCategoryImageForm mode="edit" item={item} />,
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
      <MenuCategoryImageDelete item={deleting} open={Boolean(deleting)} onClose={() => setDeleting(null)} />
    </div>
  );
}
