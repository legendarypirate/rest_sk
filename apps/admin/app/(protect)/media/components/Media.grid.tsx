'use client';

import { DeleteButton, EditButton } from '@packages/ui/main/MButtons';
import Image from 'next/image';
import {
  MCard,
  MCardContent,
  MCardFooter,
  MCardHeader,
  MCardTitle,
} from '@packages/ui/main/MCard';
import { StatusCell } from '@packages/ui/main/Status.cell';
import { MTableEmpty } from '@packages/ui/main/MTable.empty';
import { MTableSkeleton } from '@packages/ui/main/MTableSkeleton';
import type { MediaAssetDetail } from '@packages/types';

import { Icons } from '@/utils/icons';

import {
  formatBytes,
  MEDIA_STATUS_CLASS,
  MEDIA_STATUS_LABELS,
  MEDIA_STATUS_OPTIONS,
} from '../lib/labels';

type MediaGridProps = {
  items: MediaAssetDetail[];
  isLoading: boolean;
  errorMessage?: string;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (asset: MediaAssetDetail) => void;
  onDelete: (asset: MediaAssetDetail) => void;
};

export function MediaGrid({
  items,
  isLoading,
  errorMessage,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: MediaGridProps) {
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
    <div className="gap-3 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {items.map((asset) => {
        const mutable = !asset.deletedAt;
        const preview = asset.storageUrl || asset.thumbnailUrl;

        return (
          <MCard key={asset.id} className="overflow-hidden mt-2">
            <MCardHeader className="px-3 py-2 flex flex-row items-center justify-between gap-2">
              <MCardTitle className="text-sm truncate">
                {asset.originalFilename}
              </MCardTitle>
              <div className="flex shrink-0 gap-1">
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
            </MCardHeader>
            <MCardContent className="px-3">
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-md bg-muted">
                {preview ? (
                  <Image
                    src={preview}
                    alt={asset.altText ?? asset.originalFilename}
                    fill
                    unoptimized
                    sizes="320px"
                    className="object-cover"
                  />
                ) : (
                  <span className="size-full flex items-center justify-center text-muted-foreground">
                    <Icons.media className="size-6" />
                  </span>
                )}
              </div>
            </MCardContent>
            <MCardFooter className="px-3 py-2 flex items-center justify-between gap-2">
              <StatusCell
                value={asset.status}
                labels={MEDIA_STATUS_LABELS}
                classMap={MEDIA_STATUS_CLASS}
                options={MEDIA_STATUS_OPTIONS}
                disabled
              />
              <span className="text-xs text-muted-foreground">
                {formatBytes(asset.byteSize)}
              </span>
            </MCardFooter>
          </MCard>
        );
      })}
    </div>
  );
}
