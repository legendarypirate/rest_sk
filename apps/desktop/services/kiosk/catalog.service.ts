import type { KioskCatalog } from '@packages/types';

import { ALL_CATEGORY } from '@/app/(kiosk)/lib/labels';
import { api } from '@/lib/api';

export async function listKioskCatalog(): Promise<KioskCatalog> {
  const catalog = await api<KioskCatalog>('kiosk/catalog');
  return {
    categories: [ALL_CATEGORY, ...catalog.categories],
    products: catalog.products,
  };
}
