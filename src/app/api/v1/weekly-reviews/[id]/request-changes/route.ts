import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { workpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { actor } = await getSessionActor(req);

  if (!actor.roles.includes("MANAGER") && !actor.roles.includes("ADMIN")) {
    return apiError("Forbidden: Only managers and Admin can request review changes.", 403, "FORBIDDEN");
  }

  const state = workpulseSharedStore.getState();
  const review = state.weeklyReviews.find((r: any) => r.id === id);
  if (!review) return apiError(`Weekly review '${id}' not found`, 404, "NOT_FOUND");

  try {
    const body = await req.json().catch(() => ({}));
    review.status = "CHANGES_REQUESTED";
    review.managerFeedback = body.feedback || "Please clarify missed deliverables and update task reflections.";

    return apiSuccess({ review, message: "Changes requested from employee." });
  } catch {
    return apiError("Invalid request", 400, "BAD_REQUEST");
  }
}
