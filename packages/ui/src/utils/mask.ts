/**
 * Mask tokens:
 * - `0` digit
 * - `A` Latin letter (a-z)
 * - `C` Cyrillic letter (а-яё + ӨҮөү)
 * - `*` alphanumeric (digit | Latin | Cyrillic)
 * - any other char is a literal separator
 */

export type MaskType =
  'phone' | 'carNumber' | 'email' | 'register' | 'digits' | (string & {});

const CYRILLIC = /[А-ЯЁӨҮа-яёөү]/;
const LATIN = /[A-Za-z]/;
const DIGIT = /\d/;

/** Mongolian mobile: 9911-2233 */
export const MASK_PHONE = '00000000';

/** Plate like 6480УЕЕ (4 digits + 3 Cyrillic) */
export const MASK_CAR_NUMBER = '0000CCC';

/** National register: УЕ99112233 (2 Cyrillic + 8 digits) */
export const MASK_REGISTER = 'CC00000000';

/** Digits only, max 20 */
export const MASK_DIGITS = '0'.repeat(20);

const PRESET_MASKS: Record<string, string> = {
  phone: MASK_PHONE,
  carNumber: MASK_CAR_NUMBER,
  register: MASK_REGISTER,
  digits: MASK_DIGITS,
};

export function resolveMask(mask: MaskType): string | null {
  if (mask === 'email') return null;
  return PRESET_MASKS[mask] ?? mask;
}

function matchesToken(token: string, char: string): boolean {
  switch (token) {
    case '0':
      return DIGIT.test(char);
    case 'A':
      return LATIN.test(char);
    case 'C':
      return CYRILLIC.test(char);
    case '*':
      return DIGIT.test(char) || LATIN.test(char) || CYRILLIC.test(char);
    default:
      return char === token;
  }
}

function isToken(char: string): boolean {
  return char === '0' || char === 'A' || char === 'C' || char === '*';
}

/** Soft filter for email-safe characters (no rigid length mask). */
export function maskEmail(raw: string): string {
  return raw
    .replace(/\s+/g, '')
    .replace(/[^a-zA-Z0-9.!#$%&'*+/=?^_`{|}~@-]/g, '')
    .replace(/@{2,}/g, '@')
    .slice(0, 254);
}

/**
 * Applies a pattern mask to raw input.
 * Literals in the pattern are inserted automatically.
 */
export function applyPatternMask(raw: string, pattern: string): string {
  const chars = Array.from(raw.normalize('NFC'));
  let result = '';
  let i = 0;

  for (const token of pattern) {
    if (i >= chars.length) break;

    if (!isToken(token)) {
      result += token;
      if (chars[i] === token) i += 1;
      continue;
    }

    while (i < chars.length && !matchesToken(token, chars[i]!)) {
      i += 1;
    }
    if (i >= chars.length) break;

    const ch = chars[i]!;
    result += token === 'C' || token === 'A' ? ch.toUpperCase() : ch;
    i += 1;
  }

  return result;
}

export function applyMask(raw: string, mask: MaskType): string {
  if (mask === 'email') return maskEmail(raw);
  const pattern = resolveMask(mask);
  if (!pattern) return raw;
  return applyPatternMask(raw, pattern);
}

/** Strip mask separators for storage (keeps letters/digits only). */
export function unmask(value: string): string {
  return value.replace(/[^A-Za-zА-ЯЁӨҮа-яёөү0-9@.+_-]/g, '');
}

export const MASK_PLACEHOLDERS: Record<string, string> = {
  phone: '99112233',
  carNumber: 'АБВ6480',
  email: 'name@example.com',
  register: 'УЕ99112233',
  digits: '123456',
};
