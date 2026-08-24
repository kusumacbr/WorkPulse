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

  reqItem.status = "CANCELLED" as any;

  await AuditService.record({
    actorId: actor.userId,
    action: "leave_cancelled",
    entity: "LeaveRequest",
    entityId: id,
    reason: "Cancelled by requester",
  });

  return apiSuccess({ request: reqItem, message: "Leave request cancelled." });
}
