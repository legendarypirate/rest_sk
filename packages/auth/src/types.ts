import type { MfaMethod } from './enums';
import type { UserStatus } from './enums';

export type AuthUser = {
  id: string;
  publicId: string;
  email: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  status: UserStatus;
  emailVerified: boolean;
  roles: string[];
  permissions: string[];
  mustChangePassword: boolean;
  mfaEnabled: boolean;
};

export type AuthTokens = {
  tokenType: 'Bearer';
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: string;
};

export type AuthSessionSummary = {
  id: string;
  expiresAt: string;
};

export type AuthSession = {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  fingerprint: string | null;
  lastSeenAt: string;
  expiresAt: string;
  createdAt: string;
  current: boolean;
};

export type AuthenticatedResponse = {
  mfaRequired: false;
  user: AuthUser;
  tokens: AuthTokens;
  session: AuthSessionSummary;
};

export type MfaChallengeResponse = {
  mfaRequired: true;
  challengeId: string;
  methods: MfaMethod[];
};

export type AuthLoginResponse = AuthenticatedResponse | MfaChallengeResponse;

export type TotpSetupResponse = {
  secret: string;
  otpauthUrl: string;
};

export type BackupCodesResponse = {
  backupCodes: string[];
};

export type AuthApiError = {
  statusCode: number;
  message: string;
  code: string;
};
