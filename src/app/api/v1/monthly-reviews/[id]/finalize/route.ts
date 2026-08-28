import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { AuditService } from "@/lib/audit/audit-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { actor } = await getSessionActor(req);

  if (!actor.roles.includes("HR") && !actor.roles.includes("MANAGER")) {
    return apiError("Forbidden: You lack authority to finalize monthly performance reviews.", 403, "FORBIDDEN");
  }

  try {
    const body = await req.json();

    // HR override requires a reason
    if (body.override && !body.reason) {
      return apiError("Rating override requires a mandatory written reason for audit logging.", 422, "VALIDATION_FAILED");
    }

    await AuditService.record({
      actorId: actor.userId,
      action: "monthly_review_finalized",
      entity: "MonthlyPerformanceReview",
      entityId: id,
      reason: body.reason || "Monthly appraisal review finalized",
      afterState: body,
    });

    return apiSuccess({
      reviewId: id,
      finalScore: body.finalScore || 90,
      confirmedRating: body.confirmedRating || 5,
      status: "APPROVED",
      message: "Monthly performance review finalized.",
    });
  } catch {
    return apiError("Invalid request body", 400, "BAD_REQUEST");
  }
}
