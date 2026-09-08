"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell,
  Check,
  Cake,
  Sparkles,
  PartyPopper,
  Calendar,
  Award,
  Megaphone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  linkUrl?: string | null;
  read: boolean;
  createdAt: string;
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/notifications");
      if (res.ok) {
        const data = await res.json();
        if (data?.data?.notifications) {
          setNotifications(data.data.notifications);
          setUnreadCount(data.data.unreadCount || 0);
        }
      }
    } catch {
      // safe fallback
    }
  }, []);

  // Initial fetch and 60s fallback sync (SSE and Supabase handle live updates)
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Handle incoming live notification item (updates notification list/badge without popups)
  const handleIncomingNotification = useCallback((item: any) => {
    const notifId = item.id || `notif-live-${Date.now()}`;
    const newNotif: NotificationItem = {
      id: notifId,
      type: item.type || (item.category === "BIRTHDAY" ? "BIRTHDAY_BROADCAST" : item.category === "FESTIVAL" ? "FESTIVAL_BROADCAST" : "GENERAL"),
      title: item.title || "Company Broadcast",
      message: item.message || item.body || "New update received.",
      linkUrl: item.linkUrl || "/announcements",
      read: false,
      createdAt: item.createdAt || item.publishDate || new Date().toISOString(),
    };

    setNotifications((prev) => {
      if (prev.some((n) => n.id === notifId || (n.title === newNotif.title && n.message === newNotif.message))) {
        return prev;
      }
      return [newNotif, ...prev];
    });

    setUnreadCount((c) => c + 1);
  }, []);

  // REAL-TIME: Supabase WebSockets, SSE Stream, and Multi-Tab BroadcastChannel
  useEffect(() => {
    if (typeof window === "undefined") return;

    let supabaseChannel: any = null;
    let broadcastChannel: BroadcastChannel | null = null;
    let eventSource: EventSource | null = null;

    // 1. Supabase Realtime Channel
    try {
      const supabase = createClient();
      supabaseChannel = supabase
        .channel("workpulse-supabase-live-channel")
        .on("broadcast", { event: "notification:new" }, (payload) => {
          console.log("[NotificationDropdown] Realtime notification received:", payload);
          const data = payload.payload || payload;
          handleIncomingNotification(data);
        })
        .on("broadcast", { event: "announcement:new" }, (payload) => {
          console.log("[NotificationDropdown] Live announcement broadcast received:", payload);
          const data = payload.payload || payload;
          handleIncomingNotification(data);
        })
        .on("broadcast", { event: "celebration:broadcast" }, (payload) => {
          console.log("[NotificationDropdown] Celebration broadcast received:", payload);
          const data = payload.payload || payload;
          handleIncomingNotification(data);
        })
        .on("broadcast", { event: "notification:read" }, (payload) => {
          const targetId = payload.payload?.id || payload.id;
          if (targetId) {
            setNotifications((prev) =>
              prev.map((n) => (n.id === targetId ? { ...n, read: true } : n))
            );
            setUnreadCount((c) => Math.max(0, c - 1));
          }
        })
        .on("broadcast", { event: "notification:read_all" }, () => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          setUnreadCount(0);
        })
        .on("broadcast", { event: "notification:deleted" }, (payload) => {
          const data = payload.payload || payload;
          const announcementId = data?.announcementId;
          if (announcementId) {
            setNotifications((prev) => prev.filter((n) =>
              n.id !== `notif-ann-${announcementId}` &&
              !data.notificationIds?.includes(n.id) &&
              (!data.title || n.title !== data.title)
            ));
          }
        })
        .subscribe();
    } catch (err) {
      console.warn("[NotificationDropdown] Supabase channel error:", err);
    }

    // 2. Server-Sent Events (SSE) Stream
    try {
      eventSource = new EventSource("/api/v1/realtime/stream");
      eventSource.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          if (event.type === "notification:new") {
            handleIncomingNotification(event.payload);
          } else if (event.type === "announcement:broadcast") {
            handleIncomingNotification(event.payload);
          } else if (event.type === "notification:read") {
            const targetId = event.payload?.id;
            if (targetId) {
              setNotifications((prev) =>
                prev.map((n) => (n.id === targetId ? { ...n, read: true } : n))
              );
              setUnreadCount((c) => Math.max(0, c - 1));
            }
          } else if (event.type === "notification:read_all") {
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
          } else if (event.type === "notification:deleted") {
            const data = event.payload || {};
            const announcementId = data.announcementId;
            if (announcementId) {
              setNotifications((prev) => prev.filter((n) =>
                n.id !== `notif-ann-${announcementId}` &&
                !data.notificationIds?.includes(n.id) &&
                (!data.title || n.title !== data.title)
              ));
            }
          }
        } catch {}
      };
    } catch {}

    // 3. Multi-Tab BroadcastChannel
    if ("BroadcastChannel" in window) {
      broadcastChannel = new BroadcastChannel("workpulse_realtime_broadcast_v1");
      broadcastChannel.onmessage = (event) => {
        const { type, payload, data } = event.data || {};
        const item = payload || data;
        if (type === "notification:new" || type === "NEW_ANNOUNCEMENT") {
          handleIncomingNotification(item);
        } else if (type === "notification:read") {
          const targetId = item?.id;
          if (targetId) {
            setNotifications((prev) =>
              prev.map((n) => (n.id === targetId ? { ...n, read: true } : n))
            );
            setUnreadCount((c) => Math.max(0, c - 1));
          }
        } else if (type === "notification:read_all") {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          setUnreadCount(0);
        } else if (type === "notification:deleted") {
          const announcementId = item?.announcementId;
          if (announcementId) {
            setNotifications((prev) => prev.filter((n) =>
              n.id !== `notif-ann-${announcementId}` &&
              !item.notificationIds?.includes(n.id) &&
              (!item.title || n.title !== item.title)
            ));
          }
        }
      };
    }

    return () => {
      if (supabaseChannel) supabaseChannel.unsubscribe();
      if (eventSource) eventSource.close();
      if (broadcastChannel) broadcastChannel.close();
    };
  }, [handleIncomingNotification]);

  // Mark all as read with Real-Time sync
  const markAllAsRead = async () => {
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await fetch("/api/v1/notifications/read-all", { method: "POST" });

      // Supabase realtime channel broadcast
      const supabase = createClient();
      const channel = supabase.channel("workpulse-supabase-live-channel");
      await channel.send({
        type: "broadcast",
        event: "notification:read_all",
        payload: { at: new Date().toISOString() },
      });

      // Cross-tab broadcast
      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel("workpulse_realtime_broadcast_v1");
        bc.postMessage({ type: "notification:read_all" });
        bc.close();
      }
    } catch {}
  };

  // Mark single notification as read with Real-Time sync
  const markAsRead = async (id: string) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await fetch(`/api/v1/notifications/${id}/read`, { method: "POST" });

      // If it's an announcement notification, also acknowledge in Supabase
      if (id.startsWith("notif-ann-")) {
        const ancId = id.replace("notif-ann-", "");
        await fetch(`/api/v1/announcements/${ancId}/acknowledge`, { method: "POST" }).catch(() => {});
      }

      // Supabase realtime broadcast
      const supabase = createClient();
      const channel = supabase.channel("workpulse-supabase-live-channel");
      await channel.send({
        type: "broadcast",
        event: "notification:read",
        payload: { id },
      });

      // Cross-tab broadcast
      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel("workpulse_realtime_broadcast_v1");
        bc.postMessage({ type: "notification:read", payload: { id } });
        bc.close();
      }
    } catch {}
  };

  // Permanently delete single notification
  const deleteNotification = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await fetch(`/api/v1/notifications/${id}`, { method: "DELETE" });

      const supabase = createClient();
      const channel = supabase.channel("workpulse-supabase-live-channel");
      await channel.send({
        type: "broadcast",
        event: "notification:deleted",
        payload: { id },
      });

      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel("workpulse_realtime_broadcast_v1");
        bc.postMessage({ type: "notification:deleted", payload: { id } });
        bc.close();
      }
    } catch {}
  };

  // Permanently delete all notifications
  const deleteAllNotifications = async () => {
    setNotifications([]);
    setUnreadCount(0);

    try {
      await fetch("/api/v1/notifications", { method: "DELETE" });

      const supabase = createClient();
      const channel = supabase.channel("workpulse-supabase-live-channel");
      await channel.send({
        type: "broadcast",
        event: "notification:deleted_all",
        payload: { at: new Date().toISOString() },
      });

      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel("workpulse_realtime_broadcast_v1");
        bc.postMessage({ type: "notification:deleted_all" });
        bc.close();
      }
    } catch {}
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "BIRTHDAY_BROADCAST":
      case "BIRTHDAY_CELEBRATION":
        return <Cake className="h-3.5 w-3.5 text-pink-400 shrink-0" />;
      case "FESTIVAL_BROADCAST":
      case "FESTIVAL_GREETING":
        return <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />;
      case "GOAL_APPROVED":
      case "LEAVE_APPROVED":
        return <PartyPopper className="h-3.5 w-3.5 text-emerald-400 shrink-0" />;
      case "LEAVE":
        return <Calendar className="h-3.5 w-3.5 text-teal-400 shrink-0" />;
      case "BADGE":
        return <Award className="h-3.5 w-3.5 text-amber-400 shrink-0" />;
      default:
        return <Megaphone className="h-3.5 w-3.5 text-cyan-400 shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-3.5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">Notifications &amp; Broadcasts</span>
                {unreadCount > 0 && (
                  <Badge variant="brand" className="text-[10px] px-1.5 py-0 bg-cyan-500/20 text-cyan-300 font-bold border-cyan-500/40">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-[11px] text-cyan-500 hover:underline font-medium flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" />
                    <span>Mark read</span>
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={deleteAllNotifications}
                    className="text-[11px] text-red-500 hover:underline font-medium"
                    title="Permanently delete all notifications"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No notifications yet. You&apos;re all caught up!
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 hover:bg-muted/40 transition-colors text-xs space-y-1.5 group relative ${
                      !notif.read ? "bg-cyan-500/5 dark:bg-cyan-500/10 border-l-2 border-l-cyan-500" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      {notif.linkUrl ? (
                        <Link
                          href={notif.linkUrl}
                          onClick={() => {
                            if (!notif.read) markAsRead(notif.id);
                            setIsOpen(false);
                          }}
                          className="flex items-center gap-1.5 font-semibold text-foreground hover:text-cyan-500 transition-colors text-left pr-4"
                        >
                          {getIcon(notif.type)}
                          <span className="truncate max-w-[200px]">{notif.title}</span>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-1.5 font-semibold text-foreground pr-4">
                          {getIcon(notif.type)}
                          <span className="truncate max-w-[200px]">{notif.title}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {typeof notif.createdAt === "string" && notif.createdAt.includes("T")
                            ? new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : notif.createdAt || "Recent"}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => deleteNotification(notif.id, e)}
                          title="Delete permanently"
                          className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-red-500/10 opacity-70 hover:opacity-100 transition-all cursor-pointer"
                        >
                          <span className="text-[12px] leading-none font-bold">&times;</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed pl-5 line-clamp-2">{notif.message}</p>
                    {!notif.read && (
                      <div className="flex justify-end pt-0.5">
                        <button
                          type="button"
                          onClick={() => markAsRead(notif.id)}
                          className="text-[10px] text-cyan-500 hover:text-cyan-400 hover:underline transition-colors font-semibold flex items-center gap-0.5"
                        >
                          <Check className="h-2.5 w-2.5" />
                          <span>Mark read</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-2.5 border-t border-border bg-muted/20 text-center">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>View all in Notification Center &rarr;</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
