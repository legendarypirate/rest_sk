'use client';

import { ShoppingBag, Utensils } from 'lucide-react';
import type { ServiceType } from '@packages/types';

import { SERVICE_TYPE_HINTS, SERVICE_TYPE_LABELS } from '../../lib/labels';
import { menuHref } from '../../lib/routes';
import { useKioskOrderContext } from '../../providers/kiosk.order.provider';
import { ServiceOption } from './Service.option';

const OPTIONS: Array<{
  value: ServiceType;
  icon: typeof Utensils;
  primary?: boolean;
}> = [
  { value: 'DINE_IN', icon: Utensils },
  { value: 'TAKEAWAY', icon: ShoppingBag, primary: true },
];

export function WelcomeScreen() {
  const { setServiceType } = useKioskOrderContext();

  return (
    <section className="flex min-h-0 flex-1 flex-col px-12 py-16">
      <div className="flex flex-1 flex-col justify-center">
        <p className="text-sm font-medium tracking-[0.32em] text-slate-400 uppercase">
          Захиалга эхлүүлэх
        </p>
        <h1 className="mt-6 max-w-3xl text-7xl leading-[1.05] font-semibold tracking-tight text-[#102A43]">
          Та хаана идэх вэ?
        </h1>
        <p className="mt-6 max-w-xl text-2xl leading-relaxed text-slate-500">
          Үйлчилгээний төрлөө сонгоод цэс рүү орно.
        </p>

        <div className="mt-16 grid grid-cols-2 gap-8">
          {OPTIONS.map((option) => (
            <ServiceOption
              key={option.value}
              href={menuHref(option.value)}
              icon={option.icon}
              label={SERVICE_TYPE_LABELS[option.value]}
              hint={SERVICE_TYPE_HINTS[option.value]}
              primary={option.primary}
              onSelect={() => setServiceType(option.value)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
