import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { AnnouncementService } from "@/server/services/announcement-service";
import { NotificationService } from "@/server/services/notification-service";

export async function GET(req: NextRequest) {
  try {
    const { actor } = await getSessionActor(req);
    const announcements = await AnnouncementService.getAnnouncementsForEmployee({ actor });
    return apiSuccess({ announcements });
  } catch (err: any) {
    return apiError(err.message || "Failed to list announcements", 400);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, actor } = await getSessionActor(req);
    if (!actor.roles.includes("HR")) {
      return apiError("Only HR users can publish announcements", 403, "FORBIDDEN");
    }
    const body = await req.json().catch(() => ({}));

    if (!body.title || !body.body) {
      return apiError("title and body are required", 400);
    }

    const announcement = await AnnouncementService.createAnnouncement({
      actor,
      input: {
        title: body.title,
        body: body.body,
        category: body.category || "GENERAL",
        priority: body.priority || "NORMAL",
        audienceType: body.audience || body.audienceType || "ALL",
        acknowledgementRequired: Boolean(body.requiresAcknowledgement),
        authorName: user?.name || "People Operations",
      },
    });

    // Also dispatch in-app notification to all members
    try {
      await NotificationService.send({
        userId: "all",
        actorId: actor?.employeeId || user?.id,
        type: body.category === "BIRTHDAY" ? "BIRTHDAY_BROADCAST" : body.category === "FESTIVAL" ? "FESTIVAL_BROADCAST" : "GENERAL",
        title: announcement.title,
        message: announcement.body,
        linkUrl: "/announcements",
        announcementId: announcement.id,
      });
    } catch {}

    return apiSuccess({ announcement, message: "Announcement published and broadcasted successfully" }, 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to publish announcement", 400);
  }
}
