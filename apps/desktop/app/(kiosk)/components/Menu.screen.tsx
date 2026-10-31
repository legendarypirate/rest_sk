'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

import type { KioskCartLine, KioskProduct } from '@/types';

import { ALL_CATEGORY, money } from '../lib/labels';
import { productImageSrc } from '../lib/product-image';
import { KioskOrderRail } from './Kiosk.order-rail';
import { ProductImage } from './Product.image';

type MenuScreenProps = {
  category: string;
  categories: string[];
  visible: KioskProduct[];
  cart: KioskCartLine[];
  total: number;
  checkoutHref: string;
  onCategoryChange: (category: string) => void;
  onAdd: (product: KioskProduct) => void;
  onAdjust: (id: string, delta: number) => void;
};

type Flyer = {
  id: number;
  src: string;
  from: Box;
  to: Box;
  moving: boolean;
};

type Box = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function MenuScreen({
  category,
  categories,
  visible,
  cart,
  total,
  checkoutHref,
  onCategoryChange,
  onAdd,
  onAdjust,
}: MenuScreenProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const flyerId = useRef(0);
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [pulse, setPulse] = useState(false);

  function addProduct(product: KioskProduct, image: HTMLImageElement) {
    const section = sectionRef.current;
    const cartTarget = cartRef.current;
    onAdd(product);
    if (!section || !cartTarget) {
      return;
    }

    const from = boxInside(section, image.getBoundingClientRect());
    const cartBox = boxInside(section, cartTarget.getBoundingClientRect());
    const size = 64;
    const to = {
      x: cartBox.x + cartBox.width / 2 - size / 2,
      y: cartBox.y + cartBox.height / 2 - size / 2,
      width: size,
      height: size,
    };
    flyerId.current += 1;
    const id = flyerId.current;
    const flyer: Flyer = {
      id,
      src: productImageSrc(product.category, product.imageUrl),
      from,
      to,
      moving: false,
    };
    setFlyers((current) => [...current, flyer]);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setFlyers((current) =>
          current.map((item) => (item.id === id ? { ...item, moving: true } : item)),
        );
      });
    });
  }

  function land(id: number) {
    setFlyers((current) => current.filter((item) => item.id !== id));
    setPulse(true);
    window.setTimeout(() => setPulse(false), 280);
  }

  return (
    <section ref={sectionRef} className="relative flex min-h-0 flex-1 flex-col">
      <nav
        className="flex h-28 shrink-0 items-center gap-3 overflow-x-auto px-8"
        aria-label="Хоолны ангилал"
      >
        {categories.map((item) => {
          const active = category === item;

          return (
            <button
              key={item}
              type="button"
              className={
                active
                  ? 'h-16 shrink-0 rounded-2xl bg-[#102A43] px-7 text-lg font-semibold text-white'
                  : 'h-16 shrink-0 rounded-2xl bg-white px-7 text-lg font-medium text-[#102A43] ring-1 ring-slate-200'
              }
              onClick={() => onCategoryChange(item)}
            >
              {item}
            </button>
          );
        })}
      </nav>

      <div className="flex h-16 shrink-0 items-end justify-between px-8 pb-2">
        <h1 className="text-4xl font-semibold tracking-tight">
          {category === ALL_CATEGORY ? 'Цэс' : category}
        </h1>
        <p className="text-lg text-slate-500">Хоол дээр дарж нэмнэ үү</p>
      </div>

      <div className="grid min-h-0 flex-1 auto-rows-max grid-cols-2 content-start items-start gap-5 overflow-auto px-8 pt-4 pb-6">
        {visible.map((product) => (
          <button
            key={product.id}
            type="button"
            className="flex h-auto w-full flex-col overflow-hidden rounded-3xl bg-white text-left text-[#102A43] shadow-sm ring-1 ring-slate-200 active:scale-[0.99]"
            onClick={(event) => {
              const image = event.currentTarget.querySelector('img');
              if (image) {
                addProduct(product, image);
              } else {
                onAdd(product);
              }
            }}
          >
            <ProductImage
              category={product.category}
              imageUrl={product.imageUrl}
              alt={product.name}
              className="h-52 w-full shrink-0"
            />
            <div className="flex shrink-0 flex-col gap-2 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-2xl leading-tight font-semibold text-[#102A43]">{product.name}</p>
                {product.featured ? (
                  <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-[#102A43]">
                    Онцлох
                  </span>
                ) : null}
              </div>
              <p className="text-base leading-snug text-slate-500">{product.description}</p>
              <p className="pt-2 text-2xl font-semibold text-[#102A43] tabular-nums">
                {money(product.price)}
              </p>
            </div>
          </button>
        ))}
      </div>

      <KioskOrderRail
        cart={cart}
        total={total}
        checkoutHref={checkoutHref}
        cartRef={cartRef}
        pulse={pulse}
        onAdjust={onAdjust}
      />

      {flyers.map((flyer) => {
        const box = flyer.moving ? flyer.to : flyer.from;
        return (
          <span
            key={flyer.id}
            className="pointer-events-none absolute z-30 overflow-hidden rounded-2xl bg-slate-100 shadow-xl"
            style={{
              left: box.x,
              top: box.y,
              width: box.width,
              height: box.height,
              transition: flyer.moving
                ? 'left 650ms cubic-bezier(0.22, 0.8, 0.28, 1), top 650ms cubic-bezier(0.22, 0.8, 0.28, 1), width 650ms ease, height 650ms ease'
                : 'none',
            }}
            onTransitionEnd={(event) => {
              if (event.propertyName === 'top' && flyer.moving) {
                land(flyer.id);
              }
            }}
          >
            <Image src={flyer.src} alt="" fill unoptimized sizes="240px" className="object-contain" />
          </span>
        );
      })}
    </section>
  );
}

function boxInside(origin: HTMLElement, rect: DOMRect): Box {
  const base = origin.getBoundingClientRect();
  const scaleX = base.width === 0 ? 1 : origin.clientWidth / base.width;
  const scaleY = base.height === 0 ? 1 : origin.clientHeight / base.height;
  return {
    x: (rect.left - base.left) * scaleX,
    y: (rect.top - base.top) * scaleY,
    width: rect.width * scaleX,
    height: rect.height * scaleY,
  };
}
