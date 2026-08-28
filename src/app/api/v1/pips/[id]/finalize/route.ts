import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { AuditService } from "@/lib/audit/audit-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { actor } = await getSessionActor(req);

  if (!actor.roles.includes("HR")) {
    return apiError("Forbidden: Only HR can finalize PIP outcomes.", 403, "FORBIDDEN");
  }

  try {
    const body = await req.json();

    await AuditService.record({
      actorId: actor.userId,
      action: "pip_finalized",
      entity: "PipRecord",
      entityId: id,
      reason: body.outcome || "PIP completed successfully",
    });

    return apiSuccess({
      pipId: id,
      status: body.status || "COMPLETED_SUCCESSFULLY",
      finalOutcome: body.outcome || "Employee met all performance benchmarks",
      message: "PIP finalized.",
    });
  } catch {
    return apiError("Invalid request body", 400, "BAD_REQUEST");
  }
}
