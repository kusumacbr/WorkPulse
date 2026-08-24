import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { actor } = await getSessionActor(req);

  try {
    const body = await req.json().catch(() => ({}));
    return apiSuccess({
      reviewId: id,
      acknowledgedBy: actor.userId,
      employeeComment: body.comment || null,
      status: "LOCKED",
      message: "Monthly appraisal review acknowledged and locked.",
    });
  } catch {
    return apiError("Invalid request", 400, "BAD_REQUEST");
  }
}
