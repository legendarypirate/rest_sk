import { createHmac, timingSafeEqual } from 'node:crypto';

import {
  AUTH_TOTP_DIGITS,
  AUTH_TOTP_PERIOD_SECONDS,
  AUTH_TOTP_WINDOW,
} from '@packages/auth';

function hotp(secret: Buffer, counter: number, digits: number): string {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac('sha1', secret).update(buffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  return String(binary % 10 ** digits).padStart(digits, '0');
}

export function verifyTotp(
  secret: Buffer,
  code: string,
  window = AUTH_TOTP_WINDOW,
  period = AUTH_TOTP_PERIOD_SECONDS,
  digits = AUTH_TOTP_DIGITS,
): boolean {
  if (!/^\d+$/.test(code) || code.length !== digits) {
    return false;
  }

  const counter = Math.floor(Date.now() / 1000 / period);
  const expected = Buffer.from(code);

  for (let offset = -window; offset <= window; offset += 1) {
    const candidate = Buffer.from(hotp(secret, counter + offset, digits));

    if (
      candidate.length === expected.length &&
      timingSafeEqual(candidate, expected)
    ) {
      return true;
    }
  }

  return false;
}

export function totpAuthUrl(input: {
  issuer: string;
  account: string;
  secret: string;
}): string {
  const issuer = encodeURIComponent(input.issuer);
  const account = encodeURIComponent(input.account);

  return `otpauth://totp/${issuer}:${account}?secret=${input.secret}&issuer=${issuer}&algorithm=SHA1&digits=${AUTH_TOTP_DIGITS}&period=${AUTH_TOTP_PERIOD_SECONDS}`;
}
