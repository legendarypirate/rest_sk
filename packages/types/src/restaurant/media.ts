export const MEDIA_UPLOAD_STATUSES = ['PENDING', 'STORED', 'FAILED'] as const;

export type MediaUploadStatus = (typeof MEDIA_UPLOAD_STATUSES)[number];

export type MediaAssetListItem = {
  id: string;
  publicId: string;
  originalFilename: string;
  mimeType: string;
  byteSize: number;
  storageUrl: string;
  thumbnailUrl: string | null;
  width: number | null;
  height: number | null;
  altText: string | null;
  status: MediaUploadStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type MediaAssetDetail = MediaAssetListItem;
