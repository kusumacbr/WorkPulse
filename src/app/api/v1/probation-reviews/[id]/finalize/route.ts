import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { AuditService } from "@/lib/audit/audit-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { actor } = await getSessionActor(req);

  if (!actor.roles.includes("HR")) {
    return apiError("Forbidden: Only HR can finalize probation reviews.", 403, "FORBIDDEN");
  }

  try {
    const body = await req.json();

    await AuditService.record({
      actorId: actor.userId,
      action: "probation_finalized",
      entity: "ProbationReview",
      entityId: id,
      reason: body.comments || "Probation confirmed and employment status finalized",
    });

    return apiSuccess({
      reviewId: id,
      status: "CONFIRMED",
      finalizedBy: actor.userId,
      message: "Probation finalized successfully.",
    });
  } catch {
    return apiError("Invalid request body", 400, "BAD_REQUEST");
  }
}
