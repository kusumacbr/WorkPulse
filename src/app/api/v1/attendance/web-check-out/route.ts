import { NextRequest } from "next/server";
import { apiSuccess, getSessionActor } from "@/server/api-helpers";
import { WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const { user, actor } = await getSessionActor(req);
  const employeeId = actor.employeeId || user.id || "emp-sarah";

  WorkpulseSharedStore.virtualPunch(employeeId, "OUT");

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const todayDate = now.toISOString().split("T")[0]!;

  try {
    const supabaseAdmin = createAdminClient();
    if (supabaseAdmin) {
      await supabaseAdmin.from("biometric_punches").insert({
        employee_id: employeeId,
        employee_name: user.name || "Employee",
        punch_type: "OUT",
        terminal_id: "WEB-TERMINAL-01",
        location: "Web Check-Out Portal",
        method: "WEB_PORTAL",
        status: "VERIFIED",
      });

      // Also upsert to workdays table for presence synchronization
      await supabaseAdmin.from("workdays").upsert({
        id: `wd-${employeeId}-${todayDate}`,
        employee_id: employeeId,
        employee_name: user.name || "Employee",
        date: todayDate,
        work_mode: "OFFICE",
        eod_status: "SUBMITTED",
        eod_time: timeStr,
      });
    }
  } catch (err: any) {
    console.warn("Supabase check-out error:", err?.message);
  }

  // Broadcast real-time attendance update
  try {
    const { broadcastServerEvent } = await import("@/lib/supabase/broadcast");
    await broadcastServerEvent("attendance:punched", {
      employeeId,
      direction: "OUT",
      time: timeStr,
      employeeName: user.name || "Employee",
    });
  } catch {}

  return apiSuccess(
    {
      punch: {
        id: `punch-${Date.now()}`,
        employeeId: actor.employeeId,
        time: timeStr,
        direction: "OUT",
        method: "WEB_PORTAL",
        location: "Web Check-Out Portal",
        status: "VERIFIED",
      },
      message: `Web Check-out recorded at ${timeStr}.`,
    },
    201
  );
}
