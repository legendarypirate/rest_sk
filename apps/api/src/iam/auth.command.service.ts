import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ACCESS_TOKEN_USE,
  AUTH_BACKUP_CODE_COUNT,
  AUTH_EMAIL_CODE_LENGTH,
  AUTH_EMAIL_CODE_TTL_MS,
  AUTH_LOCKOUT_BASE_MINUTES,
  AUTH_LOCKOUT_MAX_MINUTES,
  AUTH_LOCKOUT_THRESHOLD,
  AUTH_MAX_ACTIVE_SESSIONS,
  AUTH_MFA_CHALLENGE_TTL_MS,
  AUTH_MFA_MAX_ATTEMPTS,
  AUTH_PASSWORD_HISTORY_LIMIT,
  AUTH_PASSWORD_RESET_TTL_MS,
  AUTH_TOKEN_TYPE,
  AuthErrorCode,
  MfaMethod,
  normalizeEmail,
  parseDurationMs,
  passwordPolicyIssues,
  type AuthenticatedResponse,
  type AuthLoginResponse,
  type AuthTokens,
  type BackupCodesResponse,
  type TotpSetupResponse,
} from '@packages/auth';
import {
  CredentialType,
  DeviceTrust,
  IdentityProvider,
  LoginOutcome,
  MfaMethod as PrismaMfaMethod,
  SecuritySeverity,
  SessionStatus,
  TokenStatus,
  TokenType,
  UserStatus,
  VerificationChannel,
  VerificationPurpose,
  VerificationStatus,
  type Prisma,
} from '@generated/prisma/client';

import {
  BadRequestAppException,
  ConflictAppException,
  ForbiddenAppException,
  NotFoundAppException,
  UnauthorizedAppException,
} from '../common/exceptions';
import { hashPassword, verifyPassword } from '../common/utils/password';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthRequestContext } from './auth-request.context';
import {
  authorizationOf,
  loadUserAuth,
  toAuthUser,
  type AuthDb,
} from './auth.authorization';
import { AuthNotificationPort } from './auth.notification';
import type { AuthenticatedUser } from './auth.types';
import {
  decryptSecret,
  deriveEncryptionKey,
  encryptSecret,
} from './crypto/aes';
import { fromBase32, toBase32 } from './crypto/base32';
import {
  hashSecret,
  numericCode,
  randomToken,
  tokenPrefix,
} from './crypto/secret';
import { totpAuthUrl, verifyTotp } from './crypto/totp';
import type {
  EmailResendDto,
  EmailVerifyDto,
  LoginDto,
  MfaDisableDto,
  MfaTotpConfirmDto,
  MfaVerifyDto,
  PasswordChangeDto,
  PasswordForgotDto,
  PasswordResetDto,
  RegisterDto,
} from './dto/auth.dto';

type JsonMap = Record<string, unknown>;

