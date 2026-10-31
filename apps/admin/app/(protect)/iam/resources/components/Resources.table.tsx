'use client';

import { MinusIcon, PlusIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

import { DeleteButton, EditButton } from '@packages/ui/main/MButtons';
import { Button } from '@packages/ui/components/button';
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
import type { ResourceListItem } from '@packages/types';

import { Icons } from '@/utils/icons';
import type { ListResourcesQueryDto } from '@/types/iam/resource.dto';

import { groupResources } from '../lib/groups';
import {
  RESOURCE_SCOPE_LABELS,
  canDeleteResource,
  canMutateResource,
} from '../lib/labels';

type ResourcesTableProps = {
  items: ResourceListItem[];
  isLoading: boolean;
  errorMessage?: string;
  sortBy: NonNullable<ListResourcesQueryDto['sortBy']>;
  sortDirection: NonNullable<ListResourcesQueryDto['sortDirection']>;
  onSort: (field: NonNullable<ListResourcesQueryDto['sortBy']>) => void;
  canWrite: boolean;
  onEdit: (resource: ResourceListItem) => void;
  onDelete: (resource: ResourceListItem) => void;
};

export function ResourcesTable({
  items,
  isLoading,
  errorMessage,
  sortBy,
  sortDirection,
  onSort,
  canWrite,
  onEdit,
  onDelete,
}: ResourcesTableProps) {
  const groups = useMemo(() => groupResources(items), [items]);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const colSpan = canWrite ? 7 : 6;

  function toggleGroup(key: string) {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

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
    return <MTableEmpty icon={Icons.resources} text="Цэс олдсонгүй." />;
  }

  return (
    <MTable>
      <MTableHeader>
        <MTableRow>
          {canWrite ? (
            <MTableHead className="w-24">Засах</MTableHead>
          ) : null}
          <SortHead
            field="name"
            label="Нэр"
            sortBy={sortBy}
            sortOrder={sortDirection}
            onSort={onSort}
          />
          <SortHead
            field="slug"
            label="Холбоос"
            sortBy={sortBy}
            sortOrder={sortDirection}
            onSort={onSort}
          />
          <MTableHead>Зам</MTableHead>
          <MTableHead>Хүрээ</MTableHead>
          <SortHead
            field="sortOrder"
            label="Цэс"
            sortBy={sortBy}
            sortOrder={sortDirection}
            onSort={onSort}
          />
          <MTableHead>Үйлдэл</MTableHead>
        </MTableRow>
      </MTableHeader>
      <MTableBody>
        {groups.map((group) => {
            const open = !collapsed.has(group.key);

            return (
              <ResourceGroupRows
                key={group.key}
                label={group.label}
                count={group.items.length}
                open={open}
                onToggle={() => toggleGroup(group.key)}
                items={group.items}
                colSpan={colSpan}
                canWrite={canWrite}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            );
          })}
      </MTableBody>
    </MTable>
  );
}

function ResourceGroupRows({
  label,
  count,
  open,
  onToggle,
  items,
  colSpan,
  canWrite,
  onEdit,
  onDelete,
}: {
  label: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  items: ResourceListItem[];
  colSpan: number;
  canWrite: boolean;
  onEdit: (resource: ResourceListItem) => void;
  onDelete: (resource: ResourceListItem) => void;
}) {
  return (
    <>
      <MTableRow className="bg-muted/50 hover:bg-muted/50">
        <MTableCell colSpan={colSpan}>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              aria-expanded={open}
              aria-label={open ? `${label} хураах` : `${label} дэлгэх`}
              className="text-muted-foreground"
              onClick={onToggle}
            >
              {open ? <MinusIcon /> : <PlusIcon />}
            </Button>
            <span className="font-medium">{label}</span>
            <span className="text-xs text-muted-foreground">{count} цэс</span>
          </div>
        </MTableCell>
      </MTableRow>

      {open
        ? items.map((resource) => {
            const mutable = canMutateResource(resource);
            const removable = canDeleteResource(resource);

            return (
              <MTableRow key={resource.id}>
                {canWrite ? (
                  <MTableCell>
                    <div className="flex gap-1">
                      <EditButton
                        size="icon"
                        text={false}
                        disabled={!mutable}
                        onClick={() => onEdit(resource)}
                      />
                      <DeleteButton
                        size="icon"
                        text={false}
                        disabled={!removable}
                        onClick={() => onDelete(resource)}
                      />
                    </div>
                  </MTableCell>
                ) : null}
                <MTableCell className="font-medium">
                  <div className="flex flex-wrap items-center gap-2 pl-9">
                    {resource.name}
                    {resource.isSystem ? (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        систем
                      </span>
                    ) : null}
                    {resource.isMenu ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        цэс
                      </span>
                    ) : null}
                  </div>
                </MTableCell>
                <MTableCell className="text-muted-foreground">
                  {resource.slug}
                </MTableCell>
                <MTableCell className="text-muted-foreground">
                  {resource.path ?? '—'}
                </MTableCell>
                <MTableCell>
                  {RESOURCE_SCOPE_LABELS[resource.scope]}
                </MTableCell>
                <MTableCell>{resource.sortOrder}</MTableCell>
                <MTableCell className="max-w-48 truncate text-muted-foreground">
                  {resource.actions.join(', ') || '—'}
                </MTableCell>
              </MTableRow>
            );
          })
        : null}
    </>
  );
}
