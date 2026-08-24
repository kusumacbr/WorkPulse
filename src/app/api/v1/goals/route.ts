import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { GoalService } from "@/server/services/goal-service";

export async function GET(req: NextRequest) {
  try {
    const { user, actor } = await getSessionActor(req);
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId") || actor.employeeId || user.id;

    const data = await GoalService.getWeeklyGoals({ employeeId });
    return apiSuccess({ ...data });
  } catch (err: any) {
    return apiError(err.message || "Failed to list goals", 400);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, actor } = await getSessionActor(req);
    const body = await req.json().catch(() => ({}));
    const employeeId = body.employeeId || actor.employeeId || user.id;

    const today = new Date().toISOString().split("T")[0]!;
    const goal = await GoalService.createWeeklyGoal({
      actor,
      employeeId,
      input: {
        title: body.title,
        description: body.description,
        category: body.category || "ENGINEERING",
        measurableOutcome: body.measurableOutcome || "100% Sprint Delivery",
        targetValue: body.targetValue || 100,
        targetUnit: body.targetUnit || "%",
        weight: Number(body.weight || body.weightage) || 30,
        priority: body.priority || "MEDIUM",
        startDate: body.startDate || today,
        endDate: body.endDate || today,
        evidenceRequired: false,
        managerApprovalRequired: false,
      },
    });

    return apiSuccess({ goal, message: "Goal created successfully" }, 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to create goal", 400);
  }
}
