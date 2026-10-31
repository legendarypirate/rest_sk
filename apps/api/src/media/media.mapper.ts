import type { MediaAsset } from '@generated/prisma/client';
import type { MediaAssetDetail } from '@packages/types';

import { toIso } from '@/common/utils/date';

export function toMediaAsset(row: MediaAsset): MediaAssetDetail {
  return {
    id: row.id,
    publicId: row.publicId,
    originalFilename: row.originalFilename,
    mimeType: row.mimeType,
    byteSize: row.byteSize,
    storageUrl: row.storageUrl,
    thumbnailUrl: row.thumbnailUrl,
    width: row.width,
    height: row.height,
    altText: row.altText,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    deletedAt: toIso(row.deletedAt),
  };
}
