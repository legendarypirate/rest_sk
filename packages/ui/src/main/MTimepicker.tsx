'use client';

import { useMemo, useState } from 'react';
import { Button } from '@packages/ui/components/button';
import { Popover, PopoverContent, PopoverTrigger } from '@packages/ui/components/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@packages/ui/components/select';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@packages/ui/lib/utils';

export interface TimePickerProps {
  /** `HH:mm` (24h), same as HTML `input[type=time]` */
  value?: string;
  onChange?: (time: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Minute grid step. Default 5 → 00, 05, …, 55 */
  minuteStep?: number;
}

function parseTimeValue(value?: string) {
  if (!value) return null;
  const [hourPart, minutePart] = value.split(':');
  const hour = Number(hourPart);
  const minute = Number(minutePart);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

function formatTimeValue(hour: number, minute: number) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function formatTimeLabel(value?: string, placeholder = 'Цаг сонгоно уу') {
  const parsed = parseTimeValue(value);
  if (!parsed) return placeholder;
  return formatTimeValue(parsed.hour, parsed.minute);
}

function buildMinuteOptions(step: number) {
  const safeStep = Math.min(30, Math.max(1, Math.floor(step)));
  const options: number[] = [];
  for (let m = 0; m < 60; m += safeStep) options.push(m);
  return options;
}

function buildHourOptions() {
  return Array.from({ length: 24 }, (_, hour) => hour);
}

export function TimePicker({
  value,
  onChange,
  className,
  placeholder = 'Цаг сонгоно уу',
  disabled = false,
  minuteStep = 5,
}: TimePickerProps) {
  const now = new Date();
  const parsed = parseTimeValue(value);

  const [displayHour, setDisplayHour] = useState(parsed?.hour ?? now.getHours());
  const [isOpen, setIsOpen] = useState(false);

  const valueKey = value ?? '';
  const [prevValueKey, setPrevValueKey] = useState(valueKey);
  if (valueKey !== prevValueKey) {
    setPrevValueKey(valueKey);
    const next = parseTimeValue(value);
    if (next) setDisplayHour(next.hour);
  }

  const selectedHour = parsed?.hour ?? null;
  const selectedMinute = parsed?.minute ?? null;

  const hours = useMemo(() => buildHourOptions(), []);
  const minutes = useMemo(() => buildMinuteOptions(minuteStep), [minuteStep]);

  const handleMinuteSelect = (minute: number) => {
    onChange?.(formatTimeValue(displayHour, minute));
    setIsOpen(false);
  };

  const handlePreviousHour = () => setDisplayHour((h) => (h <= 0 ? 23 : h - 1));
  const handleNextHour = () => setDisplayHour((h) => (h >= 23 ? 0 : h + 1));

  return (
    <Popover
      open={disabled ? false : isOpen}
      onOpenChange={(open: boolean) => {
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
        <Clock className="mr-2 size-4" />
        {formatTimeLabel(value, placeholder)}
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
            onClick={handlePreviousHour}
            className="bg-background/95 hover:bg-accent/90 border-border text-foreground size-8 rounded-lg border shadow-sm cursor-pointer"
          >
            <ChevronLeft className="size-5" />
          </Button>

          <Select
            value={displayHour.toString()}
            onValueChange={(v: string | null) => setDisplayHour(Number(v))}
          >
            <SelectTrigger className="w-25 border-slate-200 bg-white hover:bg-slate-50 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {hours.map((hour) => (
                <SelectItem key={hour} value={hour.toString()}>
                  {String(hour).padStart(2, '0')} цаг
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={handleNextHour}
            className="bg-background/95 hover:bg-accent/90 border-border text-foreground size-8 rounded-lg border shadow-sm cursor-pointer"
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {minutes.map((minute) => {
            const isSelected = selectedHour === displayHour && selectedMinute === minute;
            const isCurrentMinute = now.getHours() === displayHour && now.getMinutes() === minute;

            return (
              <Button
                key={minute}
                type="button"
                variant="ghost"
                onClick={() => handleMinuteSelect(minute)}
                className={cn(
                  'h-9 rounded-lg px-2 text-xs font-normal transition-all duration-200',
                  'hover:bg-primary/15 hover:text-primary cursor-pointer',
                  isSelected &&
                    'bg-primary text-primary-foreground hover:bg-primary/80',
                  isCurrentMinute && !isSelected && 'border-2 border-primary/60 font-semibold',
                )}
              >
                :{String(minute).padStart(2, '0')}
              </Button>
            );
          })}
        </div>

        <div className="mt-4 flex gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
          <Button
            variant="outline"
            size="sm"
            type="button"
            className="flex-1 cursor-pointer"
            onClick={() => {
              const h = now.getHours();
              const m = now.getMinutes() - (now.getMinutes() % minuteStep);
              setDisplayHour(h);
              onChange?.(formatTimeValue(h, m));
              setIsOpen(false);
            }}
          >
            Одоо
          </Button>
          {value ? (
            <Button
              variant="outline"
              size="sm"
              type="button"
              className="flex-1 cursor-pointer"
              onClick={() => {
                onChange?.('');
                setIsOpen(false);
              }}
            >
              Болих
            </Button>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
