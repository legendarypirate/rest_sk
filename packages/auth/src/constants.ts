export const AUTH_ACCESS_COOKIE = 'hh.at';
export const AUTH_REFRESH_COOKIE = 'hh.rt';
export const AUTH_FINGERPRINT_HEADER = 'x-device-fingerprint';
export const AUTH_REQUEST_ID_HEADER = 'x-request-id';

export const AUTH_TOKEN_TYPE = 'Bearer' as const;
export const ACCESS_TOKEN_USE = 'access';

export const AUTH_LOCKOUT_THRESHOLD = 5;
export const AUTH_LOCKOUT_BASE_MINUTES = 15;
export const AUTH_LOCKOUT_MAX_MINUTES = 720;
export const AUTH_PASSWORD_HISTORY_LIMIT = 12;
export const AUTH_MAX_ACTIVE_SESSIONS = 20;
export const AUTH_LAST_SEEN_TOUCH_MS = 60_000;
export const AUTH_PASSWORD_MIN_LENGTH = 8;
export const AUTH_PASSWORD_MAX_LENGTH = 128;
export const AUTH_EMAIL_CODE_LENGTH = 6;
export const AUTH_EMAIL_CODE_TTL_MS = 15 * 60 * 1000;
export const AUTH_PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
export const AUTH_MFA_CHALLENGE_TTL_MS = 10 * 60 * 1000;
export const AUTH_MFA_MAX_ATTEMPTS = 5;
export const AUTH_TOTP_PERIOD_SECONDS = 30;
export const AUTH_TOTP_DIGITS = 6;
export const AUTH_TOTP_WINDOW = 1;
export const AUTH_BACKUP_CODE_COUNT = 10;
