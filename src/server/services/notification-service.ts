export interface InAppNotification {
  id: string;
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
  }): Promise<InAppNotification> {
    const notif: InAppNotification = {
      id: `notif-${crypto.randomUUID()}`,
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
    return notif;
  }

  /**
   * Retrieve notifications for user
   */
  static async getUserNotifications(params: {
    userId: string;
    unreadOnly?: boolean;
  }): Promise<{ notifications: InAppNotification[]; unreadCount: number }> {
    const userNotifs = inMemoryNotifications.filter((n) => n.userId === params.userId || n.userId === "all");
    const unreadCount = userNotifs.filter((n) => !n.read).length;

    const filtered = params.unreadOnly ? userNotifs.filter((n) => !n.read) : userNotifs;
    return { notifications: filtered, unreadCount };
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<void> {
    const notif = inMemoryNotifications.find((n) => n.id === notificationId);
    if (notif) {
      notif.read = true;
    }
  }

  /**
   * Mark all as read
   */
  static async markAllAsRead(userId: string): Promise<void> {
    inMemoryNotifications.forEach((n) => {
      if (n.userId === userId || n.userId === "all") {
        n.read = true;
      }
    });
  }

  /**
   * Clear store for tests
   */
  static clearStore(): void {
    inMemoryNotifications.length = 0;
  }
}
