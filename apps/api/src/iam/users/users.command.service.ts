import { Injectable } from '@nestjs/common';
import {
  AuthErrorCode,
  normalizeEmail,
  passwordPolicyIssues,
} from '@packages/auth';
import {
  AuditAction,
  CredentialType,
  Prisma,
  UserStatus,
} from '@generated/prisma/client';

import { AuditCommandService } from '@/audit';
import {
  BadRequestAppException,
  ConflictAppException,
  ForbiddenAppException,
  NotFoundAppException,
} from '@/common/exceptions';
import { ErrorCode } from '@/common/exceptions/error-codes';
import { hashPassword } from '@/common/utils/password';
import { PrismaService } from '@/prisma/prisma.service';
import type { AuthRequestContext } from '../auth-request.context';
import type { AuthDb } from '../auth.authorization';
import type { AuthenticatedUser } from '../auth.types';
import type {
  CreateUserDto,
  DeleteUserDto,
  UpdateUserDto,
} from './dto/users.dto';
import { assertNotLastSystemAdmin, loadAssignableRoles } from './users.policy';
import { UsersQueryService } from './users.query.service';
import { forceLogoutUser } from './users.session';

const TERMINAL_STATUSES: UserStatus[] = [
  UserStatus.SUSPENDED,
  UserStatus.LOCKED,
  UserStatus.DEACTIVATED,
  UserStatus.DELETED,
];

