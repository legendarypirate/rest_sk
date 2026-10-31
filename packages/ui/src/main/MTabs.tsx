'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex items-center gap-1 border-b border-border', className)}>
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          type="button"
          variant="ghost"
          onClick={() => onChange(tab.id)}
          className={cn(
            'relative flex cursor-pointer items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors',
            activeTab === tab.id
              ? 'text-foreground after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:bg-primary'
              : 'text-muted-foreground hover:rounded-lg hover:bg-primary/10 hover:text-foreground',
          )}
        >
          {tab.icon}
          {tab.label}
        </Button>
      ))}
    </div>
  );
}
