'use client';

import { StatusCell } from '@packages/ui/main/Status.cell';
import {
  MTable,
  MTableBody,
  MTableCell,
  MTableHead,
  MTableHeader,
  MTableRow,
} from '@packages/ui/main/MTable';
import { SortHead } from '@packages/ui/main/MTable.helper';
import { MTableEmpty } from '@packages/ui/main/MTable.empty';
import { MTableSkeleton } from '@packages/ui/main/MTableSkeleton';

import type { EmployeeListItem } from '@packages/types';

import type { ListEmployeesQueryDto } from '@/types/employees/employee.dto';
import { Icons } from '@/utils/icons';

import {
  EMPLOYEE_STATUS_CLASS,
  EMPLOYEE_STATUS_LABELS,
  EMPLOYEE_STATUS_OPTIONS,
  formatDateTime,
} from '../lib/labels';

type EmployeesTableProps = {
  items: EmployeeListItem[];
  isLoading: boolean;
  errorMessage?: string;
  sortBy: NonNullable<ListEmployeesQueryDto['sortBy']>;
  sortDirection: NonNullable<ListEmployeesQueryDto['sortDirection']>;
  onSort: (field: NonNullable<ListEmployeesQueryDto['sortBy']>) => void;
};

export function EmployeesTable({
  items,
  isLoading,
  errorMessage,
  sortBy,
  sortDirection,
  onSort,
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
          <MTableHead>Алба</MTableHead>
          <MTableHead>Албан тушаал</MTableHead>
          <MTableHead>Улсын дугаар</MTableHead>
          <MTableHead>Төлөв</MTableHead>
          <MTableHead>Шинэчлэгдсэн</MTableHead>
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
              <StatusCell
                value={item.status}
                labels={EMPLOYEE_STATUS_LABELS}
                classMap={EMPLOYEE_STATUS_CLASS}
                options={EMPLOYEE_STATUS_OPTIONS}
                disabled
              />
            </MTableCell>
            <MTableCell>{formatDateTime(item.updatedAt)}</MTableCell>
          </MTableRow>
        ))}
      </MTableBody>
    </MTable>
  );
}
