import { NextRequest } from "next/server";
import { apiSuccess, getSessionActor } from "@/server/api-helpers";
import { workpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const { actor } = await getSessionActor(req);
    const supabaseAdmin = createAdminClient();

    if (supabaseAdmin) {
      const { data } = await supabaseAdmin
        .from("biometric_punches")
        .select("*")
        .eq("employee_id", actor.employeeId)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        const mapped = data.map((p) => ({
          id: p.id,
          employeeId: p.employee_id,
          time: new Date(p.punch_time || p.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          direction: p.punch_type,
          method: p.method || "BIOMETRIC",
          location: p.location || "Bangalore HQ",
          status: p.status || "VERIFIED",
        }));
        return apiSuccess({ punches: mapped, total: mapped.length });
      }
    }
  } catch {}

  const punches = workpulseSharedStore.getState().myPunches;
  return apiSuccess({ punches, total: punches.length });
}