@Injectable()
export class UsersCommandService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queries: UsersQueryService,
    private readonly audit: AuditCommandService,
  ) {}

  async create(
    actor: AuthenticatedUser,
    input: CreateUserDto,
    context: AuthRequestContext,
  ) {
    const email = normalizeEmail(input.email);
    const status = input.status ?? UserStatus.ACTIVE;

    if (status === UserStatus.DELETED) {
      throw new BadRequestAppException();
    }

    if (input.password) {
      const issues = passwordPolicyIssues(input.password, email);
      if (issues.length > 0) {
        throw new BadRequestAppException(AuthErrorCode.WEAK_PASSWORD);
      }
    }

    const now = new Date();
    const passwordHash = input.password
      ? await hashPassword(input.password)
      : null;
    const joined = [input.firstName, input.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    const displayName =
      input.displayName ?? (joined.length > 0 ? joined : null);

    const userId = await this.prisma.$transaction(async (tx) => {
      await this.lockIdentity(tx, email, input.username, input.phoneE164);
      await this.assertUniqueIdentity(tx, {
        email,
        username: input.username,
        phoneE164: input.phoneE164,
      });

      const roles = await loadAssignableRoles(tx, input.roleIds ?? []);

      const user = await tx.user.create({
        data: {
          email,
          emailNormalized: email,
          username: input.username ?? null,
          firstName: input.firstName ?? null,
          lastName: input.lastName ?? null,
          displayName,
          phoneE164: input.phoneE164 ?? null,
          status,
          locale: input.locale ?? null,
          timezone: input.timezone ?? null,
        },
      });

      if (passwordHash) {
        await tx.userCredential.create({
          data: {
            userId: user.id,
            type: CredentialType.PASSWORD,
            passwordHash,
            passwordAlgo: 'scrypt',
            passwordUpdatedAt: now,
            mustChangePassword: input.mustChangePassword ?? true,
            isPrimary: true,
            isActive: true,
          },
        });
      }

      await tx.userSecurity.create({
        data: {
          userId: user.id,
          lastPasswordChangeAt: passwordHash ? now : null,
        },
      });

      if (roles.length > 0) {
        await tx.userRole.createMany({
          data: roles.map((role) => ({
            userId: user.id,
            roleId: role.id,
            grantedById: actor.id,
          })),
        });
      }

      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.CREATE,
        resourceType: 'user',
        resourceId: user.id,
        targetUserId: user.id,
        after: {
          email,
          status,
          roleIds: roles.map((role) => role.id),
        },
      });

      return user.id;
    });

    return this.queries.getById(userId);
  }

  async update(
    actor: AuthenticatedUser,
    id: string,
    input: UpdateUserDto,
    context: AuthRequestContext,
  ) {
    if (input.status === UserStatus.DELETED) {
      throw new BadRequestAppException();
    }

    const now = new Date();
    const email = input.email ? normalizeEmail(input.email) : undefined;

    if (input.password) {
      const issues = passwordPolicyIssues(input.password, email);
      if (issues.length > 0) {
        throw new BadRequestAppException(AuthErrorCode.WEAK_PASSWORD);
      }
    }

    const passwordHash = input.password
      ? await hashPassword(input.password)
      : null;

    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.user.findFirst({ where: { id } });

      if (!existing) {
        throw new NotFoundAppException();
      }

      if (
        input.rowVersion !== undefined &&
        existing.rowVersion !== input.rowVersion
      ) {
        throw new ConflictAppException(ErrorCode.VERSION_CONFLICT);
      }

      const nextStatus = input.status ?? existing.status;
      const disabling =
        nextStatus !== existing.status &&
        TERMINAL_STATUSES.includes(nextStatus);
      const restoring =
        !!existing.deletedAt && nextStatus === UserStatus.ACTIVE;

      if (disabling) {
        await assertNotLastSystemAdmin(tx, id, now);
      }

      await this.lockIdentity(
        tx,
        email ?? existing.emailNormalized,
        input.username === undefined ? existing.username : input.username,
        input.phoneE164 === undefined ? existing.phoneE164 : input.phoneE164,
      );
      await this.assertUniqueIdentity(tx, {
        email: email ?? existing.emailNormalized,
        username:
          input.username === undefined ? existing.username : input.username,
        phoneE164:
          input.phoneE164 === undefined ? existing.phoneE164 : input.phoneE164,
        excludeUserId: id,
      });

      const emailChanged = !!email && email !== existing.emailNormalized;
      const data: Prisma.UserUpdateInput = {
        rowVersion: { increment: 1 },
        ...(email
          ? {
              email,
              emailNormalized: email,
              emailVerifiedAt: emailChanged ? null : existing.emailVerifiedAt,
            }
          : {}),
        ...(input.username !== undefined ? { username: input.username } : {}),
        ...(input.firstName !== undefined
          ? { firstName: input.firstName }
          : {}),
        ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
        ...(input.displayName !== undefined
          ? { displayName: input.displayName }
          : {}),
        ...(input.phoneE164 !== undefined
          ? { phoneE164: input.phoneE164 }
          : {}),
        ...(input.locale !== undefined ? { locale: input.locale } : {}),
        ...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
        ...(input.status
          ? {
              status: input.status,
              deactivatedAt:
                input.status === UserStatus.DEACTIVATED
                  ? now
                  : input.status === UserStatus.ACTIVE
                    ? null
                    : existing.deactivatedAt,
              deactivatedReason:
                input.status === UserStatus.DEACTIVATED
                  ? (input.deactivatedReason ?? existing.deactivatedReason)
                  : input.status === UserStatus.ACTIVE
                    ? null
                    : (input.deactivatedReason ?? existing.deactivatedReason),
              deletedAt: restoring ? null : existing.deletedAt,
            }
          : input.deactivatedReason !== undefined
            ? { deactivatedReason: input.deactivatedReason }
            : {}),
      };

      try {
        await tx.user.update({ where: { id }, data });
      } catch (error) {
        this.rethrowUnique(error);
      }

      if (passwordHash) {
        await this.upsertPassword(
          tx,
          id,
          passwordHash,
          input.mustChangePassword ?? true,
          now,
        );
      } else if (input.mustChangePassword !== undefined) {
        await tx.userCredential.updateMany({
          where: {
            userId: id,
            type: CredentialType.PASSWORD,
            deletedAt: null,
          },
          data: { mustChangePassword: input.mustChangePassword },
        });
      }

      if (disabling || passwordHash) {
        await forceLogoutUser(
          tx,
          id,
          now,
          passwordHash ? 'password_reset' : 'status_change',
        );
      }

      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.UPDATE,
        resourceType: 'user',
        resourceId: id,
        targetUserId: id,
        before: {
          email: existing.email,
          status: existing.status,
          rowVersion: existing.rowVersion,
        },
        after: {
          email: email ?? existing.email,
          status: nextStatus,
        },
      });
    });

    return this.queries.getById(id);
  }

  async remove(
    actor: AuthenticatedUser,
    id: string,
    input: DeleteUserDto,
    context: AuthRequestContext,
  ): Promise<void> {
    if (actor.id === id) {
      throw new ForbiddenAppException();
    }

    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.user.findFirst({ where: { id } });

      if (!existing || existing.deletedAt) {
        throw new NotFoundAppException();
      }

      if (existing.isSystemUser) {
        throw new ForbiddenAppException();
      }

      await assertNotLastSystemAdmin(tx, id, now);

      await tx.user.update({
        where: { id },
        data: {
          status: UserStatus.DELETED,
          deletedAt: now,
          deactivatedAt: existing.deactivatedAt ?? now,
          deactivatedReason: input.reason ?? existing.deactivatedReason,
          rowVersion: { increment: 1 },
        },
      });

      await forceLogoutUser(tx, id, now, 'user_deleted');

      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.DELETE,
        resourceType: 'user',
        resourceId: id,
        targetUserId: id,
        before: { status: existing.status, email: existing.email },
        after: { status: UserStatus.DELETED, reason: input.reason ?? null },
      });
    });
  }

  private async upsertPassword(
    db: AuthDb,
    userId: string,
    passwordHash: string,
    mustChangePassword: boolean,
    now: Date,
  ): Promise<void> {
    const credential = await db.userCredential.findFirst({
      where: {
        userId,
        type: CredentialType.PASSWORD,
        deletedAt: null,
      },
    });

    if (credential) {
      await db.userCredential.update({
        where: { id: credential.id },
        data: {
          passwordHash,
          passwordAlgo: 'scrypt',
          passwordUpdatedAt: now,
          mustChangePassword,
          isActive: true,
          isPrimary: true,
        },
      });
    } else {
      await db.userCredential.create({
        data: {
          userId,
          type: CredentialType.PASSWORD,
          passwordHash,
          passwordAlgo: 'scrypt',
          passwordUpdatedAt: now,
          mustChangePassword,
          isPrimary: true,
          isActive: true,
        },
      });
    }

    await db.userSecurity.upsert({
      where: { userId },
      create: {
        userId,
        lastPasswordChangeAt: now,
      },
      update: {
        lastPasswordChangeAt: now,
      },
    });
  }

  private async lockIdentity(
    db: AuthDb,
    email?: string | null,
    username?: string | null,
    phone?: string | null,
  ): Promise<void> {
    if (email) {
      await db.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`auth:email:${email}`}))`;
    }
    if (username) {
      await db.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`auth:username:${username}`}))`;
    }
    if (phone) {
      await db.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`auth:phone:${phone}`}))`;
    }
  }

  private async assertUniqueIdentity(
    db: AuthDb,
    input: {
      email?: string | null;
      username?: string | null;
      phoneE164?: string | null;
      excludeUserId?: string;
    },
  ): Promise<void> {
    const notSelf = input.excludeUserId
      ? { id: { not: input.excludeUserId } }
      : {};

    if (input.email) {
      const existing = await db.user.findFirst({
        where: {
          emailNormalized: input.email,
          deletedAt: null,
          ...notSelf,
        },
        select: { id: true },
      });
      if (existing) {
        throw new ConflictAppException();
      }
    }

    if (input.username) {
      const existing = await db.user.findFirst({
        where: {
          username: input.username,
          deletedAt: null,
          ...notSelf,
        },
        select: { id: true },
      });
      if (existing) {
        throw new ConflictAppException();
      }
    }

    if (input.phoneE164) {
      const existing = await db.user.findFirst({
        where: {
          phoneE164: input.phoneE164,
          deletedAt: null,
          ...notSelf,
        },
        select: { id: true },
      });
      if (existing) {
        throw new ConflictAppException();
      }
    }
  }

  private rethrowUnique(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictAppException();
    }

    throw error;
  }
}
