import type { MediaAssetDetail } from '@packages/types';
import { z } from 'zod';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;

const altTextField = z
  .string()
  .trim()
  .max(300, 'Тайлбар 300 тэмдэгтээс хэтрэхгүй');

const imageFileField = z
  .custom<File>((value) => value instanceof File, 'Зураг сонгоно уу')
  .refine((file) => file.size > 0, 'Зураг сонгоно уу')
  .refine((file) => file.size <= MAX_IMAGE_BYTES, 'Зураг 10MB-аас ихгүй байна')
  .refine(
    (file) => IMAGE_TYPES.includes(file.type as (typeof IMAGE_TYPES)[number]),
    'JPEG, PNG, WebP, AVIF зураг оруулна уу',
  );

export const createMediaSchema = z.object({
  file: imageFileField,
  altText: altTextField,
});

export const updateMediaSchema = z.object({
  altText: altTextField,
});

export type CreateMediaFormData = z.infer<typeof createMediaSchema>;
export type UpdateMediaFormData = z.infer<typeof updateMediaSchema>;
export type MediaFormData = CreateMediaFormData | UpdateMediaFormData;

export function getCreateMediaDefaults(): CreateMediaFormData {
  return {
    file: undefined as unknown as File,
    altText: '',
  };
}

export function getUpdateMediaDefaults(
  asset?: Pick<MediaAssetDetail, 'altText'>,
): UpdateMediaFormData {
  return {
    altText: asset?.altText ?? '',
  };
}
