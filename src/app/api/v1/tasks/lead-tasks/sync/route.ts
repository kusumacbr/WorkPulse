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

    // Directly query daily_tasks where employee_id = leadId
    const fallbackRes = await supabase
      .from("daily_tasks")
      .select("*")
      .eq("employee_id", leadId)
      .order("created_at", { ascending: false });

    let data: any[] = [];
    if (!fallbackRes.error && fallbackRes.data && fallbackRes.data.length > 0) {
      data = fallbackRes.data.map((row: any) => ({
        id: row.id,
        lead_id: leadId,
        title: row.title,
        category: row.category || "Operations",
        priority: row.priority || "MEDIUM",
        status: row.status || "NOT_STARTED",
        progress: Number(row.progress) || 0,
        time_slot: "Today",
        created_at: row.created_at,
      }));
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

    const today = new Date().toISOString().split("T")[0]!;

    // 1. Clear existing for this lead in both lead_tasks (if table exists) and daily_tasks
    try {
      await supabase.from("lead_tasks").delete().eq("lead_id", leadId);
    } catch {}

    try {
      await supabase
        .from("daily_tasks")
        .delete()
        .eq("employee_id", leadId)
        .eq("assigned_by", "LEAD_SELF");
    } catch {}

    if (tasks.length > 0) {
      // 2. Insert into Supabase daily_tasks as primary authoritative store
      const dailyTaskRows = tasks.map((t: any) => ({
        id: t.id || `lead-task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        employee_id: leadId,
        assigned_by: "LEAD_SELF",
        date: today,
        title: t.title,
        category: t.category || "Operations",
        priority: t.priority || "MEDIUM",
        status: t.status || (t.progress === 100 ? "COMPLETED" : t.progress > 0 ? "IN_PROGRESS" : "NOT_STARTED"),
        progress: Number(t.progress) || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      await supabase.from("daily_tasks").upsert(dailyTaskRows);

      // 3. Also try lead_tasks table if it exists
      try {
        const leadTaskRows = tasks.map((t: any) => ({
          id: t.id,
          lead_id: leadId,
          title: t.title,
          category: t.category || "Operations",
          priority: t.priority || "MEDIUM",
          status: t.status || "NOT_STARTED",
          progress: t.progress || 0,
          time_slot: t.timeSlot || "Today",
        }));
        await supabase.from("lead_tasks").insert(leadTaskRows);
      } catch {}
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

    // Permanently delete from all possible Supabase tables
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
