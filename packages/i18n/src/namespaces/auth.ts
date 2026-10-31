import {
  AuthValidationCode,
  type AuthValidationCode as AuthValidationCodeValue,
} from '@packages/auth';

import type { Locale } from '../types';
import { translateError } from './errors';

const validationMessages = {
  en: {
    [AuthValidationCode.IDENTIFIER_REQUIRED]: 'Email or username is required.',
    [AuthValidationCode.IDENTIFIER_MIN]:
      'Email or username must be at least 3 characters.',
    [AuthValidationCode.IDENTIFIER_MAX]:
      'Email or username must be at most 320 characters.',
    [AuthValidationCode.PASSWORD_REQUIRED]: 'Password is required.',
    [AuthValidationCode.PASSWORD_MAX]: 'Password is too long.',
  },
  mn: {
    [AuthValidationCode.IDENTIFIER_REQUIRED]: 'Имэйл хаяг оруулна уу.',
    [AuthValidationCode.IDENTIFIER_MIN]:
      'Имэйл хаяг хамгийн багадаа 3 тэмдэгт байна.',
    [AuthValidationCode.IDENTIFIER_MAX]:
      'Имэйл хаяг хамгийн ихдээ 320 тэмдэгт байна.',
    [AuthValidationCode.PASSWORD_REQUIRED]: 'Нууц үг оруулна уу.',
    [AuthValidationCode.PASSWORD_MAX]: 'Нууц үг хэт урт байна.',
  },
} as const satisfies Record<Locale, Record<AuthValidationCodeValue, string>>;

export function translateAuthValidation(
  code: string | undefined,
  locale: Locale,
): string | undefined {
  if (!code) {
    return undefined;
  }

  return (
    validationMessages[locale][code as AuthValidationCodeValue] ??
    validationMessages.en[code as AuthValidationCodeValue] ??
    code
  );
}

export function translateAuthError(
  code: string | undefined,
  locale: Locale,
): string | undefined {
  return translateError(code, locale);
}
