'use client';

import { KioskClock } from './Kiosk.clock';

type KioskShellProps = {
  children: React.ReactNode;
  serviceLabel?: string;
  attract?: boolean;
};

export function KioskShell({
  children,
  serviceLabel,
  attract = false,
}: KioskShellProps) {
  return (
    <main className="flex h-full w-full flex-col overflow-hidden bg-[#F4F6F8] text-[#102A43] select-none">
      <header className="flex h-28 shrink-0 items-center justify-between bg-[#102A43] px-10 text-white">
        <div className="flex items-center gap-5">
          <div className="grid size-16 place-items-center rounded-2xl border border-white/15 bg-white/10 text-lg font-semibold tracking-wide">
            KH
          </div>
          <div>
            <p className="text-xs font-medium tracking-[0.28em] text-white/50 uppercase">
              {attract ? 'Restaurant' : 'Self-service'}
            </p>
            <p className="text-2xl font-semibold tracking-tight">Khongor Kiosk</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {serviceLabel ? (
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-base font-medium">
              {serviceLabel}
            </span>
          ) : null}
          <span className="text-2xl font-medium tabular-nums">
            <KioskClock />
          </span>
          <span className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold tracking-wide">
            МОН
          </span>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <footer className="flex h-16 shrink-0 items-center justify-between border-t border-slate-200 bg-white px-10 text-base text-slate-500">
        <span>Тусламж хэрэгтэй бол ажилтанд хандана уу</span>
        <span>Khongor</span>
      </footer>
    </main>
  );
}
