import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { AuditService } from "@/lib/audit/audit-service";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { actor } = await getSessionActor(req);

  if (!actor.roles.includes("MANAGER") && !actor.roles.includes("HR")) {
    return apiError("Forbidden: Only Team Leads and HR can reject attendance regularisation.", 403, "FORBIDDEN");
  }

  const body = await req.json().catch(() => ({}));
  const rejectionReason = body.reason || "Rejected during attendance audit.";

  // Persist to Supabase
  try {
    const supabaseAdmin = createAdminClient();
    if (supabaseAdmin) {
      await supabaseAdmin.from("regularization_requests").update({
        status: "REJECTED",
        rejection_reason: rejectionReason,
        action_by: (actor as any).name || actor.userId,
        action_at: new Date().toISOString(),
      }).eq("id", id);
    }
  } catch {}

  await AuditService.record({
    actorId: actor.userId,
    action: "attendance_regularisation_rejected",
    entity: "AttendanceRegularisation",
    entityId: id,
    reason: rejectionReason,
  });

  return apiSuccess({
    regularisationId: id,
    status: "REJECTED",
    rejectionReason,
    rejectedBy: actor.userId,
    message: "Regularisation request rejected.",
  });
}
