import { downloadExcel } from '@packages/ui/excel';
import type { EmployeeMealOrderItem } from '@packages/types';

import { listEmployeeMealOrders } from '@/services/employee-meals/employee-meals.service';

import { formatFulfillmentType, MEAL_ORDER_STATUS_LABELS } from './labels';

export function mealOrderExportName(from: string, to: string) {
  return from === to ? `order-${from}` : `order-${from}-to-${to}`;
}

export function mealOrderExportTitle(from: string, to: string) {
  return from === to ? from : `${from} — ${to}`;
}

export async function exportMealOrders(options: { from: string; to: string; search?: string }) {
  const result = await listEmployeeMealOrders({
    page: 1,
    limit: '*',
    search: options.search || undefined,
    from: options.from,
    to: options.to,
  });

  await downloadExcel<EmployeeMealOrderItem>({
    fileName: mealOrderExportName(options.from, options.to),
    title: mealOrderExportTitle(options.from, options.to),
    sheetName: 'Захиалга',
    columns: [
      { header: 'Огноо', width: 14, value: (row) => row.serviceDate },
      { header: 'Төрөл', width: 18, value: (row) => row.mealTypeName },
      {
        header: 'Ажилтан',
        width: 28,
        value: (row) => row.employeeName?.trim() || row.employeeCode?.trim() || '—',
      },
      { header: 'Код', width: 16, value: (row) => row.employeeCode },
      { header: 'Улсын дугаар', width: 16, value: (row) => row.plateNumber?.trim() || '' },
      {
        header: 'Хэлбэр',
        width: 16,
        value: (row) => formatFulfillmentType(row.fulfillmentType),
      },
      {
        header: 'Хаана',
        width: 24,
        value: (row) =>
          row.fulfillmentType === 'DELIVERY' ? row.deliveryLocation?.trim() || '' : '',
      },
      { header: 'Төлөв', width: 14, value: (row) => MEAL_ORDER_STATUS_LABELS[row.status] },
    ],
    rows: result.items,
  });
}
