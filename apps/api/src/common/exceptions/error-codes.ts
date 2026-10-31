import { AuthErrorCode } from '@packages/auth';
import { AppErrorCode } from '@packages/types';

export const ErrorCode = {
  ...AppErrorCode,
  ...AuthErrorCode,
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
