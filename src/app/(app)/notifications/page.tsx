"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Bell,
  Clock,
  Sparkles,
  Calendar,
  AlertTriangle,
  Award,
  Check,
  CheckCircle2,
  Megaphone,
  Cake,
  X,
  Send,
  CheckCheck,
  ArrowLeft,
} from "lucide-react";
import { triggerBroadcastPopup } from "@/lib/stores/broadcast-popup-store";
import { createClient } from "@/lib/supabase/client";
import { useCurrentUser } from "@/components/layout/UserContext";

interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  linkUrl?: string | null;
  createdAt: string;
}

// LocalStorage helpers per user email key
function getReadNotifIds(userKey: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const val = localStorage.getItem(`workpulse_read_notifs_${userKey}`);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
}

function saveReadNotifId(userKey: string, id: string) {
  if (typeof window === "undefined") return;
  try {
    const list = getReadNotifIds(userKey);
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(`workpulse_read_notifs_${userKey}`, JSON.stringify(list));
    }
  } catch {}
}

function getDeletedNotifIds(userKey: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const val = localStorage.getItem(`workpulse_deleted_notifs_${userKey}`);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
}

function saveDeletedNotifId(userKey: string, id: string) {
  if (typeof window === "undefined") return;
  try {
    const list = getDeletedNotifIds(userKey);
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(`workpulse_deleted_notifs_${userKey}`, JSON.stringify(list));
    }
  } catch {}
}

function getReadAllTimestamp(userKey: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const val = localStorage.getItem(`workpulse_read_all_ts_${userKey}`);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

function saveReadAllTimestamp(userKey: string, ts: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`workpulse_read_all_ts_${userKey}`, ts.toString());
  } catch {}
}

function getClearAllTimestamp(userKey: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const val = localStorage.getItem(`workpulse_clear_all_ts_${userKey}`);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

function saveClearAllTimestamp(userKey: string, ts: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`workpulse_clear_all_ts_${userKey}`, ts.toString());
  } catch {}
}

