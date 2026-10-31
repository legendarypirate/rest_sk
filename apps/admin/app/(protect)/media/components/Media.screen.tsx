'use client';

import { CreateButton } from '@packages/ui/main/MButtons';
import { useDialog } from '@packages/ui/main/MDialog.context';
import { TableFooter } from '@packages/ui/main/MTable.footer';
import { MViewToggle } from '@packages/ui/main/MView.toggle';
import type { MediaAssetDetail } from '@packages/types';
import { useState } from 'react';

import { usePermission } from '@/hooks/use.permission';
import { getApiErrorMessage } from '@/lib/api-error';
import { PlatformPermission } from '@/types/routes';

import { useMedia } from '../hooks';
import { MediaDelete } from './Media.delete';
import { MediaFilters } from './Media.filters';
import { MediaForm } from './Media.form';
import { MediaGrid } from './Media.grid';
import { MediaTable } from './Media.table';

export function MediaScreen() {
  const { showDialog } = useDialog();
  const { can } = usePermission();
  const canAdd = can(PlatformPermission.MediaAdd);
  const canEdit = can(PlatformPermission.MediaEdit);
  const canDelete = can(PlatformPermission.MediaDelete);
  const media = useMedia();
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [deleting, setDeleting] = useState<MediaAssetDetail | null>(null);

  const meta = media.query.data?.meta;
  const items = media.query.data?.items ?? [];

  function handleCreate() {
    showDialog({
      title: 'Зураг нэмэх',
      description: 'Олон зураг нэгэн зэрэг медиа санд хадгална.',
      class: 'sm:max-w-none max-w-none w-screen h-full max-h-full rounded-none',
      content: (
        <MediaForm
          mode="add"
          onSuccess={() => {
            media.setPage(1);
            void media.query.refetch();
          }}
        />
      ),
    });
  }

  function handleEdit(asset: MediaAssetDetail) {
    showDialog({
      title: 'Медиа засах',
      description: 'Зургийн тайлбарыг шинэчилнэ.',
      content: <MediaForm mode="edit" asset={asset} />,
    });
  }

  return (
    <div className="min-h-0 flex flex-1 flex-col">
      <div className="gap-3 px-4 py-3 flex items-center justify-between border-b">
        <div>
          <h1 className="text-lg font-semibold">Медиа сан</h1>
          <p className="text-sm text-muted-foreground">
            Цэс, ангилалд ашиглах зургийг энд хадгална
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MViewToggle value={view} onChange={setView} />
          {canAdd ? (
            <CreateButton text="Зураг нэмэх" tooltip={false} onClick={handleCreate} />
          ) : null}
        </div>
      </div>

      <div className="px-4 pt-4">
        <MediaFilters
          values={media.draft}
          onChange={(key, value) => {
            media.setDraft((current) => ({
              ...current,
              [key]: key === 'includeDeleted' ? Boolean(value) : (value ?? ''),
            }));
          }}
          onSearch={media.applyFilters}
          onClear={media.clearFilters}
          hasActiveFilters={media.hasActiveFilters}
        />
      </div>

      <div className="min-h-0 px-4 flex-1 overflow-auto">
        {view === 'grid' ? (
          <MediaGrid
            items={items}
            isLoading={media.query.isPending}
            errorMessage={
              media.query.isError ? getApiErrorMessage(media.query.error) : undefined
            }
            canEdit={canEdit}
            canDelete={canDelete}
            onEdit={handleEdit}
            onDelete={setDeleting}
          />
        ) : (
          <MediaTable
            items={items}
            isLoading={media.query.isPending}
            errorMessage={
              media.query.isError ? getApiErrorMessage(media.query.error) : undefined
            }
            sortBy={media.sortBy}
            sortDirection={media.sortDirection}
            onSort={media.changeSort}
            canEdit={canEdit}
            canDelete={canDelete}
            onEdit={handleEdit}
            onDelete={setDeleting}
          />
        )}
      </div>

      {meta ? (
        <TableFooter
          meta={{
            total: meta.total,
            page: meta.page,
            limit: typeof meta.limit === 'number' ? meta.limit : media.limit,
            totalPages: meta.totalPages,
          }}
          limit={media.limit}
          onLimitChange={media.setLimit}
          onPageChange={media.setPage}
          isVisible={meta.totalPages > 1}
        />
      ) : null}

      <MediaDelete
        asset={deleting}
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
