import { AUTH_PASSWORD_MIN_LENGTH } from '@packages/auth';
import {
  CredentialType,
  MfaMethod,
  UserStatus,
} from '../../src/generated/prisma/client.js';

import { hashPassword } from '../../src/common/utils/password';
import type { SeedClient } from './client';

function adminIdentity() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? 'admin@food-order.local')
    .trim()
    .toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'admin123!';

  if (
    process.env.NODE_ENV === 'production' &&
    !process.env.SEED_ADMIN_PASSWORD
  ) {
    throw new Error('SEED_ADMIN_PASSWORD is required when NODE_ENV=production');
  }

  if (password.length < AUTH_PASSWORD_MIN_LENGTH) {
    throw new Error(
      `SEED_ADMIN_PASSWORD must be at least ${AUTH_PASSWORD_MIN_LENGTH} characters`,
    );
  }

  return { email, password };
}

export async function seedUsers(db: SeedClient, roleId: string) {
  const { email, password } = adminIdentity();
  const now = new Date();
  const passwordHash = await hashPassword(password);

  const existing = await db.user.findFirst({
    where: { emailNormalized: email, deletedAt: null },
  });

  const userData = {
    email,
    emailNormalized: email,
    username: 'admin',
    firstName: 'System',
    lastName: 'Admin',
    displayName: 'Platform Admin',
    status: UserStatus.ACTIVE,
    isSystemUser: true,
    emailVerifiedAt: now,
    locale: 'en',
    timezone: 'Asia/Ulaanbaatar',
    termsAcceptedAt: now,
    privacyAcceptedAt: now,
    deletedAt: null,
    deactivatedAt: null,
    deactivatedReason: null,
  };

  const user = existing
    ? await db.user.update({
        where: { id: existing.id },
        data: userData,
      })
    : await db.user.create({ data: userData });

  const credential = await db.userCredential.findFirst({
    where: {
      userId: user.id,
      type: CredentialType.PASSWORD,
      deletedAt: null,
    },
  });

  const credentialData = {
    type: CredentialType.PASSWORD,
    passwordHash,
    passwordAlgo: 'scrypt',
    passwordUpdatedAt: now,
    mustChangePassword: false,
    isPrimary: true,
    isActive: true,
    deletedAt: null,
  };

  if (credential) {
    await db.userCredential.update({
      where: { id: credential.id },
      data: credentialData,
    });
  } else {
    await db.userCredential.create({
      data: {
        userId: user.id,
        ...credentialData,
      },
    });
  }

  await db.userSecurity.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      mfaEnabled: false,
      mfaEnforced: false,
      mfaPrimaryMethod: MfaMethod.NONE,
      lastPasswordChangeAt: now,
    },
    update: {
      lockedUntil: null,
      lockReason: null,
      failedLoginCount: 0,
    },
  });

  await db.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId,
      },
    },
    create: {
      userId: user.id,
      roleId,
    },
    update: {
      expiresAt: null,
    },
  });

  return { email, userId: user.id };
}
