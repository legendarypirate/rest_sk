'use client';

import { DeleteButton, EditButton } from '@packages/ui/main/MButtons';
import {
  MTable,
  MTableBody,
  MTableCell,
  MTableHead,
  MTableHeader,
  MTableRow,
} from '@packages/ui/main/MTable';
import { MTableEmpty } from '@packages/ui/main/MTable.empty';
import { MTableSkeleton } from '@packages/ui/main/MTableSkeleton';
import { StatusCell } from '@packages/ui/main/Status.cell';
import type { RestaurantListItem } from '@packages/types';

import { Icons } from '@/utils/icons';

import { RECORD_STATUS_CLASS, RECORD_STATUS_LABELS, RECORD_STATUS_OPTIONS } from '../lib/labels';

export function RestaurantsTable({
  items,
  isLoading,
  errorMessage,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: {
  items: RestaurantListItem[];
  isLoading: boolean;
  errorMessage?: string;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (item: RestaurantListItem) => void;
  onDelete: (item: RestaurantListItem) => void;
}) {
  if (isLoading && items.length === 0) return <MTableSkeleton />;
  if (errorMessage) {
    return <div className="min-h-48 text-sm flex items-center justify-center text-destructive">{errorMessage}</div>;
  }
  if (items.length === 0) return <MTableEmpty icon={Icons.organizations} text="Ресторан олдсонгүй." />;
  return (
    <MTable>
      <MTableHeader>
        <MTableRow>
          <MTableHead className="w-28">Үйлдэл</MTableHead>
          <MTableHead>Нэр</MTableHead>
          <MTableHead>Код</MTableHead>
          <MTableHead>Хуулийн нэр</MTableHead>
          <MTableHead>Хот</MTableHead>
          <MTableHead>Утас</MTableHead>
          <MTableHead>Төлөв</MTableHead>
        </MTableRow>
      </MTableHeader>
      <MTableBody>
        {items.map((item) => (
          <MTableRow key={item.id}>
            <MTableCell>
              <div className="flex gap-1">
                {canEdit ? <EditButton size="icon" text={false} tooltip="Засах" onClick={() => onEdit(item)} /> : null}
                {canDelete ? <DeleteButton size="icon" text={false} onClick={() => onDelete(item)} /> : null}
              </div>
            </MTableCell>
            <MTableCell className="font-medium">{item.name}</MTableCell>
            <MTableCell>{item.code}</MTableCell>
            <MTableCell>{item.legalName}</MTableCell>
            <MTableCell>{item.city ?? '—'}</MTableCell>
            <MTableCell>{item.phone ?? '—'}</MTableCell>
            <MTableCell>
              <StatusCell
                value={item.status}
                labels={RECORD_STATUS_LABELS}
                classMap={RECORD_STATUS_CLASS}
                options={RECORD_STATUS_OPTIONS}
                disabled
              />
            </MTableCell>
          </MTableRow>
        ))}
      </MTableBody>
    </MTable>
  );
}
