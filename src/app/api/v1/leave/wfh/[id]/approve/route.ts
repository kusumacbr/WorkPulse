import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user } = await getSessionActor(req);
    const body = await req.json().catch(() => ({}));
    const isExplicitStage2 = body.stage === "STAGE_2" || Boolean(body.hrComment);
    const isExplicitStage1 = body.stage === "STAGE_1" || Boolean(body.tlComment);

    const supabaseAdmin = createAdminClient();

    let currentStatus = "PENDING_TL_STAGE_1";
    if (supabaseAdmin) {
      const { data: existing } = await supabaseAdmin.from("wfh_requests").select("status").eq("id", id).maybeSingle();
      if (existing?.status) currentStatus = existing.status;
    } else {
      const reqFromStore = WorkpulseSharedStore.getWfhRequests().find((r) => r.id === id);
      if (reqFromStore?.status) currentStatus = reqFromStore.status;
    }

    const isStage2Action = isExplicitStage2 || (!isExplicitStage1 && (currentStatus === "FORWARDED_TO_HR" || currentStatus === "PENDING_HR"));

    if (isStage2Action) {
      // HR Stage 2 Final Approval for WFH
      WorkpulseSharedStore.hrApproveWfh(id, body.comment || body.hrComment);

      if (supabaseAdmin) {
        await supabaseAdmin
          .from("wfh_requests")
          .update({
            status: "APPROVED",
            hr_approver_name: user.name || "HR Admin",
            hr_approved_at: new Date().toISOString(),
            hr_comment: body.comment || body.hrComment || "Final HR Approval granted for remote workday.",
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
      }

      return apiSuccess({ message: "WFH approved by HR (Stage 2)." }, 200);
    } else {
      // TL Stage 1 Approval -> Forwarded to HR
      WorkpulseSharedStore.tlApproveWfh(id, body.comment || body.tlComment, user.name);

      if (supabaseAdmin) {
        await supabaseAdmin
          .from("wfh_requests")
          .update({
            status: "FORWARDED_TO_HR",
            tl_approver_name: user.name || "Team Lead",
            tl_approved_at: new Date().toISOString(),
            tl_comment: body.comment || body.tlComment || "Approved by Team Lead. Forwarded to HR for final sign-off.",
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
      }

      return apiSuccess({ message: "WFH approved by TL (Stage 1). Forwarded to HR." }, 200);
    }
  } catch (err: any) {
    return apiError(err.message || "Failed to approve WFH", 400);
  }
}
