'use client';

import type { EbarimtPreview } from '@packages/types';
import type { ReceiptData } from '@/electron/types/config.types';

import { KioskLink } from './Kiosk.nav';
import { ThermalEbarimtReceipt } from './ebarimt/Thermal.receipt';

type QrScreenProps = {
  preview: EbarimtPreview;
  orderType: ReceiptData['orderType'];
  continueHref: string;
};

export function QrScreen({ preview, orderType, continueHref }: QrScreenProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="px-10 pt-8 pb-4">
        <p className="text-sm font-medium tracking-[0.24em] text-slate-400 uppercase">
          e-barimt
        </p>
        <h1 className="mt-2 text-5xl font-semibold tracking-tight">Баримтаа уншуулна уу</h1>
      </div>
      <div className="flex min-h-0 flex-1 items-start justify-center overflow-y-auto px-10 py-6">
        <ThermalEbarimtReceipt
          preview={preview}
          orderType={orderType}
          showSimulateBadge={preview.simulate}
        />
      </div>
      <div className="border-t border-slate-200 bg-white px-10 py-6">
        <KioskLink href={continueHref} className="h-20 w-full text-2xl">
          Үргэлжлүүлэх
        </KioskLink>
      </div>
    </section>
  );
}
