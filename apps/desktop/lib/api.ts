import { AuthClientError } from '@packages/auth';

export function apiOrigin() {
  return (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4004')
    .replace(/\/+$/, '')
    .replace(/\/api\/v\d+$/i, '');
}

export function apiUrl(path: string) {
  return `${apiOrigin()}/api/v1/${path.replace(/^\//, '')}`;
}

type ApiErrorBody = {
  statusCode?: number;
  code?: string;
  message?: string;
};

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');

  if (init.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(apiUrl(path), {
    ...init,
    headers,
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
