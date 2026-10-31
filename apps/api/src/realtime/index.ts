export { RealtimeIoAdapter } from './adapters/realtime-io.adapter';
export type { RealtimeAdapterOptions } from './adapters/realtime-io.adapter';
export { ConnectionRegistryService } from './connection-registry.service';
export type {
  ConnectedClientMeta,
  RealtimeStats,
} from './connection-registry.service';
export { RealtimeModule } from './realtime.module';
export { RealtimeService } from './realtime.service';
export {
  CLIENT_EVENTS,
  isKitchenRole,
  isStaffRole,
  REALTIME_EVENT_VERSION,
  REALTIME_NAMESPACE,
  Rooms,
  SERVER_EVENTS,
} from './realtime.events';
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
} from './realtime.events';
export type { AppServer, AppSocket } from './types/realtime.types';
