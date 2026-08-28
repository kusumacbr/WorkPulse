import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { workpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export async function GET() {
  const departments = workpulseSharedStore.getState().departments;
  return apiSuccess({ departments, total: departments.length });
}

export async function POST(req: NextRequest) {
  const { actor } = await getSessionActor(req);
  if (!actor.roles.includes("HR")) {
    return apiError("Forbidden: Only HR can create departments.", 403, "FORBIDDEN");
  }

  try {
    const body = await req.json();
    if (!body.name || !body.code) {
      return apiError("Missing required department fields: name, code", 422, "VALIDATION_FAILED");
    }

    const state = workpulseSharedStore.getState();
    const newDept = {
      id: `dept-${Date.now()}`,
      name: body.name,
      shortName: body.code,
      head: body.head || "Department Head",
      employees: [],
    };

    state.departments.push(newDept as any);
    return apiSuccess({ department: newDept, message: "Department created." }, 201);
  } catch {
    return apiError("Invalid request body", 400, "BAD_REQUEST");
  }
}
