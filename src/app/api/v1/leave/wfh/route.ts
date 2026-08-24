import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { LeaveService } from "@/server/services/leave-service";
import { WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export async function GET(req: NextRequest) {
  try {
    await getSessionActor(req);
    const requests = WorkpulseSharedStore.getWfhRequests();
    return apiSuccess({ requests });
  } catch (err: any) {
    return apiError(err.message || "Failed to list WFH requests", 400);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, actor } = await getSessionActor(req);
    const body = await req.json().catch(() => ({}));
    const employeeId = body.employeeId || actor.employeeId || user.id;

    const request = await LeaveService.submitWfhRequest({
      actor,
      employeeId,
      input: {
        startDate: body.startDate || body.date,
        endDate: body.endDate || body.startDate || body.date,
        reason: body.reason || "Remote workday",
        plannedDeliverables: body.deliverables || body.plannedDeliverables || "Planned sprint deliverables",
      },
    });

    return apiSuccess({ request, message: "WFH request submitted and forwarded for approval" }, 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to apply for WFH", 400);
  }
}
