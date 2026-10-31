'use client';

import { ViewButton } from '@packages/ui/main/MButtons';
import {
  MTable,
  MTableBody,
  MTableCell,
  MTableHead,
  MTableHeader,
  MTableRow,
} from '@packages/ui/main/MTable';
import { SortHead } from '@packages/ui/main/MTable.helper';
import { MTableSkeleton } from '@packages/ui/main/MTableSkeleton';
import { MTableEmpty } from '@packages/ui/main/MTable.empty';
import type { AuditListItem } from '@packages/types';

import { Icons } from '@/utils/icons';

import {
  ACTOR_TYPE_LABELS,
  AUDIT_ACTION_LABELS,
  actorLabel,
  formatDateTime,
} from '../lib/labels';

type AuditTableProps = {
  items: AuditListItem[];
  isLoading: boolean;
  errorMessage?: string;
  sortDirection: 'asc' | 'desc';
  onSort: () => void;
  onView: (item: AuditListItem) => void;
};

export function AuditTable({
  items,
  isLoading,
  errorMessage,
  sortDirection,
  onSort,
  onView,
}: AuditTableProps) {
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
    return (
      <MTableEmpty icon={Icons.audit} text="Аудитын бүртгэл олдсонгүй." />
    );
  }

  return (
    <MTable>
      <MTableHeader>
        <MTableRow>
          <MTableHead className="w-16">Үйлдэл</MTableHead>
          <SortHead
            field="createdAt"
            label="Огноо"
            sortBy="createdAt"
            sortOrder={sortDirection}
            onSort={() => onSort()}
          />
          <MTableHead>Үйлдэл</MTableHead>
          <MTableHead>Нөөц</MTableHead>
          <MTableHead>Гүйцэтгэсэн</MTableHead>
          <MTableHead>Хэнд</MTableHead>
          <MTableHead>IP</MTableHead>
        </MTableRow>
      </MTableHeader>
      <MTableBody>
        {items.map((item) => (
            <MTableRow key={item.id}>
              <MTableCell>
                <div className="flex gap-1">
                  <ViewButton
                    size="icon"
                    text={false}
                    onClick={() => onView(item)}
                  />
                </div>
              </MTableCell>
              <MTableCell className="whitespace-nowrap">
                {formatDateTime(item.createdAt)}
              </MTableCell>
              <MTableCell className="font-medium">
                {AUDIT_ACTION_LABELS[item.action] ?? item.action}
              </MTableCell>
              <MTableCell>
                <div>{item.resourceType}</div>
                {item.resourceId ? (
                  <div className="max-w-40 truncate text-xs text-muted-foreground">
                    {item.resourceId}
                  </div>
                ) : null}
              </MTableCell>
              <MTableCell>
                {actorLabel(item.actor, ACTOR_TYPE_LABELS[item.actorType])}
              </MTableCell>
              <MTableCell>{actorLabel(item.target)}</MTableCell>
              <MTableCell className="text-muted-foreground">
                {item.ipAddress ?? '—'}
              </MTableCell>

            </MTableRow>
          ))}
      </MTableBody>
    </MTable>
  );
}
