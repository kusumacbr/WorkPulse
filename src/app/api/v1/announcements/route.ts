import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { AnnouncementService } from "@/server/services/announcement-service";
import { triggerBroadcastPopup } from "@/lib/stores/broadcast-popup-store";

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
      },
    });

    // Trigger popup
    triggerBroadcastPopup({
      id: announcement.id,
      type: body.priority === "URGENT" ? "URGENT_POLICY" : "ANNOUNCEMENT",
      title: announcement.title,
      message: announcement.body,
      author: user.name || "People Operations",
      targetAudience: "All Staff (19)",
      badge: body.priority === "URGENT" ? "Urgent Statutory Notice" : "Company Broadcast",
      accentEmoji: body.priority === "URGENT" ? "⚠️" : "📢",
      linkUrl: "/hr",
    });

    return apiSuccess({ announcement, message: "Announcement published and broadcasted successfully" }, 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to publish announcement", 400);
  }
}
