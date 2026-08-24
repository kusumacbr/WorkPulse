import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { GoalService } from "@/server/services/goal-service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { actor } = await getSessionActor(req);
    const body = await req.json().catch(() => ({}));

    const goal = await GoalService.updateProgress({
      actor,
      input: {
        goalId: id,
        progressPercentage: Number(body.progressPercentage) || 0,
        currentValue: Number(body.currentValue) || 0,
        status: body.status,
      },
    });

    return apiSuccess({ goal, message: "Goal progress updated successfully" }, 200);
  } catch (err: any) {
    return apiError(err.message || "Failed to update goal progress", 400);
  }
}
