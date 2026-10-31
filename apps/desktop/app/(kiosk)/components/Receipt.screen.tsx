'use client';

import type { EbarimtPreview } from '@packages/types';

import type { ReceiptData } from '@/electron/types/config.types';

import { ThermalEbarimtReceipt } from './ebarimt/Thermal.receipt';

type ReceiptScreenProps = {
  preview: EbarimtPreview;
  orderType: ReceiptData['orderType'];
  onNewOrder: () => void;
};

export function ReceiptScreen({ preview, orderType, onNewOrder }: ReceiptScreenProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col bg-[#E7EDF2]">
      <div className="px-10 pt-8">
        <p className="text-sm font-medium tracking-[0.24em] text-slate-400 uppercase">e-barimt</p>
        <h1 className="mt-2 text-5xl font-semibold tracking-tight text-[#102A43]">Баримт</h1>
      </div>
      <div className="flex min-h-0 flex-1 items-start justify-center overflow-y-auto px-10 py-8">
        <div style={{ zoom: 1.35 }}>
          <ThermalEbarimtReceipt
            preview={preview}
            orderType={orderType}
            showSimulateBadge={false}
          />
        </div>
      </div>
      <div className="bg-white px-10 py-6">
        <button
          type="button"
          className="h-20 w-full rounded-2xl bg-[#102A43] text-2xl font-semibold text-white"
          onClick={onNewOrder}
        >
          Шинэ захиалга
        </button>
      </div>
    </section>
  );
}
