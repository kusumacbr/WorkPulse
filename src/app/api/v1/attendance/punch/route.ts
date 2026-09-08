import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { user } = await getSessionActor(req);
    const body = await req.json().catch(() => ({}));
    const employeeId = body.employeeId || user.email || "emp-sarah";
    const punchType = body.type || body.punchType || "IN";
    const timestamp = body.timestamp || new Date().toISOString();
    const terminalId = body.terminalId || "TERM-BLR-01";
    const workMode = body.workMode || "OFFICE";
    const today = new Date().toISOString().split("T")[0]!;

    const punch = {
      id: `punch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      employee_id: employeeId,
      employee_name: user.name || employeeId,
      punch_type: punchType,
      punch_time: timestamp,
      terminal_id: terminalId,
      location: "Bangalore HQ",
      method: "BIOMETRIC",
      status: "VERIFIED",
      raw_payload: {
        work_mode: workMode,
        employee_email: user.email || employeeId,
        date: today,
      },
    };

    // Persist to Supabase
    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { error } = await supabase.from("biometric_punches").insert(punch);
        if (error) {
          console.error("[Punch API] Supabase insert error:", error);
        }
      } catch (err) {
        console.warn("[Punch API] Supabase error:", err);
      }
    }

    const timeStr = new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    return apiSuccess({
      punch: {
        id: punch.id,
        employeeId,
        type: punchType,
        time: timeStr,
        terminalId,
        date: today,
        totalIngested: 1,
      },
      message: `Biometric Punch-${punchType} recorded at ${timeStr}`,
    }, 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to record punch", 400);
  }
}
