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
import type { EmployeeOrderScheduleItem } from '@packages/types';

import { Icons } from '@/utils/icons';

import { weekdayLabels } from '../lib/labels';

export function SchedulesTable({
  items,
  isLoading,
  errorMessage,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: {
  items: EmployeeOrderScheduleItem[];
  isLoading: boolean;
  errorMessage?: string;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (item: EmployeeOrderScheduleItem) => void;
  onDelete: (item: EmployeeOrderScheduleItem) => void;
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
    return <MTableEmpty icon={Icons.mealSchedule} text="Захиалгын цаг олдсонгүй." />;
  }
  return (
    <MTable>
      <MTableHeader>
        <MTableRow>
          <MTableHead className="w-28">Үйлдэл</MTableHead>
          <MTableHead>Нэр</MTableHead>
          <MTableHead>Төрөл</MTableHead>
          <MTableHead>Хоолны цаг</MTableHead>
          <MTableHead>Дуусах цаг</MTableHead>
          <MTableHead>Өдрүүд</MTableHead>
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
            <MTableCell className="font-medium">{item.name}</MTableCell>
            <MTableCell>{item.mealTypeName}</MTableCell>
            <MTableCell>{item.opensAt}</MTableCell>
            <MTableCell>{item.closesAt}</MTableCell>
            <MTableCell>{weekdayLabels(item.weekdays)}</MTableCell>
          </MTableRow>
        ))}
      </MTableBody>
    </MTable>
  );
}
