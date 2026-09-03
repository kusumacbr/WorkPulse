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
    userId: "user-sarah",
    type: "SOD_REMINDER",
    title: "Start-of-Day Plan Pending",
    message: "Don't forget to submit your daily task plan and sprint goals for today.",
    linkUrl: "/my-work",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "notif-init-2",
    userId: "user-sarah",
    type: "GENERAL",
    title: "Welcome to WorkPulse Phase 1",
    message: "Core employee workflows: SOD, EOD, and weekly goals are now active.",
    linkUrl: "/dashboard",
    read: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

const readNotificationIds = new Set<string>();
const userAllReadTimestamps = new Map<string, number>();

export class NotificationService {
  /**
   * Dispatch an in-app notification
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
    realtimeEventBus.emit("notification:new", notif);
    return notif;
  }

  /**
   * Check if a notification is marked read for a specific user
   */
  static isNotificationRead(notificationId: string, userId?: string, createdAt?: string): boolean {
    if (readNotificationIds.has(notificationId)) return true;
    if (userId) {
      if (readNotificationIds.has(`${userId}:${notificationId}`)) return true;
      const allReadTs = userAllReadTimestamps.get(userId);
      if (allReadTs) {
        if (!createdAt) return true;
        const parsed = new Date(createdAt).getTime();
        // If it was created in the past or is a relative string like "Yesterday", it is covered by mark-all-read
        if (isNaN(parsed) || parsed <= allReadTs) return true;
      }
    }
    return false;
  }

  /**
   * Retrieve notifications for user
   */
  static async getUserNotifications(params: {
    userId: string;
    unreadOnly?: boolean;
  }): Promise<{ notifications: InAppNotification[]; unreadCount: number }> {
    const rawNotifs = inMemoryNotifications
      .filter((n) => n.userId === params.userId || n.userId === "all")
      .map((n) => {
        const isRead = n.read || this.isNotificationRead(n.id, params.userId, n.createdAt);
        return { ...n, read: isRead };
      });

    // Deduplicate by title
    const uniqueMap = new Map<string, InAppNotification>();
    rawNotifs.forEach((n) => {
      const key = `${(n.title || "").toLowerCase().trim()}::${(n.message || "").toLowerCase().trim().slice(0, 30)}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, n);
      } else {
        const existing = uniqueMap.get(key)!;
        if (!n.read && existing.read) {
          uniqueMap.set(key, n);
        }
      }
    });

    const userNotifs = Array.from(uniqueMap.values());
    const unreadCount = userNotifs.filter((n) => !n.read).length;
    const filtered = params.unreadOnly ? userNotifs.filter((n) => !n.read) : userNotifs;
    return { notifications: filtered, unreadCount };
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId?: string): Promise<void> {
    readNotificationIds.add(notificationId);
    if (userId) {
      readNotificationIds.add(`${userId}:${notificationId}`);
    }

    const notif = inMemoryNotifications.find((n) => n.id === notificationId);
    if (notif) {
      notif.read = true;
    }
    realtimeEventBus.emit("notification:read", { id: notificationId, userId });
  }

  /**
   * Mark all as read
   */
  static async markAllAsRead(userId: string): Promise<void> {
    userAllReadTimestamps.set(userId, Date.now());
    inMemoryNotifications.forEach((n) => {
      if (n.userId === userId || n.userId === "all") {
        n.read = true;
        readNotificationIds.add(n.id);
        readNotificationIds.add(`${userId}:${n.id}`);
      }
    });
    realtimeEventBus.emit("notification:read_all", { userId });
  }

  /** Remove the notification generated for a deleted HR announcement for every audience member. */
  static async deleteAnnouncementNotifications(announcementId: string): Promise<void> {
    const deletedIds = inMemoryNotifications
      .filter((notification) => notification.announcementId === announcementId)
      .map((notification) => notification.id);

    if (deletedIds.length === 0) return;

    for (let index = inMemoryNotifications.length - 1; index >= 0; index -= 1) {
      const notification = inMemoryNotifications[index];
      if (notification?.announcementId === announcementId) {
        inMemoryNotifications.splice(index, 1);
      }
    }

    deletedIds.forEach((id) => {
      readNotificationIds.delete(id);
      Array.from(readNotificationIds)
        .filter((key) => key.endsWith(`:${id}`))
        .forEach((key) => readNotificationIds.delete(key));
    });

    realtimeEventBus.emit("notification:deleted", { announcementId, notificationIds: deletedIds });
  }

  /**
   * Clear store for tests
   */
  static clearStore(): void {
    inMemoryNotifications.length = 0;
    readNotificationIds.clear();
    userAllReadTimestamps.clear();
  }
}
