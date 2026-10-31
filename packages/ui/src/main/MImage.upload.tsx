'use client';

import { AlertCircle, ImagePlus, Loader2, Maximize2, RotateCcw, Upload } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useId, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@packages/ui/components/button';
import { Input } from '@packages/ui/components/input';
import { Label } from '@packages/ui/components/label';
import { cn } from '@packages/ui/lib/utils';
import { CancelButton, DeleteButton } from './MButtons';

type UploadStatus = 'idle' | 'uploading' | 'error';

type ImageMeta = {
  width: number;
  height: number;
};

type ImageUploadFieldProps = {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  /** Helper copy shown under the dropzone label. Overrides the default format/size hint. */
  helperText?: string;
  /** Comma-separated MIME types accepted by the file picker. */
  accept?: string;
  /** Maximum upload size in megabytes. */
  maxSizeMB?: number;
  /** Uploads the file and returns a public URL (Cloudinary, etc.). */
  onUpload?: (file: File) => Promise<string>;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  previewClassName?: string;
  /** Hide the built-in remove button (e.g. when a parent gallery owns deletion). */
  showRemove?: boolean;
  /** Aspect ratio of the preview card (default `4/3`). */
  aspect?: string;
  /** When provided, shows a top-right "view full" button over the image. */
  onView?: () => void;
  /** `file` skips image-only checks and filename is the value. */
  kind?: 'image' | 'file';
  emptyText?: string;
};

function fileNameFromUrl(url: string): string {
  try {
    const clean = url.split('?')[0] ?? url;
    return decodeURIComponent(clean.split('/').pop() ?? url);
  } catch {
    return url;
  }
}

