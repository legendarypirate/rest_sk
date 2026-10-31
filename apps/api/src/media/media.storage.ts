import { createHash } from 'node:crypto';

import { v2 as cloudinary } from 'cloudinary';

const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);

export type StoredMediaObject = {
  storageKey: string;
  storageUrl: string;
  thumbnailUrl: string;
  mimeType: string;
  byteSize: number;
  width: number | null;
  height: number | null;
  checksum: string;
};

export type MediaUploadFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

export function isAllowedImage(file: MediaUploadFile): boolean {
  return IMAGE_MIME_TYPES.has(file.mimetype) && file.buffer.length > 0;
}

export function checksumOf(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

export function configureCloudinary(options: {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}): void {
  cloudinary.config({
    cloud_name: options.cloudName,
    api_key: options.apiKey,
    api_secret: options.apiSecret,
    secure: true,
  });
}

export function cloudinaryConfigured(): boolean {
  return Boolean(cloudinary.config().cloud_name);
}

export async function storeImage(
  file: MediaUploadFile,
  folder: string,
): Promise<StoredMediaObject> {
  const uploaded = await uploadBuffer(file, folder);
  return {
    storageKey: uploaded.public_id,
    storageUrl: uploaded.secure_url,
    thumbnailUrl: thumbnailUrl(uploaded.secure_url),
    mimeType: file.mimetype,
    byteSize: uploaded.bytes,
    width: uploaded.width,
    height: uploaded.height,
    checksum: checksumOf(file.buffer),
  };
}

export async function destroyStoredImage(storageKey: string): Promise<void> {
  const result = await cloudinary.uploader.destroy(storageKey, {
    resource_type: 'image',
    invalidate: true,
  });

  if (result.result === 'ok' || result.result === 'not found') {
    return;
  }

  throw new Error('cloudinary destroy failed');
}

function thumbnailUrl(secureUrl: string): string {
  const marker = '/upload/';
  const index = secureUrl.indexOf(marker);
  if (index === -1) {
    return secureUrl;
  }

  const prefix = secureUrl.slice(0, index + marker.length);
  const rest = secureUrl.slice(index + marker.length);
  return `${prefix}c_fill,w_320,h_320,f_webp,q_auto/${rest}`;
}

function uploadBuffer(file: MediaUploadFile, folder: string) {
  return new Promise<{
    secure_url: string;
    public_id: string;
    bytes: number;
    width: number | null;
    height: number | null;
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        format: 'webp',
        unique_filename: true,
        use_filename: true,
      },
      (error, result) => {
        if (error || !result?.secure_url || !result.public_id) {
          reject(error ?? new Error('upload failed'));
          return;
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          bytes: result.bytes,
          width: result.width ?? null,
          height: result.height ?? null,
        });
      },
    );

    stream.end(file.buffer);
  });
}
