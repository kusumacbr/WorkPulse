import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { NotificationService } from "@/server/services/notification-service";
import { AnnouncementService } from "@/server/services/announcement-service";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, actor } = await getSessionActor(req);

    // 1. Permanently delete from NotificationService
    const isHr = actor.roles.includes("HR");
    await NotificationService.deleteNotification(id, user.id, isHr);

    // 2. If it's an announcement notification, HR can also delete the announcement
    if (id.startsWith("notif-ann-") && actor.roles.includes("HR")) {
      const ancId = id.replace("notif-ann-", "");
      try {
        await AnnouncementService.deleteAnnouncement({ actor, announcementId: ancId });
      } catch {}
    }

    return apiSuccess({ success: true, id, message: "Notification permanently deleted" });
  } catch (err: any) {
    return apiError(err.message || "Failed to delete notification", 400);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const updated = await NotificationService.updateNotification(id, {
      title: body.title,
      message: body.message,
      read: body.read,
      type: body.type,
      linkUrl: body.linkUrl,
    });

    return apiSuccess({ notification: updated, message: "Notification updated successfully in Supabase" });
  } catch (err: any) {
    return apiError(err.message || "Failed to update notification", 400);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PATCH(req, { params });
}
