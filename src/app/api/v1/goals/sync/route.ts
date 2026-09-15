import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    await getSessionActor(req);
    const body = await req.json();
    const employeeId = body.employeeId;
    const goals = body.goals;

    if (!employeeId || !Array.isArray(goals)) {
      return apiError("employeeId and goals array required", 422);
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return apiError("Database connection failed", 500);
    }

    const nowIso = new Date().toISOString();

    // 1. Delete existing goals for this employee in primary goals table
    try {
      await supabase.from("goals").delete().eq("employee_id", employeeId);
    } catch (e: any) {
      console.warn("[Goals Sync] delete warning:", e?.message);
    }

    if (goals.length > 0) {
      // Primary: insert into goals table
      const rows = goals.map((g: any) => ({
        id: g.id,
        employee_id: employeeId,
        title: g.title,
        category: g.category || "Operations",
        progress: Number(g.progress) || 0,
        status: g.status || "IN_PROGRESS",
        target_date: g.targetDate || "This Month",
        updated_at: nowIso,
      }));

      const { error } = await supabase.from("goals").upsert(rows);
      if (error) {
        console.error("[Goals Sync] goals table upsert error:", error.message);
        return apiError(`Failed to sync goals: ${error.message}`, 500);
      }
    }

    return apiSuccess({ message: "Goals and OKRs synced and stored in Supabase goals table", count: goals.length });
  } catch (err: any) {
    return apiError(err.message || "Failed to sync goals", 500);
  }
}
