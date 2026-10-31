import { SetMetadata } from '@nestjs/common';
import { ApiExtension } from '@nestjs/swagger';

export const IS_PUBLIC_KEY = 'isPublic';
export const ALLOW_MUST_CHANGE_PASSWORD_KEY = 'allowMustChangePassword';
export const PERMISSIONS_KEY = 'permissions';
export const ROLES_KEY = 'roles';

export function Public(): ClassDecorator & MethodDecorator {
  const metadata = SetMetadata(IS_PUBLIC_KEY, true);
  const swaggerPublic = ApiExtension('x-public', true);

  return ((
    target: object,
    key?: string | symbol,
    descriptor?: TypedPropertyDescriptor<unknown>,
  ) => {
    if (descriptor) {
      metadata(target, key as string, descriptor);
      swaggerPublic(target, key as string, descriptor);
      return descriptor;
    }
    return metadata(target as Function);
  }) as ClassDecorator & MethodDecorator;
}

export const AllowMustChangePassword = () =>
  SetMetadata(ALLOW_MUST_CHANGE_PASSWORD_KEY, true);

export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export const RequireRoles = (...roles: string[]) =>
  SetMetadata(ROLES_KEY, roles);
