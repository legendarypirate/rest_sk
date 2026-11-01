'use client';

import type { EmployeeListItem, EmployeeStatus } from '@packages/types';
import { Button } from '@packages/ui/components/button';
import { StatusCell } from '@packages/ui/main/Status.cell';
import {
  MTable,
  MTableBody,
  MTableCell,
  MTableHeader,
  MTableRow,
} from '@packages/ui/main/MTable';
import { SortHead } from '@packages/ui/main/MTable.helper';
import { MTableEmpty } from '@packages/ui/main/MTable.empty';
import { MTableSkeleton } from '@packages/ui/main/MTableSkeleton';
import { cn } from '@packages/ui/lib/utils';

import type { ListEmployeesQueryDto } from '@/types/employees/employee.dto';
import { Icons } from '@/utils/icons';

import {
  EMPLOYEE_STATUS_CLASS,
  EMPLOYEE_STATUS_LABELS,
  EMPLOYEE_STATUS_OPTIONS,
  formatDateTime,
} from '../lib/labels';

type EmployeeSortField = NonNullable<ListEmployeesQueryDto['sortBy']>;

type EmployeesTableProps = {
  items: EmployeeListItem[];
  isLoading: boolean;
  errorMessage?: string;
  sortBy: EmployeeSortField;
  sortDirection: NonNullable<ListEmployeesQueryDto['sortDirection']>;
  onSort: (field: EmployeeSortField) => void;
  canEdit?: boolean;
  statusPendingId?: string;
  onStatusChange?: (item: EmployeeListItem, status: EmployeeStatus) => void;
};

export function EmployeesTable({
  items,
  isLoading,
  errorMessage,
  sortBy,
  sortDirection,
  onSort,
  canEdit = false,
  statusPendingId,
  onStatusChange,
}: EmployeesTableProps) {
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
    return <MTableEmpty icon={Icons.employees} text="Ажилтан олдсонгүй." />;
  }

  return (
    <MTable>
      <MTableHeader>
        <MTableRow>
          <SortHead
            field="employeeCode"
            label="Код"
            sortBy={sortBy}
            sortOrder={sortDirection}
            onSort={onSort}
          />
          <SortHead
            field="lastName"
            label="Овог"
            sortBy={sortBy}
            sortOrder={sortDirection}
            onSort={onSort}
          />
          <SortHead
            field="firstName"
            label="Нэр"
            sortBy={sortBy}
            sortOrder={sortDirection}
            onSort={onSort}
          />
          <SortHead
            field="department"
            label="Алба"
            sortBy={sortBy}
            sortOrder={sortDirection}
            onSort={onSort}
          />
          <SortHead
            field="position"
            label="Албан тушаал"
            sortBy={sortBy}
            sortOrder={sortDirection}
            onSort={onSort}
          />
          <SortHead
            field="vehiclePlate"
            label="Улсын дугаар"
            sortBy={sortBy}
            sortOrder={sortDirection}
            onSort={onSort}
          />
          <SortHead
            field="status"
            label="Төлөв"
            sortBy={sortBy}
            sortOrder={sortDirection}
            onSort={onSort}
          />
          <SortHead
            field="updatedAt"
            label="Шинэчлэгдсэн"
            sortBy={sortBy}
            sortOrder={sortDirection}
            onSort={onSort}
          />
        </MTableRow>
      </MTableHeader>
      <MTableBody>
        {items.map((item) => (
          <MTableRow key={item.id}>
            <MTableCell className="font-medium">{item.employeeCode ?? '—'}</MTableCell>
            <MTableCell>{item.lastName}</MTableCell>
            <MTableCell>{item.firstName}</MTableCell>
            <MTableCell>{item.department}</MTableCell>
            <MTableCell>{item.position}</MTableCell>
            <MTableCell>{item.vehiclePlate ?? '—'}</MTableCell>
            <MTableCell>
              {canEdit && onStatusChange ? (
                <StatusToggle
                  status={item.status}
                  pending={statusPendingId === item.id}
                  onChange={(status) => onStatusChange(item, status)}
                />
              ) : (
                <StatusCell
                  value={item.status}
                  labels={EMPLOYEE_STATUS_LABELS}
                  classMap={EMPLOYEE_STATUS_CLASS}
                  options={EMPLOYEE_STATUS_OPTIONS}
                  disabled
                />
              )}
            </MTableCell>
            <MTableCell>{formatDateTime(item.updatedAt)}</MTableCell>
          </MTableRow>
        ))}
      </MTableBody>
    </MTable>
  );
}

function StatusToggle({
  status,
  pending,
  onChange,
}: {
  status: EmployeeStatus;
  pending?: boolean;
  onChange: (status: EmployeeStatus) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-md border bg-muted/40 p-0.5">
      <ToggleOption
        label={EMPLOYEE_STATUS_LABELS.ACTIVE}
        active={status === 'ACTIVE'}
        pending={pending}
        onClick={() => onChange('ACTIVE')}
      />
      <ToggleOption
        label={EMPLOYEE_STATUS_LABELS.INACTIVE}
        active={status === 'INACTIVE'}
        pending={pending}
        onClick={() => onChange('INACTIVE')}
      />
    </div>
  );
}

function ToggleOption({
  label,
  active,
  pending,
  onClick,
}: {
  label: string;
  active: boolean;
  pending?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      size="xs"
      variant={active ? 'default' : 'ghost'}
      disabled={pending || active}
      aria-pressed={active}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={cn('cursor-pointer', !active && 'text-muted-foreground')}
    >
      {label}
    </Button>
  );
}
