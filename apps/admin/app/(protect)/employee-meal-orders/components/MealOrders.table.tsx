'use client';

import {
  EMPLOYEE_MEAL_ORDER_STATUSES,
  type EmployeeMealOrderItem,
  type EmployeeMealOrderStatus,
} from '@packages/types';
import { MSelect } from '@packages/ui/main/MFields';
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

import { Icons } from '@/utils/icons';

import { MEAL_ORDER_STATUS_LABELS } from '../lib/labels';

export function MealOrdersTable({
  items,
  isLoading,
  errorMessage,
  canEdit,
  statusPending,
  onStatus,
}: {
  items: EmployeeMealOrderItem[];
  isLoading: boolean;
  errorMessage?: string;
  canEdit: boolean;
  statusPending: boolean;
  onStatus: (item: EmployeeMealOrderItem, status: EmployeeMealOrderStatus) => void;
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
    return <MTableEmpty icon={Icons.mealOrder} text="Захиалга олдсонгүй." />;
  }
  return (
    <MTable>
      <MTableHeader>
        <MTableRow>
          <MTableHead>Огноо</MTableHead>
          <MTableHead>Төрөл</MTableHead>
          <MTableHead>Ажилтан</MTableHead>
          <MTableHead>Код</MTableHead>
          <MTableHead>Төлөв</MTableHead>
        </MTableRow>
      </MTableHeader>
      <MTableBody>
        {items.map((item) => (
          <MTableRow key={item.id}>
            <MTableCell>{item.serviceDate}</MTableCell>
            <MTableCell>{item.mealTypeName}</MTableCell>
            <MTableCell className="font-medium">
              {item.employeeId
                ? <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Ажилтан:</span>
                      <span className="text-xs">{item.employeeName}</span>
                    </div>
                    {item.plateNumber && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">Техник:</span>
                        <span className="text-xs">{item.plateNumber}</span>
                      </div>
                    )}
                  </div>
                : 'Ажилтан олдсонгүй'}
            </MTableCell>
            <MTableCell>{item.employeeCode}</MTableCell>
            <MTableCell>
              <MSelect
                value={item.status}
                disabled={!canEdit || statusPending}
                onValueChange={(value) => {
                  if (value && value !== item.status) {
                    onStatus(item, value as EmployeeMealOrderStatus);
                  }
                }}
                options={EMPLOYEE_MEAL_ORDER_STATUSES.map((status) => ({
                  value: status,
                  label: MEAL_ORDER_STATUS_LABELS[status],
                }))}
              />
            </MTableCell>
          </MTableRow>
        ))}
      </MTableBody>
    </MTable>
  );
}
