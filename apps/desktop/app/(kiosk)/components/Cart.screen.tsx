'use client';

import type { KioskCartLine } from '@/types';

import { money } from '../lib/labels';
import { KioskCheckout } from './Kiosk.checkout';
import { KioskLink } from './Kiosk.nav';
import { KioskQty } from './Kiosk.qty';
import { ProductImage } from './Product.image';

type CartScreenProps = {
  cart: KioskCartLine[];
  total: number;
  backHref: string;
  continueHref: string;
  onAdjust: (id: string, delta: number) => void;
};

export function CartScreen({
  cart,
  total,
  backHref,
  continueHref,
  onAdjust,
}: CartScreenProps) {
  return (
    <KioskCheckout
      step={1}
      title="Таны захиалга"
      hint="Тоо ширхгээ шалгаад төлбөр рүү үргэлжлүүлнэ үү."
      backHref={backHref}
      backLabel="Цэс рүү"
      footer={
        cart.length > 0 ? (
          <KioskLink
            href={continueHref}
            className="h-20 w-full justify-between text-2xl"
          >
            <span>Төлбөр рүү</span>
            <span className="tabular-nums">{money(total)}</span>
          </KioskLink>
        ) : (
          <KioskLink href={backHref} className="h-20 w-full text-2xl">
            Цэс үзэх
          </KioskLink>
        )
      }
    >
      {cart.length === 0 ? (
        <p className="py-24 text-center text-2xl text-slate-400">
          Сагс хоосон байна.
        </p>
      ) : (
        <ul className="space-y-3">
          {cart.map((line) => (
            <li
              key={line.id}
              className="flex items-center gap-5 rounded-3xl bg-white p-5 ring-1 ring-slate-200"
            >
              <ProductImage
                category={line.category}
                alt=""
                className="size-20 shrink-0 rounded-2xl"
              />
              <div className="min-w-0 flex-1">
                <p className="text-2xl font-semibold">{line.name}</p>
                <p className="mt-1 text-lg text-slate-500">
                  {money(line.price)}
                </p>
                <div className="mt-3">
                  <KioskQty
                    value={line.quantity}
                    onDecrease={() => onAdjust(line.id, -1)}
                    onIncrease={() => onAdjust(line.id, 1)}
                  />
                </div>
              </div>
              <p className="text-2xl font-semibold tabular-nums">
                {money(line.price * line.quantity)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </KioskCheckout>
  );
}
