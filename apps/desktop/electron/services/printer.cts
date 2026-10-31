import type { HardwareStepResult, ReceiptData } from '../types/config.types';
import { loadKioskConfig } from '../config/kiosk-config.cjs';

type ThermalPrinterLike = {
  isPrinterConnected: () => Promise<boolean>;
  alignCenter: () => void;
  alignLeft: () => void;
  bold: (value: boolean) => void;
  println: (text: string) => void;
  drawLine: () => void;
  cut: () => void;
  execute: () => Promise<void>;
};

type ThermalPrinterModule = {
  PrinterTypes: { EPSON: string };
  ThermalPrinter: new (options: {
    type: string;
    interface: string;
    removeSpecialCharacters: boolean;
    lineCharacter: string;
    options: { timeout: number };
  }) => ThermalPrinterLike;
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadThermalPrinter(): Promise<ThermalPrinterModule> {
  const specifier = 'node-thermal-printer';
  return import(specifier) as Promise<ThermalPrinterModule>;
}

function formatReceipt(receipt: ReceiptData): string {
  const lines = [
    '================================',
    '           KHONGOR',
    '================================',
    `Захиалга: ${receipt.orderId}`,
    `Огноо: ${new Date(receipt.createdAt).toLocaleString('mn-MN')}`,
    receipt.orderType === 'dine-in' ? 'Энд идэх' : 'Авч явах',
    '--------------------------------',
    ...receipt.lines.map(
      (line) =>
        `${line.name}\n  ${line.qty} x ${line.unitPrice.toLocaleString('mn-MN')} = ${line.lineTotal.toLocaleString('mn-MN')}₮`,
    ),
    '--------------------------------',
    `Дэд дүн: ${receipt.subtotal.toLocaleString('mn-MN')}₮`,
    `НӨАТ:    ${receipt.tax.toLocaleString('mn-MN')}₮`,
    `НИЙТ:   ${receipt.total.toLocaleString('mn-MN')}₮`,
    '================================',
    '     Баярлалаа!',
    '================================',
    '\n\n',
  ];
  return lines.join('\n');
}

/** 80mm thermal printer — Windows printer name эсвэл COM. */
export async function printReceipt(receipt: ReceiptData): Promise<HardwareStepResult> {
  const config = loadKioskConfig();

  if (!config.printer.enabled) {
    return { success: false, message: 'Printer идэвхгүй байна (kiosk.config.json)' };
  }

  if (config.printer.simulate) {
    await delay(800);
    console.log('[printer simulate]\n', formatReceipt(receipt));
    return { success: true, message: '[SIMULATE] Баримт хэвлэгдлээ (console)' };
  }

  try {
    const { ThermalPrinter, PrinterTypes } = await loadThermalPrinter();
    const printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: config.printer.interface,
      removeSpecialCharacters: false,
      lineCharacter: '=',
      options: { timeout: 10000 },
    });

    const isConnected = await printer.isPrinterConnected();
    if (!isConnected) {
      return {
        success: false,
        message: `Printer холбогдоогүй: ${config.printer.interface}. Windows Printers-ээс нэрийг шалгана уу.`,
      };
    }

    printer.alignCenter();
    printer.bold(true);
    printer.println('KHONGOR');
    printer.bold(false);
    printer.drawLine();
    printer.alignLeft();
    printer.println(`Захиалга: ${receipt.orderId}`);
    printer.println(new Date(receipt.createdAt).toLocaleString('mn-MN'));
    printer.println(receipt.orderType === 'dine-in' ? 'Энд идэх' : 'Авч явах');
    printer.drawLine();

    for (const line of receipt.lines) {
      printer.println(line.name);
      printer.println(
        `  ${line.qty} x ${line.unitPrice.toLocaleString('mn-MN')} = ${line.lineTotal.toLocaleString('mn-MN')}₮`,
      );
    }

    printer.drawLine();
    printer.println(`Дэд дүн: ${receipt.subtotal.toLocaleString('mn-MN')}₮`);
    printer.println(`НӨАТ:    ${receipt.tax.toLocaleString('mn-MN')}₮`);
    printer.bold(true);
    printer.println(`НИЙТ:   ${receipt.total.toLocaleString('mn-MN')}₮`);
    printer.bold(false);
    printer.drawLine();
    printer.alignCenter();
    printer.println('Баярлалаа!');
    printer.cut();

    await printer.execute();
    return { success: true, message: 'Баримт амжилттай хэвлэгдлээ' };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Printer алдаа: ${message}. kiosk.config.json → printer.interface шалгана уу.`,
    };
  }
}
