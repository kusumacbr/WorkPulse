import { realtimeEventBus } from "@/server/realtime/event-bus";
import { createAdminClient } from "@/lib/supabase/admin";

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
 * Normalizes and returns all possible identity aliases for a user identifier
 */
function getUserAliases(userIdOrEmail: string): string[] {
  if (!userIdOrEmail) return [];
  const raw = userIdOrEmail.toLowerCase().trim();
  const aliases = new Set<string>([raw]);

  const core = raw.replace(/^(user|emp|lead|hr)-/, "").replace(/@.*$/, "");
  aliases.add(core);

  if (raw.includes("sarah") || raw.includes("sara") || raw.includes("employee")) {
    aliases.add("emp-sarah");
    aliases.add("user-sarah");
    aliases.add("employee.test@xorstack.com");
    aliases.add("sarah");
  } else if (raw.includes("alex") || raw.includes("lead")) {
    aliases.add("lead-alex");
    aliases.add("user-alex");
    aliases.add("lead.test@xorstack.com");
    aliases.add("alex");
  } else if (raw.includes("rachel") || raw.includes("hr")) {
    aliases.add("hr-rachel");
    aliases.add("user-rachel");
    aliases.add("hr.test@xorstack.com");
    aliases.add("rachel");
  } else if (raw.includes("david") || raw.includes("director")) {
    aliases.add("admin-david");
    aliases.add("director.test@xorstack.com");
    aliases.add("david");
  } else if (raw.includes("rohit")) {
    aliases.add("emp-rohit");
    aliases.add("rohit.sharma@xorstack.com");
  } else if (raw.includes("ananya")) {
    aliases.add("emp-ananya");
    aliases.add("ananya.sen@xorstack.com");
  }

  return Array.from(aliases);
}

/**
 * Normalizes and checks if a notification's target userId matches the given user.
 */
function matchesUserId(notifUserId: string, targetUserId: string): boolean {
  if (!notifUserId || notifUserId === "all") return true;
  if (!targetUserId) return false;
  const notifAliases = getUserAliases(notifUserId);
  const targetAliases = getUserAliases(targetUserId);
  return notifAliases.some((a) => targetAliases.includes(a));
}

