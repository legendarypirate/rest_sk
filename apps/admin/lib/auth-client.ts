import { createAuthClient } from '@packages/auth';

import { adminLocale } from '@/lib/locale';

export const authClient = createAuthClient({
  // Same-origin. next.config rewrites /api/v1 to the API so auth cookies stay on admin.
  baseUrl: '',
  fetch: (input, init) => {
    const headers = new Headers(init?.headers);
    headers.set('x-locale', adminLocale);
    headers.set('Accept-Language', adminLocale);
    return fetch(input, { ...init, headers });
  },
});

