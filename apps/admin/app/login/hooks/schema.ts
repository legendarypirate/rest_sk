import { loginRequestSchema } from '@packages/auth';

export const loginFormSchema = loginRequestSchema.pick({
  identifier: true,
  password: true,
});

export type LoginFormValues = {
  identifier: string;
  password: string;
};
