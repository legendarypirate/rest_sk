'use client';

import { AUTH_ACCESS_COOKIE } from '@packages/auth';
import { io, type Socket } from 'socket.io-client';

import { getRealtimeSocketUrl } from '@/lib/realtime/config';

type AppSocket = Socket;

let socket: AppSocket | null = null;

function readAccessCookie(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const escaped = AUTH_ACCESS_COOKIE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function fetchWsToken(): Promise<string> {
  const token = readAccessCookie();
  if (!token) {
    throw new Error('Socket auth skipped');
  }

  return token;
}

function isHandshakeAuthError(error: Error): boolean {
  const message = error.message.toUpperCase();
  return message.includes('UNAUTHORIZED') || message.includes('FORBIDDEN');
}

/** Singleton Socket.IO client. Auth runs again on every reconnect. */
export const socketService = {
  connect(): AppSocket | null {
    if (typeof window === 'undefined') {
      return null;
    }

    if (!readAccessCookie()) {
      return null;
    }

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

    socket.on('connect_error', (error) => {
      if (isHandshakeAuthError(error)) {
        socketService.disconnect();
      }
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
