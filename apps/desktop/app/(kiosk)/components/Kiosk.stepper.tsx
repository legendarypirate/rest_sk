'use client';

import { cn } from '@packages/ui/lib/utils';

type KioskStepperProps = {
  step: 1 | 2 | 3;
};

const STEPS = ['Захиалга', 'Төлбөр', 'Баримт'] as const;

export function KioskStepper({ step }: KioskStepperProps) {
  return (
    <ol className="flex gap-3" aria-label="Захиалгын алхам">
      {STEPS.map((label, index) => {
        const current = index + 1;
        const active = current === step;
        const done = current < step;

        return (
          <li
            key={label}
            className={cn(
              'flex h-16 flex-1 items-center justify-center rounded-2xl px-4 text-lg font-semibold',
              active && 'bg-[#102A43] text-white',
              done && 'bg-[#102A43]/10 text-[#102A43]',
              !active && !done && 'bg-white text-slate-400 ring-1 ring-slate-200',
            )}
          >
            {current}. {label}
          </li>
        );
      })}
    </ol>
  );
}
