"use client";

import { useEffect, useState, useRef } from "react";
import { WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export type RealtimeConnectionStatus = "CONNECTING" | "CONNECTED" | "DISCONNECTED" | "ERROR";

export interface RealtimeMessage {
  id?: string;
  type: string;
  payload?: any;
  timestamp?: string;
  message?: string;
}

const BROADCAST_CHANNEL_NAME = "workpulse_realtime_broadcast_v1";

export function useRealtimeSync() {
  const [status, setStatus] = useState<RealtimeConnectionStatus>("CONNECTING");
  const [lastEvent, setLastEvent] = useState<RealtimeMessage | null>(null);
  const [eventCount, setEventCount] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Initialize Multi-Tab BroadcastChannel
    try {
      if ("BroadcastChannel" in window) {
        const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        broadcastChannelRef.current = channel;

        channel.onmessage = (event) => {
          const msg: RealtimeMessage = event.data;
          setLastEvent(msg);
          setEventCount((c) => c + 1);
          // Hydrate local shared store upon receiving peer tab broadcast
          WorkpulseSharedStore.hydrateFromStorage();
        };
      }
    } catch (err) {
      console.warn("[RealtimeSync] BroadcastChannel init warning:", err);
    }

    // 2. Connect to Server-Sent Events (SSE) Stream
    let reconnectTimeout: NodeJS.Timeout;

    const connectSSE = () => {
      try {
        setStatus("CONNECTING");
        const eventSource = new EventSource("/api/v1/realtime/stream");
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          setStatus("CONNECTED");
        };

        eventSource.onmessage = (e) => {
          try {
            const data: RealtimeMessage = JSON.parse(e.data);
            setLastEvent(data);
            setEventCount((c) => c + 1);

            // Synchronize local shared store
            WorkpulseSharedStore.hydrateFromStorage();

            // Broadcast to other tabs
            if (broadcastChannelRef.current) {
              try {
                broadcastChannelRef.current.postMessage(data);
              } catch {
                // Ignore channel post error
              }
            }
          } catch {
            // Heartbeat or malformed payload
          }
        };

        eventSource.onerror = () => {
          setStatus("DISCONNECTED");
          eventSource.close();
          // Auto-reconnect after 3 seconds
          reconnectTimeout = setTimeout(connectSSE, 3000);
        };
      } catch (err) {
        console.warn("[RealtimeSync] SSE connection error:", err);
        setStatus("ERROR");
      }
    };

    // 3. Supabase Realtime Channels (postgres_changes)
    let supabaseChannel: any = null;
    (async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        supabaseChannel = supabase
          .channel("workpulse-supabase-live-channel")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "employees" },
            (payload) => {
              console.log("[Supabase Realtime] Employee change received:", payload.eventType);
              WorkpulseSharedStore.syncWithSupabase();
            }
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "leave_requests" },
            (payload) => {
              console.log("[Supabase Realtime] Leave request change received:", payload.eventType);
              WorkpulseSharedStore.syncWithSupabase();
            }
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "wfh_requests" },
            (payload) => {
              console.log("[Supabase Realtime] WFH request change received:", payload.eventType);
              WorkpulseSharedStore.syncWithSupabase();
            }
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "workdays" },
            (payload) => {
              console.log("[Supabase Realtime] Workday change received:", payload.eventType);
              WorkpulseSharedStore.syncWithSupabase();
            }
          )
          .subscribe();
      } catch (err) {
        console.warn("[RealtimeSync] Supabase channel subscription error:", err);
      }
    })();

    connectSSE();

    return () => {
      clearTimeout(reconnectTimeout);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
      if (supabaseChannel) {
        supabaseChannel.unsubscribe();
      }
    };
  }, []);

  const broadcastLocalEvent = (type: string, payload: any) => {
    const msg: RealtimeMessage = {
      id: `client-evt-${Date.now()}`,
      type,
      payload,
      timestamp: new Date().toISOString(),
    };
    setLastEvent(msg);
    setEventCount((c) => c + 1);

    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage(msg);
      } catch {
        // Ignore channel post error
      }
    }
  };

  return {
    status,
    lastEvent,
    eventCount,
    broadcastLocalEvent,
    isConnected: status === "CONNECTED",
  };
}
