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
import type { EmployeeMealDayItem } from '@packages/types';

import { Icons } from '@/utils/icons';

import { MEAL_DAY_STATUS_LABELS } from '../lib/labels';

export function MealDaysTable({
  items,
  isLoading,
  errorMessage,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: {
  items: EmployeeMealDayItem[];
  isLoading: boolean;
  errorMessage?: string;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (item: EmployeeMealDayItem) => void;
  onDelete: (item: EmployeeMealDayItem) => void;
}) {
  if (isLoading && items.length === 0) return <MTableSkeleton />;
  if (errorMessage) {
    return (
      <div className="min-h-48 text-sm flex items-center justify-center text-destructive">
        {errorMessage}
      </div>
    );
  }
  if (items.length === 0) {
    return <MTableEmpty icon={Icons.mealDay} text="Өдрийн хоол олдсонгүй." />;
  }
  return (
    <MTable>
      <MTableHeader>
        <MTableRow>
          <MTableHead className="w-28">Үйлдэл</MTableHead>
          <MTableHead>Огноо</MTableHead>
          <MTableHead>Төрөл</MTableHead>
          <MTableHead>Ангилал</MTableHead>
          <MTableHead>Хоол</MTableHead>
          <MTableHead>Захиалсан</MTableHead>
          <MTableHead>Идсэн</MTableHead>
          <MTableHead>Төлөв</MTableHead>
        </MTableRow>
      </MTableHeader>
      <MTableBody>
        {items.map((item) => (
          <MTableRow key={item.id}>
            <MTableCell>
              <div className="flex gap-1">
                {canEdit ? (
                  <EditButton size="icon" text={false} tooltip="Засах" onClick={() => onEdit(item)} />
                ) : null}
                {canDelete ? (
                  <DeleteButton size="icon" text={false} onClick={() => onDelete(item)} />
                ) : null}
              </div>
            </MTableCell>
            <MTableCell>{item.serviceDate}</MTableCell>
            <MTableCell>{item.mealTypeName}</MTableCell>
            <MTableCell>{item.categoryName ?? '—'}</MTableCell>
            <MTableCell>
              <div className="flex items-center gap-2">
                {item.images[0] ? (
                  <img
                    src={item.images[0].thumbnailUrl ?? item.images[0].storageUrl}
                    alt=""
                    className="h-8 w-8 rounded object-cover"
                  />
                ) : null}
                <span className="font-medium">{item.menuItemName ?? item.name ?? '—'}</span>
              </div>
            </MTableCell>
            <MTableCell>{item.orderedCount}</MTableCell>
            <MTableCell>{item.consumedCount}</MTableCell>
            <MTableCell>{MEAL_DAY_STATUS_LABELS[item.status]}</MTableCell>
          </MTableRow>
        ))}
      </MTableBody>
    </MTable>
  );
}
