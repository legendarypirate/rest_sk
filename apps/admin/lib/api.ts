import { AuthClientError } from '@packages/auth';

import { adminLocale } from '@/lib/locale';

type ApiErrorBody = {
  statusCode?: number;
  code?: string;
  message?: string;
};

export async function api<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  headers.set('x-locale', adminLocale);
  headers.set('Accept-Language', adminLocale);

  if (init.body !== undefined && !headers.has('Content-Type')) {
    const isFormData =
      typeof FormData !== 'undefined' && init.body instanceof FormData;
    if (!isFormData) {
      headers.set('Content-Type', 'application/json');
    }
  }

  const response = await fetch(`/api/v1/${path.replace(/^\//, '')}`, {
    ...init,
    headers,
    credentials: 'include',
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json().catch(() => null)) as ApiErrorBody | T;

  if (!response.ok) {
    const error = payload as ApiErrorBody | null;
    throw new AuthClientError(
      error?.statusCode ?? response.status,
      error?.code ?? 'BAD_REQUEST',
      error?.message ?? `Request failed (${response.status})`,
    );
  }

  return payload as T;
}
