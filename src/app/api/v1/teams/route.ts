import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { workpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export async function GET() {
  const departments = workpulseSharedStore.getState().departments;
  const teams = departments.map((d: any) => ({
    id: `team-${d.id}`,
    name: `${d.name} Team`,
    departmentId: d.id,
    departmentName: d.name,
    lead: d.head,
    memberCount: d.employees.length + 1,
  }));
  return apiSuccess({ teams, total: teams.length });
}

export async function POST(req: NextRequest) {
  const { actor } = await getSessionActor(req);
  if (!actor.roles.includes("HR")) {
    return apiError("Forbidden: Only HR can create teams.", 403, "FORBIDDEN");
  }

  try {
    const body = await req.json();
    if (!body.name || !body.departmentId) {
      return apiError("Missing required fields: name, departmentId", 422, "VALIDATION_FAILED");
    }

    const newTeam = {
      id: `team-${Date.now()}`,
      name: body.name,
      departmentId: body.departmentId,
      leadEmployeeId: body.leadEmployeeId || null,
    };

    return apiSuccess({ team: newTeam, message: "Team created." }, 201);
  } catch {
    return apiError("Invalid request body", 400, "BAD_REQUEST");
  }
}
