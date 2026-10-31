import type { EbarimtReceiptType, KioskCatalogProduct, ServiceType } from '@packages/types';

export type KioskProduct = KioskCatalogProduct;

export type KioskCartLine = KioskProduct & { quantity: number };

export type { KioskCatalog } from '@packages/types';

export type KioskServiceType = ServiceType;

export type ReceiptMode = 'print' | 'digital';

export type ReceiptType = EbarimtReceiptType;
