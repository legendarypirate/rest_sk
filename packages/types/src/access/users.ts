export type UserStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'LOCKED'
  | 'DEACTIVATED'
  | 'DELETED';

export type UserRoleSummary = {
  id: string;
  slug: string;
  name: string;
  scope: 'PLATFORM' | 'ORGANIZATION';
};

export type UserRoleAssignment = {
  id: string;
  userId: string;
  roleId: string;
  slug: string;
  name: string;
  scope: 'PLATFORM' | 'ORGANIZATION';
  grantedById: string | null;
  grantedAt: string;
  expiresAt: string | null;
};

export type UserListItem = {
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
  mfaEnabled: boolean;
  isSystemUser: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  roles: UserRoleSummary[];
};

export type UserDetail = UserListItem & {
  phoneE164: string | null;
  locale: string | null;
  timezone: string | null;
  lastSeenAt: string | null;
  deactivatedAt: string | null;
  deactivatedReason: string | null;
  rowVersion: number;
  assignments: UserRoleAssignment[];
};
