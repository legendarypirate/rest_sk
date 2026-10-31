import { AuthClientError } from '@packages/auth';
import { translateError } from '@packages/i18n';

import { adminLocale } from '@/lib/locale';

export function getLoginErrorMessage(error: unknown): string {
  if (error instanceof AuthClientError) {
    return (
      translateError(error.code, adminLocale) ??
      error.message ??
      'Нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.'
    );
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.';
}
