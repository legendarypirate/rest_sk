'use client';

import * as React from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

import { Checkbox } from '@packages/ui/components/checkbox';
import { Input } from '@packages/ui/components/input';
import { Label } from '@packages/ui/components/label';
import { Switch } from '@packages/ui/components/switch';
import { Textarea } from '@packages/ui/components/textarea';
import { cn } from '@packages/ui/lib/utils';
import { applyMask, MASK_PLACEHOLDERS, type MaskType } from '../utils/mask';
import { MDatalist } from './MData.list';

type InputProps = React.ComponentProps<typeof Input>;
type TextareaProps = React.ComponentProps<typeof Textarea>;

/** Shared outline / focus ring using theme tokens from globals.css. */
const fieldClass = cn(
  'h-8 border border-black/15 bg-white',
  'hover:border-ring/50',
  'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
  'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
  'placeholder:text-muted-foreground',
  'dark:border-white/20 dark:bg-black/25 dark:hover:border-ring/50',
  'dark:placeholder:text-slate-400',
);

const checkboxClass = cn(
  'border-input',
  'hover:border-ring/50',
  'focus-visible:border-ring focus-visible:ring-ring/30',
  'data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground',
  'dark:data-checked:bg-primary',
);

const switchClass = cn(
  'data-checked:bg-primary',
  'focus-visible:border-ring focus-visible:ring-ring/30',
);

/* ─── MInput ─────────────────────────────────────────────────────────────── */

export const MInput = React.forwardRef<HTMLInputElement, InputProps>(function MInput(
  { className, ...props },
  ref,
) {
  return <Input ref={ref} className={cn(fieldClass, className)} {...props} />;
});

/* ─── MTextarea ──────────────────────────────────────────────────────────── */

/** Neon-styled textarea. Defaults to `min-h-20` with vertical resize. */
export const MTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function MTextarea({ className, rows = 3, ...props }, ref) {
    return (
      <Textarea
        ref={ref}
        rows={rows}
        className={cn(fieldClass, 'min-h-20 resize-y', className)}
        {...props}
      />
    );
  },
);

/* ─── MaskedInput ────────────────────────────────────────────────────────── */

export interface MaskedInputProps extends Omit<
  InputProps,
  'onChange' | 'value' | 'defaultValue' | 'type'
> {
  mask: MaskType;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: string) => void;
}

export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  function MaskedInput(
    { mask, value, defaultValue = '', onChange, onValueChange, placeholder, className, ...props },
    ref,
  ) {
    const isControlled = value !== undefined;
    const [inner, setInner] = React.useState(() => applyMask(String(defaultValue ?? ''), mask));

    const display = isControlled ? applyMask(String(value ?? ''), mask) : inner;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = applyMask(event.target.value, mask);
      if (!isControlled) setInner(next);
      onValueChange?.(next);
      onChange?.(next, event);
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode={mask === 'phone' || mask === 'digits' ? 'numeric' : 'text'}
        autoCapitalize={mask === 'carNumber' || mask === 'register' ? 'characters' : undefined}
        value={display}
        onChange={handleChange}
        placeholder={placeholder ?? MASK_PLACEHOLDERS[mask]}
        className={cn(fieldClass, className)}
        {...props}
      />
    );
  },
);

/* ─── MPassword ──────────────────────────────────────────────────────────── */

export interface MPasswordProps extends Omit<InputProps, 'type'> {
  /** Show the eye toggle. Defaults to `true`. Pass `false` to hide it. */
  isShow?: boolean;
}

export const MPassword = React.forwardRef<HTMLInputElement, MPasswordProps>(function MPassword(
  { isShow = true, className, ...props },
  ref,
) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative w-full">
      <Input
        ref={ref}
        type={visible && isShow ? 'text' : 'password'}
        className={cn(
          fieldClass,
          isShow && 'pr-9',
          '[&::-ms-reveal]:hidden [&::-ms-clear]:hidden',
          className,
        )}
        {...props}
      />
      {isShow ? (
        <button
          type="button"
          tabIndex={-1}
          aria-label={visible ? 'Нууц үг нуух' : 'Нууц үг харах'}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setVisible((current) => !current)}
          className="absolute inset-y-0 right-0 z-10 flex w-9 items-center justify-center text-muted-foreground hover:text-secondary"
        >
          {visible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
        </button>
      ) : null}
    </div>
  );
});

/* ─── MSelect ────────────────────────────────────────────────────────────── */

export interface MSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface MSelectProps {
  options: MSelectOption[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  id?: string;
  name?: string;
  'aria-invalid'?: boolean;
}

export function MSelect({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = 'Сонгоно уу',
  disabled,
  className,
  triggerClassName,
  id,
  'aria-invalid': ariaInvalid,
}: MSelectProps) {
  const resolved =
    value === undefined ? (defaultValue ?? '') : (value ?? '');

  return (
    <MDatalist
      id={id}
      options={options
        .filter((option) => !option.disabled)
        .map((option) => ({ value: option.value, label: option.label }))}
      value={resolved || ''}
      onValueChange={(next) => onValueChange?.(next || null)}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(triggerClassName, className)}
      aria-invalid={ariaInvalid}
    />
  );
}

/* ─── MCheckbox ──────────────────────────────────────────────────────────── */

export interface MCheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  className?: string;
  'aria-invalid'?: boolean;
  label?: React.ReactNode;
}

export function MCheckbox({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  required,
  id,
  name,
  className,
  'aria-invalid': ariaInvalid,
  label,
}: MCheckboxProps) {
  const control = (
    <Checkbox
      id={id}
      name={name}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      required={required}
      aria-invalid={ariaInvalid}
      className={cn(checkboxClass, className)}
    />
  );

  if (!label) return control;

  return (
    <Label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-2 text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
    >
      {control}
      <span>{label}</span>
    </Label>
  );
}

/* ─── MSwitch ────────────────────────────────────────────────────────────── */

export interface MSwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
  size?: 'sm' | 'default';
  'aria-invalid'?: boolean;
}

export function MSwitch({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  id,
  name,
  className,
  size = 'default',
  'aria-invalid': ariaInvalid,
}: MSwitchProps) {
  return (
    <Switch
      id={id}
      name={name}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      size={size}
      aria-invalid={ariaInvalid}
      className={cn(switchClass, className)}
    />
  );
}

/* ─── MField ─────────────────────────────────────────────────────────────── */

export type MFieldProps = {
  label?: React.ReactNode;
  htmlFor?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function MField({
  label,
  htmlFor,
  error,
  required,
  children,
  className,
}: MFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <Label htmlFor={htmlFor}>
          {label}
          {required ? <span className="text-destructive"> *</span> : null}
        </Label>
      ) : null}
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
