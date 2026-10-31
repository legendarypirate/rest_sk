import {
  AuthClientError,
  AuthErrorCode,
  loginRequestSchema,
  passwordChangeRequestSchema,
  type LoginRequest,
  type PasswordChangeRequest,
} from '@packages/auth';

import { authClient } from '@/lib/auth-client';

export function login(input: Pick<LoginRequest, 'identifier' | 'password'>) {
  return authClient.login(loginRequestSchema.parse(input));
}

export function me() {
  return authClient.me();
}

export function refreshSession() {
  return authClient.refresh();
}

export function changePassword(input: PasswordChangeRequest) {
  return authClient.changePassword(passwordChangeRequestSchema.parse(input));
}

export async function endSession() {
  try {
    await authClient.logout();
  } catch {
    // Session may already be invalid.
  }

  await fetch('/api/auth/clear', {
    method: 'POST',
    credentials: 'include',
  });
}

export function isMustChangePasswordError(error: unknown) {
  return (
    error instanceof AuthClientError &&
    error.code === AuthErrorCode.MUST_CHANGE_PASSWORD
  );
}

export function isUnauthorized(error: unknown) {
  if (isMustChangePasswordError(error)) {
    return false;
  }

  return (
    error instanceof AuthClientError &&
    (error.statusCode === 401 ||
      error.code === 'UNAUTHORIZED' ||
      error.code === 'SESSION_EXPIRED')
  );
}
