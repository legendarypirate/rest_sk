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

export interface DateRange {
  from?: Date;
  to?: Date;
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  className?: string;
  placeholder?: string;
  /** Maximum inclusive span in days between from and to (optional). */
  maxDays?: number;
}

function daysBetween(a: Date, b: Date) {
  const start = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const end = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.abs(Math.round((end - start) / 86_400_000));
}

export function DateRangePicker({
  value,
  onChange,
  className,
  placeholder = 'Огноо сонгоно уу',
  maxDays,
}: DateRangePickerProps) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  const [selectedRange, setSelectedRange] = useState<DateRange>(value || {});
  const [displayMonth, setDisplayMonth] = useState<number>(
    value?.from?.getMonth() || currentDate.getMonth(),
  );
  const [displayYear, setDisplayYear] = useState<number>(value?.from?.getFullYear() || currentYear);
  const [isOpen, setIsOpen] = useState(false);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Sync internal state with external value changes (during render, keyed by
  // the range timestamps to avoid reference-instability loops).
  const valueKey = `${value?.from?.getTime() ?? ''}-${value?.to?.getTime() ?? ''}`;
  const [prevValueKey, setPrevValueKey] = useState(valueKey);
  if (valueKey !== prevValueKey) {
    setPrevValueKey(valueKey);
    setSelectedRange(value || {});
    if (!value?.from && !value?.to) {
      const now = new Date();
      setDisplayMonth(now.getMonth());
      setDisplayYear(now.getFullYear());
    }
  }

  const months = [
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

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const generateYears = () => {
    const years = [];
    const startYear = currentYear - 10;
    for (let i = 0; i <= 20; i++) {
      years.push(startYear + i);
    }
    return years;
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(displayYear, displayMonth);
    const firstDay = getFirstDayOfMonth(displayYear, displayMonth);
    const days = [];

    const prevMonthDays = getDaysInMonth(
      displayMonth === 0 ? displayYear - 1 : displayYear,
      displayMonth === 0 ? 11 : displayMonth - 1,
    );

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        isPrevMonth: true,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        isPrevMonth: false,
      });
    }

    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isPrevMonth: false,
      });
    }

    return days;
  };

  const handleDayClick = (day: number, isCurrentMonth: boolean, isPrevMonth: boolean) => {
    let newDate: Date;

    if (!isCurrentMonth) {
      if (isPrevMonth) {
        const prevMonth = displayMonth === 0 ? 11 : displayMonth - 1;
        const prevYear = displayMonth === 0 ? displayYear - 1 : displayYear;
        newDate = new Date(prevYear, prevMonth, day);
      } else {
        const nextMonth = displayMonth === 11 ? 0 : displayMonth + 1;
        const nextYear = displayMonth === 11 ? displayYear + 1 : displayYear;
        newDate = new Date(nextYear, nextMonth, day);
      }
    } else {
      newDate = new Date(displayYear, displayMonth, day);
    }

    if (!selectedRange.from || (selectedRange.from && selectedRange.to)) {
      const next = { from: newDate, to: undefined as Date | undefined };
      setSelectedRange(next);
      onChange?.(next);
    } else if (selectedRange.from && !selectedRange.to) {
      const next =
        newDate < selectedRange.from
          ? { from: newDate, to: selectedRange.from }
          : { from: selectedRange.from, to: newDate };
      if (maxDays != null && daysBetween(next.from!, next.to!) > maxDays) {
        return;
      }
      setSelectedRange(next);
      onChange?.(next);
    }
    setHoverDate(null);
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

  const handleYearChange = (year: number) => {
    setDisplayYear(year);
  };

  const handleMonthChange = (month: number) => {
    setDisplayMonth(month);
  };

  const handleDayHover = (day: number, isCurrentMonth: boolean, isPrevMonth: boolean) => {
    if (!selectedRange.from || selectedRange.to) {
      setHoverDate(null);
      return;
    }

    let newDate: Date;
    if (!isCurrentMonth) {
      if (isPrevMonth) {
        const prevMonth = displayMonth === 0 ? 11 : displayMonth - 1;
        const prevYear = displayMonth === 0 ? displayYear - 1 : displayYear;
        newDate = new Date(prevYear, prevMonth, day);
      } else {
        const nextMonth = displayMonth === 11 ? 0 : displayMonth + 1;
        const nextYear = displayMonth === 11 ? displayYear + 1 : displayYear;
        newDate = new Date(nextYear, nextMonth, day);
      }
    } else {
      newDate = new Date(displayYear, displayMonth, day);
    }

    setHoverDate(newDate);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const formatDateRange = () => {
    if (!selectedRange.from) return placeholder;
    if (!selectedRange.to) return formatDate(selectedRange.from);
    return `${formatDate(selectedRange.from)} - ${formatDate(selectedRange.to)}`;
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const isInRange = (date: Date) => {
    if (!selectedRange.from) return false;
    if (!selectedRange.to && hoverDate) {
      const start = selectedRange.from < hoverDate ? selectedRange.from : hoverDate;
      const end = selectedRange.from < hoverDate ? hoverDate : selectedRange.from;
      return date >= start && date <= end;
    }
    if (!selectedRange.to) return false;
    return date >= selectedRange.from && date <= selectedRange.to;
  };

  const isRangeStart = (date: Date) => {
    if (!selectedRange.from) return false;
    if (!selectedRange.to && hoverDate) {
      return isSameDay(date, selectedRange.from < hoverDate ? selectedRange.from : hoverDate);
    }
    return isSameDay(date, selectedRange.from);
  };

  const isRangeEnd = (date: Date) => {
    if (!selectedRange.to && hoverDate && selectedRange.from) {
      return isSameDay(date, selectedRange.from < hoverDate ? hoverDate : selectedRange.from);
    }
    return selectedRange.to ? isSameDay(date, selectedRange.to) : false;
  };

  const isToday = (year: number, month: number, day: number) => {
    return (
      day === currentDate.getDate() &&
      month === currentDate.getMonth() &&
      year === currentDate.getFullYear()
    );
  };

  const calendarDays = generateCalendarDays();
  const years = generateYears();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <PopoverTrigger
      className={'bg-white'}
        render={
          <Button
            type="button"
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal hover:text-muted-foreground cursor-pointer ',
              !selectedRange.from && 'text-muted-foreground',
              className,
            )}
          />
        }
      >
        <Calendar className="mr-2 size-4" />
        {formatDateRange()}
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
              value={months[displayMonth]}
              onValueChange={(value) => {
                if (!value) return;
                const month = months.indexOf(value);
                if (month >= 0) handleMonthChange(month);
              }}
            >
              <SelectTrigger className="w-[130px] border-slate-200 focus:ring-slate-500 dark:border-primary cursor-pointer">
                {months[displayMonth]}
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={displayYear.toString()}
              onValueChange={(value) => handleYearChange(Number(value))}
            >
              <SelectTrigger className="w-[100px] border-slate-200 focus:ring-slate-500 dark:border-primary cursor-pointer">
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
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="flex h-8 items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1" onMouseLeave={() => setHoverDate(null)}>
          {calendarDays.map((dayInfo, index) => {
            const dateToCheck = new Date(
              dayInfo.isPrevMonth
                ? displayMonth === 0
                  ? displayYear - 1
                  : displayYear
                : !dayInfo.isCurrentMonth
                  ? displayMonth === 11
                    ? displayYear + 1
                    : displayYear
                  : displayYear,
              dayInfo.isPrevMonth
                ? displayMonth === 0
                  ? 11
                  : displayMonth - 1
                : !dayInfo.isCurrentMonth
                  ? displayMonth === 11
                    ? 0
                    : displayMonth + 1
                  : displayMonth,
              dayInfo.day,
            );

            const isStart = isRangeStart(dateToCheck);
            const isEnd = isRangeEnd(dateToCheck);
            const inRange = isInRange(dateToCheck);
            const isTodayDate = isToday(
              dateToCheck.getFullYear(),
              dateToCheck.getMonth(),
              dayInfo.day,
            );
            const isPreview = !selectedRange.to && hoverDate && inRange;

            return (
              <Button
                key={index}
                variant="ghost"
                onClick={() =>
                  handleDayClick(dayInfo.day, dayInfo.isCurrentMonth, dayInfo.isPrevMonth)
                }
                onMouseEnter={() =>
                  handleDayHover(dayInfo.day, dayInfo.isCurrentMonth, dayInfo.isPrevMonth)
                }
                className={cn(
                  'relative h-9 w-full rounded-lg p-0 font-normal transition-all duration-200',
                  'hover:bg-primary/15 hover:text-primary hover:scale-105 cursor-pointer',
                  !dayInfo.isCurrentMonth && 'text-muted-foreground/60',
                  dayInfo.isCurrentMonth && 'text-foreground',
                  inRange && !isStart && !isEnd && !isPreview && 'bg-primary/15 dark:bg-primary/25',
                  inRange && !isStart && !isEnd && isPreview && 'bg-primary/10 dark:bg-primary/15',
                  (isStart || isEnd) &&
                    'bg-primary text-primary-foreground hover:bg-primary/80',
                  isTodayDate && !isStart && !isEnd && 'border-2 border-primary/60 font-semibold',
                )}
              >
                {dayInfo.day}
              </Button>
            );
          })}
        </div>

        {(selectedRange.from || selectedRange.to) && (
          <div className="mt-4 flex gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedRange({});
                onChange?.({});
                setHoverDate(null);
                setIsOpen(false);
              }}
              className="flex-1 cursor-pointer"
            >
              Болих
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                onChange?.(selectedRange);
                setIsOpen(false);
              }}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/80 cursor-pointer"
            >
              Сонгох
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
