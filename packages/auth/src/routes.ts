export const AUTH_ROUTES = {
  login: '/auth/login',
  logout: '/auth/logout',
  refresh: '/auth/refresh',
  register: '/auth/register',
  me: '/auth/me',
  sessions: '/auth/sessions',
  session: (id: string) => `/auth/sessions/${id}`,
  revokeOtherSessions: '/auth/sessions/revoke-others',
  passwordForgot: '/auth/password/forgot',
  passwordReset: '/auth/password/reset',
  passwordChange: '/auth/password/change',
  emailVerify: '/auth/email/verify',
  emailResend: '/auth/email/resend',
  mfaVerify: '/auth/mfa/verify',
  mfaTotpSetup: '/auth/mfa/totp/setup',
  mfaTotpConfirm: '/auth/mfa/totp/confirm',
  mfaDisable: '/auth/mfa/disable',
} as const;

export const AUTH_API_PREFIX = '/api/v1';

export function authUrl(path: string, baseUrl = ''): string {
  const origin = baseUrl
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/api\/v\d+$/i, '');

  return `${origin}${AUTH_API_PREFIX}${path}`;
}
