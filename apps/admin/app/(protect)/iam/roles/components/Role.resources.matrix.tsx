'use client';

import { Fragment } from 'react';
import { cn } from '@packages/ui/lib/utils';
import { MCheckbox } from '@packages/ui/main/MFields';
import {
  MTable,
  MTableBody,
  MTableCell,
  MTableHead,
  MTableHeader,
  MTableRow,
} from '@packages/ui/main/MTable';
import { MTableSkeleton } from '@packages/ui/main/MTableSkeleton';
import { Layers } from 'lucide-react';

import { resourceActionHint, resourceActionLabel } from '@/lib/resource-actions';
import { Icons } from '@/utils/icons';

import { ROLE_SCOPE_LABELS } from '../lib/labels';
import {
  actionPermissionIds,
  allSelected,
  rowPermissionIds,
  rowReadCell,
  type MatrixCell,
  type MatrixRow,
  type PermissionMatrix,
} from '../lib/matrix';

type RoleResourcesMatrixProps = {
  matrix: PermissionMatrix;
  selectedIds: string[];
  isLoading: boolean;
  errorMessage?: string;
  disabled?: boolean;
  onToggle: (id: string, checked: boolean) => void;
  onToggleMany: (ids: string[], checked: boolean) => void;
};

function idsWithImpliedRead(row: MatrixRow, cell: MatrixCell, checked: boolean) {
  const readCell = rowReadCell(row);

  if (checked && cell.action !== 'read' && readCell) {
    return [cell.id, readCell.id];
  }

  if (!checked && cell.action === 'read') {
    return rowPermissionIds(row);
  }

  return [cell.id];
}

function columnIdsWithImpliedRead(
  rows: MatrixRow[],
  action: string,
  checked: boolean,
) {
  if (checked && action !== 'read') {
    return rows.flatMap((row) => {
      const cell = row.cells[action];
      const readCell = rowReadCell(row);
      if (!cell) {
        return [];
      }
      return readCell ? [cell.id, readCell.id] : [cell.id];
    });
  }

  if (!checked && action === 'read') {
    return rows.flatMap((row) =>
      rowReadCell(row) ? rowPermissionIds(row) : [],
    );
  }

  return actionPermissionIds(rows, action);
}

function ResourceIcon({ name }: { name: string | null }) {
  const Icon =
    name && name in Icons ? Icons[name as keyof typeof Icons] : Layers;

  return <Icon className="size-4 shrink-0 text-muted-foreground" />;
}

function PermissionCell({
  cell,
  checked,
  disabled,
  onToggle,
}: {
  cell?: MatrixCell;
  checked: boolean;
  disabled?: boolean;
  onToggle: (id: string, checked: boolean) => void;
}) {
  if (!cell) {
    return <span className="text-muted-foreground/40">—</span>;
  }

  return (
    <span title={resourceActionHint(cell.action) ?? `${cell.name} (${cell.key})`} className="inline-flex">
      <MCheckbox
        checked={checked}
        disabled={disabled}
        className={cn(cell.isDangerous && 'border-amber-500/70')}
        onCheckedChange={(next) => onToggle(cell.id, Boolean(next))}
      />
    </span>
  );
}

export function RoleResourcesMatrix({
  matrix,
  selectedIds,
  isLoading,
  errorMessage,
  disabled,
  onToggleMany,
}: RoleResourcesMatrixProps) {
  if (isLoading && matrix.rows.length === 0) {
    return <MTableSkeleton />;
  }

  if (errorMessage) {
    return (
      <div className="min-h-48 text-sm flex items-center justify-center text-destructive">
        {errorMessage}
      </div>
    );
  }

  const selected = new Set(selectedIds);
  const columnCount = matrix.actions.length + 2;

  return (
    <MTable>
      <MTableHeader>
        <MTableRow>
          <MTableHead className="sticky left-0 z-30 min-w-64 bg-muted">
            Цэс
          </MTableHead>
          {matrix.actions.map((action) => {
            const ids = actionPermissionIds(matrix.rows, action);
            const checked = allSelected(selectedIds, ids);

            return (
              <MTableHead key={action} className="text-center">
                <div className="gap-1.5 flex flex-col items-center">
                  <MCheckbox
                    checked={checked}
                    disabled={disabled || ids.length === 0}
                    onCheckedChange={(next) =>
                      onToggleMany(
                        columnIdsWithImpliedRead(
                          matrix.rows,
                          action,
                          Boolean(next),
                        ),
                        Boolean(next),
                      )
                    }
                  />
                  <span title={resourceActionHint(action)}>
                    {resourceActionLabel(action)}
                  </span>
                </div>
              </MTableHead>
            );
          })}
          <MTableHead className="w-16 text-center">Бүгд</MTableHead>
        </MTableRow>
      </MTableHeader>
      <MTableBody>
        {matrix.rows.length === 0 ? (
          <MTableRow>
            <MTableCell
              colSpan={columnCount}
              className="h-24 text-center text-muted-foreground"
            >
              Цэс олдсонгүй.
            </MTableCell>
          </MTableRow>
        ) : (
          matrix.groups.map((group) => (
            <Fragment key={group.key}>
              <MTableRow className="hover:bg-transparent">
                <MTableCell
                  colSpan={columnCount}
                  className="sticky left-0 bg-muted/70 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {group.label}
                </MTableCell>
              </MTableRow>
              {group.rows.map((row) => {
                const rowIds = rowPermissionIds(row);
                const grantedCount = rowIds.filter((id) =>
                  selected.has(id),
                ).length;

                return (
                  <MTableRow key={row.key} className="group">
                    <MTableCell className="sticky left-0 z-10 bg-card group-hover:bg-muted/60">
                      <div className="gap-3 flex items-start">
                        <MCheckbox
                          checked={allSelected(selectedIds, rowIds)}
                          disabled={disabled || rowIds.length === 0}
                          onCheckedChange={(next) =>
                            onToggleMany(rowIds, Boolean(next))
                          }
                        />
                        <ResourceIcon name={row.icon} />
                        <div className="min-w-0">
                          <div className="gap-2 flex flex-wrap items-center">
                            <span className="font-medium">{row.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {ROLE_SCOPE_LABELS[row.scope]}
                            </span>
                          </div>
                          <p className="font-mono text-xs text-muted-foreground">
                            {row.slug}
                          </p>
                        </div>
                      </div>
                    </MTableCell>
                    {matrix.actions.map((action) => {
                      const cell = row.cells[action];

                      return (
                        <MTableCell key={action} className="text-center">
                          <div className="flex justify-center">
                            <PermissionCell
                              cell={cell}
                              checked={Boolean(cell && selected.has(cell.id))}
                              disabled={disabled}
                              onToggle={(id, next) => {
                                if (!cell) {
                                  return;
                                }

                                onToggleMany(
                                  idsWithImpliedRead(row, cell, next),
                                  next,
                                );
                              }}
                            />
                          </div>
                        </MTableCell>
                      );
                    })}
                    <MTableCell className="text-center tabular-nums text-muted-foreground">
                      {grantedCount}/{rowIds.length}
                    </MTableCell>
                  </MTableRow>
                );
              })}
            </Fragment>
          ))
        )}
      </MTableBody>
    </MTable>
  );
}
