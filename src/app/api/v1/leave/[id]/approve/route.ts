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
    const isHr = actor.roles.includes("HR");

    let result;
    if (isHr) {
      result = await LeaveService.hrReviewLeave({
        actor,
        input: {
          requestId: id,
          action: "APPROVE",
          comment: body.comment || "Approved by HR People Ops",
        },
      });
      WorkpulseSharedStore.hrApproveLeave(id, body.comment);
    } else {
      result = await LeaveService.managerReviewLeave({
        actor,
        input: {
          requestId: id,
          action: "APPROVE",
          comment: body.comment || "Approved by Team Lead",
        },
      });
      WorkpulseSharedStore.tlApproveLeave(id, body.comment);
    }

    return apiSuccess({ result, message: "Leave approved successfully" }, 200);
  } catch (err: any) {
    return apiError(err.message || "Failed to approve leave", 400);
  }
}
