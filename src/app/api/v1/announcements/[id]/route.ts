import { NextRequest } from "next/server";
import { apiError, apiSuccess, getSessionActor } from "@/server/api-helpers";
import { AnnouncementService } from "@/server/services/announcement-service";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { actor } = await getSessionActor(req);
    if (!actor.roles.includes("HR")) {
      return apiError("Only HR users can delete announcements", 403, "FORBIDDEN");
    }

    const { id } = await params;
    await AnnouncementService.deleteAnnouncement({ actor, announcementId: id });
    return apiSuccess({ id, message: "Announcement deleted" });
  } catch (error: any) {
    return apiError(error?.message || "Failed to delete announcement", 400);
  }
}
