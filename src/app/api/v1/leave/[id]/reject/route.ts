import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { LeaveService } from "@/server/services/leave-service";
import { WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { actor } = await getSessionActor(req);
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || "Application rejected";
    const isHr = actor.roles.includes("HR") || actor.roles.includes("ADMIN");

    let result;
    if (isHr) {
      result = await LeaveService.hrReviewLeave({
        actor,
        input: {
          requestId: id,
          action: "REJECT",
          rejectionReason: reason,
        },
      });
      WorkpulseSharedStore.hrRejectLeave(id, reason);
    } else {
      result = await LeaveService.managerReviewLeave({
        actor,
        input: {
          requestId: id,
          action: "REJECT",
          rejectionReason: reason,
        },
      });
      WorkpulseSharedStore.tlRejectLeave(id, reason);
    }

    return apiSuccess({ result, message: "Leave rejected" }, 200);
  } catch (err: any) {
    return apiError(err.message || "Failed to reject leave", 400);
  }
}
