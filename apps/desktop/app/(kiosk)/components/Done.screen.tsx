'use client';

import { formatOrderNo, money } from '../lib/labels';
import { KIOSK_ROUTES } from '../lib/routes';
import { KioskLink } from './Kiosk.nav';

type DoneScreenProps = {
  orderNo: number;
  total: number;
  onReset: () => void;
};

export function DoneScreen({ orderNo, total, onReset }: DoneScreenProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col items-center justify-center px-16 text-center">
      <div className="grid size-36 place-items-center rounded-full bg-[#102A43] text-6xl text-white">
        ✓
      </div>
      <p className="mt-12 text-xl tracking-[0.22em] text-slate-400 uppercase">
        Захиалга № {formatOrderNo(orderNo)}
      </p>
      <h1 className="mt-4 text-8xl font-semibold tracking-tight">Баярлалаа</h1>
      <p className="mt-6 text-5xl font-semibold text-[#102A43] tabular-nums">
        {money(total)}
      </p>
      <p className="mt-6 max-w-xl text-2xl leading-relaxed text-slate-500">
        Дугаараа хадгална уу. Хоол бэлэн болоход дуудлага гарна.
      </p>
      <KioskLink
        href={KIOSK_ROUTES.welcome}
        className="mt-16 h-20 w-full max-w-xl text-2xl"
        onClick={onReset}
      >
        Шинэ захиалга
      </KioskLink>
    </section>
  );
}
