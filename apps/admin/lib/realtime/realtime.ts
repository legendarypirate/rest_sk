'use client';

import { io, type Socket } from 'socket.io-client';

import { getRealtimeSocketUrl } from '@/lib/realtime/config';

type AppSocket = Socket;

let socket: AppSocket | null = null;

async function fetchWsToken(): Promise<string> {
  const res = await fetch('/api/auth/ws-token', { credentials: 'include' });
  if (!res.ok) {
    throw new Error('Socket auth failed');
  }

  const json = (await res.json()) as { success?: boolean; data?: { token?: string } };
  if (!json.success || !json.data?.token) {
    throw new Error('Socket auth failed');
  }

  return json.data.token;
}

/** Singleton Socket.IO client. Auth runs again on every reconnect. */
export const socketService = {
  connect(): AppSocket {
    if (socket) {
      if (!socket.connected && !socket.active) {
        socket.connect();
      }
      return socket;
    }

    socket = io(getRealtimeSocketUrl(), {
      auth: (cb) => {
        void fetchWsToken()
          .then((token) => cb({ token }))
          .catch(() => cb({}));
      },
      transports: ['polling', 'websocket'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
    });

    return socket;
  },

  disconnect(): void {
    socket?.removeAllListeners();
    socket?.disconnect();
    socket = null;
  },
};

export function disconnectRealtimeSocket(): void {
  socketService.disconnect();
}
