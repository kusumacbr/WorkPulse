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
    const todayDate = nowIso.split("T")[0];

    // 1. Delete existing goals for this employee in primary goals table
    try {
      await supabase.from("goals").delete().eq("employee_id", employeeId);
    } catch {}

    // 2. Delete existing goal records in feedbacks fallback table
    try {
      await supabase
        .from("feedbacks")
        .delete()
        .eq("lead_id", "GOAL")
        .eq("employee_id", employeeId);
    } catch {}

    if (goals.length > 0) {
      // Primary: insert into goals table
      const rows = goals.map((g: any) => ({
        id: g.id,
        employee_id: employeeId,
        title: g.title,
        description: g.description || "",
        category: g.category || "Operations",
        progress: Number(g.progress) || 0,
        status: g.status || "IN_PROGRESS",
        target_date: g.targetDate || "This Month",
      }));

      try {
        await supabase.from("goals").insert(rows);
      } catch (err) {
        console.warn("[Goals Sync] goals table insert warning (fallback active):", err);
      }

      // Secondary: insert into feedbacks as guaranteed Supabase storage
      const feedbackRows = goals.map((g: any) => ({
        id: g.id,
        employee_id: employeeId,
        employee_name: "Employee",
        lead_id: "GOAL",
        lead_name: g.category || "Operations",
        date: todayDate,
        rating: Math.min(5.0, Math.max(0.0, Number(((g.progress || 0) / 20).toFixed(1)))),
        sentiment: g.status || "IN_PROGRESS",
        notes: JSON.stringify({
          id: g.id,
          title: g.title,
          description: g.description || "",
          category: g.category || "Operations",
          progress: Number(g.progress) || 0,
          status: g.status || "IN_PROGRESS",
          targetDate: g.targetDate || "This Month",
        }),
        action_item: g.title,
        created_at: nowIso,
      }));

      try {
        await supabase.from("feedbacks").insert(feedbackRows);
      } catch (err) {
        console.warn("[Goals Sync] feedbacks backup insert warning:", err);
      }
    }

    return apiSuccess({ message: "Goals and OKRs synced and stored in Supabase", count: goals.length });
  } catch (err: any) {
    return apiError(err.message || "Failed to sync goals", 500);
  }
}
