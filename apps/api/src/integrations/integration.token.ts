type CachedToken = {
  accessToken: string;
  expiresAt: number;
};

type TokenResponse = {
  access_token?: string;
  expires_in?: number;
  data?: {
    access_token?: string;
    expires_in?: number;
  };
};

const REFRESH_BEFORE_MS = 60_000;

export class IntegrationTokenManager {
  private readonly cache = new Map<string, CachedToken>();
  private readonly pending = new Map<string, Promise<string>>();

  async getAccessToken(
    cacheKey: string,
    requestToken: () => Promise<{ accessToken: string; expiresIn: number }>,
    force = false,
  ): Promise<string> {
    if (!force) {
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiresAt - REFRESH_BEFORE_MS > Date.now()) {
        return cached.accessToken;
      }
    }

    const existing = this.pending.get(cacheKey);
    if (existing && !force) {
      return existing;
    }

    const task = requestToken()
      .then((issued) => {
        const ttlMs = Math.max(issued.expiresIn, 60) * 1000;
        this.cache.set(cacheKey, {
          accessToken: issued.accessToken,
          expiresAt: Date.now() + ttlMs,
        });
        return issued.accessToken;
      })
      .finally(() => {
        this.pending.delete(cacheKey);
      });

    this.pending.set(cacheKey, task);
    return task;
  }

  invalidate(cacheKey: string) {
    this.cache.delete(cacheKey);
  }
}

export const integrationTokens = new IntegrationTokenManager();

export function readTokenPayload(body: TokenResponse): {
  accessToken: string;
  expiresIn: number;
} {
  const accessToken = body.data?.access_token ?? body.access_token;
  const expiresIn = body.data?.expires_in ?? body.expires_in ?? 3600;

  if (!accessToken) {
    throw new Error('Integration token response has no access_token');
  }

  return { accessToken, expiresIn };
}
