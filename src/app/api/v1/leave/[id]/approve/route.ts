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
    const { user, actor } = await getSessionActor(req);
    const body = await req.json().catch(() => ({}));
    const isHr = actor.roles.includes("HR");
    const existingReq = WorkpulseSharedStore.getLeaveRequests().find((r) => r.id === id);
    const isStage2 =
      isHr ||
      body.stage === "STAGE_2" ||
      existingReq?.status === "FORWARDED_TO_HR" ||
      (existingReq?.status as string) === "PENDING_HR" ||
      (existingReq?.status as string) === "STAGE_2";

    const supabaseAdmin = createAdminClient();

    if (isStage2) {
      // HR Stage 2 Final Approval
      WorkpulseSharedStore.hrApproveLeave(id, body.comment);

      // Persist to Supabase
      if (supabaseAdmin) {
        // Update leave request status
        await supabaseAdmin
          .from("leave_requests")
          .update({
            status: "APPROVED",
            hr_approver_name: user.name || "HR Admin",
            hr_approved_at: new Date().toISOString(),
            hr_comment: body.comment || "Final HR Approval granted.",
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        // Deduct leave balance from employee record
        const { data: leaveReq } = await supabaseAdmin
          .from("leave_requests")
          .select("employee_id, days_count, remaining_balance")
          .eq("id", id)
          .maybeSingle();

        if (leaveReq) {
          const newBalance = Math.max(0, Number(leaveReq.remaining_balance || 12) - Number(leaveReq.days_count || 1));
          // Update the leave request's remaining balance
          await supabaseAdmin
            .from("leave_requests")
            .update({ remaining_balance: newBalance })
            .eq("id", id);

          // Update the employee's leave balance
          await supabaseAdmin
            .from("employees")
            .update({
              leave_balance: newBalance,
              updated_at: new Date().toISOString(),
            })
            .eq("id", leaveReq.employee_id);
        }
      }

      return apiSuccess({ message: "Leave approved by HR (Stage 2). Balance deducted." }, 200);
    } else {
      // TL Stage 1 Approval — forward to HR
      WorkpulseSharedStore.tlApproveLeave(id, body.comment, user.name);

      // Persist to Supabase
      if (supabaseAdmin) {
        await supabaseAdmin
          .from("leave_requests")
          .update({
            status: "FORWARDED_TO_HR",
            tl_approver_name: user.name || "Team Lead",
            tl_approved_at: new Date().toISOString(),
            tl_comment: body.comment || "Approved by Team Lead. Forwarded to HR for final sign-off.",
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
      }

      return apiSuccess({ message: "Leave approved by TL (Stage 1). Forwarded to HR." }, 200);
    }
  } catch (err: any) {
    return apiError(err.message || "Failed to approve leave", 400);
  }
}
