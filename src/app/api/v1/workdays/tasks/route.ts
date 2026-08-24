import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { assertAuthorized } from "@/lib/authorization/authorize";
import { PERMISSIONS } from "@/lib/authorization/permissions";

export async function PATCH(req: NextRequest) {
  try {
    const { actor } = await getSessionActor(req);
    const body = await req.json().catch(() => ({}));
    const { taskId, completionPercentage, status, delayReason, blockerReference } = body;

    if (!taskId) {
      return apiError("taskId is required", 400);
    }

    await assertAuthorized({
      actor,
      permission: PERMISSIONS.DAILY_TASK_UPDATE,
      resource: { employeeId: actor.employeeId || actor.userId },
    });

    const updatedTask = {
      id: taskId,
      completionPercentage: completionPercentage ?? 100,
      status: status || (completionPercentage === 100 ? "COMPLETED" : "IN_PROGRESS"),
      delayReason: delayReason || null,
      blockerReference: blockerReference || null,
      updatedAt: new Date().toISOString(),
    };

    return apiSuccess({ task: updatedTask, message: "Task updated successfully" }, 200);
  } catch (err: any) {
    return apiError(err.message || "Failed to update task", 400);
  }
}
