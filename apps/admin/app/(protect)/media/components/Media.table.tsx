'use client';

import { DeleteButton, EditButton } from '@packages/ui/main/MButtons';
import Image from 'next/image';
import { StatusCell } from '@packages/ui/main/Status.cell';
import {
  MTable,
  MTableBody,
  MTableCell,
  MTableHead,
  MTableHeader,
  MTableRow,
} from '@packages/ui/main/MTable';
import { SortHead } from '@packages/ui/main/MTable.helper';
import { MTableEmpty } from '@packages/ui/main/MTable.empty';
import { MTableSkeleton } from '@packages/ui/main/MTableSkeleton';
import type { MediaAssetDetail } from '@packages/types';

import type { ListMediaQueryDto } from '@/types/media/media.dto';
import { Icons } from '@/utils/icons';

import {
  formatBytes,
  formatDateTime,
  MEDIA_STATUS_CLASS,
  MEDIA_STATUS_LABELS,
  MEDIA_STATUS_OPTIONS,
} from '../lib/labels';

type MediaTableProps = {
  items: MediaAssetDetail[];
  isLoading: boolean;
  errorMessage?: string;
  sortBy: NonNullable<ListMediaQueryDto['sortBy']>;
  sortDirection: NonNullable<ListMediaQueryDto['sortDirection']>;
  onSort: (field: NonNullable<ListMediaQueryDto['sortBy']>) => void;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (asset: MediaAssetDetail) => void;
  onDelete: (asset: MediaAssetDetail) => void;
};

export function MediaTable({
  items,
  isLoading,
  errorMessage,
  sortBy,
  sortDirection,
  onSort,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: MediaTableProps) {
  if (isLoading && items.length === 0) {
    return <MTableSkeleton />;
  }

  if (errorMessage) {
    return (
      <div className="min-h-48 text-sm flex items-center justify-center text-destructive">
        {errorMessage}
      </div>
    );
  }

  if (items.length === 0) {
    return <MTableEmpty icon={Icons.media} text="Медиа олдсонгүй." />;
  }

  return (
    <MTable>
      <MTableHeader>
        <MTableRow>
          <MTableHead className="w-28">Үйлдэл</MTableHead>
          <MTableHead className="w-16">Зураг</MTableHead>
          <SortHead
            field="originalFilename"
            label="Файл"
            sortBy={sortBy}
            sortOrder={sortDirection}
            onSort={onSort}
          />
          <MTableHead>Тайлбар</MTableHead>
          <MTableHead>Төлөв</MTableHead>
          <MTableHead>Хэмжээ</MTableHead>
          <SortHead
            field="createdAt"
            label="Үүссэн"
            sortBy={sortBy}
            sortOrder={sortDirection}
            onSort={onSort}
          />
        </MTableRow>
      </MTableHeader>
      <MTableBody>
        {items.map((asset) => {
          const mutable = !asset.deletedAt;
          const preview = asset.storageUrl || asset.thumbnailUrl;

          return (
            <MTableRow key={asset.id}>
              <MTableCell>
                <div className="flex gap-1">
                  {canEdit ? (
                    <EditButton
                      size="icon"
                      text={false}
                      disabled={!mutable}
                      onClick={() => onEdit(asset)}
                    />
                  ) : null}
                  {canDelete ? (
                    <DeleteButton
                      size="icon"
                      text={false}
                      disabled={!mutable}
                      onClick={() => onDelete(asset)}
                    />
                  ) : null}
                </div>
              </MTableCell>
              <MTableCell>
                <div className="relative size-10 overflow-hidden rounded-md bg-muted">
                  {preview ? (
                    <Image
                      src={preview}
                      alt={asset.altText ?? asset.originalFilename}
                      fill
                      unoptimized
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="size-full flex items-center justify-center text-muted-foreground">
                      <Icons.media className="size-4" />
                    </span>
                  )}
                </div>
              </MTableCell>
              <MTableCell className="max-w-56 truncate font-medium">
                {asset.originalFilename}
              </MTableCell>
              <MTableCell className="max-w-56 truncate">
                {asset.altText ?? '—'}
              </MTableCell>
              <MTableCell>
                <StatusCell
                  value={asset.status}
                  labels={MEDIA_STATUS_LABELS}
                  classMap={MEDIA_STATUS_CLASS}
                  options={MEDIA_STATUS_OPTIONS}
                  disabled
                />
              </MTableCell>
              <MTableCell>{formatBytes(asset.byteSize)}</MTableCell>
              <MTableCell>{formatDateTime(asset.createdAt)}</MTableCell>
            </MTableRow>
          );
        })}
      </MTableBody>
    </MTable>
  );
}
