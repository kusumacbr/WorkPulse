import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { actor, user } = await getSessionActor(req);

  if (!actor.roles.includes("HR")) {
    return apiError("Forbidden: Only HR People Operations can decline profile change queries.", 403, "FORBIDDEN");
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    const text = await req.text();
    body = text ? JSON.parse(text) : {};
  }

  const reason = body.reason || body.remarks || "Declined: Information could not be verified by HR.";

  // Update in store
  const rejectedQuery = WorkpulseSharedStore.hrRejectProfileQuery(id, reason);

  // Persist rejection in Supabase feedbacks table
  try {
    const supabaseAdmin = createAdminClient();
    if (supabaseAdmin) {
      await supabaseAdmin
        .from("feedbacks")
        .update({
          eod_reviewed: false,
          lead_note: JSON.stringify({ status: "REJECTED", reason }),
        })
        .or(`id.eq.${id},author_name.eq.${id}`);
    }
  } catch (err: any) {
    console.warn("Supabase profile query rejection sync warning:", err.message);
  }

  return apiSuccess({
    query: rejectedQuery,
    message: `Profile change query declined by ${user.name || "HR Operations"}.`,
  });
}
