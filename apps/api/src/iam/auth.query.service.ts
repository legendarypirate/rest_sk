import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  AUTH_LAST_SEEN_TOUCH_MS,
  AuthErrorCode,
  isAccessTokenClaims,
  type AuthSession,
  type AuthUser,
} from '@packages/auth';
import { SessionStatus, TokenStatus, UserStatus } from '@generated/prisma/client';

import {
  UnauthorizedAppException,
} from '../common/exceptions';
import { PrismaService } from '../prisma/prisma.service';
import {
  authorizationOf,
  loadUserAuth,
  toAuthUser,
} from './auth.authorization';
import type { AuthenticatedUser } from './auth.types';

@Injectable()
export class AuthQueryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async authenticateAccessToken(token: string): Promise<AuthenticatedUser> {
    const claims = await this.verifyClaims(token);
    const now = new Date();

    const access = await this.prisma.accessToken.findFirst({
      where: {
        jti: claims.jti,
        status: TokenStatus.ACTIVE,
        expiresAt: { gt: now },
      },
    });

    if (!access || access.userId !== claims.sub) {
      throw this.unauthorized();
    }

    const session = await this.prisma.userSession.findFirst({
      where: {
        id: claims.sid,
        userId: claims.sub,
      },
    });

    if (!session || session.status !== SessionStatus.ACTIVE) {
      throw this.unauthorized(AuthErrorCode.SESSION_EXPIRED);
    }

    if (session.expiresAt <= now) {
      await this.prisma.userSession.update({
        where: { id: session.id },
        data: { status: SessionStatus.EXPIRED },
      });
      throw this.unauthorized(AuthErrorCode.SESSION_EXPIRED);
    }

    if (session.impersonatedById) {
      throw this.unauthorized();
    }

    const user = await loadUserAuth(this.prisma, claims.sub);

    if (!user) {
      throw this.unauthorized();
    }

    this.assertUsableStatus(user.status);

    const authz = authorizationOf(user, now);
    const profile = toAuthUser(user, authz);

    if (now.getTime() - session.lastSeenAt.getTime() >= AUTH_LAST_SEEN_TOUCH_MS) {
      await this.prisma.$transaction([
        this.prisma.userSession.update({
          where: { id: session.id },
          data: { lastSeenAt: now },
        }),
        this.prisma.user.update({
          where: { id: user.id },
          data: { lastSeenAt: now },
        }),
      ]);
    }

    return {
      ...profile,
      sessionId: session.id,
      accessTokenId: access.id,
      jti: claims.jti,
      impersonatedById: session.impersonatedById,
    };
  }

  async getMe(actor: AuthenticatedUser): Promise<AuthUser> {
    const user = await loadUserAuth(this.prisma, actor.id);

    if (!user) {
      throw this.unauthorized();
    }

    this.assertUsableStatus(user.status);
    const authz = authorizationOf(user);

    return toAuthUser(user, authz);
  }

  async listSessions(actor: AuthenticatedUser): Promise<AuthSession[]> {
    const now = new Date();
    const sessions = await this.prisma.userSession.findMany({
      where: {
        userId: actor.id,
        status: SessionStatus.ACTIVE,
        expiresAt: { gt: now },
      },
      orderBy: { lastSeenAt: 'desc' },
    });

    return sessions.map((session) => ({
      id: session.id,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      fingerprint: session.fingerprint,
      lastSeenAt: session.lastSeenAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
      createdAt: session.createdAt.toISOString(),
      current: session.id === actor.sessionId,
    }));
  }

  private async verifyClaims(token: string) {
    try {
      const payload: unknown = await this.jwt.verifyAsync(token, {
        secret: this.config.getOrThrow<string>('auth.jwtSecret'),
        issuer: this.config.get<string>('auth.jwtIssuer'),
        audience: this.config.get<string>('auth.jwtAudience'),
      });

      if (!isAccessTokenClaims(payload)) {
        throw this.unauthorized();
      }

      return payload;
    } catch (error) {
      if (
        error instanceof UnauthorizedAppException ||
        (error instanceof Error && error.name === 'UnauthorizedAppException')
      ) {
        throw error;
      }

      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw this.unauthorized(AuthErrorCode.SESSION_EXPIRED);
      }

      throw this.unauthorized();
    }
  }

  private assertUsableStatus(status: UserStatus): void {
    if (status === UserStatus.ACTIVE) {
      return;
    }

    if (status === UserStatus.LOCKED) {
      throw this.unauthorized(AuthErrorCode.ACCOUNT_LOCKED);
    }

    if (status === UserStatus.PENDING) {
      throw this.unauthorized(AuthErrorCode.EMAIL_NOT_VERIFIED);
    }

    throw this.unauthorized(AuthErrorCode.ACCOUNT_DISABLED);
  }

  private unauthorized(
    code: typeof AuthErrorCode.UNAUTHORIZED | typeof AuthErrorCode.SESSION_EXPIRED | typeof AuthErrorCode.ACCOUNT_LOCKED | typeof AuthErrorCode.EMAIL_NOT_VERIFIED | typeof AuthErrorCode.ACCOUNT_DISABLED = AuthErrorCode.UNAUTHORIZED,
  ) {
    return new UnauthorizedAppException(code);
  }
}
