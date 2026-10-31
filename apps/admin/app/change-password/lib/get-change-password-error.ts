import { AuthClientError, AuthErrorCode } from '@packages/auth';
import { translateError } from '@packages/i18n';

import { adminLocale } from '@/lib/locale';

export function getChangePasswordErrorMessage(error: unknown): string {
  if (error instanceof AuthClientError) {
    if (error.code === AuthErrorCode.INVALID_CREDENTIALS) {
      return 'Хуучин нууц үг буруу байна.';
    }

    return (
      translateError(error.code, adminLocale) ??
      error.message ??
      'Нууц үг солиход алдаа гарлаа. Дахин оролдоно уу.'
    );
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Нууц үг солиход алдаа гарлаа. Дахин оролдоно уу.';
}
