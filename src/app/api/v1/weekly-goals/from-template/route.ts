import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { workpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { actor } = await getSessionActor(req);

  try {
    const body = await req.json();
    const { employeeId } = body;

    const targetEmpId = employeeId || actor.employeeId;
    const defaultTemplateGoals = [
      {
        id: `goal-tpl-${Date.now()}-1`,
        title: "Sprint Execution & High Quality Delivery",
        category: "ENGINEERING",
        measurableOutcome: "Zero high-priority regressions and on-time PR submissions",
        weightage: 50,
        priority: "HIGH" as const,
        status: "IN_PROGRESS" as const,
        progressPercentage: 0,
        currentValue: 0,
        targetValue: 100,
        evidenceRequired: true,
      },
      {
        id: `goal-tpl-${Date.now()}-2`,
        title: "Cross-functional Unblocking & Architecture Reviews",
        category: "COLLABORATION",
        measurableOutcome: "Complete PR code reviews within 4 hours",
        weightage: 50,
        priority: "MEDIUM" as const,
        status: "IN_PROGRESS" as const,
        progressPercentage: 0,
        currentValue: 0,
        targetValue: 100,
        evidenceRequired: false,
      },
    ];

    const state = workpulseSharedStore.getState();
    state.weeklyGoals.push(...(defaultTemplateGoals as any));

    return apiSuccess({
      goals: defaultTemplateGoals,
      message: `Assigned ${defaultTemplateGoals.length} template goals to ${targetEmpId}`,
    }, 201);
  } catch {
    return apiError("Invalid request body", 400, "BAD_REQUEST");
  }
}