export class NotificationService {
  /**
   * Dispatch an in-app notification and persist directly to Supabase
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
      const supabase = createAdminClient();
      if (supabase) {
        // 1. Try public.notifications table
        try {
          await supabase.from("notifications").insert({
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
        } catch {}

        // 2. Persist to feedbacks namespace for 100% durability
        try {
          await supabase.from("feedbacks").upsert({
            id: notif.id,
            employee_id: notif.userId,
            employee_name: notif.title,
            lead_id: "NOTIFICATION_ITEM",
            lead_name: notif.actorId || "System",
            date: new Date().toISOString().split("T")[0],
            rating: 5,
            sentiment: notif.type,
            notes: notif.message,
            action_item: JSON.stringify({
              id: notif.id,
              userId: notif.userId,
              actorId: notif.actorId,
              type: notif.type,
              title: notif.title,
              message: notif.message,
              linkUrl: notif.linkUrl,
              announcementId: notif.announcementId,
              createdAt: notif.createdAt,
            }),
          });
        } catch {}
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
      const aliases = getUserAliases(userId);
      for (const a of aliases) {
        if (deletedNotificationIds.has(`${a}:${notificationId}`)) return true;
        const allClearedTs = userAllClearedTimestamps.get(a);
        if (allClearedTs) {
          if (!createdAt) return true;
          const parsed = new Date(createdAt).getTime();
          if (isNaN(parsed) || parsed <= allClearedTs) return true;
        }
      }
    }
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
    const aliases = getUserAliases(userId);
    for (const a of aliases) {
      if (readNotificationIds.has(`${a}:${notificationId}`)) return true;
      const allReadTs = userAllReadTimestamps.get(a);
      if (allReadTs) {
        if (!createdAt) return true;
        const parsed = new Date(createdAt).getTime();
        if (isNaN(parsed) || parsed <= allReadTs) return true;
      }
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
    let dbAllReadTs = 0;
    let dbClearAllTs = 0;

    const userAliases = getUserAliases(params.userId);

    try {
      const supabase = createAdminClient();
      if (supabase) {
        // 1. Fetch persistent receipts from feedbacks table for all user aliases
        try {
          const { data: fbNotifData, error: fbErr } = await supabase
            .from("feedbacks")
            .select("*")
            .in("lead_id", ["NOTIFICATION_READ", "NOTIFICATION_READ_ALL", "NOTIFICATION_DELETE", "NOTIFICATION_CLEAR_ALL", "NOTIFICATION_ITEM"]);

          if (!fbErr && Array.isArray(fbNotifData)) {
            fbNotifData.forEach((row: any) => {
              const rowEmp = (row.employee_id || "").toLowerCase();
              const isMatch = userAliases.some((a) => rowEmp === a || rowEmp.includes(a) || a.includes(rowEmp));

              if (row.lead_id === "NOTIFICATION_ITEM") {
                if (matchesUserId(row.employee_id, params.userId)) {
                  let meta: any = {};
                  try { meta = JSON.parse(row.action_item || "{}"); } catch {}
                  supabaseNotifs.push({
                    id: row.id,
                    announcementId: meta.announcementId || null,
                    userId: row.employee_id,
                    actorId: row.lead_name || null,
                    type: (meta.type || row.sentiment || "GENERAL") as any,
                    title: row.employee_name || meta.title || "Notification",
                    message: row.notes || meta.message || "",
                    linkUrl: meta.linkUrl || null,
                    read: false,
                    createdAt: meta.createdAt || row.created_at,
                  });
                }
              } else if (isMatch) {
                if (row.lead_id === "NOTIFICATION_READ") {
                  const targetNotifId = row.lead_name || row.notes;
                  if (targetNotifId) {
                    dbReadIds.add(targetNotifId);
                    userAliases.forEach((a) => readNotificationIds.add(`${a}:${targetNotifId}`));
                  }
                } else if (row.lead_id === "NOTIFICATION_READ_ALL") {
                  let meta: any = {};
                  try { meta = JSON.parse(row.action_item || "{}"); } catch {}
                  const ts = meta.allReadAt || new Date(row.created_at).getTime();
                  if (ts > dbAllReadTs) dbAllReadTs = ts;
                  userAliases.forEach((a) => userAllReadTimestamps.set(a, Math.max(userAllReadTimestamps.get(a) || 0, ts)));
                } else if (row.lead_id === "NOTIFICATION_DELETE") {
                  const targetNotifId = row.lead_name || row.notes;
                  if (targetNotifId) {
                    dbDeletedIds.add(targetNotifId);
                    userAliases.forEach((a) => deletedNotificationIds.add(`${a}:${targetNotifId}`));
                  }
                } else if (row.lead_id === "NOTIFICATION_CLEAR_ALL") {
                  let meta: any = {};
                  try { meta = JSON.parse(row.action_item || "{}"); } catch {}
                  const ts = meta.clearedAllAt || new Date(row.created_at).getTime();
                  if (ts > dbClearAllTs) dbClearAllTs = ts;
                  userAliases.forEach((a) => userAllClearedTimestamps.set(a, Math.max(userAllClearedTimestamps.get(a) || 0, ts)));
                }
              }
            });
          }
        } catch (e: any) {
          console.warn("[NotificationService] feedbacks namespace read warning:", e?.message);
        }

        // 2. Fetch from dedicated public.notifications table if it exists
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
        } catch {}
      }
    } catch (err) {
      console.warn("[NotificationService] Supabase read error:", err);
    }

    // Merge in-memory and Supabase notifications
    const allCombined = [...inMemoryNotifications, ...supabaseNotifs];

    const rawNotifs = allCombined
      .filter((n) => !dbDeletedIds.has(n.id) && !this.isNotificationDeleted(n.id, params.userId, n.createdAt))
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
    const notif = inMemoryNotifications.find((n) => n.id === notificationId);
    if (notif) {
      if (updates.title !== undefined) notif.title = updates.title;
      if (updates.message !== undefined) notif.message = updates.message;
      if (updates.read !== undefined) notif.read = updates.read;
      if (updates.type !== undefined) notif.type = updates.type;
      if (updates.linkUrl !== undefined) notif.linkUrl = updates.linkUrl;
    }

    try {
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
    const userAliases = userId ? getUserAliases(userId) : [];

    if (userId) {
      userAliases.forEach((a) => readNotificationIds.add(`${a}:${notificationId}`));
    } else {
      readNotificationIds.add(notificationId);
    }

    const notif = inMemoryNotifications.find((n) => n.id === notificationId);
    if (notif && notif.userId !== "all") {
      notif.read = true;
    }

    // Persist permanently in Supabase feedbacks table (100% persistent)
    try {
      const supabase = createAdminClient();
      if (supabase && userId) {
        const receiptId = `nr-${userId}-${notificationId}`.replace(/[^a-zA-Z0-9_-]/g, "_");
        await supabase.from("feedbacks").upsert({
          id: receiptId,
          employee_id: userId,
          employee_name: "Notification Read Receipt",
          lead_id: "NOTIFICATION_READ",
          lead_name: notificationId,
          date: new Date().toISOString().split("T")[0],
          rating: 5,
          sentiment: "READ",
          notes: notificationId,
          action_item: JSON.stringify({
            notificationId,
            userId,
            readAt: new Date().toISOString(),
          }),
        });

        // Also try direct notifications table update if not a broadcast to all
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
    const now = Date.now();
    const userAliases = getUserAliases(userId);

    userAliases.forEach((a) => userAllReadTimestamps.set(a, now));

    inMemoryNotifications.forEach((n) => {
      if (matchesUserId(n.userId, userId)) {
        if (n.userId !== "all") {
          n.read = true;
        }
        userAliases.forEach((a) => readNotificationIds.add(`${a}:${n.id}`));
      }
    });

    // Persist permanently in Supabase feedbacks table
    try {
      const supabase = createAdminClient();
      if (supabase) {
        const readAllReceiptId = `nr-all-${userId}`.replace(/[^a-zA-Z0-9_-]/g, "_");
        await supabase.from("feedbacks").upsert({
          id: readAllReceiptId,
          employee_id: userId,
          employee_name: "Mark All Read Receipt",
          lead_id: "NOTIFICATION_READ_ALL",
          lead_name: userId,
          date: new Date().toISOString().split("T")[0],
          rating: 5,
          sentiment: "READ_ALL",
          notes: "All notifications marked as read",
          action_item: JSON.stringify({
            userId,
            allReadAt: now,
            timestamp: new Date().toISOString(),
          }),
        });

        // Also update direct notifications for this user in notifications table
        await supabase
          .from("notifications")
          .update({ read: true, updated_at: new Date().toISOString() })
          .eq("user_id", userId);
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
    const userAliases = userId ? getUserAliases(userId) : [];

    if (userId) {
      userAliases.forEach((a) => {
        deletedNotificationIds.add(`${a}:${notificationId}`);
        readNotificationIds.delete(`${a}:${notificationId}`);
      });
    }

    const notif = inMemoryNotifications.find((n) => n.id === notificationId);
    const isBroadcast = !notif || !notif.userId || notif.userId === "all";

    if (!isBroadcast || _isHr) {
      deletedNotificationIds.add(notificationId);
      readNotificationIds.delete(notificationId);

      const idx = inMemoryNotifications.findIndex((n) => n.id === notificationId);
      if (idx !== -1) {
        inMemoryNotifications.splice(idx, 1);
      }
    }

    // Persist delete receipt in Supabase feedbacks table (100% durable)
    try {
      const supabase = createAdminClient();
      if (supabase && userId) {
        const deleteReceiptId = `nd-${userId}-${notificationId}`.replace(/[^a-zA-Z0-9_-]/g, "_");
        await supabase.from("feedbacks").upsert({
          id: deleteReceiptId,
          employee_id: userId,
          employee_name: "Notification Delete Receipt",
          lead_id: "NOTIFICATION_DELETE",
          lead_name: notificationId,
          date: new Date().toISOString().split("T")[0],
          rating: 1,
          sentiment: "DELETED",
          notes: notificationId,
          action_item: JSON.stringify({
            notificationId,
            userId,
            deletedAt: new Date().toISOString(),
          }),
        });

        if (!isBroadcast || _isHr) {
          await supabase.from("notifications").delete().eq("id", notificationId);
          await supabase.from("feedbacks").delete().eq("id", notificationId);
        }
      }
    } catch (err) {
      console.warn("[NotificationService] Supabase delete notification error:", err);
    }

    realtimeEventBus.emit("notification:deleted", { notificationIds: [notificationId], userId });
  }

  /**
   * Permanently delete all notifications for a user from memory and from Supabase
   * Strictly scopes to this user: broadcast notifications remain active for Lead/HR.
   */
  static async deleteAllNotifications(userId: string, _isHr?: boolean): Promise<void> {
    const now = Date.now();
    const userAliases = getUserAliases(userId);

    userAliases.forEach((a) => userAllClearedTimestamps.set(a, now));

    const deletedIds: string[] = [];
    for (let i = inMemoryNotifications.length - 1; i >= 0; i--) {
      const n = inMemoryNotifications[i];
      if (n && matchesUserId(n.userId, userId)) {
        deletedIds.push(n.id);
        userAliases.forEach((a) => deletedNotificationIds.add(`${a}:${n.id}`));

        if (n.userId !== "all") {
          deletedNotificationIds.add(n.id);
          inMemoryNotifications.splice(i, 1);
        }
      }
    }

    // Persist clear-all receipt in Supabase feedbacks table
    try {
      const supabase = createAdminClient();
      if (supabase) {
        const clearAllReceiptId = `nd-all-${userId}`.replace(/[^a-zA-Z0-9_-]/g, "_");
        await supabase.from("feedbacks").upsert({
          id: clearAllReceiptId,
          employee_id: userId,
          employee_name: "Clear All Notifications Receipt",
          lead_id: "NOTIFICATION_CLEAR_ALL",
          lead_name: userId,
          date: new Date().toISOString().split("T")[0],
          rating: 1,
          sentiment: "CLEARED_ALL",
          notes: "All notifications cleared by user",
          action_item: JSON.stringify({
            userId,
            clearedAllAt: now,
            timestamp: new Date().toISOString(),
          }),
        });

        // Delete direct personal notification rows
        await supabase.from("notifications").delete().eq("user_id", userId);
      }
    } catch (err) {
      console.warn("[NotificationService] Supabase delete all notifications error:", err);
    }

    realtimeEventBus.emit("notification:deleted_all", { notificationIds: deletedIds, userId });
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

    try {
      const supabase = createAdminClient();
      if (supabase) {
        await supabase.from("notifications").delete().eq("announcement_id", announcementId);
        await supabase.from("feedbacks").delete().eq("id", `notif-ann-${announcementId}`);
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
    userAllClearedTimestamps.clear();
  }
}
