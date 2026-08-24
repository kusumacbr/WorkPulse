import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { LeaveService } from "@/server/services/leave-service";
import { WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export async function GET(req: NextRequest) {
  try {
    const { user, actor } = await getSessionActor(req);
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId") || actor.employeeId || user.id;

    const requests = WorkpulseSharedStore.getLeaveRequests();
    const balance = await LeaveService.getLeaveBalance({ employeeId });

    return apiSuccess({ requests, balance });
  } catch (err: any) {
    return apiError(err.message || "Failed to list leave requests", 400);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, actor } = await getSessionActor(req);
    const body = await req.json().catch(() => ({}));
    const employeeId = body.employeeId || actor.employeeId || user.id;

    const request = await LeaveService.submitLeaveRequest({
      actor,
      employeeId,
      input: {
        leaveType: body.leaveType || "CASUAL",
        startDate: body.startDate,
        endDate: body.endDate || body.startDate,
        isHalfDay: Boolean(body.isHalfDay),
        reason: body.reason || "Personal leave",
        handoverNotes: body.handoverNotes,
      },
    });

    return apiSuccess({ request, message: "Leave application submitted and forwarded for approval" }, 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to apply for leave", 400);
  }
}
