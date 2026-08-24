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
  const reqItem = state.leaveRequests.find((r) => r.id === id);
  if (!reqItem) return apiError(`Leave request '${id}' not found`, 404, "NOT_FOUND");

  try {
    const body = await req.json().catch(() => ({}));
    state.hrRejectLeave(id, body.reason || "Rejected by Reviewer");

    await AuditService.record({
      actorId: actor.userId,
      action: "leave_rejected",
      entity: "LeaveRequest",
      entityId: id,
      reason: body.reason,
    });

    return apiSuccess({ request: reqItem, message: "Leave request rejected." });
  } catch {
    return apiError("Invalid request", 400, "BAD_REQUEST");
  }
}
