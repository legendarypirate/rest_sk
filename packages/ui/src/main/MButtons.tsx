'use client';

import * as React from 'react';
import type { VariantProps } from 'class-variance-authority';

import {
  ArrowLeftIcon,
  DownloadIcon,
  EyeIcon,
  KeyRoundIcon,
  PlusIcon,
  SaveIcon,
  SquarePen,
  Trash2Icon,
  UploadIcon,
  XIcon,
  Image as ImageIcon,
  ListTreeIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
} from 'lucide-react';

import { Button, buttonVariants } from '@packages/ui/components/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@packages/ui/components/tooltip';
import { cn } from '@packages/ui/lib/utils';

const Icons = {
  plus: PlusIcon,
  squarePen: SquarePen,
  trash2: Trash2Icon,
  eye: EyeIcon,
  save: SaveIcon,
  x: XIcon,
  download: DownloadIcon,
  upload: UploadIcon,
  back: ArrowLeftIcon,
  menu: ListTreeIcon,
  image: ImageIcon,
  keyRound: KeyRoundIcon,
  play: PlayIcon,
  pause: PauseIcon,
  reset: RotateCcwIcon,
} as const;

type ButtonProps = React.ComponentProps<typeof Button>;
type IconName = keyof typeof Icons;
type ButtonVariant = NonNullable<
  VariantProps<typeof buttonVariants>['variant']
>;

export interface ActionButtonProps extends Omit<
  ButtonProps,
  'children' | 'variant' | 'title'
> {
  text?: string | false;
  icon?: IconName | false;
  variant?: ButtonVariant;
  /**
   * `true` (default) → show default tooltip.
   * `string` → custom tooltip text.
   * `false` → no tooltip.
   */
  tooltip?: boolean | string;
}

interface BaseActionButtonProps extends ActionButtonProps {
  defaultText: string;
  defaultIcon: IconName;
  defaultVariant?: ButtonVariant;
  defaultTooltip: string;
}

