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

  if (!actor.roles.includes("HR")) {
    return apiError("Forbidden: Only HR can configure manager assignments.", 403, "FORBIDDEN");
  }

  try {
    const body = await req.json();
    if (!body.managerId) {
      return apiError("Missing managerId parameter", 422, "VALIDATION_FAILED");
    }

    const state = workpulseSharedStore.getState();
    const emp = state.allEmployees.find((e) => e.id === id);
    if (!emp) {
      return apiError(`Employee '${id}' not found`, 404, "NOT_FOUND");
    }

    const prevLead = emp.teamLeadName;
    emp.teamLeadName = body.managerName || "Assigned Lead";

    await AuditService.record({
      actorId: actor.userId,
      action: "manager_assigned",
      entity: "ManagerAssignment",
      entityId: `${id}:${body.managerId}`,
      reason: `Changed reporting line for ${emp.name} from ${prevLead} to ${emp.teamLeadName}`,
      beforeState: { manager: prevLead },
      afterState: { manager: emp.teamLeadName },
    });

    return apiSuccess({
      assignment: {
        id: `mga-${Date.now()}`,
        employeeId: id,
        managerId: body.managerId,
        managerName: emp.teamLeadName,
        isPrimary: body.isPrimary !== false,
        startDate: body.startDate || new Date().toISOString().split("T")[0],
      },
      message: "Manager assignment updated.",
    }, 201);
  } catch {
    return apiError("Invalid request payload", 400, "BAD_REQUEST");
  }
}
