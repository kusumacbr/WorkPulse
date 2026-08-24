import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { ReviewService } from "@/server/services/review-service";

export async function POST(req: NextRequest) {
  try {
    const { actor } = await getSessionActor(req);
    const body = await req.json().catch(() => ({}));

    if (!body.reviewId) {
      return apiError("reviewId is required", 400);
    }

    const review = await ReviewService.submitSelfReview({
      actor,
      input: {
        reviewId: body.reviewId,
        selfSummary: body.comments || "Quarterly self evaluation",
        selfAchievements: body.strengths || "Completed deliverables",
        selfMissedCommitments: body.growthAreas || "None",
        selfBlockers: "None",
        selfRatings: body.ratings || { delivery: 5, quality: 5 },
      },
    });

    return apiSuccess({ review, message: "Appraisal evaluation submitted successfully" }, 200);
  } catch (err: any) {
    return apiError(err.message || "Failed to submit appraisal evaluation", 400);
  }
}
