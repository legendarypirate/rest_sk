import { z } from 'zod';

import {
  AUTH_PASSWORD_MAX_LENGTH,
  AUTH_PASSWORD_MIN_LENGTH,
} from './constants';
import { passwordPolicyIssues } from './password-policy';
import { AuthValidationCode } from './validation-codes';

const identifierSchema = z
  .string()
  .trim()
  .min(1, { error: AuthValidationCode.IDENTIFIER_REQUIRED })
  .min(3, { error: AuthValidationCode.IDENTIFIER_MIN })
  .max(320, { error: AuthValidationCode.IDENTIFIER_MAX });
export const loginRequestSchema = z.object({
  identifier: identifierSchema,
  password: z
    .string()
    .min(1, { error: AuthValidationCode.PASSWORD_REQUIRED })
    .max(AUTH_PASSWORD_MAX_LENGTH, { error: AuthValidationCode.PASSWORD_MAX }),
  fingerprint: z.string().min(8).max(128).optional(),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const refreshRequestSchema = z.object({
  refreshToken: z.string().min(16).max(512).optional(),
});

export type RefreshRequest = z.infer<typeof refreshRequestSchema>;

export const registerRequestSchema = z
  .object({
    email: z.email().max(320),
    password: z
      .string()
      .min(AUTH_PASSWORD_MIN_LENGTH)
      .max(AUTH_PASSWORD_MAX_LENGTH),
    firstName: z.string().trim().min(1).max(100).optional(),
    lastName: z.string().trim().min(1).max(100).optional(),
  })
  .superRefine((value, ctx) => {
    const issues = passwordPolicyIssues(value.password, value.email);

    for (const issue of issues) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: issue,
      });
    }
  });

export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export const passwordForgotRequestSchema = z.object({
  email: z.email().max(320),
});

export type PasswordForgotRequest = z.infer<typeof passwordForgotRequestSchema>;

export const passwordResetRequestSchema = z.object({
  token: z.string().min(16).max(512),
  password: z
    .string()
    .min(AUTH_PASSWORD_MIN_LENGTH)
    .max(AUTH_PASSWORD_MAX_LENGTH),
});

export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>;

export const passwordChangeRequestSchema = z.object({
  currentPassword: z.string().min(1).max(AUTH_PASSWORD_MAX_LENGTH),
  newPassword: z
    .string()
    .min(AUTH_PASSWORD_MIN_LENGTH)
    .max(AUTH_PASSWORD_MAX_LENGTH),
});

export type PasswordChangeRequest = z.infer<typeof passwordChangeRequestSchema>;

export const emailVerifyRequestSchema = z.object({
  email: z.email().max(320),
  code: z.string().regex(/^\d{6}$/),
});

export type EmailVerifyRequest = z.infer<typeof emailVerifyRequestSchema>;

export const emailResendRequestSchema = z.object({
  email: z.email().max(320),
});

export type EmailResendRequest = z.infer<typeof emailResendRequestSchema>;

export const mfaVerifyRequestSchema = z.object({
  challengeId: z.uuid(),
  code: z.string().min(6).max(64),
});

export type MfaVerifyRequest = z.infer<typeof mfaVerifyRequestSchema>;

export const mfaTotpConfirmRequestSchema = z.object({
  code: z.string().regex(/^\d{6}$/),
});

export type MfaTotpConfirmRequest = z.infer<typeof mfaTotpConfirmRequestSchema>;

export const mfaDisableRequestSchema = z.object({
  password: z.string().min(1).max(AUTH_PASSWORD_MAX_LENGTH),
  code: z.string().min(6).max(64),
});

export type MfaDisableRequest = z.infer<typeof mfaDisableRequestSchema>;

export const logoutRequestSchema = z.object({
  everywhere: z.boolean().optional(),
});

export type LogoutRequest = z.infer<typeof logoutRequestSchema>;
