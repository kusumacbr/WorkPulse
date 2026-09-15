import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { workpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export async function POST(req: NextRequest) {
  try {
    const { actor } = await getSessionActor(req);
    const body = await req.json().catch(() => ({}));
    const employeeId = body.employeeId || actor.employeeId;

    const supabaseAdmin = createAdminClient();
    if (!supabaseAdmin) {
      return apiError("Database connection failed", 500);
    }

    const today = new Date().toISOString().split("T")[0]!;

    const isSarah = !employeeId || employeeId === "emp-sarah" || employeeId?.toLowerCase().includes("employee.test") || employeeId?.toLowerCase().includes("sarah");
    const isAlex = employeeId === "lead-alex" || employeeId?.toLowerCase().includes("lead.test");
    const employeeIds = isSarah
      ? ["emp-sarah", "employee.test@xorstack.com", "emp-sarah-devi"]
      : isAlex
      ? ["lead-alex", "lead.test@xorstack.com"]
      : [employeeId];

    // Delete 100% completed tasks for this employee / aliases & previous days from Supabase daily_tasks
    const [del1, del2, del3, del4, del5] = await Promise.all([
      supabaseAdmin.from("daily_tasks").delete().in("employee_id", employeeIds).eq("status", "COMPLETED").select(),
      supabaseAdmin.from("daily_tasks").delete().in("employee_id", employeeIds).gte("progress", 100).select(),
      supabaseAdmin.from("daily_tasks").delete().lt("date", today).eq("status", "COMPLETED").select(),
      supabaseAdmin.from("daily_tasks").delete().lt("date", today).gte("progress", 100).select(),
      supabaseAdmin.from("daily_tasks").delete().is("date", null).eq("status", "COMPLETED").select(),
    ]);

    const deleted = [
      ...(del1.data || []),
      ...(del2.data || []),
      ...(del3.data || []),
      ...(del4.data || []),
      ...(del5.data || []),
    ];
    if (del1.error || del2.error || del3.error || del4.error) {
      console.error("[Tasks Cleanup API] Error deleting completed tasks:", del1.error || del2.error || del3.error || del4.error);
    }

    // Also update in-memory store for this employee to keep only rollover tasks
    try {
      const state = workpulseSharedStore.getState();
      const emp = state.allEmployees.find((e: any) => employeeIds.includes(e.id) || (e.email && employeeIds.includes(e.email.toLowerCase())));
      if (emp && Array.isArray(emp.plannedTasks)) {
        emp.plannedTasks = emp.plannedTasks.filter((t: any) => {
          const p = Number(t.completionPercentage !== undefined ? t.completionPercentage : t.progress) || 0;
          return p < 100 && t.status !== "COMPLETED";
        });
      }
    } catch {}

    return apiSuccess({ deletedCount: deleted?.length || 0, message: "Completed tasks deleted successfully" });
  } catch (err: any) {
    return apiError(err.message || "Failed to cleanup tasks", 500);
  }
}
