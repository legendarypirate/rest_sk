import type { HardwareStepResult } from '../types/config.types';
import { loadKioskConfig } from '../config/kiosk-config.cjs';

type SerialPortLike = {
  open: (callback: (error: Error | null) => void) => void;
  write: (payload: Buffer, callback: (error: Error | null | undefined) => void) => void;
  close: () => void;
};

type SerialPortModule = {
  SerialPort: new (options: {
    path: string;
    baudRate: number;
    autoOpen: boolean;
  }) => SerialPortLike;
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadSerialPort(): Promise<SerialPortModule> {
  const specifier = 'serialport';
  return import(specifier) as Promise<SerialPortModule>;
}

/** POS terminal — simulate, эсвэл COM port (Genevision / bank terminal). */
export async function chargeCard(amount: number): Promise<HardwareStepResult> {
  const config = loadKioskConfig();

  if (!config.pos.enabled) {
    return { success: false, message: 'POS идэвхгүй байна (kiosk.config.json)' };
  }

  if (config.pos.simulate) {
    await delay(1500);
    return {
      success: true,
      message: `[SIMULATE] POS төлбөр амжилттай: ${amount.toLocaleString('mn-MN')}₮`,
      transactionId: `SIM-${Date.now()}`,
    };
  }

  try {
    const { SerialPort } = await loadSerialPort();
    const port = new SerialPort({
      path: config.pos.comPort,
      baudRate: config.pos.baudRate,
      autoOpen: false,
    });

    await new Promise<void>((resolve, reject) => {
      port.open((error: Error | null) => (error ? reject(error) : resolve()));
    });

    const payload = Buffer.from(`PAY:${amount}\n`, 'utf-8');
    await new Promise<void>((resolve, reject) => {
      port.write(payload, (error: Error | null | undefined) => {
        port.close();
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    return {
      success: true,
      message: `POS төлбөр илгээгдлээ (${config.pos.comPort})`,
      transactionId: `POS-${Date.now()}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `POS алдаа: ${message}. COM port / simulate тохиргоог шалгана уу.`,
    };
  }
}
