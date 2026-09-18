"use client";

import { useEffect, useState, useRef } from "react";
import { WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { createClient } from "@/lib/supabase/client";

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
          if (
            msg.type?.startsWith("workday:") ||
            msg.type?.startsWith("employee:") ||
            msg.type?.startsWith("leave:") ||
            msg.type?.startsWith("wfh:")
          ) {
            WorkpulseSharedStore.syncWithSupabase(true);
            if (typeof window !== "undefined") {
              if (msg.type?.includes("help")) {
                window.dispatchEvent(new CustomEvent("workpulse:help_changed", { detail: msg.payload }));
              } else {
                window.dispatchEvent(new CustomEvent("workpulse:lead_feedback_updated", { detail: msg.payload || msg }));
              }
              window.dispatchEvent(new CustomEvent("workpulse_sync"));
            }
          }
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
            if (data.type?.startsWith("employee:") || data.type?.startsWith("leave:") || data.type?.startsWith("wfh:")) {
              WorkpulseSharedStore.syncWithSupabase();
            }

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

    // 3. Supabase Realtime Channels (postgres_changes & broadcast)
    let supabaseChannel: any = null;
    let isCleanedUp = false;

    try {
      const supabase = createClient();
      const channelName = "workpulse-supabase-live-channel";

      // Remove any pre-existing channel with the same name from Supabase client to prevent duplicate subscriptions / state conflicts
      const existingChannels = supabase.getChannels();
      const existing = existingChannels.find(
        (ch: any) => ch.name === channelName || ch.topic === `realtime:${channelName}`
      );
      if (existing) {
        supabase.removeChannel(existing);
      }

      if (!isCleanedUp) {
        supabaseChannel = supabase
          .channel(channelName)
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
              if (payload.eventType === "DELETE") {
                const deletedId = (payload.old as any)?.id;
                if (deletedId) {
                  WorkpulseSharedStore.removeLeaveRequestFromRealtime(deletedId);
                } else {
                  WorkpulseSharedStore.syncWithSupabase(true);
                }
              } else {
                WorkpulseSharedStore.syncWithSupabase(true);
              }
            }
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "wfh_requests" },
            (payload) => {
              console.log("[Supabase Realtime] WFH request change received:", payload.eventType);
              if (payload.eventType === "DELETE") {
                const deletedId = (payload.old as any)?.id;
                if (deletedId) {
                  WorkpulseSharedStore.removeWfhRequestFromRealtime(deletedId);
                } else {
                  WorkpulseSharedStore.syncWithSupabase(true);
                }
              } else {
                WorkpulseSharedStore.syncWithSupabase(true);
              }
            }
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "workdays" },
            (payload) => {
              console.log("[Supabase Realtime] Workday change received:", payload.eventType);
              WorkpulseSharedStore.syncWithSupabase(true);
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("workpulse_sync"));
                window.dispatchEvent(new CustomEvent("workpulse:lead_feedback_updated", { detail: payload }));
                try {
                  const bc = new BroadcastChannel("workpulse_realtime_broadcast_v1");
                  bc.postMessage({ type: "workday:changed", eventType: payload.eventType, record: payload.new || payload.old, timestamp: Date.now() });
                  bc.close();
                } catch {}
              }
            }
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "feedbacks" },
            (payload) => {
              console.log("[Supabase Realtime] Feedback/Notice change received:", payload.eventType);
              WorkpulseSharedStore.syncWithSupabase(true);
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("workpulse_sync"));
                window.dispatchEvent(new CustomEvent("workpulse:help_changed", { detail: payload }));
                window.dispatchEvent(new CustomEvent("workpulse:lead_feedback_updated", { detail: payload }));
                try {
                  const bc = new BroadcastChannel("workpulse_realtime_broadcast_v1");
                  bc.postMessage({ type: "workday:help_changed", eventType: payload.eventType, record: payload.new || payload.old, timestamp: Date.now() });
                  bc.close();
                } catch {}
              }
            }
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "daily_tasks" },
            (payload) => {
              console.log("[Supabase Realtime] Daily task change received:", payload.eventType);
              WorkpulseSharedStore.syncWithSupabase(true);
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("workpulse:tasks_changed"));
                window.dispatchEvent(new CustomEvent("workpulse:task_deleted", { detail: payload }));
                try {
                  const bc = new BroadcastChannel("workpulse_realtime_broadcast_v1");
                  bc.postMessage({ type: "daily_tasks:changed", eventType: payload.eventType, timestamp: Date.now() });
                  bc.close();
                } catch {}
              }
            }
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "assigned_tasks" },
            (payload) => {
              console.log("[Supabase Realtime] Assigned task change received:", payload.eventType);
              WorkpulseSharedStore.syncWithSupabase(true);
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("workpulse:tasks_changed"));
                window.dispatchEvent(new CustomEvent("workpulse:task_deleted", { detail: payload }));
                try {
                  const bc = new BroadcastChannel("workpulse_realtime_broadcast_v1");
                  bc.postMessage({ type: "daily_tasks:changed", eventType: payload.eventType, timestamp: Date.now() });
                  bc.close();
                } catch {}
              }
            }
          )
          // 4. Supabase Culture & Announcements Live Broadcast Channel
          .on(
            "broadcast",
            { event: "announcement:new" },
            (payload) => {
              console.log("[Supabase Realtime] Live announcement broadcast received:", payload);
              const data = payload.payload || payload;
              setLastEvent({ type: "announcement:new", payload: data });
              setEventCount((c) => c + 1);
            }
          )
          .on(
            "broadcast",
            { event: "celebration:broadcast" },
            (payload) => {
              console.log("[Supabase Realtime] Live celebration broadcast received:", payload);
              const data = payload.payload || payload;
              setLastEvent({ type: "celebration:broadcast", payload: data });
              setEventCount((c) => c + 1);
            }
          )
          // 5. Employee CRUD Live Broadcast Handlers
          .on(
            "broadcast",
            { event: "employee:created" },
            (payload) => {
              console.log("[Supabase Realtime] Live employee created broadcast:", payload);
              WorkpulseSharedStore.syncWithSupabase();
            }
          )
          .on(
            "broadcast",
            { event: "employee:updated" },
            (payload) => {
              console.log("[Supabase Realtime] Live employee updated broadcast:", payload);
              const data = payload.payload || payload;
              if (data?.id) {
                WorkpulseSharedStore.updateEmployee(data.id, data);
              }
              WorkpulseSharedStore.syncWithSupabase();
            }
          )
          .on(
            "broadcast",
            { event: "employee:deleted" },
            (payload) => {
              console.log("[Supabase Realtime] Live employee deleted broadcast:", payload);
              const data = payload.payload || payload;
              if (data?.id) {
                WorkpulseSharedStore.deleteEmployee(data.id);
              }
              WorkpulseSharedStore.syncWithSupabase();
            }
          )
          // 6. Leave & WFH Realtime Sync
          .on(
            "broadcast",
            { event: "leave:updated" },
            (payload) => {
              console.log("[Supabase Realtime] Live leave update broadcast:", payload);
              WorkpulseSharedStore.syncWithSupabase();
            }
          )
          .on(
            "broadcast",
            { event: "wfh:updated" },
            (payload) => {
              console.log("[Supabase Realtime] Live WFH update broadcast:", payload);
              WorkpulseSharedStore.syncWithSupabase();
            }
          )
          // 7. Attendance & Workday Realtime Sync
          .on(
            "broadcast",
            { event: "attendance:punched" },
            (payload) => {
              console.log("[Supabase Realtime] Live attendance punch broadcast:", payload);
              WorkpulseSharedStore.syncWithSupabase();
            }
          )
          .on(
            "broadcast",
            { event: "workday:sod_submitted" },
            (payload) => {
              console.log("[Supabase Realtime] Live SOD submission broadcast:", payload);
              WorkpulseSharedStore.syncWithSupabase();
            }
          )
          .on(
            "broadcast",
            { event: "workday:eod_submitted" },
            (payload) => {
              console.log("[Supabase Realtime] Live EOD submission broadcast:", payload);
              WorkpulseSharedStore.syncWithSupabase();
            }
          )
          // 8. Performance Reviews Realtime Sync
          .on(
            "broadcast",
            { event: "review:updated" },
            (payload) => {
              console.log("[Supabase Realtime] Live review update broadcast:", payload);
              WorkpulseSharedStore.syncWithSupabase();
            }
          )
          .subscribe((subStatus: string) => {
            if (subStatus === "SUBSCRIBED") {
              setStatus("CONNECTED");
            } else if (subStatus === "CHANNEL_ERROR" || subStatus === "TIMED_OUT") {
              if (!isCleanedUp) connectSSE();
            }
          });
      }
    } catch (err) {
      console.warn("[RealtimeSync] Supabase channel subscription error:", err);
      if (!isCleanedUp) connectSSE();
    }

    return () => {
      isCleanedUp = true;
      clearTimeout(reconnectTimeout);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
      if (supabaseChannel) {
        try {
          const supabase = createClient();
          supabase.removeChannel(supabaseChannel);
        } catch {
          supabaseChannel.unsubscribe();
        }
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
