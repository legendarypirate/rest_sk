export { createAuthClient, AuthClientError } from './client';
export type { AuthClient, AuthClientConfig } from './client';
export {
  ACCESS_TOKEN_USE,
  AUTH_ACCESS_COOKIE,
  AUTH_BACKUP_CODE_COUNT,
  AUTH_EMAIL_CODE_LENGTH,
  AUTH_EMAIL_CODE_TTL_MS,
  AUTH_FINGERPRINT_HEADER,
  AUTH_LAST_SEEN_TOUCH_MS,
  AUTH_LOCKOUT_BASE_MINUTES,
  AUTH_LOCKOUT_MAX_MINUTES,
  AUTH_LOCKOUT_THRESHOLD,
  AUTH_MAX_ACTIVE_SESSIONS,
  AUTH_MFA_CHALLENGE_TTL_MS,
  AUTH_MFA_MAX_ATTEMPTS,
  AUTH_PASSWORD_HISTORY_LIMIT,
  AUTH_PASSWORD_MAX_LENGTH,
  AUTH_PASSWORD_MIN_LENGTH,
  AUTH_PASSWORD_RESET_TTL_MS,
  AUTH_REFRESH_COOKIE,
  AUTH_REQUEST_ID_HEADER,
  AUTH_TOKEN_TYPE,
  AUTH_TOTP_DIGITS,
  AUTH_TOTP_PERIOD_SECONDS,
  AUTH_TOTP_WINDOW,
} from './constants';
export { addDuration, parseDurationMs } from './duration';
export { emailLocalPart, normalizeEmail } from './email';
export {
  DeviceTrust,
  MfaMethod,
  SessionStatus,
  UserStatus,
} from './enums';
export type {
  DeviceTrust as DeviceTrustValue,
  MfaMethod as MfaMethodValue,
  SessionStatus as SessionStatusValue,
  UserStatus as UserStatusValue,
} from './enums';
export { AuthErrorCode } from './error-codes';
export { AuthValidationCode } from './validation-codes';
export type { AuthValidationCode as AuthValidationCodeValue } from './validation-codes';
export { decodeJwtPayload, isAccessTokenClaims } from './jwt';
export type { AccessTokenClaims } from './jwt';
export {
  assertPasswordPolicy,
  passwordPolicyIssues,
} from './password-policy';
export type { PasswordPolicyIssue } from './password-policy';
export { AUTH_API_PREFIX, AUTH_ROUTES, authUrl } from './routes';
export {
  emailResendRequestSchema,
  emailVerifyRequestSchema,
  loginRequestSchema,
  logoutRequestSchema,
  mfaDisableRequestSchema,
  mfaTotpConfirmRequestSchema,
  mfaVerifyRequestSchema,
  passwordChangeRequestSchema,
  passwordForgotRequestSchema,
  passwordResetRequestSchema,
  refreshRequestSchema,
  registerRequestSchema,
} from './schemas';
export type {
  EmailResendRequest,
  EmailVerifyRequest,
  LoginRequest,
  LogoutRequest,
  MfaDisableRequest,
  MfaTotpConfirmRequest,
  MfaVerifyRequest,
  PasswordChangeRequest,
  PasswordForgotRequest,
  PasswordResetRequest,
  RefreshRequest,
  RegisterRequest,
} from './schemas';
export type {
  AuthApiError,
  AuthenticatedResponse,
  AuthLoginResponse,
  AuthSession,
  AuthSessionSummary,
  AuthTokens,
  AuthUser,
  BackupCodesResponse,
  MfaChallengeResponse,
  TotpSetupResponse,
} from './types';
