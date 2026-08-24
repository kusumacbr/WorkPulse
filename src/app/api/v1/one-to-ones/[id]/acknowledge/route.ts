import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { OneToOneService } from "@/server/services/coaching-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { actor } = await getSessionActor(req);

  try {
    const meeting = await OneToOneService.acknowledgeSharedNotes({
      actor,
      meetingId: id,
    });
    return apiSuccess({ meeting, message: "Shared meeting notes acknowledged by employee." });
  } catch (err: any) {
    return apiError(err.message || "Failed to acknowledge notes", 400, "BAD_REQUEST");
  }
}
