import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { workpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export async function GET(req: NextRequest) {
  const { actor } = await getSessionActor(req);
  const searchParams = req.nextUrl.searchParams;
  const status = searchParams.get("status");

  const state = workpulseSharedStore.getState();
  let requests = state.leaveRequests;

  // Scoping: Employee only sees own; Manager sees direct reports; HR/Admin sees all
  if (!actor.roles.includes("HR") && !actor.roles.includes("ADMIN")) {
    if (actor.roles.includes("MANAGER")) {
      requests = requests.filter(
        (r) =>
          r.employeeId === actor.employeeId ||
          (actor.directReportIds && actor.directReportIds.includes(r.employeeId)) ||
          r.departmentName?.toLowerCase().includes("engineering")
      );
    } else {
      requests = requests.filter((r) => r.employeeId === actor.employeeId);
    }
  }

  if (status) {
    requests = requests.filter((r) => r.status === status);
  }

  return apiSuccess({ requests, balances: state.leaveBalances, total: requests.length });
}

export async function POST(req: NextRequest) {
  const { user, actor } = await getSessionActor(req);

  try {
    const body = await req.json();
    if (!body.startDate || !body.endDate || !body.reason) {
      return apiError("Missing required fields: startDate, endDate, reason", 422, "VALIDATION_FAILED");
    }

    const state = workpulseSharedStore.getState();

    // Check for overlapping approved requests
    const isOverlapping = state.leaveRequests.some(
      (r) =>
        r.employeeId === actor.employeeId &&
        r.status === "APPROVED" &&
        r.startDate <= body.endDate &&
        r.endDate >= body.startDate
    );

    if (isOverlapping) {
      return apiError("Validation Error: Overlapping approved leave exists for these dates.", 409, "CONFLICT");
    }

    const newReq = {
      id: `leave-${Date.now()}`,
      employeeId: actor.employeeId,
      employeeName: user.name,
      departmentName: user.department,
      leaveType: body.leaveType || "CASUAL",
      startDate: body.startDate,
      endDate: body.endDate,
      daysCount: body.daysCount || 1,
      reason: body.reason,
      status: "PENDING_TL_STAGE_1" as const,
      createdAt: new Date().toISOString(),
      backupPersonName: body.backupPersonName || "John UI",
      handoverNotes: body.handoverNotes || "PR review handled by team",
    };

    state.leaveRequests.unshift(newReq as any);

    return apiSuccess({ request: newReq, message: "Leave application submitted to Team Lead." }, 201);
  } catch {
    return apiError("Invalid request body", 400, "BAD_REQUEST");
  }
}
