import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { AnnouncementService } from "@/server/services/announcement-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { actor } = await getSessionActor(req);

    const result = await AnnouncementService.acknowledgeAnnouncement({
      actor,
      announcementId: id,
    });

    return apiSuccess({ result, message: "Announcement acknowledged" }, 200);
  } catch (err: any) {
    return apiError(err.message || "Failed to acknowledge announcement", 400);
  }
}
