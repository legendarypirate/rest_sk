'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const MONTHS = [
  '1-р сар',
  '2-р сар',
  '3-р сар',
  '4-р сар',
  '5-р сар',
  '6-р сар',
  '7-р сар',
  '8-р сар',
  '9-р сар',
  '10-р сар',
  '11-р сар',
  '12-р сар',
];

export interface MonthPickerProps {
  /** `YYYY-MM` format */
  value?: string;
  onChange?: (month: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

function parseMonthValue(value?: string) {
  if (!value) return null;
  const [yearPart, monthPart] = value.split('-');
  const year = Number(yearPart);
  const month = Number(monthPart) - 1;
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 0 || month > 11) return null;
  return { year, month };
}

function formatMonthValue(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

function formatMonthLabel(value?: string, placeholder = 'Сар сонгоно уу') {
  const parsed = parseMonthValue(value);
  if (!parsed) return placeholder;
  return `${parsed.year} оны ${MONTHS[parsed.month]}`;
}

export function MonthPicker({
  value,
  onChange,
  className,
  placeholder = 'Сар сонгоно уу',
  disabled = false,
}: MonthPickerProps) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const parsed = parseMonthValue(value);

  const [displayYear, setDisplayYear] = useState(parsed?.year ?? currentYear);
  const [isOpen, setIsOpen] = useState(false);

  const valueKey = value ?? '';
  const [prevValueKey, setPrevValueKey] = useState(valueKey);
  if (valueKey !== prevValueKey) {
    setPrevValueKey(valueKey);
    const next = parseMonthValue(value);
    if (next) setDisplayYear(next.year);
  }

  const selectedMonth = parsed?.month ?? null;
  const selectedYear = parsed?.year ?? null;

  const generateYears = () => {
    const years: number[] = [];
    const startYear = currentYear - 10;
    for (let i = 0; i <= 20; i++) years.push(startYear + i);
    return years;
  };

  const years = generateYears();

  const handleMonthSelect = (month: number) => {
    onChange?.(formatMonthValue(displayYear, month));
    setIsOpen(false);
  };

  const handlePreviousYear = () => setDisplayYear((y) => y - 1);
  const handleNextYear = () => setDisplayYear((y) => y + 1);

  return (
    <Popover
      open={disabled ? false : isOpen}
      onOpenChange={(open) => {
        if (!disabled) setIsOpen(open);
      }}
      modal={false}
    >
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              'h-9 w-60 justify-start text-left font-normal hover:text-muted-foreground cursor-pointer',
              !value && 'text-muted-foreground',
              className,
            )}
          />
        }
      >
        <Calendar className="mr-2 size-4" />
        {formatMonthLabel(value, placeholder)}
      </PopoverTrigger>
      <PopoverContent
        className="w-auto border bg-popover p-4 text-popover-foreground shadow-md"
        align="start"
        sideOffset={6}
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={handlePreviousYear}
            className="bg-background/95 hover:bg-accent/90 border-border text-foreground size-8 rounded-lg border shadow-sm cursor-pointer"
          >
            <ChevronLeft className="size-5" />
          </Button>

          <Select value={displayYear.toString()} onValueChange={(v) => setDisplayYear(Number(v))}>
            <SelectTrigger className="w-25 border-slate-200 bg-white hover:bg-slate-50 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={handleNextYear}
            className="bg-background/95 hover:bg-accent/90 border-border text-foreground size-8 rounded-lg border shadow-sm cursor-pointer"
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {MONTHS.map((label, index) => {
            const isSelected = selectedYear === displayYear && selectedMonth === index;
            const isCurrent =
              currentDate.getFullYear() === displayYear && currentDate.getMonth() === index;

            return (
              <Button
                key={label}
                type="button"
                variant="ghost"
                onClick={() => handleMonthSelect(index)}
                className={cn(
                  'h-9 rounded-lg px-2 text-xs font-normal transition-all duration-200',
                  'hover:bg-primary/15 hover:text-primary cursor-pointer',
                  isSelected &&
                    'bg-primary text-primary-foreground hover:bg-primary/80',
                  isCurrent && !isSelected && 'border-2 border-primary/60 font-semibold',
                )}
              >
                {label}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
