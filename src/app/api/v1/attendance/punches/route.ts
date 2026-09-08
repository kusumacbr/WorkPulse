import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const { actor, user } = await getSessionActor(req);
    const searchParams = req.nextUrl.searchParams;
    const requestedEmpId = searchParams.get("employeeId");
    const empId = requestedEmpId || actor?.employeeId || user?.email || "emp-sarah";
    const userEmail = user?.email || "";

    const supabase = createAdminClient();
    if (supabase) {
      let query = supabase
        .from("biometric_punches")
        .select("*")
        .order("punch_time", { ascending: false })
        .limit(100);

      // Filter for this employee's punches
      if (empId) {
        if (empId.includes("sarah") || userEmail.includes("employee.test")) {
          query = query.or("employee_id.eq.emp-sarah,employee_id.eq.employee.test@xorstack.com,employee_id.eq.dev.sarah@xorstack.com");
        } else {
          query = query.or(`employee_id.eq.${empId}${userEmail ? `,employee_id.eq.${userEmail}` : ""}`);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error("[Punches API] Error:", error);
      }

      if (data && data.length > 0) {
        const mapped = data.map((p: any) => {
          const punchTimeStr = p.punch_time || p.created_at;
          const punchDateObj = new Date(punchTimeStr);
          const dateStr = p.raw_payload?.date || punchDateObj.toISOString().split("T")[0];

          return {
            id: p.id,
            employeeId: p.employee_id,
            employeeName: p.employee_name,
            punch_time: punchTimeStr,
            time: punchDateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            direction: p.punch_type,
            punch_type: p.punch_type,
            date: dateStr,
            work_mode: p.raw_payload?.work_mode || "OFFICE",
            method: p.method || "BIOMETRIC",
            location: p.location || "Bangalore HQ",
            terminal_id: p.terminal_id || "TERM-BLR-01",
            status: p.status || "VERIFIED",
          };
        });
        return apiSuccess({ punches: mapped, total: mapped.length });
      }
    }

    return apiSuccess({ punches: [], total: 0 });
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch punches", 500);
  }
}
