import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { AuditService } from "@/lib/audit/audit-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { actor } = await getSessionActor(req);

  if (!actor.roles.includes("MANAGER") && !actor.roles.includes("HR")) {
    return apiError("Forbidden: Only team leads and HR can submit probation recommendations.", 403, "FORBIDDEN");
  }

  try {
    const body = await req.json();

    await AuditService.record({
      actorId: actor.userId,
      action: "probation_recommended",
      entity: "ProbationReview",
      entityId: id,
      reason: body.comments || `Manager recommended ${body.recommendation}`,
    });

    return apiSuccess({
      reviewId: id,
      recommendation: body.recommendation || "CONFIRM_EMPLOYMENT",
      status: "PENDING_HR",
      message: "Probation recommendation forwarded to HR.",
    });
  } catch {
    return apiError("Invalid request body", 400, "BAD_REQUEST");
  }
}
