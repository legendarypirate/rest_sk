export type SecurityPolicySource = 'config';

export type SecurityPolicySnapshot = {
  source: SecurityPolicySource;
  password: {
    minLength: number;
    maxLength: number;
    historyLimit: number;
    requireLowercase: boolean;
    requireUppercase: boolean;
    requireDigit: boolean;
    forbidIdentifier: boolean;
  };
  lockout: {
    threshold: number;
    baseMinutes: number;
    maxMinutes: number;
  };
  session: {
    maxActiveSessions: number;
    accessTokenTtl: string;
    refreshTokenTtl: string;
    cookieSecure: boolean;
  };
  mfa: {
    challengeTtlMs: number;
    maxAttempts: number;
    totpPeriodSeconds: number;
    totpDigits: number;
    totpWindow: number;
    backupCodeCount: number;
  };
  emailCode: {
    length: number;
    ttlMs: number;
  };
  passwordReset: {
    ttlMs: number;
  };
};
