import { translateAuthValidation } from '@packages/i18n';

import { adminLocale } from '@/lib/locale';

export function validationMessage(code: string | undefined) {
  return translateAuthValidation(code, adminLocale);
}
