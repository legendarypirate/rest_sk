import { Logger } from '@nestjs/common';

import { BadGatewayAppException } from '@/common/exceptions';

import { integrationTokens, readTokenPayload } from './integration.token';

type IntegrationCall = {
  id: string;
  baseUrl: string;
  clientId: string;
  clientSecret: string;
};

type ListEnvelope<T> = {
  success?: boolean;
  data?: T[] | { data?: T[] };
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  request_id?: string;
};

type ItemEnvelope<T> = {
  success?: boolean;
  data?: T;
  request_id?: string;
};

const logger = new Logger('IntegrationClient');

export class IntegrationClient {
  constructor(private readonly integration: IntegrationCall) {}

  async listAll<T>(path: string, query: Record<string, string | number> = {}) {
    const items: T[] = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const payload = await this.request<ListEnvelope<T>>(path, {
        ...query,
        page,
        limit: 100,
      });
      const data = Array.isArray(payload.data) ? payload.data : [];
      items.push(...data);
      totalPages = payload.totalPages ?? page;
      page += 1;
    }

    return items;
  }

  async getItem<T>(path: string): Promise<T> {
    const payload = await this.request<ItemEnvelope<T>>(path);
    if (!payload.data) {
      throw new BadGatewayAppException();
    }
    return payload.data;
  }

  private async request<T>(
    path: string,
    query?: Record<string, string | number>,
    retried = false,
  ): Promise<T> {
    const token = await this.accessToken(retried);
    const url = new URL(joinUrl(this.integration.baseUrl, path));
    for (const [key, value] of Object.entries(query ?? {})) {
      url.searchParams.set(key, String(value));
    }

    const requestId = crypto.randomUUID();
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'X-Request-Id': requestId,
      },
    });

    if (response.status === 401 && !retried) {
      integrationTokens.invalidate(this.integration.id);
      return this.request(path, query, true);
    }

    if (!response.ok) {
      logger.warn(
        `Integration ${this.integration.id} ${response.status} ${url.pathname} request_id=${requestId}`,
      );
      throw new BadGatewayAppException();
    }

    return (await response.json()) as T;
  }

  private accessToken(force: boolean) {
    return integrationTokens.getAccessToken(
      this.integration.id,
      async () => {
        const response = await fetch(
          joinUrl(this.integration.baseUrl, '/auth/integration/token'),
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
              client_id: this.integration.clientId,
              client_secret: this.integration.clientSecret,
            }),
          },
        );

        if (!response.ok) {
          logger.warn(
            `Integration token failed status=${response.status} client=${this.integration.clientId}`,
          );
          throw new BadGatewayAppException();
        }

        return readTokenPayload((await response.json()) as never);
      },
      force,
    );
  }
}

function joinUrl(baseUrl: string, path: string) {
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
