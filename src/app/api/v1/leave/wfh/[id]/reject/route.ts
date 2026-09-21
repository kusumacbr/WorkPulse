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
    const reason = body.reason || "WFH request rejected";
    const isHr = actor.roles.includes("HR");
    const existingReq = WorkpulseSharedStore.getWfhRequests().find((r) => r.id === id);
    const isStage2 =
      isHr ||
      body.stage === "STAGE_2" ||
      existingReq?.status === "FORWARDED_TO_HR" ||
      (existingReq?.status as string) === "PENDING_HR" ||
      (existingReq?.status as string) === "STAGE_2";

    const supabaseAdmin = createAdminClient();

    if (isStage2) {
      WorkpulseSharedStore.hrRejectWfh(id, reason);

      if (supabaseAdmin) {
        await supabaseAdmin
          .from("wfh_requests")
          .update({
            status: "REJECTED",
            hr_approver_name: user.name || "HR Admin",
            hr_approved_at: new Date().toISOString(),
            rejection_reason: reason,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
      }
    } else {
      WorkpulseSharedStore.tlRejectWfh(id, reason);

      if (supabaseAdmin) {
        await supabaseAdmin
          .from("wfh_requests")
          .update({
            status: "REJECTED",
            tl_approver_name: user.name || "Team Lead",
            tl_approved_at: new Date().toISOString(),
            rejection_reason: reason,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
      }
    }

    return apiSuccess({ message: "WFH request rejected" }, 200);
  } catch (err: any) {
    return apiError(err.message || "Failed to reject WFH", 400);
  }
}
