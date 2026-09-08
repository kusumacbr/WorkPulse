import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    await getSessionActor(req);
    const searchParams = req.nextUrl.searchParams;
    const leadId = searchParams.get("leadId");

    if (!leadId) {
      return apiError("leadId is required", 422);
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return apiError("Database connection failed", 500);
    }

    // 1. Try primary lead_tasks table
    let hasLeadTasksTable = true;
    let { data, error } = await supabase
      .from("lead_tasks")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });

    if (error) {
      if (error.code === "PGRST205" || error.message?.includes("does not exist")) {
        hasLeadTasksTable = false;
      } else {
        console.error("[Lead Tasks API] Error:", error);
      }
    }

    // 2. Fallback to daily_tasks where employee_id = leadId and assigned_by = 'LEAD_SELF'
    if (!hasLeadTasksTable || (!data || data.length === 0)) {
      const fallbackRes = await supabase
        .from("daily_tasks")
        .select("*")
        .eq("employee_id", leadId)
        .eq("assigned_by", "LEAD_SELF")
        .order("created_at", { ascending: false });

      if (!fallbackRes.error && fallbackRes.data && fallbackRes.data.length > 0) {
        data = fallbackRes.data.map((row: any) => ({
          id: row.id,
          lead_id: leadId,
          title: row.title,
          category: row.category || "Code Review",
          priority: row.priority || "MEDIUM",
          status: row.status || "NOT_STARTED",
          progress: Number(row.progress) || 0,
          time_slot: "Today",
          created_at: row.created_at,
        }));
      } else if (!hasLeadTasksTable) {
        data = [];
      }
    }

    const tasks = (data || []).map((t: any) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      priority: t.priority,
      status: t.status,
      progress: Number(t.progress) || 0,
      timeSlot: t.time_slot || "Today",
    }));

    return apiSuccess({ tasks, total: tasks.length });
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch lead tasks", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await getSessionActor(req);
    const body = await req.json();
    const leadId = body.leadId;
    const tasks = body.tasks;

    if (!leadId || !Array.isArray(tasks)) {
      return apiError("leadId and tasks array required", 422);
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return apiError("Database connection failed", 500);
    }

    const nowIso = new Date().toISOString();

    // Delete existing for this lead in both tables
    try {
      await supabase.from("lead_tasks").delete().eq("lead_id", leadId);
    } catch {}
    try {
      await supabase.from("daily_tasks").delete().eq("employee_id", leadId).eq("assigned_by", "LEAD_SELF");
    } catch {}

    if (tasks.length > 0) {
      // 1. Insert into lead_tasks
      const rows = tasks.map((t: any) => ({
        id: t.id,
        lead_id: leadId,
        title: t.title,
        category: t.category || "Code Review",
        priority: t.priority || "MEDIUM",
        status: t.status || "NOT_STARTED",
        progress: t.progress || 0,
        time_slot: t.timeSlot || "Today",
      }));

      try {
        await supabase.from("lead_tasks").insert(rows);
      } catch {}

      // 2. Insert into daily_tasks fallback
      const dailyRows = tasks.map((t: any) => ({
        id: t.id,
        employee_id: leadId,
        date: new Date().toISOString().split("T")[0],
        title: t.title,
        category: t.category || "Code Review",
        priority: t.priority || "MEDIUM",
        status: t.status || "NOT_STARTED",
        progress: t.progress || 0,
        assigned_by: "LEAD_SELF",
        created_at: nowIso,
        updated_at: nowIso,
      }));

      try {
        await supabase.from("daily_tasks").upsert(dailyRows);
      } catch (err) {
        console.warn("[Lead Tasks Sync] daily_tasks backup warning:", err);
      }
    }

    return apiSuccess({ message: "Lead tasks synced permanently to Supabase", count: tasks.length });
  } catch (err: any) {
    return apiError(err.message || "Failed to sync lead tasks", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await getSessionActor(req);
    const body = await req.json().catch(() => ({}));
    const taskId = body.taskId || body.id;

    if (!taskId) {
      return apiError("taskId is required", 422);
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return apiError("Database connection failed", 500);
    }

    // Permanently delete from all possible locations
    try {
      await supabase.from("lead_tasks").delete().eq("id", taskId);
    } catch {}

    try {
      await supabase.from("daily_tasks").delete().eq("id", taskId);
    } catch {}

    try {
      await supabase.from("feedbacks").delete().eq("id", taskId);
    } catch {}

    return apiSuccess({ message: "Lead task deleted permanently from Supabase", taskId });
  } catch (err: any) {
    return apiError(err.message || "Failed to delete lead task", 500);
  }
}
