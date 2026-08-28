import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { workpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { AuditService } from "@/lib/audit/audit-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { actor } = await getSessionActor(req);

  if (!actor.roles.includes("MANAGER") && !actor.roles.includes("HR")) {
    return apiError("Forbidden: Only team leads and HR can approve weekly reviews.", 403, "FORBIDDEN");
  }

  const state = workpulseSharedStore.getState();
  const review = state.weeklyReviews.find((r: any) => r.id === id);
  if (!review) return apiError(`Weekly review '${id}' not found`, 404, "NOT_FOUND");

  try {
    const body = await req.json();
    review.status = "APPROVED";
    review.managerFeedback = body.feedback || review.managerFeedback;
    review.leadRating = body.confirmedOverallRating || body.rating || review.leadRating;
    review.approvedAt = new Date().toISOString();

    await AuditService.record({
      actorId: actor.userId,
      action: "weekly_review_approved",
      entity: "WeeklyReview",
      entityId: id,
      reason: review.managerFeedback,
    });

    return apiSuccess({ review, message: "Weekly review approved successfully." });
  } catch {
    return apiError("Invalid request body", 400, "BAD_REQUEST");
  }
}
