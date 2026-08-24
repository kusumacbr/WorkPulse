import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { ReviewService } from "@/server/services/review-service";
import { WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export async function GET(req: NextRequest) {
  try {
    await getSessionActor(req);
    const teamData = await ReviewService.getTeamDashboardData();
    const feedbacks = WorkpulseSharedStore.getFeedbacks();

    return apiSuccess({ teamData, feedbacks });
  } catch (err: any) {
    return apiError(err.message || "Failed to list reviews", 400);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, actor } = await getSessionActor(req);
    const body = await req.json().catch(() => ({}));
    const employeeId = body.employeeId || actor.employeeId || user.id;

    const review = await ReviewService.createDraftWeeklyReview({
      actor,
      employeeId,
      reviewerId: body.reviewerId || "emp-alex",
      periodStart: body.periodStart || "2026-08-17",
      periodEnd: body.periodEnd || "2026-08-21",
    });

    return apiSuccess({ review, message: "Review cycle created" }, 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to create review cycle", 400);
  }
}
