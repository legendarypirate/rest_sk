export const AuthValidationCode = {
  IDENTIFIER_REQUIRED: 'IDENTIFIER_REQUIRED',
  IDENTIFIER_MIN: 'IDENTIFIER_MIN',
  IDENTIFIER_MAX: 'IDENTIFIER_MAX',
  PASSWORD_REQUIRED: 'PASSWORD_REQUIRED',
  PASSWORD_MAX: 'PASSWORD_MAX',
} as const;

export type AuthValidationCode =
  (typeof AuthValidationCode)[keyof typeof AuthValidationCode];
