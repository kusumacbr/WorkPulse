import { realtimeEventBus } from "@/server/realtime/event-bus";

export interface InAppNotification {
  id: string;
  /** Links a broadcast notification to its HR announcement for cascade deletion. */
  announcementId?: string | null;
  userId: string;
  actorId?: string | null;
  type:
    | "SOD_REMINDER"
    | "EOD_REMINDER"
    | "CHANGES_REQUESTED"
    | "GOAL_APPROVED"
    | "WORKDAY_LOCKED"
    | "BLOCKER_ALERT"
    | "BIRTHDAY_CELEBRATION"
    | "BIRTHDAY_BROADCAST"
    | "FESTIVAL_BROADCAST"
    | "FESTIVAL_GREETING"
    | "GENERAL";
  title: string;
  message: string;
  linkUrl?: string | null;
  read: boolean;
  createdAt: string;
}

const inMemoryNotifications: InAppNotification[] = [
  {
    id: "notif-init-1",
    userId: "all",
    actorId: "system",
    type: "SOD_REMINDER",
    title: "Start-of-Day Plan Pending",
    message: "Don't forget to submit your daily task plan and sprint goals for today.",
    linkUrl: "/my-work",
    read: false,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "notif-init-2",
    userId: "all",
    actorId: "hr-rachel",
    type: "GENERAL",
    title: "Welcome to WorkPulse Enterprise",
    message: "Core employee workflows: SOD, EOD, biometric punches, and weekly goals are active.",
    linkUrl: "/dashboard",
    read: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

const readNotificationIds = new Set<string>();
const deletedNotificationIds = new Set<string>();
const userAllReadTimestamps = new Map<string, number>();
const userAllClearedTimestamps = new Map<string, number>();

/**
 * Normalizes and checks if a notification's target userId matches the given user.
 * e.g. "all" matches everyone; "emp-sarah" matches "user-sarah", "lead-alex" matches "user-alex"
 */
function matchesUserId(notifUserId: string, targetUserId: string): boolean {
  if (!notifUserId || notifUserId === "all") return true;
  if (!targetUserId) return false;
  const n = notifUserId.toLowerCase().trim();
  const t = targetUserId.toLowerCase().trim();
  if (n === t) return true;
  const nCore = n.replace(/^(user|emp|lead|hr)-/, "");
  const tCore = t.replace(/^(user|emp|lead|hr)-/, "");
  return nCore === tCore;
}

export class NotificationService {
  /**
   * Dispatch an in-app notification and persist directly to Supabase notifications table
   */
  static async send(params: {
    userId: string;
    actorId?: string | null;
    type: InAppNotification["type"];
    title: string;
    message: string;
    linkUrl?: string | null;
    announcementId?: string | null;
  }): Promise<InAppNotification> {
    const notif: InAppNotification = {
      id: `notif-${crypto.randomUUID()}`,
      announcementId: params.announcementId || null,
      userId: params.userId,
      actorId: params.actorId || null,
      type: params.type,
      title: params.title,
      message: params.message,
      linkUrl: params.linkUrl || null,
      read: false,
      createdAt: new Date().toISOString(),
    };

    inMemoryNotifications.unshift(notif);

    // Persist to Supabase
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();
      if (supabase) {
        // 1. Primary: Save into dedicated public.notifications table
        try {
          const { error: notifErr } = await supabase.from("notifications").insert({
            id: notif.id,
            user_id: notif.userId,
            actor_id: notif.actorId,
            announcement_id: notif.announcementId,
            type: notif.type,
            title: notif.title,
            message: notif.message,
            link_url: notif.linkUrl,
            read: notif.read,
            created_at: notif.createdAt,
            updated_at: notif.createdAt,
          });
          if (notifErr) {
            console.warn("[NotificationService] notifications table insert warning:", notifErr.message);
          }
        } catch (e: any) {
          console.warn("[NotificationService] Error inserting to notifications table:", e?.message);
        }
      }
    } catch (err) {
      console.warn("[NotificationService] Supabase persist error:", err);
    }

    realtimeEventBus.emit("notification:new", notif);
    return notif;
  }

  /**
   * Check if a notification is permanently deleted
   */
  static isNotificationDeleted(notificationId: string, userId?: string, createdAt?: string): boolean {
    if (userId) {
      if (deletedNotificationIds.has(`${userId}:${notificationId}`)) return true;
      const uCore = userId.toLowerCase().replace(/^(user|emp|lead|hr)-/, "");
      if (deletedNotificationIds.has(`${uCore}:${notificationId}`)) return true;

      const allClearedTs = userAllClearedTimestamps.get(userId) || userAllClearedTimestamps.get(uCore);
      if (allClearedTs) {
        if (!createdAt) return true;
        const parsed = new Date(createdAt).getTime();
        if (isNaN(parsed) || parsed <= allClearedTs) return true;
      }
    }
    // Global deletion check (e.g. if HR permanently revoked/deleted an announcement for everyone)
    if (deletedNotificationIds.has(notificationId)) return true;
    return false;
  }

  /**
   * Check if a notification is marked read for a specific user
   */
  static isNotificationRead(notificationId: string, userId?: string, createdAt?: string): boolean {
    if (!userId) {
      return readNotificationIds.has(notificationId);
    }
    const uCore = userId.toLowerCase().replace(/^(user|emp|lead|hr)-/, "");
    if (
      readNotificationIds.has(`${userId}:${notificationId}`) ||
      readNotificationIds.has(`${uCore}:${notificationId}`)
    ) {
      return true;
    }

    const allReadTs = userAllReadTimestamps.get(userId) || userAllReadTimestamps.get(uCore);
    if (allReadTs) {
      if (!createdAt) return true;
      const parsed = new Date(createdAt).getTime();
      if (isNaN(parsed) || parsed <= allReadTs) return true;
    }
    return false;
  }

  /**
   * Retrieve notifications for user from dedicated Supabase tables and in-memory
   */
  static async getUserNotifications(params: {
    userId: string;
    unreadOnly?: boolean;
  }): Promise<{ notifications: InAppNotification[]; unreadCount: number }> {
    const supabaseNotifs: InAppNotification[] = [];
    const dbReadIds = new Set<string>();
    const dbDeletedIds = new Set<string>();

    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();
      if (supabase) {
        // 1. Fetch from dedicated public.notifications table
        try {
          const { data: notifData, error: nErr } = await supabase
            .from("notifications")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(100);

          if (!nErr && Array.isArray(notifData) && notifData.length > 0) {
            notifData.forEach((row: any) => {
              if (!matchesUserId(row.user_id, params.userId)) return;
              supabaseNotifs.push({
                id: row.id,
                announcementId: row.announcement_id || null,
                userId: row.user_id,
                actorId: row.actor_id || null,
                type: row.type || "GENERAL",
                title: row.title,
                message: row.message,
                linkUrl: row.link_url || null,
                read: Boolean(row.read),
                createdAt: row.created_at,
              });
            });
          }
        } catch (e: any) {
          console.warn("[NotificationService] notifications table read error:", e?.message);
        }

        // 2. Fetch per-user read receipts from public.notification_reads
        try {
          const { data: readRows } = await supabase
            .from("notification_reads")
            .select("notification_id")
            .eq("user_id", params.userId);

          if (Array.isArray(readRows)) {
            readRows.forEach((r: any) => {
              if (r.notification_id) {
                dbReadIds.add(r.notification_id);
                readNotificationIds.add(r.notification_id);
                readNotificationIds.add(`${params.userId}:${r.notification_id}`);
              }
            });
          }
        } catch {}

        // 3. Fetch per-user deleted notifications from public.notification_deletes
        try {
          const { data: delRows } = await supabase
            .from("notification_deletes")
            .select("notification_id")
            .eq("user_id", params.userId);

          if (Array.isArray(delRows)) {
            delRows.forEach((d: any) => {
              if (d.notification_id) {
                dbDeletedIds.add(d.notification_id);
                deletedNotificationIds.add(`${params.userId}:${d.notification_id}`);
              }
            });
          }
        } catch {}
      }
    } catch (err) {
      console.warn("[NotificationService] Supabase read error:", err);
    }

    // Merge in-memory and Supabase notifications
    const allCombined = [...inMemoryNotifications, ...supabaseNotifs];

    const rawNotifs = allCombined
      .filter((n) => !dbDeletedIds.has(n.id) && !this.isNotificationDeleted(n.id, params.userId))
      .filter((n) => matchesUserId(n.userId, params.userId))
      .map((n) => {
        const isBroadcast = !n.userId || n.userId === "all";
        const isRead = isBroadcast
          ? (dbReadIds.has(n.id) || this.isNotificationRead(n.id, params.userId, n.createdAt))
          : (Boolean(n.read) || dbReadIds.has(n.id) || this.isNotificationRead(n.id, params.userId, n.createdAt));
        return { ...n, read: isRead };
      });

    // Deduplicate by title & message (or id)
    const uniqueMap = new Map<string, InAppNotification>();
    rawNotifs.forEach((n) => {
      const key = `${(n.title || "").toLowerCase().trim()}::${(n.message || "").toLowerCase().trim().slice(0, 35)}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, n);
      } else {
        const existing = uniqueMap.get(key)!;
        // If either item is marked as read, KEEP IT READ!
        const isRead = existing.read || n.read;
        uniqueMap.set(key, { ...existing, read: isRead });
      }
    });

    const userNotifs = Array.from(uniqueMap.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const unreadCount = userNotifs.filter((n) => !n.read).length;
    const filtered = params.unreadOnly ? userNotifs.filter((n) => !n.read) : userNotifs;
    return { notifications: filtered, unreadCount };
  }

  /**
   * Modify/update an existing notification in memory and in Supabase
   */
  static async updateNotification(
    notificationId: string,
    updates: Partial<InAppNotification>
  ): Promise<InAppNotification | null> {
    // 1. Update in-memory
    const notif = inMemoryNotifications.find((n) => n.id === notificationId);
    if (notif) {
      if (updates.title !== undefined) notif.title = updates.title;
      if (updates.message !== undefined) notif.message = updates.message;
      if (updates.read !== undefined) notif.read = updates.read;
      if (updates.type !== undefined) notif.type = updates.type;
      if (updates.linkUrl !== undefined) notif.linkUrl = updates.linkUrl;
    }

    // 2. Update Supabase
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();
      if (supabase) {
        const notifUpdates: any = { updated_at: new Date().toISOString() };
        if (updates.title !== undefined) notifUpdates.title = updates.title;
        if (updates.message !== undefined) notifUpdates.message = updates.message;
        if (updates.read !== undefined) notifUpdates.read = updates.read;
        if (updates.type !== undefined) notifUpdates.type = updates.type;
        if (updates.linkUrl !== undefined) notifUpdates.link_url = updates.linkUrl;

        await supabase.from("notifications").update(notifUpdates).eq("id", notificationId);
      }
    } catch (err) {
      console.warn("[NotificationService] Supabase update error:", err);
    }

    realtimeEventBus.emit("notification:updated", { id: notificationId, updates });
    return notif || null;
  }

  /**
   * Mark notification as read in memory and permanently in Supabase (per user)
   */
  static async markAsRead(notificationId: string, userId?: string): Promise<void> {
    if (userId) {
      readNotificationIds.add(`${userId}:${notificationId}`);
      const uCore = userId.toLowerCase().replace(/^(user|emp|lead|hr)-/, "");
      readNotificationIds.add(`${uCore}:${notificationId}`);
    } else {
      readNotificationIds.add(notificationId);
    }

    const notif = inMemoryNotifications.find((n) => n.id === notificationId);
    if (notif && notif.userId !== "all") {
      notif.read = true;
    }

    // Update permanently in Supabase
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();
      if (supabase) {
        // 1. Record in dedicated notification_reads table for this user
        if (userId) {
          await supabase.from("notification_reads").upsert(
            {
              id: `nr-${notificationId}-${userId}`,
              notification_id: notificationId,
              user_id: userId,
              read_at: new Date().toISOString(),
            },
            { onConflict: "notification_id,user_id" }
          );
        }

        // 2. Only update direct notification row if not broadcast to all
        if (!notif || notif.userId !== "all") {
          await supabase.from("notifications").update({ read: true, updated_at: new Date().toISOString() }).eq("id", notificationId);
        }
      }
    } catch (err) {
      console.warn("[NotificationService] Supabase markAsRead error:", err);
    }

    realtimeEventBus.emit("notification:read", { id: notificationId, userId });
  }

  /**
   * Mark all as read in memory and permanently in Supabase for user
   */
  static async markAllAsRead(userId: string): Promise<void> {
    userAllReadTimestamps.set(userId, Date.now());
    const uCore = userId.toLowerCase().replace(/^(user|emp|lead|hr)-/, "");
    userAllReadTimestamps.set(uCore, Date.now());

    inMemoryNotifications.forEach((n) => {
      if (matchesUserId(n.userId, userId)) {
        if (n.userId !== "all") {
          n.read = true;
        }
        readNotificationIds.add(`${userId}:${n.id}`);
        readNotificationIds.add(`${uCore}:${n.id}`);
      }
    });

    // Update in Supabase
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();
      if (supabase) {
        // Fetch all current notifications to populate notification_reads
        const { data: allNotifs } = await supabase
          .from("notifications")
          .select("id, user_id")
          .limit(100);

        if (Array.isArray(allNotifs) && allNotifs.length > 0) {
          const readsToInsert = allNotifs
            .filter((n) => matchesUserId(n.user_id, userId))
            .map((n) => ({
              id: `nr-${n.id}-${userId}`,
              notification_id: n.id,
              user_id: userId,
              read_at: new Date().toISOString(),
            }));

          if (readsToInsert.length > 0) {
            await supabase
              .from("notification_reads")
              .upsert(readsToInsert, { onConflict: "notification_id,user_id" });
          }
        }

        // Also update direct notifications for this user
        await supabase
          .from("notifications")
          .update({ read: true, updated_at: new Date().toISOString() })
          .or(`user_id.eq.${userId},user_id.eq.${uCore}`);
      }
    } catch (err) {
      console.warn("[NotificationService] Supabase markAllAsRead error:", err);
    }

    realtimeEventBus.emit("notification:read_all", { userId });
  }

  /**
   * Permanently delete a single notification from memory and from Supabase
   */
  static async deleteNotification(notificationId: string, userId?: string, _isHr?: boolean): Promise<void> {
    if (userId) {
      deletedNotificationIds.add(`${userId}:${notificationId}`);
      const uCore = userId.toLowerCase().replace(/^(user|emp|lead|hr)-/, "");
      deletedNotificationIds.add(`${uCore}:${notificationId}`);
      readNotificationIds.delete(`${userId}:${notificationId}`);
      readNotificationIds.delete(`${uCore}:${notificationId}`);
    }

    const notif = inMemoryNotifications.find((n) => n.id === notificationId);
    const isBroadcast = !notif || !notif.userId || notif.userId === "all";

    // Only delete globally from in-memory array and Supabase if it is a personal notification or deleted by HR
    if (!isBroadcast || _isHr) {
      deletedNotificationIds.add(notificationId);
      readNotificationIds.delete(notificationId);

      const idx = inMemoryNotifications.findIndex((n) => n.id === notificationId);
      if (idx !== -1) {
        inMemoryNotifications.splice(idx, 1);
      }

      try {
        const { createAdminClient } = await import("@/lib/supabase/admin");
        const supabase = createAdminClient();
        if (supabase) {
          await supabase.from("notifications").delete().eq("id", notificationId);
        }
      } catch (err) {
        console.warn("[NotificationService] Supabase delete notification error:", err);
      }
    }

    realtimeEventBus.emit("notification:deleted", { notificationIds: [notificationId], userId });
  }

  /**
   * Permanently delete all notifications for a user from memory and from Supabase
   * Strictly scopes to this user: broadcast notifications remain active for Lead/HR.
   */
  static async deleteAllNotifications(userId: string, _isHr?: boolean): Promise<void> {
    const now = Date.now();
    userAllClearedTimestamps.set(userId, now);
    const uCore = userId.toLowerCase().replace(/^(user|emp|lead|hr)-/, "");
    userAllClearedTimestamps.set(uCore, now);

    const deletedIds: string[] = [];
    for (let i = inMemoryNotifications.length - 1; i >= 0; i--) {
      const n = inMemoryNotifications[i];
      if (n && matchesUserId(n.userId, userId)) {
        deletedIds.push(n.id);
        deletedNotificationIds.add(`${userId}:${n.id}`);
        deletedNotificationIds.add(`${uCore}:${n.id}`);

        // Only splice private personal notifications; do NOT wipe broadcast notifications from memory
        if (n.userId !== "all") {
          deletedNotificationIds.add(n.id);
          inMemoryNotifications.splice(i, 1);
        }
      }
    }

    // Delete permanently from Supabase only personal records owned by this user
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();
      if (supabase) {
        await supabase.from("notifications").delete().or(`user_id.eq.${userId},user_id.eq.${uCore}`);
      }
    } catch (err) {
      console.warn("[NotificationService] Supabase delete all notifications error:", err);
    }

    realtimeEventBus.emit("notification:deleted", { notificationIds: deletedIds, userId });
  }

  /**
   * Remove notifications generated for a deleted HR announcement for every audience member
   */
  static async deleteAnnouncementNotifications(announcementId: string): Promise<void> {
    const deletedIds = inMemoryNotifications
      .filter((notification) => notification.announcementId === announcementId)
      .map((notification) => notification.id);

    for (let index = inMemoryNotifications.length - 1; index >= 0; index -= 1) {
      const notification = inMemoryNotifications[index];
      if (notification?.announcementId === announcementId) {
        inMemoryNotifications.splice(index, 1);
      }
    }

    deletedIds.forEach((id) => {
      deletedNotificationIds.add(id);
      readNotificationIds.delete(id);
      Array.from(readNotificationIds)
        .filter((key) => key.endsWith(`:${id}`))
        .forEach((key) => readNotificationIds.delete(key));
    });

    // Cascade delete in Supabase
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();
      if (supabase) {
        await supabase.from("notifications").delete().eq("announcement_id", announcementId);
      }
    } catch (err) {
      console.warn("[NotificationService] Cascade delete announcement notifications error:", err);
    }

    realtimeEventBus.emit("notification:deleted", { announcementId, notificationIds: deletedIds });
  }

  /**
   * Clear store for tests
   */
  static clearStore(): void {
    inMemoryNotifications.length = 0;
    readNotificationIds.clear();
    deletedNotificationIds.clear();
    userAllReadTimestamps.clear();
  }
}
