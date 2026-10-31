'use client';

import { useState } from 'react';
import { Button } from '@packages/ui/components/button';
import { Popover, PopoverContent, PopoverTrigger } from '@packages/ui/components/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@packages/ui/components/select';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '@packages/ui/lib/utils';

interface DatePickerProps {
  /**
   * `Date`, or a date-like string/number (ISO, `YYYY-MM-DD`, timestamp).
   * Anything unparseable is treated as "no selection" rather than throwing —
   * generic filter state (`MFilters`) hands over loosely typed values.
   */
  value?: Date | string | number | null;
  onChange?: (date: Date | undefined) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  /** Closes the popover as soon as a day is picked. Default true. */
  closeOnSelect?: boolean;
}

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

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/** Years shown in the year select: current year −70 … +20 (birth dates, hire dates, etc.). */
const YEAR_RANGE_BEFORE = 70;
const YEAR_RANGE_AFTER = 20;

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function toValidDate(value: Date | string | number | null | undefined): Date | undefined {
  if (value == null || value === '') return undefined;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }
  if (typeof value === 'string') {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (match) {
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

/** Resolves the previous/current/next month + year a calendar cell belongs to. */
function resolveCellDate(
  day: number,
  isCurrentMonth: boolean,
  isPrevMonth: boolean,
  displayYear: number,
  displayMonth: number,
): Date {
  if (isCurrentMonth) return new Date(displayYear, displayMonth, day);

  if (isPrevMonth) {
    const month = displayMonth === 0 ? 11 : displayMonth - 1;
    const year = displayMonth === 0 ? displayYear - 1 : displayYear;
    return new Date(year, month, day);
  }

  const month = displayMonth === 11 ? 0 : displayMonth + 1;
  const year = displayMonth === 11 ? displayYear + 1 : displayYear;
  return new Date(year, month, day);
}

export function DatePicker({
  value: rawValue,
  onChange,
  className,
  placeholder = 'Огноо сонгоно уу',
  disabled = false,
  id,
  closeOnSelect = true,
}: DatePickerProps) {
  const value = toValidDate(rawValue);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  const [selected, setSelected] = useState<Date | undefined>(value);
  const [displayMonth, setDisplayMonth] = useState<number>(
    value?.getMonth() ?? currentDate.getMonth(),
  );
  const [displayYear, setDisplayYear] = useState<number>(value?.getFullYear() ?? currentYear);
  const [isOpen, setIsOpen] = useState(false);

  // Sync internal state when the controlled `value` prop changes externally.
  const valueKey = value?.getTime() ?? '';
  const [prevValueKey, setPrevValueKey] = useState(valueKey);
  if (valueKey !== prevValueKey) {
    setPrevValueKey(valueKey);
    setSelected(value);
    if (value) {
      setDisplayMonth(value.getMonth());
      setDisplayYear(value.getFullYear());
    }
  }

  const generateYears = () => {
    const years: number[] = [];
    const startYear = currentYear - YEAR_RANGE_BEFORE;
    const endYear = currentYear + YEAR_RANGE_AFTER;
    for (let year = startYear; year <= endYear; year++) years.push(year);
    return years;
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(displayYear, displayMonth);
    const firstDay = getFirstDayOfMonth(displayYear, displayMonth);
    const days: { day: number; isCurrentMonth: boolean; isPrevMonth: boolean }[] = [];

    const prevMonthDays = getDaysInMonth(
      displayMonth === 0 ? displayYear - 1 : displayYear,
      displayMonth === 0 ? 11 : displayMonth - 1,
    );

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isCurrentMonth: false, isPrevMonth: true });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ day, isCurrentMonth: true, isPrevMonth: false });
    }
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({ day, isCurrentMonth: false, isPrevMonth: false });
    }
    return days;
  };

  const handleDayClick = (day: number, isCurrentMonth: boolean, isPrevMonth: boolean) => {
    const newDate = resolveCellDate(day, isCurrentMonth, isPrevMonth, displayYear, displayMonth);
    setSelected(newDate);
    onChange?.(newDate);
    if (!isCurrentMonth) {
      setDisplayMonth(newDate.getMonth());
      setDisplayYear(newDate.getFullYear());
    }
    if (closeOnSelect) setIsOpen(false);
  };

  const handlePreviousMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return placeholder;
    return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const isToday = (year: number, month: number, day: number) =>
    day === currentDate.getDate() &&
    month === currentDate.getMonth() &&
    year === currentDate.getFullYear();

  const calendarDays = generateCalendarDays();
  const years = generateYears();

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
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal hover:text-muted-foreground cursor-pointer',
              !selected && 'text-muted-foreground',
              className,
            )}
          />
        }
      >
        <Calendar className="mr-2 size-4" />
        {formatDate(selected)}
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
            onClick={handlePreviousMonth}
            className="bg-background/95 hover:bg-accent/90 border-border text-foreground size-8 rounded-lg border shadow-sm cursor-pointer"
          >
            <ChevronLeft className="size-5" />
          </Button>

          <div className="flex items-center gap-2">
            <Select
              value={MONTHS[displayMonth]}
              onValueChange={(v) => {
                if (!v) return;
                const month = MONTHS.indexOf(v);
                if (month >= 0) setDisplayMonth(month);
              }}
            >
              <SelectTrigger className="w-32 border-slate-200 focus:ring-slate-500 dark:border-primary cursor-pointer">
                {MONTHS[displayMonth]}
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={displayYear.toString()} onValueChange={(v) => setDisplayYear(Number(v))}>
              <SelectTrigger className="w-25 border-slate-200 focus:ring-slate-500 dark:border-primary cursor-pointer">
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
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="bg-background/95 hover:bg-accent/90 border-border text-foreground size-8 rounded-lg border shadow-sm cursor-pointer"
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="flex h-8 items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-400"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((dayInfo, index) => {
            const cellDate = resolveCellDate(
              dayInfo.day,
              dayInfo.isCurrentMonth,
              dayInfo.isPrevMonth,
              displayYear,
              displayMonth,
            );
            const isSelected = selected ? isSameDay(cellDate, selected) : false;
            const isTodayDate = isToday(cellDate.getFullYear(), cellDate.getMonth(), dayInfo.day);

            return (
              <Button
                key={index}
                variant="ghost"
                onClick={() =>
                  handleDayClick(dayInfo.day, dayInfo.isCurrentMonth, dayInfo.isPrevMonth)
                }
                aria-label={cellDate.toDateString()}
                aria-pressed={isSelected}
                className={cn(
                  'relative h-9 w-full rounded-lg p-0 font-normal transition-all duration-200',
                  'hover:bg-primary/15 hover:text-primary hover:scale-105 cursor-pointer',
                  !dayInfo.isCurrentMonth && 'text-muted-foreground/60',
                  dayInfo.isCurrentMonth && 'text-foreground',
                  isSelected &&
                    'bg-primary text-primary-foreground hover:bg-primary/80',
                  isTodayDate && !isSelected && 'border-2 border-primary/60 font-semibold',
                )}
              >
                {dayInfo.day}
              </Button>
            );
          })}
        </div>

        {selected && (
          <div className="mt-4 flex gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelected(undefined);
                onChange?.(undefined);
              }}
              className="flex-1 cursor-pointer"
            >
              Болих
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
