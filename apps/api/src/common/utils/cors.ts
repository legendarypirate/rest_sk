import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

function stripTrailingSlash(origin: string): string {
  return origin.replace(/\/$/, '');
}

function loopbackAliases(origin: string): string[] {
  try {
    const url = new URL(origin);
    const host = url.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return [stripTrailingSlash(origin)];
    }

    const alt = host === 'localhost' ? '127.0.0.1' : 'localhost';
    const port = url.port ? `:${url.port}` : '';
    return [
      stripTrailingSlash(origin),
      `${url.protocol}//${alt}${port}`,
    ];
  } catch {
    return [stripTrailingSlash(origin)];
  }
}

function isKioskOrigin(origin: string): boolean {
  return origin.startsWith('kiosk://');
}

export function isAllowedCorsOrigin(
  requestOrigin: string,
  configured: string[],
): boolean {
  const requested = stripTrailingSlash(requestOrigin);
  if (isKioskOrigin(requested)) {
    return true;
  }

  const allowed = new Set(
    configured.flatMap(loopbackAliases).map(stripTrailingSlash),
  );
  return allowed.has(requested);
}

export function getCorsConfig(
  origins: string[],
  isProduction: boolean,
): CorsOptions {
  const reflectAny = !isProduction && origins.length === 0;

  return {
    origin: (requestOrigin, callback) => {
      if (!requestOrigin || reflectAny) {
        callback(null, true);
        return;
      }

      callback(null, isAllowedCorsOrigin(requestOrigin, origins));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Device-Fingerprint',
      'X-Request-Id',
    ],
    maxAge: 86400,
  };
}
