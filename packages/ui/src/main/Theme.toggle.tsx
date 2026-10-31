'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

import { Switch } from '@packages/ui/components/switch';
import { cn } from '@packages/ui/lib/utils';

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <div
      className={cn(
        'gap-2 px-3 py-1.5 shadow-sm flex items-center rounded-full border border-border bg-card',
        isDark && 'shadow-sm border-primary',
        className,
      )}
      title={isDark ? 'Гэрэл горим' : 'Харанхуй горим'}
    >
      <Sun
        className={cn(
          'size-4 transition-colors',
          isDark ? 'text-white' : 'text-amber-500',
        )}
      />
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        aria-label="Харанхуй горим солих"
        className={cn(isDark && 'data-checked:bg-primary', 'cursor-pointer')}
      />
      <Moon
        className={cn(
          'size-4 transition-colors',
          isDark ? 'text-white' : 'text-primary',
        )}
      />
    </div>
  );
}

export default ThemeToggle;
