import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { workpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { AuditService } from "@/lib/audit/audit-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { actor } = await getSessionActor(req);

  const state = workpulseSharedStore.getState();
  const reqItem = state.leaveRequests.find((r: any) => r.id === id);
  if (!reqItem) return apiError(`Leave request '${id}' not found`, 404, "NOT_FOUND");

  // Prevent employee approving own request
  if (actor.employeeId === reqItem.employeeId && !actor.roles.includes("ADMIN")) {
    return apiError("Forbidden: You cannot approve your own leave application.", 403, "FORBIDDEN");
  }

  const body = await req.json().catch(() => ({}));

  if (reqItem.status === "PENDING_TL_STAGE_1" || (reqItem.status as string) === "PENDING_MANAGER") {
    if (!actor.roles.includes("MANAGER") && !actor.roles.includes("ADMIN")) {
      return apiError("Forbidden: Only Managers or Admin can provide Stage 1 approval.", 403, "FORBIDDEN");
    }
    state.leadApproveLeave(id, body.comment || "Approved by Manager");
    await AuditService.record({
      actorId: actor.userId,
      action: "leave_stage1_approved",
      entity: "LeaveRequest",
      entityId: id,
      reason: body.comment,
    });
    return apiSuccess({ request: reqItem, status: "FORWARDED_TO_HR", message: "Stage 1 approved. Forwarded to HR." });
  } else if (reqItem.status === "FORWARDED_TO_HR" || (reqItem.status as string) === "PENDING_HR") {
    if (!actor.roles.includes("HR") && !actor.roles.includes("ADMIN")) {
      return apiError("Forbidden: Only HR or Admin can provide final Stage 2 approval.", 403, "FORBIDDEN");
    }
    state.hrApproveLeave(id, body.comment || "Approved by HR");
    await AuditService.record({
      actorId: actor.userId,
      action: "leave_stage2_approved",
      entity: "LeaveRequest",
      entityId: id,
      reason: body.comment,
    });
    return apiSuccess({ request: reqItem, status: "APPROVED", message: "Final HR approval granted." });
  }

  return apiError(`Cannot approve leave in status '${reqItem.status}'`, 409, "INVALID_STATE");
}
