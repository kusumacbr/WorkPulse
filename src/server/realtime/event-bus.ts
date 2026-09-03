/**
 * WorkPulse Server Real-Time Event Bus
 * Dispatches live backend events to Server-Sent Event (SSE) subscribers and active client streams.
 */

export type RealtimeEventType =
  | "employee:created"
  | "employee:updated"
  | "employee:deleted"
  | "workday:sod_submitted"
  | "workday:sod_verified"
  | "workday:sod_changes_requested"
  | "workday:eod_submitted"
  | "workday:eod_verified"
  | "workday:task_updated"
  | "workday:task_assigned"
  | "workday:task_acknowledged"
  | "workday:help_requested"
  | "workday:help_acknowledged"
  | "workday:help_resolved"
  | "attendance:punched"
  | "attendance:presence_verified"
  | "attendance:all_presence_verified"
  | "leave:created"
  | "leave:approved"
  | "leave:rejected"
  | "leave:deleted"
  | "wfh:created"
  | "wfh:approved"
  | "wfh:rejected"
  | "wfh:deleted"
  | "review:feedback_submitted"
  | "review:appraisal_submitted"
  | "announcement:broadcast"
  | "announcement:deleted"
  | "notification:new"
  | "notification:deleted"
  | "notification:read"
  | "notification:read_all"
  | "admin:role_updated"
  | "admin:status_updated"
  | "profile:query_submitted"
  | "profile:query_approved"
  | "profile:query_rejected";

export interface RealtimeEvent<T = any> {
  id: string;
  type: RealtimeEventType;
  payload: T;
  timestamp: string;
}

type EventListener = (event: RealtimeEvent) => void;

class RealtimeEventBus {
  private listeners = new Set<EventListener>();

  public subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public emit<T = any>(type: RealtimeEventType, payload: T): RealtimeEvent<T> {
    const event: RealtimeEvent<T> = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      payload,
      timestamp: new Date().toISOString(),
    };

    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error(`[RealtimeEventBus] Listener error for ${type}:`, err);
      }
    });

    return event;
  }

  public getListenerCount(): number {
    return this.listeners.size;
  }
}

// Global singleton for the server runtime
const globalForEvents = globalThis as unknown as {
  realtimeEventBus?: RealtimeEventBus;
};

export const realtimeEventBus =
  globalForEvents.realtimeEventBus ?? new RealtimeEventBus();

if (process.env.NODE_ENV !== "production") {
  globalForEvents.realtimeEventBus = realtimeEventBus;
}
