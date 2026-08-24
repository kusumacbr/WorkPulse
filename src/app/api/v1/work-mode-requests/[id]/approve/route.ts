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
  const reqItem = state.wfhRequests.find((r: any) => r.id === id);
  if (!reqItem) return apiError(`WFH request '${id}' not found`, 404, "NOT_FOUND");

  state.hrApproveWfh(id, "Approved by Manager/HR");

  // Update employee work mode
  const emp = state.allEmployees.find((e: any) => e.id === reqItem.employeeId);
  if (emp) {
    emp.workMode = "WFH";
  }

  await AuditService.record({
    actorId: actor.userId,
    action: "wfh_approved",
    entity: "WfhRequest",
    entityId: id,
    reason: "Approved WFH request and updated work mode",
  });

  return apiSuccess({ request: reqItem, message: "WFH request approved. Work mode set to WFH." });
}
