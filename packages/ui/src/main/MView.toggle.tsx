'use client';

import { LayoutGrid, Table2 } from 'lucide-react';

import { Button } from '@packages/ui/components/button';
import { cn } from '@packages/ui/lib/utils';

export type DataView = 'grid' | 'table';

type MViewToggleProps = {
  value: DataView;
  onChange: (value: DataView) => void;
  className?: string;
  gridLabel?: string;
  tableLabel?: string;
};

export function MViewToggle({
  value,
  onChange,
  className,
  gridLabel = 'Сүлжээ',
  tableLabel = 'Хүснэгт',
}: MViewToggleProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Button
        type="button"
        size="icon"
        variant={value === 'grid' ? 'default' : 'outline'}
        className="cursor-pointer"
        aria-label={gridLabel}
        aria-pressed={value === 'grid'}
        onClick={() => onChange('grid')}
      >
        <LayoutGrid className="size-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant={value === 'table' ? 'default' : 'outline'}
        className="cursor-pointer"
        aria-label={tableLabel}
        aria-pressed={value === 'table'}
        onClick={() => onChange('table')}
      >
        <Table2 className="size-4" />
      </Button>
    </div>
  );
}
