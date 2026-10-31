export type DisplayPreset = 'fullHd' | 'hdReady' | 'portraitKiosk' | 'squareTablet';

export interface KioskConfig {
  display: {
    preset: DisplayPreset;
    fullscreen: boolean;
    useNativeResolution: boolean;
    resizable: boolean;
  };
  printer: {
    enabled: boolean;
    interface: string;
    simulate: boolean;
  };
  pos: {
    enabled: boolean;
    comPort: string;
    baudRate: number;
    simulate: boolean;
  };
}

export const DEFAULT_KIOSK_CONFIG: KioskConfig = {
  display: {
    preset: 'portraitKiosk',
    fullscreen: true,
    useNativeResolution: false,
    resizable: false,
  },
  printer: {
    enabled: true,
    interface: 'printer:POS-80',
    simulate: true,
  },
  pos: {
    enabled: true,
    comPort: 'COM3',
    baudRate: 9600,
    simulate: true,
  },
};

export type OrderType = 'dine-in' | 'takeaway';

export interface ReceiptLine {
  name: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface ReceiptData {
  orderId: string;
  orderType: OrderType;
  lines: ReceiptLine[];
  subtotal: number;
  tax: number;
  total: number;
  kioskName?: string;
  createdAt: string;
  ebarimt?: {
    receiptType: 'individual' | 'company';
    consumerTin?: string;
  };
}

export interface HardwareStepResult {
  success: boolean;
  message: string;
  transactionId?: string;
}

export interface CheckoutResult {
  success: boolean;
  orderId: string;
  message: string;
  pos?: HardwareStepResult;
  print?: HardwareStepResult;
  ebarimt?: HardwareStepResult & {
    billId?: string;
    lottery?: string;
    qrData?: string;
    preview?: import('@packages/types').EbarimtPreview;
  };
}

