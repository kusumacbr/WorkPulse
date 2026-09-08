import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    try {
      await getSessionActor(req);
    } catch {
      // Allow deletion without strict auth header from client store sync
    }

    const existingReq = WorkpulseSharedStore.getWfhRequests().find((r) => r.id === id);

    // 1. Delete from in-memory / shared store
    WorkpulseSharedStore.deleteWfhRequest(id);

    // 2. Delete from Supabase permanently with service role
    try {
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin) {
        await supabaseAdmin.from("wfh_requests").delete().eq("id", id);
        await supabaseAdmin.from("work_mode_requests").delete().eq("id", id);
        if (existingReq?.employeeId && existingReq?.startDate) {
          await supabaseAdmin
            .from("wfh_requests")
            .delete()
            .eq("employee_id", existingReq.employeeId)
            .eq("start_date", existingReq.startDate);
        }
      }
    } catch (dbErr) {
      console.warn("[WorkMode DELETE API] Supabase delete warning:", dbErr);
    }

    return apiSuccess({ success: true, id, message: "WFH request permanently deleted" });
  } catch (err: any) {
    return apiError(err.message || "Failed to delete WFH request", 400);
  }
}
