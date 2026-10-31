import { api } from '@/lib/api';

export type UploadedImage = {
  url: string;
  publicId: string;
};

export function uploadImage(file: File) {
  const body = new FormData();
  body.append('file', file);

  return api<UploadedImage>('uploads/images', {
    method: 'POST',
    body,
  });
}

export function discardImage(publicId: string, keepalive = false) {
  return api<void>('uploads/images/discard', {
    method: 'POST',
    body: JSON.stringify({ publicId }),
    keepalive,
  }).catch(() => undefined);
}