@Injectable()
export class AuthCommandService implements OnModuleInit {
  private dummyPasswordHash = '';
  private readonly accessTtlMs: number;
  private readonly refreshTtlMs: number;
  private readonly encryptionKey: Buffer;
  private readonly issuerName = 'Restaurant';

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly notifications: AuthNotificationPort,
  ) {
    this.accessTtlMs = parseDurationMs(
      config.get<string>('auth.jwtExpiresIn') ?? '15m',
    );
    this.refreshTtlMs = parseDurationMs(
      config.get<string>('auth.jwtRefreshExpiresIn') ?? '7d',
    );
    this.encryptionKey = deriveEncryptionKey(
      config.getOrThrow<string>('auth.jwtSecret'),
    );
  }

  async onModuleInit(): Promise<void> {
    this.dummyPasswordHash = await hashPassword(randomToken());
  }

  async login(
    input: LoginDto,
    context: AuthRequestContext,
  ): Promise<AuthLoginResponse> {
    const now = new Date();
    const identifier = input.identifier.trim();
    const user = await this.findUserByIdentifier(identifier);
    const passwordHash = user
      ? await this.primaryPasswordHash(user.id)
      : this.dummyPasswordHash;
    const passwordOk = await verifyPassword(
      input.password,
      passwordHash ?? this.dummyPasswordHash,
    );

    if (!user || !passwordHash || !passwordOk) {
      if (user) {
        await this.registerFailure(user.id, identifier, context, now);
      } else {
        await this.recordLoginAttempt({
          identifier,
          outcome: LoginOutcome.FAILURE,
          failureReason: 'invalid_credentials',
          context,
        });
      }

      throw this.invalidCredentials();
    }

    await this.assertAccountCanLogin(user.id, now);

    const authUser = await loadUserAuth(this.prisma, user.id);

    if (!authUser) {
      throw this.invalidCredentials();
    }

    const authz = authorizationOf(authUser, now);

    if (authz.mfaEnabled) {
      const challengeId = await this.createMfaChallenge({
        userId: user.id,
        fingerprint: context.fingerprint ?? input.fingerprint,
        context,
        now,
        methods: this.mfaMethods(authUser.security?.backupCodesHash ?? []),
      });

      await this.recordLoginAttempt({
        userId: user.id,
        identifier,
        outcome: LoginOutcome.MFA_REQUIRED,
        context,
      });

      return {
        mfaRequired: true,
        challengeId,
        methods: this.mfaMethods(authUser.security?.backupCodesHash ?? []),
      };
    }

    return this.completeLogin({
      userId: user.id,
      identifier,
      fingerprint: context.fingerprint ?? input.fingerprint,
      context,
      now,
    });
  }

  async verifyMfa(
    input: MfaVerifyDto,
    context: AuthRequestContext,
  ): Promise<AuthenticatedResponse> {
    const now = new Date();
    const challenge = await this.prisma.userVerification.findFirst({
      where: {
        id: input.challengeId,
        purpose: VerificationPurpose.MFA,
        status: VerificationStatus.PENDING,
      },
    });

    if (!challenge || challenge.expiresAt <= now) {
      throw new UnauthorizedAppException(AuthErrorCode.MFA_FAILED);
    }

    if (challenge.attempts >= challenge.maxAttempts) {
      await this.prisma.userVerification.update({
        where: { id: challenge.id },
        data: { status: VerificationStatus.FAILED },
      });
      throw new UnauthorizedAppException(AuthErrorCode.MFA_FAILED);
    }

    const metadata = asJsonMap(challenge.metadata);
    const user = await loadUserAuth(this.prisma, challenge.userId);
    const security = user?.security;

    if (!user || !security?.mfaEnabled) {
      throw new UnauthorizedAppException(AuthErrorCode.MFA_FAILED);
    }

    const accepted = await this.verifyMfaFactor(
      user.id,
      security,
      input.code.trim(),
    );

    if (!accepted) {
      await this.prisma.userVerification.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      await this.recordLoginAttempt({
        userId: user.id,
        identifier: user.email ?? user.id,
        outcome: LoginOutcome.MFA_FAILED,
        context,
      });
      throw new UnauthorizedAppException(AuthErrorCode.MFA_FAILED);
    }

    await this.prisma.userVerification.update({
      where: { id: challenge.id },
      data: {
        status: VerificationStatus.CONSUMED,
        verifiedAt: now,
        consumedAt: now,
      },
    });

    const fingerprint = asString(metadata.fingerprint) ?? context.fingerprint;

    return this.completeLogin({
      userId: user.id,
      identifier: user.email ?? user.id,
      fingerprint,
      context,
      now,
    });
  }

  async refresh(
    refreshToken: string | undefined,
    context: AuthRequestContext,
  ): Promise<AuthenticatedResponse> {
    if (!refreshToken) {
      throw new UnauthorizedAppException();
    }

    const now = new Date();
    const tokenHash = hashSecret(refreshToken);
    const existing = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!existing) {
      throw new UnauthorizedAppException();
    }

    if (
      existing.status !== TokenStatus.ACTIVE ||
      existing.expiresAt <= now ||
      !existing.sessionId
    ) {
      if (
        existing.status === TokenStatus.ROTATED ||
        existing.status === TokenStatus.REUSE_DETECTED
      ) {
        await this.revokeFamily(existing.familyId, now, 'refresh_reuse');
        await this.securityEvent({
          userId: existing.userId,
          eventType: 'refresh_reuse',
          severity: SecuritySeverity.CRITICAL,
          title: 'Refresh token reuse detected',
          context,
        });
        throw new UnauthorizedAppException(AuthErrorCode.TOKEN_REUSE);
      }

      throw new UnauthorizedAppException(AuthErrorCode.SESSION_EXPIRED);
    }

    const user = await loadUserAuth(this.prisma, existing.userId);

    if (!user) {
      throw new UnauthorizedAppException();
    }

    this.assertUsableStatus(user.status);

    const session = await this.prisma.userSession.findFirst({
      where: { id: existing.sessionId, userId: user.id },
    });

    if (
      !session ||
      session.status !== SessionStatus.ACTIVE ||
      session.expiresAt <= now
    ) {
      throw new UnauthorizedAppException(AuthErrorCode.SESSION_EXPIRED);
    }

    const authz = authorizationOf(user, now);
    const issued = await this.prisma.$transaction(async (tx) => {
      await tx.refreshToken.update({
        where: { id: existing.id },
        data: {
          status: TokenStatus.ROTATED,
          rotatedAt: now,
        },
      });

      if (existing.accessTokenId) {
        await tx.accessToken.update({
          where: { id: existing.accessTokenId },
          data: {
            status: TokenStatus.ROTATED,
            revokedAt: now,
            revokeReason: 'rotated',
          },
        });
      }

      await tx.userSession.update({
        where: { id: session.id },
        data: {
          lastSeenAt: now,
          expiresAt: new Date(now.getTime() + this.refreshTtlMs),
          ipAddress: context.ipAddress ?? session.ipAddress,
          userAgent: context.userAgent ?? session.userAgent,
        },
      });

      return this.issueTokens(tx, {
        userId: user.id,
        sessionId: session.id,
        familyId: existing.familyId,
        parentRefreshId: existing.id,
        context,
        now,
      });
    });

    await this.prisma.refreshToken.update({
      where: { id: existing.id },
      data: { replacedById: issued.refreshId },
    });

    return {
      mfaRequired: false,
      user: toAuthUser(user, authz),
      tokens: issued.tokens,
      session: {
        id: session.id,
        expiresAt: new Date(now.getTime() + this.refreshTtlMs).toISOString(),
      },
    };
  }

  async logout(
    actor: AuthenticatedUser,
    everywhere: boolean,
    context: AuthRequestContext,
  ): Promise<void> {
    const now = new Date();

    if (everywhere) {
      await this.revokeUserSessions(actor.id, now, 'logout_all');
    } else {
      await this.revokeSessionById(actor.sessionId, actor.id, now, 'logout');
    }

    await this.securityEvent({
      userId: actor.id,
      eventType: everywhere ? 'logout_all' : 'logout',
      severity: SecuritySeverity.INFO,
      title: everywhere ? 'All sessions revoked' : 'Session ended',
      context,
    });
  }

  async revokeSession(
    actor: AuthenticatedUser,
    sessionId: string,
    context: AuthRequestContext,
  ): Promise<void> {
    const session = await this.prisma.userSession.findFirst({
      where: { id: sessionId, userId: actor.id },
    });

    if (!session) {
      throw new NotFoundAppException();
    }

    await this.revokeSessionById(session.id, actor.id, new Date(), 'revoked');
    await this.securityEvent({
      userId: actor.id,
      eventType: 'session_revoked',
      severity: SecuritySeverity.MEDIUM,
      title: 'Session revoked',
      context,
    });
  }

  async revokeOtherSessions(
    actor: AuthenticatedUser,
    context: AuthRequestContext,
  ): Promise<void> {
    const now = new Date();
    const sessions = await this.prisma.userSession.findMany({
      where: {
        userId: actor.id,
        status: SessionStatus.ACTIVE,
        id: { not: actor.sessionId },
      },
      select: { id: true },
    });

    for (const session of sessions) {
      await this.revokeSessionById(session.id, actor.id, now, 'revoked_others');
    }

    await this.securityEvent({
      userId: actor.id,
      eventType: 'sessions_revoked_others',
      severity: SecuritySeverity.MEDIUM,
      title: 'Other sessions revoked',
      context,
    });
  }

  async register(
    input: RegisterDto,
    context: AuthRequestContext,
  ): Promise<void> {
    const email = normalizeEmail(input.email);
    const issues = passwordPolicyIssues(input.password, email);

    if (issues.length > 0) {
      throw new BadRequestAppException(AuthErrorCode.WEAK_PASSWORD);
    }

    const now = new Date();
    const passwordHash = await hashPassword(input.password);

    const created = await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`auth:email:${email}`}))`;

      const existing = await tx.user.findFirst({
        where: { emailNormalized: email, deletedAt: null },
      });

      if (existing) {
        return existing.status === UserStatus.PENDING ? existing : null;
      }

      const displayName = [input.firstName, input.lastName]
        .filter(Boolean)
        .join(' ')
        .trim();

      const user = await tx.user.create({
        data: {
          email,
          emailNormalized: email,
          firstName: input.firstName,
          lastName: input.lastName,
          displayName: displayName || null,
          status: UserStatus.PENDING,
        },
      });

      await tx.userCredential.create({
        data: {
          userId: user.id,
          type: CredentialType.PASSWORD,
          passwordHash,
          passwordAlgo: 'scrypt',
          passwordUpdatedAt: now,
          isPrimary: true,
          isActive: true,
        },
      });

      await tx.userSecurity.create({
        data: {
          userId: user.id,
          lastPasswordChangeAt: now,
        },
      });

      return user;
    });

    if (created) {
      await this.issueEmailVerification(created.id, email, context, now);
    }
  }

  async requestPasswordReset(
    input: PasswordForgotDto,
    context: AuthRequestContext,
  ): Promise<void> {
    const email = normalizeEmail(input.email);
    const user = await this.prisma.user.findFirst({
      where: {
        emailNormalized: email,
        deletedAt: null,
        status: { in: [UserStatus.ACTIVE, UserStatus.PENDING] },
      },
    });

    if (!user) {
      return;
    }

    const now = new Date();
    const token = randomToken();

    await this.prisma.$transaction(async (tx) => {
      await tx.passwordReset.updateMany({
        where: {
          userId: user.id,
          consumedAt: null,
          invalidatedAt: null,
        },
        data: { invalidatedAt: now },
      });

      await tx.passwordReset.create({
        data: {
          userId: user.id,
          tokenHash: hashSecret(token),
          requestedIp: context.ipAddress,
          userAgent: context.userAgent,
          expiresAt: new Date(now.getTime() + AUTH_PASSWORD_RESET_TTL_MS),
        },
      });
    });

    await this.notifications.sendPasswordReset({ email, token });
  }

  async confirmPasswordReset(
    input: PasswordResetDto,
    context: AuthRequestContext,
  ): Promise<void> {
    const now = new Date();
    const reset = await this.prisma.passwordReset.findUnique({
      where: { tokenHash: hashSecret(input.token) },
    });

    if (
      !reset ||
      reset.consumedAt ||
      reset.invalidatedAt ||
      reset.expiresAt <= now
    ) {
      throw new BadRequestAppException(AuthErrorCode.UNAUTHORIZED);
    }

    const user = await this.prisma.user.findFirst({
      where: { id: reset.userId, deletedAt: null },
    });

    if (!user) {
      throw new BadRequestAppException(AuthErrorCode.UNAUTHORIZED);
    }

    const issues = passwordPolicyIssues(
      input.password,
      user.email ?? undefined,
    );

    if (issues.length > 0) {
      throw new BadRequestAppException(AuthErrorCode.WEAK_PASSWORD);
    }

    await this.replacePassword(user.id, input.password, now, true);
    await this.prisma.passwordReset.update({
      where: { id: reset.id },
      data: { consumedAt: now },
    });
    await this.revokeUserSessions(user.id, now, 'password_reset');
    await this.securityEvent({
      userId: user.id,
      eventType: 'password_reset',
      severity: SecuritySeverity.HIGH,
      title: 'Password reset',
      context,
    });
  }

  async changePassword(
    actor: AuthenticatedUser,
    input: PasswordChangeDto,
    context: AuthRequestContext,
  ): Promise<void> {
    const credential = await this.primaryCredential(actor.id);

    if (!credential?.passwordHash) {
      throw new UnauthorizedAppException(AuthErrorCode.INVALID_CREDENTIALS);
    }

    const matches = await verifyPassword(
      input.currentPassword,
      credential.passwordHash,
    );

    if (!matches) {
      throw new UnauthorizedAppException(AuthErrorCode.INVALID_CREDENTIALS);
    }

    const issues = passwordPolicyIssues(
      input.newPassword,
      actor.email ?? undefined,
    );

    if (issues.length > 0) {
      throw new BadRequestAppException(AuthErrorCode.WEAK_PASSWORD);
    }

    if (input.currentPassword === input.newPassword) {
      throw new BadRequestAppException(AuthErrorCode.PASSWORD_REUSED);
    }

    const now = new Date();
    await this.replacePassword(actor.id, input.newPassword, now, false);
    await this.revokeOtherSessions(actor, context);
    await this.securityEvent({
      userId: actor.id,
      eventType: 'password_changed',
      severity: SecuritySeverity.MEDIUM,
      title: 'Password changed',
      context,
    });
  }

  async verifyEmail(
    input: EmailVerifyDto,
    context: AuthRequestContext,
  ): Promise<void> {
    const email = normalizeEmail(input.email);
    const now = new Date();
    const verification = await this.prisma.emailVerification.findFirst({
      where: {
        emailNormalized: email,
        purpose: VerificationPurpose.SIGNUP,
        status: VerificationStatus.PENDING,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verification || verification.expiresAt <= now) {
      throw new BadRequestAppException();
    }

    if (verification.attempts >= verification.maxAttempts) {
      await this.prisma.emailVerification.update({
        where: { id: verification.id },
        data: { status: VerificationStatus.FAILED },
      });
      throw new BadRequestAppException();
    }

    const expected = hashSecret(`${email}:${input.code}`);

    if (!timingSafeHexEqual(expected, verification.codeHash)) {
      await this.prisma.emailVerification.update({
        where: { id: verification.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestAppException();
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.emailVerification.update({
        where: { id: verification.id },
        data: {
          status: VerificationStatus.CONSUMED,
          verifiedAt: now,
          consumedAt: now,
        },
      });

      if (verification.userId) {
        await tx.user.update({
          where: { id: verification.userId },
          data: {
            emailVerifiedAt: now,
            status: UserStatus.ACTIVE,
          },
        });
      }
    });

    await this.securityEvent({
      userId: verification.userId,
      eventType: 'email_verified',
      severity: SecuritySeverity.INFO,
      title: 'Email verified',
      context,
    });
  }

  async resendEmailVerification(
    input: EmailResendDto,
    context: AuthRequestContext,
  ): Promise<void> {
    const email = normalizeEmail(input.email);
    const user = await this.prisma.user.findFirst({
      where: {
        emailNormalized: email,
        deletedAt: null,
        status: UserStatus.PENDING,
      },
    });

    if (!user) {
      return;
    }

    await this.issueEmailVerification(user.id, email, context, new Date());
  }

  async setupTotp(actor: AuthenticatedUser): Promise<TotpSetupResponse> {
    const security = await this.requireSecurity(actor.id);

    if (security.mfaEnabled) {
      throw new ConflictAppException();
    }

    const secret = toBase32(randomBytes(20));
    const encrypted = encryptSecret(secret, this.encryptionKey);
    const metadata = {
      ...asJsonMap(security.metadata),
      totpPending: encrypted,
    };

    await this.prisma.userSecurity.update({
      where: { userId: actor.id },
      data: { metadata: metadata as Prisma.InputJsonValue },
    });

    const account = actor.email ?? actor.id;

    return {
      secret,
      otpauthUrl: totpAuthUrl({
        issuer: this.issuerName,
        account,
        secret,
      }),
    };
  }

  async confirmTotp(
    actor: AuthenticatedUser,
    input: MfaTotpConfirmDto,
  ): Promise<BackupCodesResponse> {
    const security = await this.requireSecurity(actor.id);
    const pending = asString(asJsonMap(security.metadata).totpPending);

    if (!pending) {
      throw new BadRequestAppException();
    }

    const secret = decryptSecret(pending, this.encryptionKey);

    if (!verifyTotp(fromBase32(secret), input.code)) {
      throw new UnauthorizedAppException(AuthErrorCode.MFA_FAILED);
    }

    const backupCodes = Array.from({ length: AUTH_BACKUP_CODE_COUNT }, () =>
      randomBytes(5).toString('hex'),
    );
    const backupCodesHash = backupCodes.map((code) =>
      hashSecret(`${actor.id}:${code}`),
    );
    const metadata = asJsonMap(security.metadata);
    delete metadata.totpPending;

    await this.prisma.userSecurity.update({
      where: { userId: actor.id },
      data: {
        mfaEnabled: true,
        mfaPrimaryMethod: PrismaMfaMethod.TOTP,
        totpSecretEncrypted: encryptSecret(secret, this.encryptionKey),
        totpVerifiedAt: new Date(),
        lastMfaChangeAt: new Date(),
        backupCodesHash,
        metadata: metadata as Prisma.InputJsonValue,
      },
    });

    return { backupCodes };
  }

  async disableMfa(
    actor: AuthenticatedUser,
    input: MfaDisableDto,
    context: AuthRequestContext,
  ): Promise<void> {
    const credential = await this.primaryCredential(actor.id);
    const security = await this.requireSecurity(actor.id);

    if (!security.mfaEnabled) {
      throw new BadRequestAppException(AuthErrorCode.MFA_NOT_ENABLED);
    }

    if (
      !credential?.passwordHash ||
      !(await verifyPassword(input.password, credential.passwordHash))
    ) {
      throw new UnauthorizedAppException(AuthErrorCode.INVALID_CREDENTIALS);
    }

    const accepted = await this.verifyMfaFactor(
      actor.id,
      security,
      input.code.trim(),
    );

    if (!accepted) {
      throw new UnauthorizedAppException(AuthErrorCode.MFA_FAILED);
    }

    await this.prisma.userSecurity.update({
      where: { userId: actor.id },
      data: {
        mfaEnabled: false,
        mfaPrimaryMethod: PrismaMfaMethod.NONE,
        totpSecretEncrypted: null,
        totpVerifiedAt: null,
        backupCodesHash: [],
        lastMfaChangeAt: new Date(),
        metadata: {},
      },
    });

    await this.securityEvent({
      userId: actor.id,
      eventType: 'mfa_disabled',
      severity: SecuritySeverity.HIGH,
      title: 'MFA disabled',
      context,
    });
  }

  private async completeLogin(input: {
    userId: string;
    identifier: string;
    fingerprint?: string;
    context: AuthRequestContext;
    now: Date;
  }): Promise<AuthenticatedResponse> {
    const user = await loadUserAuth(this.prisma, input.userId);

    if (!user) {
      throw this.invalidCredentials();
    }

    const authz = authorizationOf(user, input.now);
    const result = await this.prisma.$transaction(async (tx) => {
      const deviceId = await this.upsertDevice(tx, {
        userId: input.userId,
        fingerprint: input.fingerprint,
        context: input.context,
        now: input.now,
      });

      await this.enforceSessionCap(tx, input.userId, input.now);

      const sessionId = randomUUID();
      const familyId = randomUUID();
      const sessionExpiresAt = new Date(
        input.now.getTime() + this.refreshTtlMs,
      );

      await tx.userSession.create({
        data: {
          id: sessionId,
          userId: input.userId,
          deviceId,
          sessionTokenHash: hashSecret(randomToken()),
          status: SessionStatus.ACTIVE,
          ipAddress: input.context.ipAddress,
          userAgent: input.context.userAgent,
          fingerprint: input.fingerprint,
          lastSeenAt: input.now,
          expiresAt: sessionExpiresAt,
        },
      });

      const issued = await this.issueTokens(tx, {
        userId: input.userId,
        sessionId,
        familyId,
        context: input.context,
        now: input.now,
      });

      await tx.userSecurity.upsert({
        where: { userId: input.userId },
        create: {
          userId: input.userId,
          failedLoginCount: 0,
        },
        update: {
          failedLoginCount: 0,
          lockedUntil: null,
          lockReason: null,
        },
      });

      await tx.user.update({
        where: { id: input.userId },
        data: {
          lastLoginAt: input.now,
          lastLoginIp: input.context.ipAddress,
          lastSeenAt: input.now,
          status:
            user.status === UserStatus.PENDING
              ? user.status
              : UserStatus.ACTIVE,
        },
      });

      await tx.loginAttempt.create({
        data: {
          userId: input.userId,
          identifier: input.identifier,
          identifierType: input.identifier.includes('@') ? 'email' : 'username',
          outcome: LoginOutcome.SUCCESS,
          provider: IdentityProvider.LOCAL,
          ipAddress: input.context.ipAddress,
          userAgent: input.context.userAgent,
          fingerprint: input.fingerprint,
          requestId: input.context.requestId,
        },
      });

      return {
        sessionId,
        sessionExpiresAt,
        tokens: issued.tokens,
      };
    });

    return {
      mfaRequired: false,
      user: toAuthUser(user, authz),
      tokens: result.tokens,
      session: {
        id: result.sessionId,
        expiresAt: result.sessionExpiresAt.toISOString(),
      },
    };
  }

  private async issueTokens(
    tx: Prisma.TransactionClient,
    input: {
      userId: string;
      sessionId: string;
      familyId: string;
      parentRefreshId?: string;
      context: AuthRequestContext;
      now: Date;
    },
  ): Promise<{ refreshId: string; tokens: AuthTokens }> {
    const accessId = randomUUID();
    const refreshId = randomUUID();
    const refreshPlain = randomToken();
    const accessExpiresAt = new Date(input.now.getTime() + this.accessTtlMs);
    const refreshExpiresAt = new Date(input.now.getTime() + this.refreshTtlMs);
    const accessToken = await this.jwt.signAsync({
      sub: input.userId,
      jti: accessId,
      sid: input.sessionId,
      use: ACCESS_TOKEN_USE,
    });

    await tx.accessToken.create({
      data: {
        id: accessId,
        userId: input.userId,
        sessionId: input.sessionId,
        type: TokenType.ACCESS,
        status: TokenStatus.ACTIVE,
        tokenHash: hashSecret(accessToken),
        tokenPrefix: tokenPrefix(accessToken),
        jti: accessId,
        expiresAt: accessExpiresAt,
      },
    });

    await tx.refreshToken.create({
      data: {
        id: refreshId,
        userId: input.userId,
        sessionId: input.sessionId,
        accessTokenId: accessId,
        familyId: input.familyId,
        tokenHash: hashSecret(refreshPlain),
        status: TokenStatus.ACTIVE,
        parentId: input.parentRefreshId,
        ipAddress: input.context.ipAddress,
        userAgent: input.context.userAgent,
        expiresAt: refreshExpiresAt,
      },
    });

    return {
      refreshId,
      tokens: {
        tokenType: AUTH_TOKEN_TYPE,
        accessToken,
        refreshToken: refreshPlain,
        expiresIn: Math.floor(this.accessTtlMs / 1000),
        expiresAt: accessExpiresAt.toISOString(),
      },
    };
  }

  private async findUserByIdentifier(identifier: string) {
    if (identifier.includes('@')) {
      return this.prisma.user.findFirst({
        where: {
          emailNormalized: normalizeEmail(identifier),
          deletedAt: null,
        },
      });
    }

    return this.prisma.user.findFirst({
      where: {
        username: { equals: identifier, mode: 'insensitive' },
        deletedAt: null,
      },
    });
  }

  private async primaryCredential(userId: string) {
    return this.prisma.userCredential.findFirst({
      where: {
        userId,
        type: CredentialType.PASSWORD,
        isActive: true,
        deletedAt: null,
      },
    });
  }

  private async primaryPasswordHash(userId: string) {
    const credential = await this.primaryCredential(userId);
    return credential?.passwordHash ?? null;
  }

  private async requireSecurity(userId: string) {
    const security = await this.prisma.userSecurity.findUnique({
      where: { userId },
    });

    if (!security) {
      throw new UnauthorizedAppException();
    }

    return security;
  }

  private async assertAccountCanLogin(
    userId: string,
    now: Date,
  ): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: { security: true },
    });

    if (!user) {
      throw this.invalidCredentials();
    }

    this.assertUsableStatus(user.status);

    const lockedUntil = user.security?.lockedUntil;

    if (lockedUntil && lockedUntil > now) {
      throw new UnauthorizedAppException(AuthErrorCode.ACCOUNT_LOCKED);
    }

    const credential = await this.primaryCredential(userId);

    if (credential?.passwordExpiresAt && credential.passwordExpiresAt <= now) {
      throw new UnauthorizedAppException(AuthErrorCode.PASSWORD_EXPIRED);
    }
  }

  private assertUsableStatus(status: UserStatus): void {
    if (status === UserStatus.ACTIVE) {
      return;
    }

    if (status === UserStatus.LOCKED) {
      throw new UnauthorizedAppException(AuthErrorCode.ACCOUNT_LOCKED);
    }

    if (status === UserStatus.PENDING) {
      throw new UnauthorizedAppException(AuthErrorCode.EMAIL_NOT_VERIFIED);
    }

    throw new UnauthorizedAppException(AuthErrorCode.ACCOUNT_DISABLED);
  }

  private async registerFailure(
    userId: string,
    identifier: string,
    context: AuthRequestContext,
    now: Date,
  ): Promise<void> {
    const security = await this.prisma.userSecurity.findUnique({
      where: { userId },
    });
    const failedLoginCount = (security?.failedLoginCount ?? 0) + 1;
    const shouldLock = failedLoginCount >= AUTH_LOCKOUT_THRESHOLD;
    const lockoutCount = shouldLock
      ? (security?.lockoutCount ?? 0) + 1
      : (security?.lockoutCount ?? 0);
    const lockedUntil = shouldLock ? lockoutUntil(lockoutCount, now) : null;

    await this.prisma.userSecurity.update({
      where: { userId },
      data: {
        failedLoginCount,
        lockoutCount,
        lockedAt: shouldLock ? now : security?.lockedAt,
        lockedUntil,
        lastLockoutAt: shouldLock ? now : security?.lastLockoutAt,
        lockReason: shouldLock ? 'failed_logins' : security?.lockReason,
      },
    });

    if (shouldLock) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { status: UserStatus.LOCKED },
      });
      await this.recordLoginAttempt({
        userId,
        identifier,
        outcome: LoginOutcome.LOCKED,
        failureReason: 'lockout',
        context,
      });
      await this.securityEvent({
        userId,
        eventType: 'account_locked',
        severity: SecuritySeverity.HIGH,
        title: 'Account locked after failed logins',
        context,
      });
      throw new UnauthorizedAppException(AuthErrorCode.ACCOUNT_LOCKED);
    }

    await this.recordLoginAttempt({
      userId,
      identifier,
      outcome: LoginOutcome.FAILURE,
      failureReason: 'invalid_credentials',
      context,
    });
  }

  private async upsertDevice(
    tx: AuthDb,
    input: {
      userId: string;
      fingerprint?: string;
      context: AuthRequestContext;
      now: Date;
    },
  ): Promise<string | undefined> {
    if (!input.fingerprint) {
      return undefined;
    }

    const existing = await tx.userDevice.findUnique({
      where: {
        userId_fingerprint: {
          userId: input.userId,
          fingerprint: input.fingerprint,
        },
      },
    });

    if (
      existing &&
      (existing.trust === DeviceTrust.BLOCKED ||
        existing.trust === DeviceTrust.REVOKED)
    ) {
      throw new ForbiddenAppException(AuthErrorCode.DEVICE_BLOCKED);
    }

    const device = await tx.userDevice.upsert({
      where: {
        userId_fingerprint: {
          userId: input.userId,
          fingerprint: input.fingerprint,
        },
      },
      create: {
        userId: input.userId,
        fingerprint: input.fingerprint,
        userAgent: input.context.userAgent,
        lastIp: input.context.ipAddress,
        lastSeenAt: input.now,
      },
      update: {
        userAgent: input.context.userAgent,
        lastIp: input.context.ipAddress,
        lastSeenAt: input.now,
        deletedAt: null,
      },
    });

    return device.id;
  }

  private async enforceSessionCap(
    tx: Prisma.TransactionClient,
    userId: string,
    now: Date,
  ): Promise<void> {
    const active = await tx.userSession.findMany({
      where: {
        userId,
        status: SessionStatus.ACTIVE,
        expiresAt: { gt: now },
      },
      orderBy: { lastSeenAt: 'asc' },
      select: { id: true },
    });

    const overflow = active.length - AUTH_MAX_ACTIVE_SESSIONS + 1;

    if (overflow <= 0) {
      return;
    }

    for (const session of active.slice(0, overflow)) {
      await this.revokeSessionById(session.id, userId, now, 'session_cap', tx);
    }
  }

  private async revokeSessionById(
    sessionId: string,
    userId: string,
    now: Date,
    reason: string,
    db: AuthDb = this.prisma,
  ): Promise<void> {
    await db.userSession.updateMany({
      where: { id: sessionId, userId, status: SessionStatus.ACTIVE },
      data: {
        status: SessionStatus.REVOKED,
        revokedAt: now,
        revokeReason: reason,
      },
    });
    await db.accessToken.updateMany({
      where: { sessionId, status: TokenStatus.ACTIVE },
      data: {
        status: TokenStatus.REVOKED,
        revokedAt: now,
        revokeReason: reason,
      },
    });
    await db.refreshToken.updateMany({
      where: { sessionId, status: TokenStatus.ACTIVE },
      data: {
        status: TokenStatus.REVOKED,
        revokedAt: now,
      },
    });
  }

  private async revokeUserSessions(
    userId: string,
    now: Date,
    reason: string,
  ): Promise<void> {
    const sessions = await this.prisma.userSession.findMany({
      where: { userId, status: SessionStatus.ACTIVE },
      select: { id: true },
    });

    for (const session of sessions) {
      await this.revokeSessionById(session.id, userId, now, reason);
    }
  }

  private async revokeFamily(
    familyId: string,
    now: Date,
    reason: string,
  ): Promise<void> {
    const tokens = await this.prisma.refreshToken.findMany({
      where: { familyId },
      select: { sessionId: true, userId: true },
    });

    await this.prisma.refreshToken.updateMany({
      where: { familyId },
      data: {
        status: TokenStatus.REUSE_DETECTED,
        reuseDetectedAt: now,
        revokedAt: now,
      },
    });

    const sessionIds = [
      ...new Set(tokens.map((token) => token.sessionId).filter(Boolean)),
    ] as string[];

    for (const sessionId of sessionIds) {
      const owner = tokens.find((token) => token.sessionId === sessionId);
      if (owner) {
        await this.revokeSessionById(sessionId, owner.userId, now, reason);
      }
    }
  }

  private async replacePassword(
    userId: string,
    password: string,
    now: Date,
    unlock: boolean,
  ): Promise<void> {
    const credential = await this.primaryCredential(userId);
    const previous = credential?.passwordHash
      ? [credential.passwordHash, ...asStringArray(credential.passwordHistory)]
      : [];

    for (const stored of previous) {
      if (await verifyPassword(password, stored)) {
        throw new BadRequestAppException(AuthErrorCode.PASSWORD_REUSED);
      }
    }

    const passwordHash = await hashPassword(password);
    const history = previous.slice(0, AUTH_PASSWORD_HISTORY_LIMIT);

    if (credential) {
      await this.prisma.userCredential.update({
        where: { id: credential.id },
        data: {
          passwordHash,
          passwordAlgo: 'scrypt',
          passwordUpdatedAt: now,
          passwordExpiresAt: null,
          mustChangePassword: false,
          passwordHistory: history,
        },
      });
    } else {
      await this.prisma.userCredential.create({
        data: {
          userId,
          type: CredentialType.PASSWORD,
          passwordHash,
          passwordAlgo: 'scrypt',
          passwordUpdatedAt: now,
          isPrimary: true,
          isActive: true,
        },
      });
    }

    await this.prisma.userSecurity.update({
      where: { userId },
      data: {
        lastPasswordChangeAt: now,
        ...(unlock
          ? {
              failedLoginCount: 0,
              lockedUntil: null,
              lockReason: null,
            }
          : {}),
      },
    });

    if (unlock) {
      const account = await this.prisma.user.findFirst({
        where: { id: userId, deletedAt: null },
        select: { status: true, emailVerifiedAt: true },
      });

      if (account?.status === UserStatus.LOCKED) {
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            status: account.emailVerifiedAt
              ? UserStatus.ACTIVE
              : UserStatus.PENDING,
          },
        });
      }
    }
  }

  private async issueEmailVerification(
    userId: string,
    email: string,
    context: AuthRequestContext,
    now: Date,
  ): Promise<void> {
    const code = numericCode(AUTH_EMAIL_CODE_LENGTH);

    await this.prisma.emailVerification.updateMany({
      where: {
        emailNormalized: email,
        purpose: VerificationPurpose.SIGNUP,
        status: VerificationStatus.PENDING,
      },
      data: { status: VerificationStatus.CANCELLED },
    });

    await this.prisma.emailVerification.create({
      data: {
        userId,
        email,
        emailNormalized: email,
        purpose: VerificationPurpose.SIGNUP,
        status: VerificationStatus.PENDING,
        codeHash: hashSecret(`${email}:${code}`),
        ipAddress: context.ipAddress,
        expiresAt: new Date(now.getTime() + AUTH_EMAIL_CODE_TTL_MS),
      },
    });

    await this.notifications.sendEmailVerification({ email, code });
  }

  private async createMfaChallenge(input: {
    userId: string;
    fingerprint?: string;
    context: AuthRequestContext;
    now: Date;
    methods: Array<(typeof MfaMethod)[keyof typeof MfaMethod]>;
  }): Promise<string> {
    await this.prisma.userVerification.updateMany({
      where: {
        userId: input.userId,
        purpose: VerificationPurpose.MFA,
        status: VerificationStatus.PENDING,
      },
      data: { status: VerificationStatus.CANCELLED },
    });

    const challenge = await this.prisma.userVerification.create({
      data: {
        userId: input.userId,
        channel: VerificationChannel.TOTP,
        purpose: VerificationPurpose.MFA,
        status: VerificationStatus.PENDING,
        codeHash: hashSecret(randomToken()),
        maxAttempts: AUTH_MFA_MAX_ATTEMPTS,
        ipAddress: input.context.ipAddress,
        userAgent: input.context.userAgent,
        expiresAt: new Date(input.now.getTime() + AUTH_MFA_CHALLENGE_TTL_MS),
        metadata: {
          fingerprint: input.fingerprint,
          methods: input.methods,
        },
      },
    });

    return challenge.id;
  }

  private async verifyMfaFactor(
    userId: string,
    security: {
      totpSecretEncrypted: string | null;
      backupCodesHash: string[];
    },
    code: string,
  ): Promise<boolean> {
    if (security.totpSecretEncrypted) {
      const secret = decryptSecret(
        security.totpSecretEncrypted,
        this.encryptionKey,
      );

      if (verifyTotp(fromBase32(secret), code)) {
        return true;
      }
    }

    const backupHash = hashSecret(`${userId}:${code.toLowerCase()}`);
    const index = security.backupCodesHash.indexOf(backupHash);

    if (index === -1) {
      return false;
    }

    const remaining = security.backupCodesHash.filter(
      (_, position) => position !== index,
    );

    await this.prisma.userSecurity.update({
      where: { userId },
      data: { backupCodesHash: remaining },
    });

    return true;
  }

  private mfaMethods(backupCodesHash: string[]) {
    const methods: Array<(typeof MfaMethod)[keyof typeof MfaMethod]> = [
      MfaMethod.TOTP,
    ];

    if (backupCodesHash.length > 0) {
      methods.push(MfaMethod.BACKUP_CODE);
    }

    return methods;
  }

  private async recordLoginAttempt(input: {
    userId?: string;
    identifier: string;
    outcome: LoginOutcome;
    failureReason?: string;
    context: AuthRequestContext;
  }): Promise<void> {
    await this.prisma.loginAttempt.create({
      data: {
        userId: input.userId,
        identifier: input.identifier,
        identifierType: input.identifier.includes('@') ? 'email' : 'username',
        outcome: input.outcome,
        failureReason: input.failureReason,
        provider: IdentityProvider.LOCAL,
        ipAddress: input.context.ipAddress,
        userAgent: input.context.userAgent,
        fingerprint: input.context.fingerprint,
        requestId: input.context.requestId,
      },
    });
  }

  private async securityEvent(input: {
    userId?: string | null;
    eventType: string;
    severity: SecuritySeverity;
    title: string;
    context: AuthRequestContext;
  }): Promise<void> {
    await this.prisma.securityEvent.create({
      data: {
        userId: input.userId ?? undefined,
        eventType: input.eventType,
        severity: input.severity,
        title: input.title,
        ipAddress: input.context.ipAddress,
        userAgent: input.context.userAgent,
        requestId: input.context.requestId,
      },
    });
  }

  private invalidCredentials() {
    return new UnauthorizedAppException(AuthErrorCode.INVALID_CREDENTIALS);
  }
}

function lockoutUntil(lockoutCount: number, now: Date): Date {
  const minutes = Math.min(
    AUTH_LOCKOUT_BASE_MINUTES * 2 ** Math.min(lockoutCount - 1, 5),
    AUTH_LOCKOUT_MAX_MINUTES,
  );

  return new Date(now.getTime() + minutes * 60_000);
}

function asJsonMap(value: unknown): JsonMap {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value as JsonMap;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function timingSafeHexEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);

  if (a.length !== b.length) {
    return false;
  }

  return timingSafeEqual(a, b);
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}