const DEFAULT_ACCEPT = 'image/png,image/jpeg,image/webp';
const DEFAULT_MAX_SIZE_MB = 8;

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${exponent === 0 ? value : value.toFixed(1)} ${units[exponent]}`;
}

function readableAcceptList(accept: string) {
  return accept
    .split(',')
    .map((mime) => mime.trim().split('/')[1]?.toUpperCase())
    .filter(Boolean)
    .join(', ');
}

export default function ImageUploadField({
  value,
  onChange,
  label,
  helperText,
  accept = DEFAULT_ACCEPT,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  onUpload,
  required,
  disabled,
  className,
  previewClassName,
  showRemove = true,
  aspect = '4 / 3',
  onView,
  kind = 'image',
  emptyText,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropzoneId = useId();
  const errorId = useId();

  const [status, setStatus] = useState<UploadStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [meta, setMeta] = useState<ImageMeta | null>(null);

  // Tracks the in-flight upload so a stale response can't clobber a newer
  // one (e.g. user cancels, then immediately re-uploads a different file).
  const uploadTokenRef = useRef(0);

  const acceptList = readableAcceptList(accept);
  const acceptedMimes = accept.split(',').map((m) => m.trim());
  const isEmpty = !value;

  const validate = useCallback(
    (file: File): string | null => {
      if (kind === 'image' && !file.type.startsWith('image/')) {
        return 'Зөвхөн зураг файл оруулна уу';
      }
      if (
        acceptedMimes.length &&
        !acceptedMimes.includes('*/*') &&
        !acceptedMimes.some((mime) => {
          if (mime.startsWith('.')) {
            return file.name.toLowerCase().endsWith(mime.toLowerCase());
          }
          if (mime.endsWith('/*')) {
            return file.type.startsWith(mime.slice(0, -1));
          }
          return mime === file.type;
        })
      ) {
        return `Дэмжигдэх формат: ${acceptList}`;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        return `${kind === 'file' ? 'Файл' : 'Зураг'} ${maxSizeMB}MB-аас их байна (${formatBytes(file.size)})`;
      }
      return null;
    },
    [acceptedMimes, acceptList, kind, maxSizeMB],
  );

  const handleFile = useCallback(
    async (file?: File | null) => {
      if (!file || disabled) return;

      const validationError = validate(file);
      if (validationError) {
        setStatus('error');
        setErrorMessage(validationError);
        toast.error(validationError);
        return;
      }

      const token = ++uploadTokenRef.current;
      setStatus('uploading');
      setErrorMessage(null);

      try {
        if (!onUpload) {
          throw new Error('Зураг байршуулах тохиргоо алга');
        }
        const url = await onUpload(file);
        if (token !== uploadTokenRef.current) return; // superseded by a newer upload

        if (url) {
          onChange?.(url);
          setStatus('idle');
          toast.success(
            kind === 'file' ? 'Файл байршлаа.' : 'Зураг амжилттай байршлаа',
          );
        } else {
          throw new Error('Зураг байршуулахад алдаа гарлаа');
        }
      } catch (err) {
        if (token !== uploadTokenRef.current) return;
        const message = err instanceof Error ? err.message : 'Зураг байршуулахад алдаа гарлаа';
        setStatus('error');
        setErrorMessage(message);
        toast.error(message);
      } finally {
        if (token === uploadTokenRef.current && inputRef.current) {
          inputRef.current.value = '';
        }
      }
    },
    [disabled, kind, onChange, onUpload, validate],
  );

  const handleFileListInput = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      if (files.length > 1) {
        toast.error('Зөвхөн нэг зураг сонгоно уу');
      }
      handleFile(files[0]);
    },
    [handleFile],
  );

  const cancelUpload = useCallback(() => {
    uploadTokenRef.current += 1; // invalidates any in-flight response
    setStatus('idle');
    setErrorMessage(null);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const openPicker = () => {
    if (!disabled && status !== 'uploading') inputRef.current?.click();
  };

  const isUploading = status === 'uploading';
  const hasError = status === 'error';
  const canOpen = !disabled && !isUploading;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={dropzoneId} className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
      )}

      <Input
        ref={inputRef}
        id={dropzoneId}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={(e) => handleFileListInput(e.target.files)}
      />

      <div
        role={isEmpty ? 'button' : undefined}
        tabIndex={isEmpty && canOpen ? 0 : -1}
        aria-disabled={disabled}
        aria-describedby={hasError ? errorId : undefined}
        onClick={isEmpty ? openPicker : undefined}
        onKeyDown={
          isEmpty
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openPicker();
                }
              }
            : undefined
        }
        onDragOver={(e) => {
          e.preventDefault();
          if (canOpen) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (canOpen) handleFileListInput(e.dataTransfer.files);
        }}
        style={{ aspectRatio: kind === 'file' ? '16 / 5' : aspect }}
        className={cn(
          'group relative w-full overflow-hidden rounded-xl border transition-colors',
          'bg-[repeating-conic-gradient(var(--color-muted)_0%_25%,transparent_0%_50%)] bg-size-[16px_16px]',
          isEmpty && !hasError && 'border-dashed',
          isEmpty && canOpen && 'cursor-pointer',
          disabled && 'opacity-60',
          hasError && 'border-destructive/60 bg-destructive/5',
          !hasError && dragOver && 'border-primary bg-primary/5 dark:border-primary dark:bg-primary/10',
          !hasError && !dragOver && 'border-border hover:border-primary/50',
          previewClassName,
        )}
      >
        {/* Uploaded image */}
        {value && kind === 'image' ? (
          <Image
            key={value}
            src={value}
            alt={label || 'Зураг'}
            fill
            unoptimized
            sizes="100vw"
            className="object-cover"
            onLoad={(e) =>
              setMeta({
                width: e.currentTarget.naturalWidth,
                height: e.currentTarget.naturalHeight,
              })
            }
            onError={() => setMeta(null)}
          />
        ) : null}
        {value && kind === 'file' ? (
          <div className="absolute inset-0 flex items-center px-4">
            <p className="truncate text-sm font-medium">{value}</p>
          </div>
        ) : null}

        {/* Empty state */}
        {isEmpty && !isUploading && !hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-4 text-center">
            <ImagePlus className="size-7 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              {emptyText ?? (kind === 'file' ? 'Файл байхгүй' : 'Зураг байхгүй')}
            </p>
            <p className="text-[11px] text-muted-foreground/70">
              {helperText ?? `${acceptList} · ${maxSizeMB}MB хүртэл`}
            </p>
          </div>
        )}

        {/* Uploading overlay */}
        {isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80 backdrop-blur-sm">
            <Loader2 className="size-7 animate-spin text-primary" />
            <p className="text-xs font-medium text-foreground">Байршуулж байна...</p>
            <CancelButton tooltip={false} onClick={cancelUpload} />
          </div>
        )}

        {/* Error overlay */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-destructive/5 px-4 text-center">
            <AlertCircle className="size-6 text-destructive" />
            <p id={errorId} className="max-w-xs text-xs font-medium text-destructive">
              {errorMessage}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setStatus('idle');
                setErrorMessage(null);
                openPicker();
              }}
            >
              <RotateCcw className="size-4" />
              Дахин оролдох
            </Button>
          </div>
        )}

        {/* Top-right "view full" button */}
        {value && onView && !isUploading && !hasError && (
          <Button
            type="button"
            size="icon-sm"
            variant="secondary"
            title="Бүтэн харах"
            className="absolute right-2 top-2 z-10 shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
          >
            <Maximize2 className="size-4" />
          </Button>
        )}

        {/* Info strip inside the preview (filename + dimensions) */}
        {value && kind === 'image' && !isUploading && !hasError && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-0.5 bg-linear-to-t from-black/75 via-black/40 to-transparent px-3 pb-2 pt-8 text-left">
            <p className="truncate text-xs font-medium text-white" title={value}>
              {fileNameFromUrl(value)}
            </p>
            <p className="text-[11px] text-white/70">
              {meta ? `${meta.width} × ${meta.height}px` : 'Зураг'}
            </p>
          </div>
        )}

        {/* Bottom-left absolute upload / change + remove actions */}
        {!isUploading && !hasError && (
          <div className="absolute bottom-2 left-2 z-10 flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={'ghost'}
              className={cn(
                value ? 'bg-secondary' : 'bg-primary hover:bg-primary/80 text-primary-foreground',
                'shadow-sm cursor-pointer',
              )}
              disabled={!canOpen}
              onClick={(e) => {
                e.stopPropagation();
                openPicker();
              }}
            >
              <Upload className="size-4" />
              {value ? 'Солих' : 'Оруулах'}
            </Button>
            {value && showRemove && (
              <DeleteButton
                text={false}
                tooltip={'Цэвэрлэх'}
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange?.('');
                  setMeta(null);
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export { ImageUploadField as MImageUpload };
