export const REALTIME_NAMESPACE = '/realtime';

/** Socket.IO server origin (no path). */
export function getRealtimeServerUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_WS_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4004';

  return raw.replace(/\/api\/v\d+$/, '').replace(/\/$/, '');
}

export function getRealtimeSocketUrl(): string {
  return `${getRealtimeServerUrl()}${REALTIME_NAMESPACE}`;
}
