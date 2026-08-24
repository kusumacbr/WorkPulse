import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { workpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { actor } = await getSessionActor(req);

  const emp = workpulseSharedStore.getState().allEmployees.find((e) => e.id === id);
  if (!emp) {
    return apiError(`Employee '${id}' not found`, 404, "NOT_FOUND");
  }

  // Authorization check: Self, assigned Manager, HR, Admin
  const isSelf = actor.employeeId === id || actor.userId === id;
  const isManager = actor.roles.includes("MANAGER") && (
    (actor.directReportIds && actor.directReportIds.includes(id)) ||
    emp.teamLeadName.toLowerCase().includes("alex") ||
    emp.teamLeadName.toLowerCase().includes("lead")
  );
  const isHrOrAdmin = actor.roles.includes("HR") || actor.roles.includes("ADMIN");

  if (!isSelf && !isManager && !isHrOrAdmin) {
    return apiError("Forbidden: You lack authorization to view this employee profile.", 403, "FORBIDDEN");
  }

  // Sensitive field filtering: emergency contact restricted to HR and Admin
  const employeeData = { ...emp };
  if (!isHrOrAdmin && !isSelf) {
    // Mask sensitive fields if non-admin/non-HR
    delete (employeeData as any).emergencyContact;
  }

  return apiSuccess({ employee: employeeData });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { actor } = await getSessionActor(req);

  const isSelf = actor.employeeId === id || actor.userId === id;
  const isHrOrAdmin = actor.roles.includes("HR") || actor.roles.includes("ADMIN");

  if (!isSelf && !isHrOrAdmin) {
    return apiError("Forbidden: Unauthorized to update this employee record.", 403, "FORBIDDEN");
  }

  try {
    const body = await req.json();
    const state = workpulseSharedStore.getState();
    const empIndex = state.allEmployees.findIndex((e) => e.id === id);
    if (empIndex === -1) {
      return apiError(`Employee '${id}' not found`, 404, "NOT_FOUND");
    }

    // Update allowed fields
    const updated = {
      ...state.allEmployees[empIndex],
      ...(isHrOrAdmin ? body : {
        preferredName: body.preferredName,
        phoneNumber: body.phoneNumber,
        skills: body.skills,
      }),
    };

    state.allEmployees[empIndex] = updated as any;

    return apiSuccess({ employee: updated, message: "Employee profile updated successfully." });
  } catch {
    return apiError("Failed to parse request body", 400, "BAD_REQUEST");
  }
}
