import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { NotificationService, InAppNotification } from "@/server/services/notification-service";
import { AnnouncementService } from "@/server/services/announcement-service";
import { WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user, actor } = await getSessionActor(req);
    const userId = user.id;
    const userEmail = (user.email || "").toLowerCase();

    // 1. Get base notifications
    const { notifications: baseNotifs } = await NotificationService.getUserNotifications({
      userId,
    });

    // 2. Aggregate announcements as notifications
    let announcementNotifs: InAppNotification[] = [];
    try {
      const announcements = await AnnouncementService.getAnnouncementsForEmployee({ actor });
      announcementNotifs = announcements.map((a) => {
        const notifId = `notif-ann-${a.id}`;
        const isRead =
          NotificationService.isNotificationRead(notifId, userId, a.publishDate || a.createdAt) ||
          a.receipts?.some((r) => r.employeeId === actor.employeeId) ||
          (a.acknowledgedBy && actor.employeeId ? a.acknowledgedBy.includes(actor.employeeId) : false) ||
          false;

        return {
          id: notifId,
          userId,
          type: a.category === "BIRTHDAY" ? "BIRTHDAY_BROADCAST" : a.category === "FESTIVAL" ? "FESTIVAL_BROADCAST" : "GENERAL",
          title: a.title,
          message: a.body,
          linkUrl: "/announcements",
          read: isRead,
          createdAt: a.publishDate || a.createdAt || new Date().toISOString(),
        };
      });
    } catch {}

    // 3. Aggregate profile queries for this user as notifications
    const myQueries = WorkpulseSharedStore.getProfileQueries().filter(
      (q) => q.employeeEmail.toLowerCase() === userEmail || q.employeeId === userId
    );

    const queryNotifs: InAppNotification[] = myQueries.map((q) => {
      const notifId = `notif-qry-${q.id}`;
      const queryDate = (q as any).submittedAt || (q as any).createdAt || "2026-08-20T10:00:00.000Z";
      const isRead =
        q.status === "APPROVED" ||
        NotificationService.isNotificationRead(notifId, userId, queryDate);

      return {
        id: notifId,
        userId,
        type: "GENERAL",
        title: q.status === "APPROVED" ? `Profile Change Approved (${q.ticketNumber})` : `Profile Change Under Review (${q.ticketNumber})`,
        message: q.status === "APPROVED" ? `HR approved your change: "${q.requestedChange}". Records updated.` : `Your request "${q.requestedChange}" is being reviewed by HR.`,
        linkUrl: "/profile",
        read: isRead,
        createdAt: queryDate,
      };
    });

    // Merge and deduplicate by content/title
    const map = new Map<string, InAppNotification>();
    [...baseNotifs, ...announcementNotifs, ...queryNotifs].forEach((n) => {
      const key = `${(n.title || "").toLowerCase().trim()}::${(n.message || "").toLowerCase().trim().slice(0, 35)}`;
      if (!map.has(key)) {
        map.set(key, n);
      } else {
        const existing = map.get(key)!;
        // Keep the unread one if either is unread
        if (!n.read && existing.read) {
          map.set(key, n);
        }
      }
    });

    const allNotifications = Array.from(map.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    const unreadCount = allNotifications.filter((n) => !n.read).length;

    return apiSuccess({
      notifications: allNotifications,
      unreadCount,
    });
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch notifications", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, actor } = await getSessionActor(req);
    if (!actor.roles.includes("HR")) {
      return apiError("Only HR users can broadcast organization notifications", 403, "FORBIDDEN");
    }
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      const text = await req.text();
      body = text ? JSON.parse(text) : {};
    }

    const title = body.title?.trim();
    const message = body.message?.trim() || body.body?.trim();
    const type = body.type || "GENERAL";
    const targetAudience = body.audience || body.targetAudience || "ALL";

    if (!title || !message) {
      return apiError("Title and message are required to broadcast notification", 400);
    }

    // 1. Create the Supabase-backed HR announcement first. It is the canonical
    // record for this broadcast and is what the HR delete action removes.
    const announcement = await AnnouncementService.createAnnouncement({
      actor,
      input: {
        title,
        body: message,
        category: type === "BIRTHDAY" ? "BIRTHDAY" : type === "FESTIVAL" ? "FESTIVAL" : "GENERAL",
        priority: body.priority || "HIGH",
        audienceType: targetAudience === "ALL" ? "ALL" : "DEPARTMENT",
        acknowledgementRequired: Boolean(body.requiresAcknowledgement),
      },
    });

    // 2. Dispatch the live notification linked to that canonical announcement.
    const createdNotif = await NotificationService.send({
      userId: targetAudience === "ALL" ? "all" : body.userId || user.id,
      actorId: actor.employeeId || user.id,
      type: type as any,
      title,
      message,
      linkUrl: body.linkUrl || "/announcements",
      announcementId: announcement.id,
    });

    return apiSuccess(
      {
        notification: createdNotif,
        message: "Notification broadcasted successfully to all members.",
      },
      201
    );
  } catch (err: any) {
    return apiError(err.message || "Failed to dispatch broadcast notification", 500);
  }
}
