import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AUTH_ACCESS_COOKIE, AuthErrorCode } from '@packages/auth';
import type { Request } from 'express';

import { UnauthorizedAppException } from '@/common/exceptions';
import { AuthQueryService } from '../auth.query.service';
import {
  ALLOW_MUST_CHANGE_PASSWORD_KEY,
  IS_PUBLIC_KEY,
} from '../decorators/auth.decorators';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authQuery: AuthQueryService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = extractAccessToken(request);

    if (!token) {
      throw new UnauthorizedAppException();
    }

    const user = await this.authQuery.authenticateAccessToken(token);
    request.user = user;

    const allowMustChange = this.reflector.getAllAndOverride<boolean>(
      ALLOW_MUST_CHANGE_PASSWORD_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (user.mustChangePassword && !allowMustChange) {
      throw new UnauthorizedAppException(AuthErrorCode.MUST_CHANGE_PASSWORD);
    }

    return true;
  }
}

export function extractAccessToken(request: Request): string | undefined {
  const header = request.headers.authorization;
  const [scheme, value] = header?.split(' ') ?? [];

  if (scheme?.toLowerCase() === 'bearer' && value) {
    return value.trim();
  }

  const cookie = request.cookies?.[AUTH_ACCESS_COOKIE];
  return typeof cookie === 'string' && cookie.length > 0 ? cookie : undefined;
}
