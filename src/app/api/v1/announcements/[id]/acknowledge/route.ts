import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { AnnouncementService } from "@/server/services/announcement-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { actor } = await getSessionActor(req);
    const resolvedParams = await params;
    const announcementId = resolvedParams.id;

    const result = await AnnouncementService.acknowledgeAnnouncement({
      actor,
      announcementId,
    });

    return apiSuccess({
      result,
      message: "Announcement acknowledged successfully",
    });
  } catch (err: any) {
    return apiError(err.message || "Failed to acknowledge announcement", 400);
  }
}
