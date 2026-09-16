import { NextRequest } from "next/server";
import { apiSuccess, getSessionActor } from "@/server/api-helpers";
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
  const isExplicitStage2 = body.stage === "STAGE_2" || Boolean(body.hrComment);
  const isExplicitStage1 = body.stage === "STAGE_1" || Boolean(body.tlComment);

  const state = workpulseSharedStore.getState();
  const reqItem = state.wfhRequests.find((r: any) => r.id === id);

  const supabaseAdmin = createAdminClient();

  let currentStatus: string = reqItem?.status || "PENDING_TL_STAGE_1";
  if (supabaseAdmin) {
    const { data: existing } = await supabaseAdmin.from("wfh_requests").select("status").eq("id", id).maybeSingle();
    if (existing?.status) currentStatus = existing.status;
  }

  const isStage2Action = isExplicitStage2 || (!isExplicitStage1 && (currentStatus === "FORWARDED_TO_HR" || currentStatus === "PENDING_HR"));

  if (isStage2Action) {
    state.hrApproveWfh(id, body.comment || body.hrComment || "Authorized by HR People Ops");
    // Update employee work mode to WFH
    const emp = state.allEmployees.find((e: any) => e.id === reqItem?.employeeId);
    if (emp) {
      emp.workMode = "WFH";
    }

    // Persist to Supabase
    if (supabaseAdmin) {
      await supabaseAdmin.from("wfh_requests").update({
        status: "APPROVED",
        hr_approver_name: user.name || "HR Admin",
        hr_approved_at: new Date().toISOString(),
        hr_comment: body.comment || body.hrComment || "Authorized by HR People Ops",
        updated_at: new Date().toISOString(),
      }).eq("id", id);

      // Update employee work mode in Supabase
      if (reqItem?.employeeId) {
        await supabaseAdmin.from("employees").update({
          work_mode: "WFH",
          updated_at: new Date().toISOString(),
        }).eq("id", reqItem.employeeId);
      }
    }
  } else {
    state.tlApproveWfh(id, body.comment || body.tlComment || "Approved by Team Lead. Forwarded to HR.", user.name);

    // Persist to Supabase
    if (supabaseAdmin) {
      await supabaseAdmin.from("wfh_requests").update({
        status: "FORWARDED_TO_HR",
        tl_approver_name: user.name || "Team Lead",
        tl_approved_at: new Date().toISOString(),
        tl_comment: body.comment || body.tlComment || "Approved by Team Lead. Forwarded to HR for final sign-off.",
        updated_at: new Date().toISOString(),
      }).eq("id", id);
    }
  }

  await AuditService.record({
    actorId: actor.userId,
    action: isStage2Action ? "wfh_authorized_by_hr" : "wfh_approved_by_lead",
    entity: "WfhRequest",
    entityId: id,
    reason: isStage2Action ? "Stage-2 HR authorization" : "Stage-1 Team Lead review",
  });

  return apiSuccess({
    request: reqItem,
    message: isStage2Action
      ? "WFH request authorized by HR. Work mode set to WFH."
      : "WFH request approved by Lead and forwarded to HR for final sign-off.",
  });
}
