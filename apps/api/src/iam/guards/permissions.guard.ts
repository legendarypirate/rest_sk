import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import {
  ForbiddenAppException,
  UnauthorizedAppException,
} from '../../common/exceptions';
import type { AuthenticatedUser } from '../auth.types';
import {
  IS_PUBLIC_KEY,
  PERMISSIONS_KEY,
  ROLES_KEY,
} from '../decorators/auth.decorators';
import {
  holdsAllPermissions,
  PLATFORM_SUPER_ADMIN_SLUG,
} from '@packages/types';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const permissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!permissions?.length && !roles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthenticatedUser | undefined;

    if (!user) {
      throw new UnauthorizedAppException();
    }

    if (
      user.roles.includes(PLATFORM_SUPER_ADMIN_SLUG) ||
      holdsAllPermissions(user.permissions)
    ) {
      return true;
    }

    if (roles?.length && !roles.some((role) => user.roles.includes(role))) {
      throw new ForbiddenAppException();
    }

    if (
      permissions?.length &&
      !permissions.every((permission) => user.permissions.includes(permission))
    ) {
      throw new ForbiddenAppException();
    }

    return true;
  }
}
