import { AuthClientError } from '@packages/auth';
import { translateError } from '@packages/i18n';

import { kioskLocale } from '@/lib/locale';

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AuthClientError) {
    return (
      translateError(error.code, kioskLocale) ??
      error.message ??
      'Хүсэлт амжилтгүй боллоо.'
    );
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Хүсэлт амжилтгүй боллоо.';
}
