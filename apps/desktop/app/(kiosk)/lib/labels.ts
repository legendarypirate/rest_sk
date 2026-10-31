import type { ServiceType } from '@packages/types';

export const ALL_CATEGORY = 'Бүгд';
export const CATALOG_LOADING = 'Цэс ачаалж байна…';

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  DINE_IN: 'Эндээ идэх',
  TAKEAWAY: 'Авч явах',
};

export const SERVICE_TYPE_HINTS: Record<ServiceType, string> = {
  DINE_IN: 'Ресторан дотор сууж иднэ',
  TAKEAWAY: 'Хоолоо авч явах',
};

export function money(value: number) {
  return `${new Intl.NumberFormat('mn-MN').format(value)}₮`;
}

export function formatOrderNo(orderNo: number) {
  return String(orderNo).padStart(4, '0');
}
