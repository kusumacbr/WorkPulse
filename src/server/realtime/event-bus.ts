/**
 * WorkPulse Server Real-Time Event Bus
 * Dispatches live backend events to Server-Sent Event (SSE) subscribers and active client streams.
 */

export type RealtimeEventType =
  | "employee:created"
  | "employee:updated"
  | "employee:deleted"
  | "workday:sod_submitted"
  | "workday:eod_submitted"
  | "workday:task_updated"
  | "attendance:punched"
  | "leave:created"
  | "leave:approved"
  | "leave:rejected"
  | "wfh:created"
  | "wfh:approved"
  | "wfh:rejected"
  | "review:feedback_submitted"
  | "review:appraisal_submitted"
  | "badge:awarded"
  | "announcement:broadcast"
  | "admin:role_updated"
  | "admin:status_updated";

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
