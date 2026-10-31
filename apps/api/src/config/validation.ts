import { z } from 'zod';

const blankToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

const envInteger = (schema: z.ZodInt = z.int()) =>
  z
    .string()
    .transform((value) => Number(value))
    .pipe(schema);

const optionalEnvString = () =>
  z.preprocess(blankToUndefined, z.string().min(1).optional());

const envString = (fallback: string) =>
  z.preprocess(blankToUndefined, z.string().min(1).default(fallback));

export const envValidationSchema = z.looseObject({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  APP_TIMEZONE: z.string().min(1).default('Asia/Ulaanbaatar'),
  PORT: envInteger(z.int().min(1).max(65535)).default(4400),
  SWAGGER_ENABLED: z.stringbool().optional(),
  CORS_ORIGINS: z.string().optional(),

  DATABASE_URL: z.url({
    protocol: /^postgres(ql)?$/,
    error: 'DATABASE_URL must be a postgres connection string',
  }),
  REDIS_URL: z.url({ protocol: /^rediss?$/ }).optional(),

  JWT_SECRET: z.string().min(32, {
    error: 'JWT_SECRET must be at least 32 characters',
  }),
  JWT_EXPIRES_IN: z.string().min(1).default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().min(1).default('7d'),
  JWT_ISSUER: z.string().min(1).default('restaurant'),
  JWT_AUDIENCE: z.string().min(1).default('restaurant-web'),
  AUTH_COOKIE_DOMAIN: z.string().min(1).optional(),
  AUTH_COOKIE_SECURE: z.stringbool().optional(),

  CLOUDINARY_CLOUD_NAME: optionalEnvString(),
  CLOUDINARY_API_KEY: optionalEnvString(),
  CLOUDINARY_API_SECRET: optionalEnvString(),
  CLOUDINARY_FOLDER: envString('restaurant'),

  PAYMENT_METHODS: envString('QPAY,CARD'),
  QPAY_BASE_URL: optionalEnvString(),
  QPAY_CLIENT_ID: optionalEnvString(),
  QPAY_CLIENT_SECRET: optionalEnvString(),
  QPAY_INVOICE_CODE: optionalEnvString(),

  WS_PING_INTERVAL: envInteger().optional(),
  WS_PING_TIMEOUT: envInteger().optional(),
  WS_CONNECT_TIMEOUT: envInteger().optional(),
  WS_MAX_HTTP_BUFFER_SIZE: envInteger().optional(),
  WS_PING_RATE_LIMIT: envInteger().optional(),
  WS_PING_RATE_WINDOW_MS: envInteger().optional(),
});

export type EnvVars = z.infer<typeof envValidationSchema>;

export function validateEnv(config: Record<string, unknown>): EnvVars {
  const result = envValidationSchema.safeParse(config);

  if (!result.success) {
    throw new Error(
      `Invalid environment variables:\n${z.prettifyError(result.error)}`,
    );
  }

  return result.data;
}
