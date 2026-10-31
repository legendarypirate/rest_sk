import {
  REALTIME_EVENT_VERSION,
  type RealtimeEnvelope,
} from '../realtime.events';
import { randomUUID } from 'node:crypto';

export function createRealtimeEnvelope<T>(data: T): RealtimeEnvelope<T> {
  return {
    v: REALTIME_EVENT_VERSION,
    eventId: randomUUID(),
    at: new Date().toISOString(),
    data,
  };
}
