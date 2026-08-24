import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/server/api-helpers";
import { workpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export async function GET(_req: NextRequest) {
  const goals = workpulseSharedStore.getState().weeklyGoals;
  return apiSuccess({ goals, total: goals.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title) {
      return apiError("Missing required field: title", 422, "VALIDATION_FAILED");
    }

    const state = workpulseSharedStore.getState();
    const newGoal = {
      id: `goal-${Date.now()}`,
      title: body.title,
      description: body.description || "",
      category: body.category || "ENGINEERING",
      measurableOutcome: body.measurableOutcome || "Complete deliverables",
      weightage: body.weightage || body.weight || 20,
      priority: body.priority || "MEDIUM",
      status: "IN_PROGRESS" as const,
      progressPercentage: 0,
      currentValue: 0,
      targetValue: body.targetValue || 100,
      evidenceRequired: Boolean(body.evidenceRequired),
    };

    state.weeklyGoals.push(newGoal as any);

    return apiSuccess({ goal: newGoal, message: "Weekly goal created." }, 201);
  } catch {
    return apiError("Invalid request payload", 400, "BAD_REQUEST");
  }
}
