const parseOrigins = (value?: string) =>
  (value ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

export default () => ({
  app: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 4400),
    swaggerEnabled:
      process.env.SWAGGER_ENABLED === 'true' ||
      (process.env.SWAGGER_ENABLED !== 'false' &&
        process.env.NODE_ENV !== 'production'),
  },

  cors: {
    origins: parseOrigins(process.env.CORS_ORIGINS),
  },

  database: {
    url: process.env.DATABASE_URL,
  },

  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    jwtIssuer: process.env.JWT_ISSUER ?? 'food_order',
    jwtAudience: process.env.JWT_AUDIENCE ?? 'food_order-web',
    cookieDomain: process.env.AUTH_COOKIE_DOMAIN,
    cookieSecure:
      process.env.AUTH_COOKIE_SECURE === 'true' ||
      process.env.NODE_ENV === 'production',
  },

  realtime: {
    redisUrl: process.env.REDIS_URL,
    pingInterval: Number(process.env.WS_PING_INTERVAL ?? 25_000),
    pingTimeout: Number(process.env.WS_PING_TIMEOUT ?? 20_000),
    connectTimeout: Number(process.env.WS_CONNECT_TIMEOUT ?? 45_000),
    maxHttpBufferSize: Number(process.env.WS_MAX_HTTP_BUFFER_SIZE ?? 1e6),
    pingRateLimit: Number(process.env.WS_PING_RATE_LIMIT ?? 30),
    pingRateWindowMs: Number(process.env.WS_PING_RATE_WINDOW_MS ?? 60_000),
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
    folder: process.env.CLOUDINARY_FOLDER ?? 'food_order',
  },

  payment: {
    methods: (process.env.PAYMENT_METHODS ?? 'QPAY,CARD')
      .split(',')
      .map((method) => method.trim().toUpperCase())
      .filter(Boolean),
    qpay: {
      baseUrl: process.env.QPAY_BASE_URL ?? 'https://merchant.qpay.mn/v2',
      clientId: process.env.QPAY_CLIENT_ID ?? '',
      clientSecret: process.env.QPAY_CLIENT_SECRET ?? '',
      invoiceCode: process.env.QPAY_INVOICE_CODE ?? '',
    },
  },
});
