'use client';

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

/** Preset max-widths for left/right drawers (sm+). Matches sheet `data-side` selectors. */
export const DRAWER_WIDTHS = {
  sm: 'data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm',
  md: 'data-[side=left]:sm:max-w-md data-[side=right]:sm:max-w-md',
  lg: 'data-[side=left]:sm:max-w-lg data-[side=right]:sm:max-w-lg',
  xl: 'data-[side=left]:sm:max-w-xl data-[side=right]:sm:max-w-xl',
  '2xl': 'data-[side=left]:sm:max-w-2xl data-[side=right]:sm:max-w-2xl',
  '3xl': 'data-[side=left]:sm:max-w-3xl data-[side=right]:sm:max-w-3xl',
} as const;

export type DrawerWidth = keyof typeof DRAWER_WIDTHS;

interface DrawerProps {
  title?: string;
  description?: string;
  styles?: string;
  children: React.ReactNode;
  trigger?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  footer?: React.ReactNode;
  closeOnOutsideClick?: boolean;
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Preset width for left/right drawers. Default: `xl`. */
  width?: DrawerWidth;
}

export function Drawer({
  title,
  description,
  styles,
  children,
  trigger,
  open,
  onOpenChange,
  footer,
  closeOnOutsideClick = false,
  side = 'right',
  width = 'lg',
}: DrawerProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const handleOpenChange = isControlled ? onOpenChange : setInternalOpen;

  const widthClass = side === 'left' || side === 'right' ? DRAWER_WIDTHS[width] : undefined;

  return (
    <Sheet
      open={isOpen}
      onOpenChange={handleOpenChange}
      disablePointerDismissal={!closeOnOutsideClick}
    >
      {trigger && <SheetTrigger render={trigger} />}
      <SheetContent side={side} initialFocus={false} className={cn(widthClass, styles)}>
        {(title || description) && (
          <SheetHeader>
            {title && <SheetTitle>{title}</SheetTitle>}
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
        )}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-4">
          {children}
        </div>
        {footer && <SheetFooter>{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  );
}
