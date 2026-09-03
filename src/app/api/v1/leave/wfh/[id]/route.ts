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
    await getSessionActor(req);

    // 1. Delete from in-memory / shared store
    WorkpulseSharedStore.deleteWfhRequest(id);

    // 2. Delete from Supabase if available
    try {
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin) {
        await supabaseAdmin.from("wfh_requests").delete().eq("id", id);
      }
    } catch (dbErr) {
      console.warn("[WFH DELETE API] Supabase delete warning:", dbErr);
    }

    return apiSuccess({ success: true, id, message: "WFH request permanently deleted" });
  } catch (err: any) {
    return apiError(err.message || "Failed to delete WFH request", 400);
  }
}
