import { createHash, randomBytes, randomInt } from 'node:crypto';

export function hashSecret(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

export function numericCode(length: number): string {
  const max = 10 ** length;
  return String(randomInt(0, max)).padStart(length, '0');
}

export function tokenPrefix(value: string, size = 8): string {
  return value.slice(0, size);
}