export default function NotificationsPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const userKey = (user?.userEmail || "user").toLowerCase().replace(/[^a-z0-9]/g, "_");
  const isHR = user.roles.includes("HR") || user.primaryRole === "HR";
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [filterType, setFilterType] = useState<"ALL" | "UNREAD" | "BROADCASTS" | "LEAVE">("ALL");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Broadcast modal state
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastType, setBroadcastType] = useState<"ANNOUNCEMENT" | "BIRTHDAY" | "FESTIVAL" | "URGENT">("ANNOUNCEMENT");
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const processNotifications = useCallback((rawNotifs: InAppNotification[]) => {
    const deletedIds = getDeletedNotifIds(userKey);
    const readIds = getReadNotifIds(userKey);
    const readAllTs = getReadAllTimestamp(userKey);
    const clearAllTs = getClearAllTimestamp(userKey);

    const filtered = rawNotifs
      .filter((n) => {
        if (deletedIds.includes(n.id)) return false;
        if (clearAllTs > 0 && n.createdAt) {
          const nTime = new Date(n.createdAt).getTime();
          if (!isNaN(nTime) && nTime <= clearAllTs) return false;
        }
        return true;
      })
      .map((n) => {
        let isRead = n.read;
        if (readIds.includes(n.id)) isRead = true;
        if (readAllTs > 0 && n.createdAt) {
          const nTime = new Date(n.createdAt).getTime();
          if (!isNaN(nTime) && nTime <= readAllTs) isRead = true;
        }
        return { ...n, read: isRead };
      });

    setNotifications(filtered);
  }, [userKey]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/notifications");
      if (res.ok) {
        const data = await res.json();
        if (data?.data?.notifications) {
          processNotifications(data.data.notifications);
        }
      }
    } catch {}
  }, [processNotifications]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleIncomingNotification = useCallback((item: any) => {
    const notifId = item.id || `notif-live-${Date.now()}`;
    const newNotif: InAppNotification = {
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
  }, []);

  // Supabase Realtime & Multi-Tab Broadcast Listeners
  useEffect(() => {
    if (typeof window === "undefined") return;

    let supabaseChannel: any = null;
    let broadcastChannel: BroadcastChannel | null = null;
    let eventSource: EventSource | null = null;

    // 1. Supabase Realtime
    try {
      const supabase = createClient();
      supabaseChannel = supabase
        .channel("workpulse-supabase-live-channel")
        .on("broadcast", { event: "notification:new" }, (payload) => {
          const data = payload.payload || payload;
          handleIncomingNotification(data);
        })
        .on("broadcast", { event: "announcement:new" }, (payload) => {
          const data = payload.payload || payload;
          handleIncomingNotification(data);
        })
        .on("broadcast", { event: "celebration:broadcast" }, (payload) => {
          const data = payload.payload || payload;
          handleIncomingNotification(data);
        })
        .on("broadcast", { event: "notification:read" }, (payload) => {
          const data = payload.payload || payload;
          const targetId = data?.id;
          const evtUser = data?.userKey || data?.userEmail;
          if (evtUser && evtUser !== userKey && evtUser !== user?.userEmail) return;
          if (targetId) {
            setNotifications((prev) =>
              prev.map((n) => (n.id === targetId ? { ...n, read: true } : n))
            );
          }
        })
        .on("broadcast", { event: "notification:read_all" }, (payload) => {
          const data = payload.payload || payload;
          const evtUser = data?.userKey || data?.userEmail;
          if (evtUser && evtUser !== userKey && evtUser !== user?.userEmail) return;
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        })
        .on("broadcast", { event: "notification:deleted" }, (payload) => {
          const data = payload.payload || payload;
          const announcementId = data?.announcementId;
          const evtUser = data?.userKey || data?.userEmail;
          if (announcementId) {
            setNotifications((prev) => prev.filter((n) =>
              n.id !== `notif-ann-${announcementId}` &&
              !data.notificationIds?.includes(n.id) &&
              (!data.title || n.title !== data.title)
            ));
          } else if (evtUser && (evtUser === userKey || evtUser === user?.userEmail)) {
            const targetId = data?.id;
            if (targetId) {
              setNotifications((prev) => prev.filter((n) => n.id !== targetId));
            }
          }
        })
        .on("broadcast", { event: "notification:deleted_all" }, (payload) => {
          const data = payload.payload || payload;
          const evtUser = data?.userKey || data?.userEmail;
          if (evtUser && (evtUser === userKey || evtUser === user?.userEmail)) {
            setNotifications([]);
          }
        })
        .subscribe();
    } catch {}

    // 2. SSE Stream
    try {
      eventSource = new EventSource("/api/v1/realtime/stream");
      eventSource.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          if (event.type === "notification:new" || event.type === "announcement:broadcast") {
            handleIncomingNotification(event.payload);
          } else if (event.type === "notification:read") {
            const data = event.payload || {};
            const evtUser = data.userKey || data.userEmail;
            if (evtUser && evtUser !== userKey && evtUser !== user?.userEmail) return;
            const targetId = data.id;
            if (targetId) {
              setNotifications((prev) =>
                prev.map((n) => (n.id === targetId ? { ...n, read: true } : n))
              );
            }
          } else if (event.type === "notification:read_all") {
            const data = event.payload || {};
            const evtUser = data.userKey || data.userEmail;
            if (evtUser && evtUser !== userKey && evtUser !== user?.userEmail) return;
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
          const evtUser = item?.userKey || item?.userEmail;
          if (evtUser && evtUser !== userKey && evtUser !== user?.userEmail) return;
          const targetId = item?.id;
          if (targetId) {
            setNotifications((prev) =>
              prev.map((n) => (n.id === targetId ? { ...n, read: true } : n))
            );
          }
        } else if (type === "notification:read_all") {
          const evtUser = item?.userKey || item?.userEmail;
          if (evtUser && evtUser !== userKey && evtUser !== user?.userEmail) return;
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } else if (type === "notification:deleted_all") {
          const evtUser = item?.userKey || item?.userEmail;
          if (evtUser && (evtUser === userKey || evtUser === user?.userEmail)) {
            setNotifications([]);
          }
        } else if (type === "notification:deleted") {
          const announcementId = item?.announcementId;
          const evtUser = item?.userKey || item?.userEmail;
          if (announcementId) {
            setNotifications((prev) => prev.filter((n) =>
              n.id !== `notif-ann-${announcementId}` &&
              !item.notificationIds?.includes(n.id) &&
              (!item.title || n.title !== item.title)
            ));
          } else if (evtUser && (evtUser === userKey || evtUser === user?.userEmail)) {
            const targetId = item?.id;
            if (targetId) {
              setNotifications((prev) => prev.filter((n) => n.id !== targetId));
            }
          }
        }
      };
    }

    return () => {
      if (supabaseChannel) supabaseChannel.unsubscribe();
      if (eventSource) eventSource.close();
      if (broadcastChannel) broadcastChannel.close();
    };
  }, [handleIncomingNotification, userKey, user?.userEmail]);

  const markAllAsRead = async () => {
    saveReadAllTimestamp(userKey, Date.now());
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setToastMsg("All notifications marked as read");
    setTimeout(() => setToastMsg(null), 3000);

    try {
      await fetch("/api/v1/notifications/read-all", { method: "POST" });

      const supabase = createClient();
      const channel = supabase.channel("workpulse-supabase-live-channel");
      await channel.send({
        type: "broadcast",
        event: "notification:read_all",
        payload: { at: new Date().toISOString(), userEmail: user?.userEmail, userKey },
      });

      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel("workpulse_realtime_broadcast_v1");
        bc.postMessage({ type: "notification:read_all", payload: { userEmail: user?.userEmail, userKey } });
        bc.close();
      }
    } catch {}
  };

  const markAsRead = async (id: string) => {
    saveReadNotifId(userKey, id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    try {
      await fetch(`/api/v1/notifications/${id}/read`, { method: "POST" });

      if (id.startsWith("notif-ann-")) {
        const ancId = id.replace("notif-ann-", "");
        await fetch(`/api/v1/announcements/${ancId}/acknowledge`, { method: "POST" }).catch(() => {});
      }

      const supabase = createClient();
      const channel = supabase.channel("workpulse-supabase-live-channel");
      await channel.send({
        type: "broadcast",
        event: "notification:read",
        payload: { id, userEmail: user?.userEmail, userKey },
      });

      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel("workpulse_realtime_broadcast_v1");
        bc.postMessage({ type: "notification:read", payload: { id, userEmail: user?.userEmail, userKey } });
        bc.close();
      }
    } catch {}
  };

  const deleteNotification = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    saveDeletedNotifId(userKey, id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setToastMsg("Notification permanently deleted.");
    setTimeout(() => setToastMsg(null), 3000);

    try {
      await fetch(`/api/v1/notifications/${id}`, { method: "DELETE" });

      const supabase = createClient();
      const channel = supabase.channel("workpulse-supabase-live-channel");
      await channel.send({
        type: "broadcast",
        event: "notification:deleted",
        payload: { id, userEmail: user?.userEmail, userKey },
      });

      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel("workpulse_realtime_broadcast_v1");
        bc.postMessage({ type: "notification:deleted", payload: { id, userEmail: user?.userEmail, userKey } });
        bc.close();
      }
    } catch {}
  };

  const deleteAllNotifications = async () => {
    saveClearAllTimestamp(userKey, Date.now());
    setNotifications([]);
    setToastMsg("All notifications permanently deleted.");
    setTimeout(() => setToastMsg(null), 3000);

    try {
      await fetch("/api/v1/notifications", { method: "DELETE" });

      const supabase = createClient();
      const channel = supabase.channel("workpulse-supabase-live-channel");
      await channel.send({
        type: "broadcast",
        event: "notification:deleted_all",
        payload: { at: new Date().toISOString(), userEmail: user?.userEmail, userKey },
      });

      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel("workpulse_realtime_broadcast_v1");
        bc.postMessage({ type: "notification:deleted_all", payload: { userEmail: user?.userEmail, userKey } });
        bc.close();
      }
    } catch {}
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      setToastMsg("Please fill in title and message.");
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    setIsBroadcasting(true);
    const broadcastId = `bc-${Date.now()}`;
    const cleanTitle = broadcastTitle.trim();
    const cleanMsg = broadcastMessage.trim();

    try {
      const res = await fetch("/api/v1/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: cleanTitle,
          message: cleanMsg,
          type: broadcastType,
          audience: "ALL",
        }),
      });

      if (res.ok) {
        setShowBroadcastModal(false);
        setBroadcastTitle("");
        setBroadcastMessage("");
        setToastMsg("✓ Broadcast notification sent to all members!");

        const broadcastPayload = {
          id: broadcastId,
          type: (broadcastType === "BIRTHDAY"
            ? "BIRTHDAY"
            : broadcastType === "FESTIVAL"
            ? "FESTIVAL"
            : broadcastType === "URGENT"
            ? "URGENT_POLICY"
            : "ANNOUNCEMENT") as "BIRTHDAY" | "FESTIVAL" | "ANNOUNCEMENT" | "URGENT_POLICY",
          title: cleanTitle,
          message: cleanMsg,
          author: "People Operations",
          targetAudience: "Entire Organization",
          badge: broadcastType === "BIRTHDAY" ? "Birthday Celebration" : broadcastType === "FESTIVAL" ? "Festival Broadcast" : "Company Broadcast",
          accentEmoji: broadcastType === "BIRTHDAY" ? "🎂" : broadcastType === "FESTIVAL" ? "✨" : "📢",
          linkUrl: "/notifications",
        };

        // Trigger local popup
        triggerBroadcastPopup(broadcastPayload);

        // Broadcast across Supabase Realtime channel so all other roles receive it instantly
        const supabase = createClient();
        const channel = supabase.channel("workpulse-supabase-live-channel");
        await channel.send({
          type: "broadcast",
          event: "notification:new",
          payload: broadcastPayload,
        });

        // Multi-tab broadcast
        if ("BroadcastChannel" in window) {
          const bc = new BroadcastChannel("workpulse_realtime_broadcast_v1");
          bc.postMessage({ type: "notification:new", payload: broadcastPayload });
          bc.close();
        }

        fetchNotifications();
      }
    } catch {
      setToastMsg("✓ Broadcast sent!");
    } finally {
      setIsBroadcasting(false);
      setTimeout(() => setToastMsg(null), 4000);
    }
  };

  const filtered = notifications.filter((n) => {
    if (filterType === "UNREAD") return !n.read;
    if (filterType === "BROADCASTS") return n.type.includes("BROADCAST") || n.type === "ANNOUNCEMENT";
    if (filterType === "LEAVE") return n.type.includes("LEAVE");
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "BIRTHDAY_BROADCAST":
      case "BIRTHDAY_CELEBRATION":
        return <Cake className="h-4 w-4 text-pink-400" />;
      case "FESTIVAL_BROADCAST":
      case "FESTIVAL_GREETING":
        return <Sparkles className="h-4 w-4 text-amber-400" />;
      case "BADGE":
        return <Award className="h-4 w-4 text-amber-400" />;
      case "LEAVE":
      case "LEAVE_APPROVED":
        return <Calendar className="h-4 w-4 text-teal-400" />;
      case "BLOCKER":
        return <AlertTriangle className="h-4 w-4 text-rose-400" />;
      default:
        return <Megaphone className="h-4 w-4 text-cyan-400" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTimestamp = (raw: string) => {
    if (!raw) return "Recent";
    try {
      const date = new Date(raw);
      if (isNaN(date.getTime())) return raw;
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return raw;
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        {/* Toast Feedback */}
        {toastMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in duration-150 shadow-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            <span className="font-semibold">{toastMsg}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Notification Center
              </h1>
              {unreadCount > 0 ? (
                <Badge variant="brand" className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border-cyan-500/40">
                  {unreadCount} unread
                </Badge>
              ) : (
                <span className="text-xs text-muted-foreground font-medium">All caught up</span>
              )}
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Supabase Live</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Stay updated with organizational notices, leave requests, and milestone celebrations in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs h-8 px-3 rounded-lg border-border/70 text-muted-foreground hover:text-foreground gap-1.5 font-medium"
              >
                <CheckCheck className="h-3.5 w-3.5 text-cyan-400" />
                <span>Mark all read</span>
              </Button>
            )}

            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={deleteAllNotifications}
                className="text-xs h-8 px-3 rounded-lg border-red-500/30 text-red-400 hover:bg-red-500/10 gap-1.5 font-medium"
                title="Permanently delete all notifications"
              >
                <X className="h-3.5 w-3.5" />
                <span>Clear All</span>
              </Button>
            )}

            {isHR && (
              <Button
                variant="brand"
                size="sm"
                onClick={() => setShowBroadcastModal(true)}
                className="text-xs h-8 px-3.5 rounded-lg font-semibold gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm"
              >
                <Megaphone className="h-3.5 w-3.5" />
                <span>Broadcast Notice</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="text-xs h-8 px-3 rounded-lg border-border/70 text-muted-foreground hover:text-foreground gap-1.5 font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setFilterType("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filterType === "ALL"
                ? "bg-muted text-foreground border border-border/80 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <span>All</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-background/80 font-mono">
              {notifications.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType("UNREAD")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filterType === "UNREAD"
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 font-mono text-cyan-300 font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setFilterType("BROADCASTS")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filterType === "BROADCASTS"
                ? "bg-muted text-foreground border border-border/80 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <span>Broadcasts</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType("LEAVE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filterType === "LEAVE"
                ? "bg-muted text-foreground border border-border/80 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <span>Leaves &amp; Requests</span>
          </button>
        </div>

        {/* Notifications Feed */}
        <div className="space-y-2.5">
          {filtered.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-card/60 border border-border/60 text-muted-foreground text-xs space-y-2">
              <Bell className="h-8 w-8 mx-auto text-muted-foreground/30" />
              <p className="font-semibold text-foreground text-sm">No notifications found</p>
              <p className="text-muted-foreground">You are completely up to date with organization activity.</p>
            </div>
          ) : (
            filtered.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-xl border transition-all group ${
                  !notif.read
                    ? "border-cyan-500/30 bg-card/90 border-l-4 border-l-cyan-500 shadow-sm"
                    : "border-border/60 bg-card/40 hover:bg-card/70"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="p-2 rounded-lg bg-muted/60 border border-border/60 shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {notif.linkUrl ? (
                          <Link
                            href={notif.linkUrl}
                            onClick={() => {
                              if (!notif.read) markAsRead(notif.id);
                            }}
                            className="text-sm font-semibold text-foreground hover:text-cyan-500 transition-colors"
                          >
                            {notif.title}
                          </Link>
                        ) : (
                          <span className="text-sm font-semibold text-foreground">
                            {notif.title}
                          </span>
                        )}

                        {!notif.read && (
                          <span className="h-2 w-2 rounded-full bg-cyan-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground/80 font-mono">
                        <Clock className="h-3 w-3 text-muted-foreground/60" />
                        <span>{formatTimestamp(notif.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!notif.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notif.id)}
                        className="text-[11px] h-7 px-2.5 text-muted-foreground hover:text-cyan-500 rounded-lg font-medium"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        <span>Mark read</span>
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => deleteNotification(notif.id, e)}
                      title="Permanently delete notification"
                      className="text-[11px] h-7 px-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg font-medium opacity-70 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal: Broadcast Organization Announcement */}
        {showBroadcastModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => setShowBroadcastModal(false)}
          >
            <div
              className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-500">
                    <Megaphone className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Broadcast Organization Notice</h3>
                    <p className="text-[11px] text-muted-foreground">Notify all organization members in real-time</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSendBroadcast} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-foreground font-semibold block mb-1">Broadcast Type</label>
                  <select
                    value={broadcastType}
                    onChange={(e) => setBroadcastType(e.target.value as any)}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ANNOUNCEMENT">📢 Company Announcement / Policy Update</option>
                    <option value="BIRTHDAY">🎂 Team Member Birthday Celebration</option>
                    <option value="FESTIVAL">✨ Cultural Festival / Holiday Notice</option>
                    <option value="URGENT">⚠️ Urgent Operational Notice</option>
                  </select>
                </div>

                <div>
                  <label className="text-foreground font-semibold block mb-1">
                    Notice Headline <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="e.g. Q3 All-Hands Meeting & Roadmap Presentation"
                    className="h-9 text-xs rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="text-foreground font-semibold block mb-1">
                    Notice Details <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Provide the complete message for all team members..."
                    rows={3}
                    className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:border-cyan-500 resize-none"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBroadcastModal(false)}
                    className="text-xs h-8 px-4 rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="brand"
                    size="sm"
                    disabled={isBroadcasting}
                    className="text-xs h-8 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold gap-1.5 rounded-lg"
                  >
                    <Send className="h-3 w-3" />
                    <span>{isBroadcasting ? "Broadcasting..." : "Broadcast Notice"}</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
