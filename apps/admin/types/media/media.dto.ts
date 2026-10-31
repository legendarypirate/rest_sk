import type { MediaUploadStatus, SortDirection } from '@packages/types';

export type ListMediaQueryDto = {
  page?: number;
  limit?: number | '*';
  search?: string;
  status?: MediaUploadStatus;
  sortBy?: 'createdAt' | 'updatedAt' | 'originalFilename';
  sortDirection?: SortDirection;
  includeDeleted?: boolean;
};

export type UpdateMediaDto = {
  altText?: string | null;
};
