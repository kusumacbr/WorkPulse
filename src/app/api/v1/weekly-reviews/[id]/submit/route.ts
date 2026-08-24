import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/server/api-helpers";
import { workpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const state = workpulseSharedStore.getState();
  const review = state.weeklyReviews.find((r: any) => r.id === id);
  if (!review) return apiError(`Weekly review '${id}' not found`, 404, "NOT_FOUND");

  try {
    const body = await req.json().catch(() => ({}));
    if (body.selfSummary) review.selfSummary = body.selfSummary;
    review.status = "SUBMITTED";

    return apiSuccess({ review, message: "Weekly review submitted to manager." });
  } catch {
    return apiError("Invalid request", 400, "BAD_REQUEST");
  }
}
