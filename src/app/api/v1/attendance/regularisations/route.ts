import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { AuditService } from "@/lib/audit/audit-service";

const inMemoryRegularisations: any[] = [];

export async function GET() {
  return apiSuccess({ regularisations: inMemoryRegularisations, total: inMemoryRegularisations.length });
}

export async function POST(req: NextRequest) {
  const { user, actor } = await getSessionActor(req);

  try {
    const body = await req.json();
    if (!body.proposedCheckIn || !body.proposedCheckOut || !body.reason) {
      return apiError("Missing required fields: proposedCheckIn, proposedCheckOut, reason", 422, "VALIDATION_FAILED");
    }

    const reg = {
      id: `reg-${Date.now()}`,
      employeeId: actor.employeeId,
      employeeName: user.name,
      workDate: body.workDate || new Date().toISOString().split("T")[0],
      proposedCheckIn: body.proposedCheckIn,
      proposedCheckOut: body.proposedCheckOut,
      reason: body.reason,
      evidenceUrl: body.evidenceUrl || null,
      status: "PENDING_MANAGER",
      createdAt: new Date().toISOString(),
    };

    inMemoryRegularisations.unshift(reg);

    await AuditService.record({
      actorId: actor.userId,
      action: "attendance_regularisation_requested",
      entity: "AttendanceRegularisation",
      entityId: reg.id,
      reason: reg.reason,
    });

    return apiSuccess({ regularisation: reg, message: "Attendance regularisation request submitted." }, 201);
  } catch {
    return apiError("Invalid request body", 400, "BAD_REQUEST");
  }
}
