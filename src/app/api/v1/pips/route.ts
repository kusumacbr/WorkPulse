import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { PipService } from "@/server/services/coaching-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { actor } = await getSessionActor(req);

  // PIP confidentiality: only employee self, assigned manager, HR, Admin
  const pips = [
    {
      id: "pip-sample-1",
      employeeId: "emp-rohit",
      employeeName: "Rohit Sharma",
      managerId: "lead-alex",
      managerName: "Alex Lead",
      reason: "Latency in sprint UI delivery commitments",
      performanceConcerns: "Missed 2 sprint delivery deadlines due to unestimated component work",
      measurableGoals: "Deliver all assigned Jira tickets within estimated story points",
      supportOffered: "Daily 15-minute unblocking and pair programming with Senior Backend Lead",
      startDate: "2026-08-01",
      endDate: "2026-09-30",
      checkInFrequency: "WEEKLY",
      status: "ACTIVE",
      employeeAcknowledgedAt: "2026-08-03T10:00:00Z",
      checkpoints: [
        {
          id: "chk-1",
          checkpointDate: "2026-08-10",
          notes: "Positive improvement in sprint ticket turnaround",
          isImproving: true,
        },
      ],
    },
  ];

  const visiblePips = pips.filter((p) => {
    if (actor.roles.includes("HR") || actor.roles.includes("ADMIN")) return true;
    if (actor.roles.includes("MANAGER") && p.managerId === actor.employeeId) return true;
    if (p.employeeId === actor.employeeId) return true;
    return false;
  });

  return apiSuccess({ pips: visiblePips, total: visiblePips.length });
}

export async function POST(req: NextRequest) {
  const { actor } = await getSessionActor(req);
  if (!actor.roles.includes("MANAGER") && !actor.roles.includes("HR") && !actor.roles.includes("ADMIN")) {
    return apiError("Forbidden: Only Managers, HR, and Admin can create PIP records.", 403, "FORBIDDEN");
  }

  try {
    const body = await req.json();
    const pip = await PipService.createPip({
      actor,
      input: {
        employeeId: body.employeeId,
        reason: body.reason,
        performanceConcerns: body.performanceConcerns,
        measurableGoals: body.measurableGoals,
        supportOffered: body.supportOffered,
        startDate: body.startDate,
        endDate: body.endDate,
        checkInFrequency: body.checkInFrequency,
      },
    });

    return apiSuccess({ pip, message: "Performance Improvement Plan (PIP) created." }, 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to create PIP", 400, "BAD_REQUEST");
  }
}
