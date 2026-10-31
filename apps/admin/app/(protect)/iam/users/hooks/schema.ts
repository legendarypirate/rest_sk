import {
  AUTH_PASSWORD_MAX_LENGTH,
  AUTH_PASSWORD_MIN_LENGTH,
  passwordPolicyIssues,
  type PasswordPolicyIssue,
} from '@packages/auth';
import type { UserDetail, UserStatus } from '@packages/types';
import { z } from 'zod';

import type { CreateUserDto, UpdateUserDto } from '@/types/iam/user.dto';

const usernamePattern = /^[a-z0-9][a-z0-9._-]{1,62}$/;

function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

const userStatusEnum = z.enum([
  'PENDING',
  'ACTIVE',
  'SUSPENDED',
  'LOCKED',
  'DEACTIVATED',
]);

const profileFields = {
  email: z.email('Зөв имэйл хаяг оруулна уу'),
  username: z
    .string()
    .trim()
    .refine(
      (value) => !value || usernamePattern.test(value.toLowerCase()),
      'Нэвтрэх нэр буруу байна.',
    ),
  firstName: z.string(),
  lastName: z.string(),
  displayName: z.string(),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => !value || digitsOnly(value).length === 8,
      'Утасны дугаар 8 оронтой байна.',
    ),
  status: userStatusEnum,
  roleIds: z.array(z.string()),
};

const passwordField = z
  .string()
  .min(
    AUTH_PASSWORD_MIN_LENGTH,
    `Нууц үг дор хаяж ${AUTH_PASSWORD_MIN_LENGTH} тэмдэгт байх ёстой`,
  )
  .max(AUTH_PASSWORD_MAX_LENGTH, 'Нууц үг хэт урт байна');

const passwordIssueMessages: Record<PasswordPolicyIssue, string> = {
  TOO_SHORT: `Нууц үг дор хаяж ${AUTH_PASSWORD_MIN_LENGTH} тэмдэгт байх ёстой`,
  TOO_LONG: 'Нууц үг хэт урт байна',
  MISSING_LOWER: 'Нууц үг жижиг үсэг агуулсан байх ёстой.',
  MISSING_UPPER: 'Нууц үг том үсэг агуулсан байх ёстой.',
  MISSING_DIGIT: 'Нууц үг тоо агуулсан байх ёстой.',
  CONTAINS_IDENTIFIER: 'Нууц үг имэйл хаягийн хэсэгтэй ижил байж болохгүй.',
};

function addPasswordIssues(
  ctx: z.RefinementCtx,
  password: string,
  email?: string,
) {
  for (const issue of passwordPolicyIssues(password, email)) {
    if (issue === 'TOO_SHORT' || issue === 'TOO_LONG') {
      continue;
    }

    ctx.addIssue({
      code: 'custom',
      path: ['password'],
      message: passwordIssueMessages[issue],
    });
  }
}

export const createUserSchema = z
  .object({
    ...profileFields,
    password: passwordField,
    confirmPassword: z.string(),
    mustChangePassword: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Нууц үг таарахгүй байна',
    path: ['confirmPassword'],
  })
  .superRefine((data, ctx) =>
    addPasswordIssues(ctx, data.password, data.email),
  );

export const updateUserSchema = z.object(profileFields);

export const changeUserPasswordSchema = z
  .object({
    password: passwordField,
    confirmPassword: z.string(),
    mustChangePassword: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Нууц үг таарахгүй байна',
    path: ['confirmPassword'],
  })
  .superRefine((data, ctx) => addPasswordIssues(ctx, data.password));

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
export type ChangeUserPasswordFormData = z.infer<
  typeof changeUserPasswordSchema
>;

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toPhoneE164(phone: string): string | undefined {
  const digits = digitsOnly(phone);
  return digits ? `+976${digits}` : undefined;
}

function fromPhoneE164(phoneE164: string | null) {
  return phoneE164 ? phoneE164.replace(/^\+976/, '').replace(/\D/g, '') : '';
}

export function getCreateUserDefaults(): CreateUserFormData {
  return {
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    displayName: '',
    phone: '',
    status: 'ACTIVE',
    roleIds: [],
    password: '',
    confirmPassword: '',
    mustChangePassword: true,
  };
}

export function getUpdateUserDefaults(user?: UserDetail): UpdateUserFormData {
  if (!user) {
    return {
      email: '',
      username: '',
      firstName: '',
      lastName: '',
      displayName: '',
      phone: '',
      status: 'ACTIVE',
      roleIds: [],
    };
  }

  return {
    email: user.email ?? '',
    username: user.username ?? '',
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    displayName: user.displayName ?? '',
    phone: fromPhoneE164(user.phoneE164),
    status: user.status === 'DELETED' ? 'DEACTIVATED' : user.status,
    roleIds: user.assignments.map((assignment) => assignment.roleId),
  };
}

export function getChangeUserPasswordDefaults(): ChangeUserPasswordFormData {
  return {
    password: '',
    confirmPassword: '',
    mustChangePassword: false,
  };
}

export function toCreateUserDto(
  values: CreateUserFormData,
  canAssignRoles: boolean,
): CreateUserDto {
  return {
    email: values.email.trim(),
    username: optionalText(values.username)?.toLowerCase(),
    firstName: optionalText(values.firstName),
    lastName: optionalText(values.lastName),
    displayName: optionalText(values.displayName),
    phoneE164: toPhoneE164(values.phone),
    status: values.status as UserStatus,
    password: values.password,
    mustChangePassword: values.mustChangePassword,
    roleIds: canAssignRoles ? values.roleIds : undefined,
  };
}

export function toUpdateUserDto(
  values: UpdateUserFormData,
  rowVersion: number,
): UpdateUserDto {
  return {
    email: values.email.trim(),
    username: optionalText(values.username)?.toLowerCase() ?? null,
    firstName: optionalText(values.firstName) ?? null,
    lastName: optionalText(values.lastName) ?? null,
    displayName: optionalText(values.displayName) ?? null,
    phoneE164: toPhoneE164(values.phone) ?? null,
    status: values.status as UserStatus,
    rowVersion,
  };
}

export function toChangeUserPasswordDto(
  values: ChangeUserPasswordFormData,
  rowVersion: number,
): UpdateUserDto {
  return {
    password: values.password,
    mustChangePassword: values.mustChangePassword,
    rowVersion,
  };
}

export function rolesChanged(current: string[], next: string[]) {
  return (
    current.length !== next.length || next.some((id) => !current.includes(id))
  );
}
