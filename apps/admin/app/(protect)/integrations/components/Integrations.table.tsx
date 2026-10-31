'use client';

import { DeleteButton, EditButton, ImportButton } from '@packages/ui/main/MButtons';
import { StatusCell } from '@packages/ui/main/Status.cell';
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
import { toast } from '@packages/ui/components/sonner';

import type { IntegrationDetail } from '@packages/types';
import { Icons } from '@/utils/icons';

import { useIntegrationMutate } from '../hooks';
import { formatDateTime } from '../lib/labels';

const ENABLED_LABELS = {
  true: 'Идэвхтэй',
  false: 'Идэвхгүй',
} as const;

const ENABLED_CLASS = {
  true: 'bg-primary/10 text-primary',
  false: 'bg-muted text-muted-foreground',
} as const;

type IntegrationsTableProps = {
  items: IntegrationDetail[];
  isLoading: boolean;
  errorMessage?: string;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (item: IntegrationDetail) => void;
  onDelete: (item: IntegrationDetail) => void;
};

export function IntegrationsTable({
  items,
  isLoading,
  errorMessage,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: IntegrationsTableProps) {
  const { sync } = useIntegrationMutate();

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
    return <MTableEmpty icon={Icons.integrations} text="Интеграци олдсонгүй." />;
  }

  return (
    <MTable>
      <MTableHeader>
        <MTableRow>
          <MTableHead className="w-36">Үйлдэл</MTableHead>
          <MTableHead>Нэр</MTableHead>
          <MTableHead>Хаяг</MTableHead>
          <MTableHead>Client ID</MTableHead>
          <MTableHead>Эрх</MTableHead>
          <MTableHead>Төлөв</MTableHead>
          <MTableHead>Сүүлийн синк</MTableHead>
        </MTableRow>
      </MTableHeader>
      <MTableBody>
        {items.map((item) => (
          <MTableRow key={item.id}>
            <MTableCell>
              <div className="flex gap-1">
                {canEdit ? (
                  <ImportButton
                    size="icon"
                    text={false}
                    tooltip="Ажилтан татах"
                    disabled={sync.isPending || !item.isEnabled}
                    onClick={() =>
                      sync.mutate(item.id, {
                        onSuccess: (result) => {
                          toast.success(`${result.saved} ажилтан хадгалагдлаа`);
                        },
                      })
                    }
                  />
                ) : null}
                {canEdit ? (
                  <EditButton size="icon" text={false} tooltip="Засах" onClick={() => onEdit(item)} />
                ) : null}
                {canDelete ? (
                  <DeleteButton size="icon" text={false} onClick={() => onDelete(item)} />
                ) : null}
              </div>
            </MTableCell>
            <MTableCell className="font-medium">{item.name}</MTableCell>
            <MTableCell className="max-w-64 truncate">{item.baseUrl}</MTableCell>
            <MTableCell>{item.clientId}</MTableCell>
            <MTableCell>{item.scopes.join(', ') || '—'}</MTableCell>
            <MTableCell>
              <StatusCell
                value={item.isEnabled ? 'true' : 'false'}
                labels={ENABLED_LABELS}
                classMap={ENABLED_CLASS}
                options={[
                  { value: 'true', label: ENABLED_LABELS.true },
                  { value: 'false', label: ENABLED_LABELS.false },
                ]}
                disabled
              />
            </MTableCell>
            <MTableCell>{formatDateTime(item.lastSyncedAt)}</MTableCell>
          </MTableRow>
        ))}
      </MTableBody>
    </MTable>
  );
}
