import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@packages/ui/lib/utils';

type ServiceOptionProps = {
  href: string;
  icon: LucideIcon;
  label: string;
  hint: string;
  primary?: boolean;
  onSelect: () => void;
};

export function ServiceOption({
  href,
  icon: Icon,
  label,
  hint,
  primary = false,
  onSelect,
}: ServiceOptionProps) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      className={cn(
        'flex min-h-115 flex-col justify-between rounded-3xl border px-10 py-10 text-left shadow-sm transition active:scale-[0.99]',
        primary
          ? 'border-[#102A43] bg-[#102A43] text-white'
          : 'border-slate-200 bg-white text-[#102A43]',
      )}
    >
      <span
        className={cn(
          'grid size-20 place-items-center rounded-2xl',
          primary ? 'bg-white/10' : 'bg-slate-100 text-[#102A43]',
        )}
      >
        <Icon className="size-10" strokeWidth={1.75} aria-hidden />
      </span>
      <span>
        <span className="block text-4xl font-semibold tracking-tight">{label}</span>
        <span className={cn('mt-3 block text-xl leading-snug', primary ? 'text-white/70' : 'text-slate-500')}>
          {hint}
        </span>
      </span>
    </Link>
  );
}
