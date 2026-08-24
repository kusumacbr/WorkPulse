import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { OneToOneService } from "@/server/services/coaching-service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { actor } = await getSessionActor(req);

  const meeting = await OneToOneService.getMeetingForActor({
    actor,
    meetingId: id,
  });

  if (!meeting) return apiError(`Meeting '${id}' not found`, 404, "NOT_FOUND");
  return apiSuccess({ meeting });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { actor } = await getSessionActor(req);

  try {
    const body = await req.json();
    const updated = await OneToOneService.updateMeetingNotes({
      actor,
      input: {
        meetingId: id,
        discussionNotes: body.discussionNotes,
        sharedNotes: body.sharedNotes,
        privateManagerNotes: body.privateManagerNotes,
        employeeConcerns: body.employeeConcerns,
        achievements: body.achievements,
        developmentTopics: body.developmentTopics,
      },
    });

    return apiSuccess({ meeting: updated, message: "Meeting notes updated." });
  } catch (err: any) {
    return apiError(err.message || "Failed to update meeting", 400, "BAD_REQUEST");
  }
}
