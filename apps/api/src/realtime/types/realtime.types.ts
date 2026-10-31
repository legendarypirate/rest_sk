import type { Server, Socket } from 'socket.io';

import type { AuthenticatedUser } from '../../iam/auth.types';
import {
  CLIENT_EVENTS,
  SERVER_EVENTS,
  type NotificationData,
  type OrgDailyMenuUpdateData,
  type OrgMealOrderUpdateData,
  type RealtimeConnectedPayload,
  type RealtimeEnvelope,
  type WsAck,
  type WsErrorPayload,
} from '../realtime.events';

export {
  CLIENT_EVENTS,
  isKitchenRole,
  isStaffRole,
  REALTIME_EVENT_VERSION,
  REALTIME_NAMESPACE,
  Rooms,
  SERVER_EVENTS,
} from '../realtime.events';

export type {
  NotificationData,
  OrgDailyMenuUpdateAction,
  OrgDailyMenuUpdateData,
  OrgMealOrderUpdateAction,
  OrgMealOrderUpdateData,
  RealtimeConnectedPayload,
  RealtimeEnvelope,
  WsAck,
  WsErrorPayload,
} from '../realtime.events';

export type {
  ConnectedClientMeta,
  RealtimeStats,
} from '../connection-registry.service';

export interface ClientToServerEvents {
  [CLIENT_EVENTS.ping]: (
    payload: { at?: string } | undefined,
    ack?: (response: WsAck<{ at: string }>) => void,
  ) => void;
}

export interface ServerToClientEvents {
  [SERVER_EVENTS.connected]: (payload: RealtimeConnectedPayload) => void;
  [SERVER_EVENTS.error]: (error: WsErrorPayload) => void;
  [SERVER_EVENTS.notification]: (
    envelope: RealtimeEnvelope<NotificationData>,
  ) => void;
  [SERVER_EVENTS.orgDailyMenuUpdated]: (
    envelope: RealtimeEnvelope<OrgDailyMenuUpdateData>,
  ) => void;
  [SERVER_EVENTS.orgMealOrderUpdated]: (
    envelope: RealtimeEnvelope<OrgMealOrderUpdateData>,
  ) => void;
  [SERVER_EVENTS.pong]: (data: { at: string }) => void;
}

export interface SocketData {
  user?: AuthenticatedUser;
}

export type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;

export type AppServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;
