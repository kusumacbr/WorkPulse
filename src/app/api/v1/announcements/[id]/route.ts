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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { actor, user } = await getSessionActor(req);
    if (!actor.roles.includes("HR")) {
      return apiError("Only HR users can modify announcements", 403, "FORBIDDEN");
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const updated = await AnnouncementService.updateAnnouncement({
      actor,
      announcementId: id,
      input: {
        title: body.title,
        body: body.body || body.message,
        category: body.category,
        priority: body.priority,
        audienceType: body.audience || body.audienceType,
        authorName: user?.name,
      },
    });

    return apiSuccess({ announcement: updated, message: "Announcement updated and synchronized with Supabase" });
  } catch (error: any) {
    return apiError(error?.message || "Failed to update announcement", 400);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PATCH(req, { params });
}
