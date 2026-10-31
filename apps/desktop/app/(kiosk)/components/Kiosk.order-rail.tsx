'use client';

import type { KioskCartLine } from '@/types';

import { money } from '../lib/labels';
import { KioskLink } from './Kiosk.nav';
import { KioskQty } from './Kiosk.qty';
import { ProductImage } from './Product.image';

type KioskOrderRailProps = {
  cart: KioskCartLine[];
  total: number;
  checkoutHref: string;
  cartRef?: React.Ref<HTMLDivElement>;
  pulse?: boolean;
  onAdjust: (id: string, delta: number) => void;
};

export function KioskOrderRail({
  cart,
  total,
  checkoutHref,
  cartRef,
  pulse = false,
  onAdjust,
}: KioskOrderRailProps) {
  const count = cart.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <aside className="flex h-80 shrink-0 flex-col border-t border-slate-200 bg-white">
      <div className="flex h-14 shrink-0 items-center justify-between px-8">
        <p className="text-xl font-semibold">Сагс</p>
        <div
          ref={cartRef}
          className={
            pulse
              ? 'scale-110 rounded-full bg-[#102A43] px-4 py-1 text-lg font-semibold text-white tabular-nums transition'
              : 'rounded-full bg-slate-100 px-4 py-1 text-lg font-semibold text-[#102A43] tabular-nums transition'
          }
        >
          {count} ш
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-8">
        {cart.length === 0 ? (
          <p className="py-6 text-center text-lg text-slate-400">
            Хоолоо сонгоод захиалгаа эхлүүлнэ үү.
          </p>
        ) : (
          <ul className="space-y-3">
            {cart.map((line) => (
              <li key={line.id} className="flex items-center gap-4">
                <ProductImage
                  category={line.category}
                  alt=""
                  className="size-14 shrink-0 rounded-2xl"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-medium">{line.name}</p>
                  <p className="text-base text-slate-500 tabular-nums">{money(line.price)}</p>
                </div>
                <KioskQty
                  value={line.quantity}
                  onDecrease={() => onAdjust(line.id, -1)}
                  onIncrease={() => onAdjust(line.id, 1)}
                />
                <p className="w-28 shrink-0 text-right text-lg font-semibold tabular-nums">
                  {money(line.price * line.quantity)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-6 border-t border-slate-100 px-8 py-4">
        <div className="min-w-0">
          <p className="text-sm tracking-[0.14em] text-slate-400 uppercase">Нийт төлөх</p>
          <p className="text-3xl font-semibold tabular-nums">{money(total)}</p>
        </div>
        {cart.length > 0 ? (
          <KioskLink href={checkoutHref} className="h-16 flex-1 text-xl font-semibold">
            Төлбөр рүү
          </KioskLink>
        ) : (
          <p className="flex-1 text-right text-base text-slate-400">НӨАТ үнийн дүнд багтсан</p>
        )}
      </div>
    </aside>
  );
}
