'use client';

import * as React from 'react';
import {
  Dialog as DialogUI,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@packages/ui/components/dialog';
import { cn } from '@packages/ui/lib/utils';

interface DialogProps {
  title?: string;
  description?: string;
  styles?: string;
  children: React.ReactNode;
  trigger?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  footer?: React.ReactNode;
  closeOnOutsideClick?: boolean;
}

export function Dialog({
  title,
  description,
  styles,
  children,
  trigger,
  open,
  onOpenChange,
  footer,
  closeOnOutsideClick = false,
}: DialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const handleOpenChange = isControlled ? onOpenChange : setInternalOpen;

  return (
    <DialogUI
      open={isOpen}
      onOpenChange={handleOpenChange}
      disablePointerDismissal={!closeOnOutsideClick}
    >
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent
        initialFocus={false}
        className={cn(
          'gap-0! p-0! sm:max-w-sm flex w-full flex-col overflow-hidden!',
          styles,
        )}
      >
        {(title || description) && (
          <DialogHeader className="space-y-1 px-4 py-3 pr-12 shrink-0 border-b">
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
        )}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 has-[form]:p-0">
          {children}
        </div>
        {footer ? (
          <div className="shrink-0 border-t bg-popover px-4 py-3">{footer}</div>
        ) : null}
      </DialogContent>
    </DialogUI>
  );
}

type DialogFormProps = React.ComponentProps<'form'> & {
  actions?: React.ReactNode;
};

/** Form body scrolls; action bar is a real footer, flush with the dialog edge. */
export function DialogForm({
  actions,
  className,
  children,
  ...props
}: DialogFormProps) {
  return (
    <form className={cn('flex min-h-0 flex-1 flex-col', className)} {...props}>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 border-t bg-popover px-4 py-3">
          {actions}
        </div>
      ) : null}
    </form>
  );
}
