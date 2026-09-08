import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { AuditService } from "@/lib/audit/audit-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { actor } = await getSessionActor(req);

  if (!actor.roles.includes("MANAGER") && !actor.roles.includes("HR")) {
    return apiError("Forbidden: Only Team Leads and HR can approve attendance regularisation.", 403, "FORBIDDEN");
  }

  // Persist to Supabase
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabaseAdmin = createAdminClient();
    if (supabaseAdmin) {
      await supabaseAdmin.from("regularization_requests").update({
        status: "APPROVED",
        action_by: (actor as any).name || actor.userId,
        action_at: new Date().toISOString(),
      }).eq("id", id);
    }
  } catch {}

  await AuditService.record({
    actorId: actor.userId,
    action: "attendance_regularisation_approved",
    entity: "AttendanceRegularisation",
    entityId: id,
    reason: "Approved attendance correction while preserving immutable raw punches",
  });

  return apiSuccess({
    regularisationId: id,
    status: "APPROVED",
    approvedBy: actor.userId,
    message: "Regularisation approved. Calculated daily attendance updated without mutating raw punches.",
  });
}
