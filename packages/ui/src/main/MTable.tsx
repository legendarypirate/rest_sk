'use client';

import * as React from 'react';

import { cn } from '@packages/ui/lib/utils';

function MTable({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div
      data-slot="table-container"
      className="min-h-0 min-w-0 overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn(
          'w-full min-w-max caption-bottom border-separate border-spacing-0 text-sm',
          className,
        )}
        {...props}
      />
    </div>
  );
}

function MTableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn('sticky top-0 z-20 bg-muted [&_tr]:border-b', className)}
      {...props}
    />
  );
}

function MTableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  );
}

function MTableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn('bg-muted/50 border-t font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  );
}

function MTableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'group/row hover:bg-muted data-[state=selected]:bg-muted border-b transition-colors',
        className,
      )}
      {...props}
    />
  );
}

function MTableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'h-9 border-b bg-muted px-3 text-left align-middle text-xs font-semibold tracking-wider whitespace-nowrap uppercase text-muted-foreground has([role=checkbox]):pr-0 *:[[role=checkbox]]:translate-y-0.5',
        'first:sticky first:left-0 first:z-30 first:bg-muted first:shadow-[1px_0_0_0] first:shadow-border',
        className,
      )}
      {...props}
    />
  );
}

function MTableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'px-3 py-1 align-middle whitespace-nowrap text-sm has([role=checkbox]):pr-0 :[[role=checkbox]]:translate-y-0.5 border-b',
        'first:sticky first:left-0 first:z-10 first:bg-card first:shadow-[1px_0_0_0] first:shadow-border',
        'group-hover/row:first:bg-muted group-data-[state=selected]/row:first:bg-muted',
        className,
      )}
      {...props}
    />
  );
}

function MTableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('text-muted-foreground mt-2 text-xs', className)}
      {...props}
    />
  );
}

export {
  MTable,
  MTableHeader,
  MTableBody,
  MTableFooter,
  MTableHead,
  MTableRow,
  MTableCell,
  MTableCaption,
};
