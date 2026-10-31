const path = require('node:path');

const root = __dirname;
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

const apiPort = process.env.PORT ?? '4004';
const adminPort = process.env.ADMIN_PORT ?? '3001';
const publicApiUrl = (process.env.PUBLIC_API_URL ?? `http://127.0.0.1:${apiPort}`).replace(
  /\/+$/,
  '',
);

module.exports = {
  apps: [
    {
      name: 'restaurant-api',
      cwd: root,
      script: pnpm,
      args: '--filter api start:prod',
      interpreter: 'none',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: apiPort,
        AUTH_COOKIE_SECURE: 'true',
        SWAGGER_ENABLED: 'false',
      },
    },
    {
      name: 'restaurant-admin',
      cwd: path.join(root, 'apps/admin'),
      script: pnpm,
      args: 'start',
      interpreter: 'none',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: adminPort,
        HOSTNAME: '0.0.0.0',
        API_INTERNAL_URL: `http://127.0.0.1:${apiPort}`,
        NEXT_PUBLIC_API_URL: publicApiUrl,
        NEXT_PUBLIC_WS_URL: publicApiUrl,
        NEXT_PUBLIC_KIOSK_DOWNLOAD_URL: '/downloads/Khongor-Kiosk-Setup.exe',
      },
    },
  ],
};
