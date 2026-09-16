import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { workpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { AuditService } from "@/lib/audit/audit-service";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, actor } = await getSessionActor(req);
  const body = await req.json().catch(() => ({}));
  const isHr = actor.roles.includes("HR");

  const state = workpulseSharedStore.getState();
  const reqItem = state.wfhRequests.find((r: any) => r.id === id);
  if (!reqItem) return apiError(`WFH request '${id}' not found`, 404, "NOT_FOUND");

  const supabaseAdmin = createAdminClient();

  if (isHr) {
    state.hrApproveWfh(id, body.comment || "Authorized by HR People Ops");
    // Update employee work mode to WFH
    const emp = state.allEmployees.find((e: any) => e.id === reqItem.employeeId);
    if (emp) {
      emp.workMode = "WFH";
    }

    // Persist to Supabase
    if (supabaseAdmin) {
      await supabaseAdmin.from("wfh_requests").update({
        status: "APPROVED",
        hr_approver_name: user.name || "HR Admin",
        hr_approved_at: new Date().toISOString(),
        hr_comment: body.comment || "Authorized by HR People Ops",
        updated_at: new Date().toISOString(),
      }).eq("id", id);

      // Update employee work mode in Supabase
      if (reqItem.employeeId) {
        await supabaseAdmin.from("employees").update({
          work_mode: "WFH",
          updated_at: new Date().toISOString(),
        }).eq("id", reqItem.employeeId);
      }
    }
  } else {
    state.tlApproveWfh(id, body.comment || "Approved by Team Lead. Forwarded to HR.");

    // Persist to Supabase
    if (supabaseAdmin) {
      await supabaseAdmin.from("wfh_requests").update({
        status: "FORWARDED_TO_HR",
        tl_approver_name: user.name || "Team Lead",
        tl_approved_at: new Date().toISOString(),
        tl_comment: body.comment || "Approved by Team Lead. Forwarded to HR for final sign-off.",
        updated_at: new Date().toISOString(),
      }).eq("id", id);
    }
  }

  await AuditService.record({
    actorId: actor.userId,
    action: isHr ? "wfh_authorized_by_hr" : "wfh_approved_by_lead",
    entity: "WfhRequest",
    entityId: id,
    reason: isHr ? "Stage-2 HR authorization" : "Stage-1 Team Lead review",
  });

  return apiSuccess({
    request: reqItem,
    message: isHr
      ? "WFH request authorized by HR. Work mode set to WFH."
      : "WFH request approved by Lead and forwarded to HR for final sign-off.",
  });
}
