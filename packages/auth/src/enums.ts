export const UserStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  LOCKED: 'LOCKED',
  DEACTIVATED: 'DEACTIVATED',
  DELETED: 'DELETED',
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const MfaMethod = {
  NONE: 'NONE',
  TOTP: 'TOTP',
  SMS: 'SMS',
  EMAIL: 'EMAIL',
  WEBAUTHN: 'WEBAUTHN',
  BACKUP_CODE: 'BACKUP_CODE',
} as const;

export type MfaMethod = (typeof MfaMethod)[keyof typeof MfaMethod];

export const DeviceTrust = {
  UNKNOWN: 'UNKNOWN',
  PENDING: 'PENDING',
  TRUSTED: 'TRUSTED',
  BLOCKED: 'BLOCKED',
  REVOKED: 'REVOKED',
} as const;

export type DeviceTrust = (typeof DeviceTrust)[keyof typeof DeviceTrust];

export const SessionStatus = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  REVOKED: 'REVOKED',
  FORCED_LOGOUT: 'FORCED_LOGOUT',
} as const;

export type SessionStatus = (typeof SessionStatus)[keyof typeof SessionStatus];
