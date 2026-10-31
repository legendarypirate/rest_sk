import type { Locale } from './types';

export function resolveLocale(input?: string | null): Locale {
  if (!input) {
    return 'en';
  }

  const token = input.split(',')[0]?.trim().split(';')[0]?.trim().toLowerCase();

  if (token?.startsWith('mn')) {
    return 'mn';
  }

  return 'en';
}
