import type { MediaAssetDetail, Paginated } from '@packages/types';

import { api } from '@/lib/api';
import { toSearchParams } from '@/lib/search-params';
import type {
  ListMediaQueryDto,
  UpdateMediaDto,
} from '@/types/media/media.dto';

export function listMedia(params: ListMediaQueryDto) {
  return api<Paginated<MediaAssetDetail>>(
    `media?${toSearchParams({
      page: params.page,
      limit: params.limit,
      search: params.search,
      status: params.status,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
      includeDeleted: params.includeDeleted || undefined,
    })}`,
  );
}

export function getMedia(id: string) {
  return api<MediaAssetDetail>(`media/${id}`);
}

export function uploadMedia(file: File, altText?: string) {
  const body = new FormData();
  body.set('file', file);
  if (altText) {
    body.set('altText', altText);
  }

  return api<MediaAssetDetail>('media', {
    method: 'POST',
    body,
  });
}

export function updateMedia(id: string, dto: UpdateMediaDto) {
  return api<MediaAssetDetail>(`media/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  });
}

export function discardMedia(id: string) {
  return api<void>(`media/${id}/discard`, { method: 'POST' });
}

export function deleteMedia(id: string) {
  return api<void>(`media/${id}`, { method: 'DELETE' });
}
