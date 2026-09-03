import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { NotificationService } from "@/server/services/notification-service";
import { AnnouncementService } from "@/server/services/announcement-service";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, actor } = await getSessionActor(req);

    await NotificationService.markAsRead(id, user.id);

    // If it is an announcement notification, acknowledge it in AnnouncementService
    if (id.startsWith("notif-ann-")) {
      const announcementId = id.replace("notif-ann-", "");
      await AnnouncementService.acknowledgeAnnouncement({
        actor,
        announcementId,
        employeeId: actor.employeeId || user.id,
      }).catch(() => {});
    }

    return apiSuccess({ message: `Notification ${id} marked as read.` });
  } catch (err: any) {
    return apiError(err.message || "Failed to mark notification as read", 500);
  }
}
