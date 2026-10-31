'use client';

import { MPagination } from './MPagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@packages/ui/components/select';

const PAGE_SIZES = [20, 30, 40, 50, 100];

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export interface TableFooterProps {
  meta: PaginationMeta;
  limit: number;
  onLimitChange: (limit: number) => void;
  onPageChange: (page: number) => void;
  className?: string;
  isVisible?: boolean;
}

export function TableFooter({
  meta,
  limit,
  onLimitChange,
  onPageChange,
  className,
  isVisible = false,
}: TableFooterProps) {
  const handleLimitChange = (value: string | null) => {
    if (value) onLimitChange(Number(value));
  };

  return (
    <div className={`shrink-0 bg-background py-2 px-3 border-t ${className ?? ''}`}>
      <div className="flex flex-col md:flex-row gap-y-1 justify-between items-center">
        <div className="text-sm text-muted-foreground text-center">
          Бүгд {meta.total ?? 0} мэдээлэл, {meta.page ?? 1}-р хуудас / нийт {meta.totalPages ?? 1}{' '}
          хуудас
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center justify-end gap-2">
            <Select value={String(limit)} onValueChange={handleLimitChange}>
              <SelectTrigger className="h-9 w-[70px] cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((s) => (
                  <SelectItem key={s} value={String(s)} className="cursor-pointer">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <MPagination
            currentPage={Number(meta.page) || 1}
            totalPages={Number(meta.totalPages) || 1}
            onPageChange={onPageChange}
            isVisible={isVisible}
          />
        </div>
      </div>
    </div>
  );
}
