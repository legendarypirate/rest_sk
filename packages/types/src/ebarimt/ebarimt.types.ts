export type EbarimtReceiptType = 'individual' | 'company';

export interface EbarimtOptions {
  receiptType: EbarimtReceiptType;
  consumerTin?: string;
}

export interface EbarimtLineItem {
  name: string;
  qty: number;
  unitPrice: number;
  total: number;
  vat: number;
}

/** e-barimt баримтын урьдчилсан харагдац */
export interface EbarimtPreview {
  billId: string;
  lottery: string;
  qrData: string;
  merchantName: string;
  merchantTin: string;
  date: string;
  receiptType: EbarimtReceiptType;
  consumerTin?: string;
  subtotal: number;
  vat: number;
  total: number;
  items: EbarimtLineItem[];
  simulate: boolean;
}

export interface EbarimtResult {
  success: boolean;
  message: string;
  billId?: string;
  lottery?: string;
  qrData?: string;
  preview?: EbarimtPreview;
}
