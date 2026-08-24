import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { workpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export async function GET(_req: NextRequest) {
  const state = workpulseSharedStore.getState();
  return apiSuccess({ requests: state.wfhRequests, total: state.wfhRequests.length });
}

export async function POST(req: NextRequest) {
  const { user, actor } = await getSessionActor(req);

  try {
    const body = await req.json();
    if (!body.startDate || !body.endDate || !body.reason) {
      return apiError("Missing required fields: startDate, endDate, reason", 422, "VALIDATION_FAILED");
    }

    const state = workpulseSharedStore.getState();
    const newReq = {
      id: `wfh-${Date.now()}`,
      employeeId: actor.employeeId,
      employeeName: user.name,
      departmentName: user.department,
      startDate: body.startDate,
      endDate: body.endDate,
      daysCount: body.daysCount || 1,
      reason: body.reason,
      deliverables: body.deliverables || body.plannedDeliverables || "Architecture documentation",
      availabilityHours: body.availabilityHours || "10:00 AM - 07:00 PM",
      contactMethod: body.contactMethod || "Slack & Google Meet",
      status: "FORWARDED_TO_HR" as const,
      createdAt: new Date().toISOString(),
    };

    state.wfhRequests.unshift(newReq as any);

    return apiSuccess({ request: newReq, message: "Work-from-home request submitted." }, 201);
  } catch {
    return apiError("Invalid request body", 400, "BAD_REQUEST");
  }
}
