'use client';

import { Field, FieldError, FieldLabel } from '@packages/ui/components/field';
import { cn } from '@packages/ui/lib/utils';
import { useQuery } from '@tanstack/react-query';

import { listMedia } from '@/services/media/media.service';

export function MediaPicker({
  value,
  onChange,
  multiple = false,
  error,
}: {
  value: string[];
  onChange: (ids: string[]) => void;
  multiple?: boolean;
  error?: unknown;
}) {
  const media = useQuery({
    queryKey: ['media', 'picker'],
    queryFn: () => listMedia({ page: 1, limit: '*', status: 'STORED' }),
  });
  const items = media.data?.items ?? [];

  function toggle(id: string) {
    if (multiple) {
      onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);
      return;
    }
    onChange(value[0] === id ? [] : [id]);
  }

  return (
    <Field>
      <FieldLabel data-required>Медиа сангаас зураг сонгох</FieldLabel>
      {media.isPending ? (
        <p className="text-sm text-muted-foreground">Уншиж байна…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Медиа сан хоосон байна. Эхлээд Медиа хэсэгт зураг оруулна уу.</p>
      ) : (
        <div className="gap-2 grid max-h-72 grid-cols-3 overflow-y-auto sm:grid-cols-4 md:grid-cols-5">
          {items.map((asset) => {
            const selected = value.includes(asset.id);
            return (
              <button
                key={asset.id}
                type="button"
                onClick={() => toggle(asset.id)}
                className={cn(
                  'overflow-hidden rounded-md ring-1 ring-border',
                  selected && 'ring-2 ring-primary',
                )}
              >
                <img
                  src={asset.thumbnailUrl ?? asset.storageUrl}
                  alt={asset.altText ?? asset.originalFilename}
                  className="h-20 w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
      <FieldError errors={error ? [error] : []} />
    </Field>
  );
}
