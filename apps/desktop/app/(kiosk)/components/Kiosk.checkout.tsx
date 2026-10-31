'use client';

import { KioskBackLink } from './Kiosk.nav';
import { KioskStepper } from './Kiosk.stepper';

type KioskCheckoutProps = {
  step: 1 | 2 | 3;
  title: string;
  hint: string;
  backHref: string;
  backLabel: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function KioskCheckout({
  step,
  title,
  hint,
  backHref,
  backLabel,
  children,
  footer,
}: KioskCheckoutProps) {
  return (
    <section className="flex min-h-0 w-full flex-1 flex-col px-10 py-8">
      <KioskBackLink href={backHref}>{backLabel}</KioskBackLink>
      <div className="mt-8">
        <KioskStepper step={step} />
      </div>
      <div className="mt-8 mb-6">
        <h1 className="text-5xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 text-xl text-slate-500">{hint}</p>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
      {footer ? <div className="mt-6 shrink-0">{footer}</div> : null}
    </section>
  );
}
