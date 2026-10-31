'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@packages/ui/components/avatar';
import { DeleteButton, EditButton } from '@packages/ui/main/MButtons';
import { MTable, MTableBody, MTableCell, MTableHead, MTableHeader, MTableRow } from '@packages/ui/main/MTable';
import { MTableEmpty } from '@packages/ui/main/MTable.empty';
import { MTableSkeleton } from '@packages/ui/main/MTableSkeleton';
import type { MenuItemImageItem } from '@packages/types';

import { Icons } from '@/utils/icons';

export function MenuItemImagesTable({
  items,
  isLoading,
  errorMessage,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: {
  items: MenuItemImageItem[];
  isLoading: boolean;
  errorMessage?: string;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (item: MenuItemImageItem) => void;
  onDelete: (item: MenuItemImageItem) => void;
}) {
  if (isLoading && items.length === 0) return <MTableSkeleton />;
  if (errorMessage) {
    return <div className="min-h-48 text-sm flex items-center justify-center text-destructive">{errorMessage}</div>;
  }
  if (items.length === 0) return <MTableEmpty icon={Icons.media} text="Зураг олдсонгүй." />;
  return (
    <MTable>
      <MTableHeader>
        <MTableRow>
          <MTableHead className="w-28">Үйлдэл</MTableHead>
          <MTableHead>Зураг</MTableHead>
          <MTableHead>Файл</MTableHead>
          <MTableHead>Тайлбар</MTableHead>
          <MTableHead>Эрэмбэ</MTableHead>
          <MTableHead>Үндсэн</MTableHead>
        </MTableRow>
      </MTableHeader>
      <MTableBody>
        {items.map((item) => {
          const preview = item.thumbnailUrl ?? item.storageUrl;
          return (
            <MTableRow key={item.id}>
              <MTableCell>
                <div className="flex gap-1">
                  {canEdit ? <EditButton size="icon" text={false} tooltip="Засах" onClick={() => onEdit(item)} /> : null}
                  {canDelete ? <DeleteButton size="icon" text={false} onClick={() => onDelete(item)} /> : null}
                </div>
              </MTableCell>
              <MTableCell>
                <Avatar className="size-10 rounded-md">
                  {preview ? <AvatarImage src={preview} alt={item.altText ?? item.originalFilename} /> : null}
                  <AvatarFallback>Зу</AvatarFallback>
                </Avatar>
              </MTableCell>
              <MTableCell className="font-medium">{item.originalFilename}</MTableCell>
              <MTableCell>{item.altText ?? '—'}</MTableCell>
              <MTableCell>{item.sortOrder}</MTableCell>
              <MTableCell>{item.isPrimary ? 'Тийм' : 'Үгүй'}</MTableCell>
            </MTableRow>
          );
        })}
      </MTableBody>
    </MTable>
  );
}
