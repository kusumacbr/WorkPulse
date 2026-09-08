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
  const reqItem = state.leaveRequests.find((r: any) => r.id === id);
  if (!reqItem) return apiError(`Leave request '${id}' not found`, 404, "NOT_FOUND");

  // Prevent employee approving own request
  if (actor.employeeId === reqItem.employeeId) {
    return apiError("Forbidden: You cannot approve your own leave application.", 403, "FORBIDDEN");
  }

  const body = await req.json().catch(() => ({}));

  if (reqItem.status === "PENDING_TL_STAGE_1" || (reqItem.status as string) === "PENDING_MANAGER") {
    if (!actor.roles.includes("MANAGER")) {
      return apiError("Forbidden: Only Team Leads can provide Stage 1 approval.", 403, "FORBIDDEN");
    }
    state.leadApproveLeave(id, body.comment || "Approved by Manager");

    // Persist Stage 1 to Supabase
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin) {
        await supabaseAdmin.from("leave_requests").update({
          status: "FORWARDED_TO_HR",
          tl_approver_name: (actor as any).name || "Alex Lead (Team Lead)",
          tl_approved_at: new Date().toISOString(),
          tl_comment: body.comment || "Approved by Team Lead. Forwarded to HR.",
          updated_at: new Date().toISOString(),
        }).eq("id", id);
      }
    } catch {}

    await AuditService.record({
      actorId: actor.userId,
      action: "leave_stage1_approved",
      entity: "LeaveRequest",
      entityId: id,
      reason: body.comment,
    });
    return apiSuccess({ request: reqItem, status: "FORWARDED_TO_HR", message: "Stage 1 approved. Forwarded to HR." });
  } else if (reqItem.status === "FORWARDED_TO_HR" || (reqItem.status as string) === "PENDING_HR") {
    if (!actor.roles.includes("HR")) {
      return apiError("Forbidden: Only HR can provide final Stage 2 approval.", 403, "FORBIDDEN");
    }
    state.hrApproveLeave(id, body.comment || "Approved by HR");

    // Persist Stage 2 to Supabase
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin) {
        await supabaseAdmin.from("leave_requests").update({
          status: "APPROVED",
          hr_approver_name: (actor as any).name || "Rachel HR (People Ops)",
          hr_approved_at: new Date().toISOString(),
          hr_comment: body.comment || "Final HR Approval granted.",
          updated_at: new Date().toISOString(),
        }).eq("id", id);

        const { data: leaveData } = await supabaseAdmin.from("leave_requests").select("employee_id, days_count, remaining_balance").eq("id", id).maybeSingle();
        if (leaveData) {
          const newBal = Math.max(0, Number(leaveData.remaining_balance || 12) - Number(leaveData.days_count || 1));
          await supabaseAdmin.from("leave_requests").update({ remaining_balance: newBal }).eq("id", id);
          await supabaseAdmin.from("employees").update({ leave_balance: newBal }).eq("id", leaveData.employee_id);
        }
      }
    } catch {}

    await AuditService.record({
      actorId: actor.userId,
      action: "leave_stage2_approved",
      entity: "LeaveRequest",
      entityId: id,
      reason: body.comment,
    });
    return apiSuccess({ request: reqItem, status: "APPROVED", message: "Final HR approval granted." });
  }

  return apiError(`Cannot approve leave in status '${reqItem.status}'`, 409, "INVALID_STATE");
}