function ActionButton({
  text,
  icon,
  defaultText,
  defaultIcon,
  defaultVariant = 'default',
  defaultTooltip,
  tooltip = true,
  variant,
  size,
  className,
  ...props
}: BaseActionButtonProps) {
  const showText = text !== false;
  const showIcon = icon !== false;
  const Icon = icon ? Icons[icon] : Icons[defaultIcon];
  const label = typeof text === 'string' ? text : defaultText;

  const button = (
    <Button
      variant={variant ?? defaultVariant}
      size={size ?? (showText ? 'default' : 'icon')}
      aria-label={showText ? undefined : label}
      className={cn(className, 'shadow-sm cursor-pointer')}
      {...props}
    >
      {showIcon ? <Icon /> : null}
      {showText ? label : null}
    </Button>
  );

  if (tooltip === false) {
    return button;
  }

  const tip = typeof tooltip === 'string' ? tooltip : defaultTooltip;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={button} />
        <TooltipContent side="top">{tip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const primaryClass = cn(
  'bg-primary text-primary-foreground',
  'hover:bg-primary/80',
  'focus-visible:ring-ring/40',
);

const dangerClass = cn(
  'bg-red-400 text-white',
  'hover:bg-red-500',
  'focus-visible:ring-red-500/30',
);

export function CreateButton({
  className,
  variant = 'default',
  tooltip = true,
  ...props
}: ActionButtonProps) {
  return (
    <ActionButton
      defaultText="Create"
      defaultIcon="plus"
      defaultVariant="default"
      defaultTooltip="Үүсгэх"
      variant={variant}
      tooltip={tooltip}
      className={cn(variant === 'default' && primaryClass, className)}
      {...props}
    />
  );
}

export function EditButton({
  className,
  variant = 'outline',
  tooltip = true,
  ...props
}: ActionButtonProps) {
  return (
    <ActionButton
      defaultText="Edit"
      defaultIcon="squarePen"
      defaultVariant="outline"
      defaultTooltip="Засах"
      variant={variant}
      tooltip={tooltip}
      className={cn(className, 'text-muted-foreground')}
      {...props}
    />
  );
}

export function RestoreButton({
  className,
  variant = 'outline',
  tooltip = true,
  ...props
}: ActionButtonProps) {
  return (
    <ActionButton
      defaultText="Сэргээх"
      defaultIcon="reset"
      defaultVariant="outline"
      defaultTooltip="Сэргээх"
      variant={variant}
      tooltip={tooltip}
      className={cn(className, 'text-muted-foreground')}
      {...props}
    />
  );
}

export function DeleteButton({
  className,
  variant = 'default',
  tooltip = true,
  ...props
}: ActionButtonProps) {
  return (
    <ActionButton
      defaultText="Delete"
      defaultIcon="trash2"
      defaultVariant="default"
      defaultTooltip="Устгах"
      variant={variant}
      tooltip={tooltip}
      className={cn(
        variant === 'default' && dangerClass,
        className,
        variant === 'default' && 'text-white hover:text-white',
      )}
      {...props}
    />
  );
}

export function ViewButton({
  className,
  variant = 'outline',
  tooltip = true,
  ...props
}: ActionButtonProps) {
  return (
    <ActionButton
      defaultText="View"
      defaultIcon="eye"
      defaultVariant="outline"
      defaultTooltip="Харах"
      variant={variant}
      tooltip={tooltip}
      className={cn(className, 'text-muted-foreground')}
      {...props}
    />
  );
}

export function PermissionsButton({
  className,
  variant = 'outline',
  tooltip = true,
  ...props
}: ActionButtonProps) {
  return (
    <ActionButton
      defaultText="Зөвшөөрөл"
      defaultIcon="keyRound"
      defaultVariant="outline"
      defaultTooltip="Цэс, зөвшөөрөл"
      variant={variant}
      tooltip={tooltip}
      className={cn(className, 'text-muted-foreground')}
      {...props}
    />
  );
}

export function SaveButton({
  className,
  variant = 'default',
  tooltip = true,
  ...props
}: ActionButtonProps) {
  return (
    <ActionButton
      defaultText="Save"
      defaultIcon="save"
      defaultVariant="default"
      defaultTooltip="Хадгалах"
      variant={variant}
      tooltip={tooltip}
      className={cn(variant === 'default' && primaryClass, className)}
      {...props}
    />
  );
}

export function CancelButton({
  className,
  variant = 'outline',
  tooltip = true,
  ...props
}: ActionButtonProps) {
  return (
    <ActionButton
      defaultText="Цуцлах"
      defaultIcon="x"
      defaultVariant="outline"
      defaultTooltip="Болих"
      variant={variant}
      tooltip={tooltip}
      className={cn(className)}
      {...props}
    />
  );
}

export function ExportButton({
  className,
  variant = 'outline',
  tooltip = true,
  ...props
}: ActionButtonProps) {
  return (
    <ActionButton
      defaultText="Export"
      defaultIcon="download"
      defaultVariant="outline"
      defaultTooltip="Excel экспорт"
      variant={variant}
      tooltip={tooltip}
      className={cn(className, 'text-muted-foreground')}
      {...props}
    />
  );
}

export function ImportButton({
  className,
  variant = 'outline',
  tooltip = true,
  ...props
}: ActionButtonProps) {
  return (
    <ActionButton
      defaultText="Импорт"
      defaultIcon="upload"
      defaultVariant="outline"
      defaultTooltip="Excel импорт"
      variant={variant}
      tooltip={tooltip}
      className={cn(className, 'text-muted-foreground')}
      {...props}
    />
  );
}

export function BackButton({
  className,
  variant = 'outline',
  tooltip = true,
  ...props
}: ActionButtonProps) {
  return (
    <ActionButton
      defaultText="Буцах"
      defaultIcon="back"
      defaultVariant="outline"
      defaultTooltip="Буцах"
      variant={variant}
      tooltip={tooltip}
      className={cn(className, 'text-muted-foreground')}
      {...props}
    />
  );
}

export function PlayButton({
  className,
  variant = 'default',
  tooltip = true,
  ...props
}: ActionButtonProps) {
  return (
    <ActionButton
      defaultText="Ажиллуулах"
      defaultIcon="play"
      defaultVariant="default"
      defaultTooltip="Ажиллуулах"
      variant={variant}
      tooltip={tooltip}
      className={cn(variant === 'default' && primaryClass, className)}
      {...props}
    />
  );
}

export function PauseButton({
  className,
  variant = 'outline',
  tooltip = true,
  ...props
}: ActionButtonProps) {
  return (
    <ActionButton
      defaultText="Түр зогсоох"
      defaultIcon="pause"
      defaultVariant="outline"
      defaultTooltip="Түр зогсоох"
      variant={variant}
      tooltip={tooltip}
      className={cn(className, 'text-muted-foreground')}
      {...props}
    />
  );
}

export function ResetButton({
  className,
  variant = 'outline',
  tooltip = true,
  ...props
}: ActionButtonProps) {
  return (
    <ActionButton
      defaultText="Эхлүүлэх"
      defaultIcon="reset"
      defaultVariant="outline"
      defaultTooltip="Эхлүүлэх"
      variant={variant}
      tooltip={tooltip}
      className={cn(className, 'text-muted-foreground')}
      {...props}
    />
  );
}
