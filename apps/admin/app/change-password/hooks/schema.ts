import {
  AUTH_PASSWORD_MAX_LENGTH,
  AUTH_PASSWORD_MIN_LENGTH,
  passwordPolicyIssues,
  type PasswordPolicyIssue,
} from '@packages/auth';
import { z } from 'zod';

const passwordIssueMessages: Record<PasswordPolicyIssue, string> = {
  TOO_SHORT: `Нууц үг дор хаяж ${AUTH_PASSWORD_MIN_LENGTH} тэмдэгт байх ёстой`,
  TOO_LONG: 'Нууц үг хэт урт байна',
  MISSING_LOWER: 'Нууц үг жижиг үсэг агуулсан байх ёстой.',
  MISSING_UPPER: 'Нууц үг том үсэг агуулсан байх ёстой.',
  MISSING_DIGIT: 'Нууц үг тоо агуулсан байх ёстой.',
  CONTAINS_IDENTIFIER: 'Нууц үг имэйл хаягийн хэсэгтэй ижил байж болохгүй.',
};

export const changePasswordFormSchema = (email?: string | null) =>
  z
    .object({
      currentPassword: z.string().min(1, 'Хуучин нууц үг оруулна уу'),
      newPassword: z
        .string()
        .min(
          AUTH_PASSWORD_MIN_LENGTH,
          `Нууц үг дор хаяж ${AUTH_PASSWORD_MIN_LENGTH} тэмдэгт байх ёстой`,
        )
        .max(AUTH_PASSWORD_MAX_LENGTH, 'Нууц үг хэт урт байна'),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Нууц үг таарахгүй байна',
      path: ['confirmPassword'],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: 'Шинэ нууц үг хуучнаасаа өөр байх ёстой',
      path: ['newPassword'],
    })
    .superRefine((data, ctx) => {
      for (const issue of passwordPolicyIssues(data.newPassword, email ?? undefined)) {
        if (issue === 'TOO_SHORT' || issue === 'TOO_LONG') {
          continue;
        }

        ctx.addIssue({
          code: 'custom',
          path: ['newPassword'],
          message: passwordIssueMessages[issue],
        });
      }
    });

export type ChangePasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
