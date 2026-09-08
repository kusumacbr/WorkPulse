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
  const reqItem = state.leaveRequests.find((r) => r.id === id);
  if (!reqItem) return apiError(`Leave request '${id}' not found`, 404, "NOT_FOUND");

  try {
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || "Rejected by Reviewer";
    state.hrRejectLeave(id, reason);

    // Persist to Supabase
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin) {
        await supabaseAdmin.from("leave_requests").update({
          status: "REJECTED",
          rejection_reason: reason,
          hr_approver_name: (actor as any).name || "Reviewer",
          hr_approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq("id", id);
      }
    } catch {}

    await AuditService.record({
      actorId: actor.userId,
      action: "leave_rejected",
      entity: "LeaveRequest",
      entityId: id,
      reason: body.reason,
    });

    return apiSuccess({ request: reqItem, message: "Leave request rejected." });
  } catch {
    return apiError("Invalid request", 400, "BAD_REQUEST");
  }
}
