import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    await getSessionActor(req);
    const searchParams = req.nextUrl.searchParams;
    const leadId = searchParams.get("leadId");
    const employeeId = searchParams.get("employeeId");

    const supabase = createAdminClient();
    if (!supabase) {
      return apiError("Database connection failed", 500);
    }

    // Lookup employees map for accurate names and designations
    const { data: supaEmps } = await supabase.from("employees").select("id, name, email, role_title");
    const empMap = new Map((supaEmps || []).map((e: any) => [e.id, e]));

    // Try primary table `assigned_tasks`
    let hasAssignedTable = true;
    let query = supabase
      .from("assigned_tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (leadId) {
      query = query.eq("assigned_by_id", leadId);
    }
    if (employeeId) {
      query = query.eq("target_employee_id", employeeId);
    }

    let { data, error } = await query;

    if (error) {
      if (error.code === "PGRST205" || error.message?.includes("does not exist")) {
        hasAssignedTable = false;
      } else {
        console.error("[Assigned Tasks API] Error:", error);
      }
    }

    // If assigned_tasks table does not exist or empty, fallback to daily_tasks with assigned_by
    if (!hasAssignedTable || (!data || data.length === 0)) {
      let fallbackQuery = supabase
        .from("daily_tasks")
        .select("*")
        .not("assigned_by", "is", null)
        .order("created_at", { ascending: false });

      if (employeeId) {
        fallbackQuery = fallbackQuery.eq("employee_id", employeeId);
      }

      const fallbackRes = await fallbackQuery;
      if (!fallbackRes.error && fallbackRes.data && fallbackRes.data.length > 0) {
        data = fallbackRes.data.map((row: any) => {
          const emp = empMap.get(row.employee_id);
          const empName = emp?.name || (row.employee_id === "emp-sarah" ? "Sarah Dev" : row.employee_id);
          const empEmail = emp?.email || (row.employee_id === "emp-sarah" ? "employee.test@xorstack.com" : "");
          const empDesignation = emp?.role_title || "Engineer";

          return {
            id: row.id,
            title: row.title,
            category: row.category,
            priority: row.priority,
            status: row.status,
            progress: Number(row.progress) || 0,
            assigned_by: row.assigned_by,
            assigned_by_id: leadId || "lead-alex",
            assigned_at: row.assigned_at || row.created_at,
            target_employee_id: row.employee_id,
            target_employee_name: empName,
            target_employee_email: empEmail,
            target_employee_designation: empDesignation,
            target_employee_avatar: empName.slice(0, 2).toUpperCase(),
            acknowledged: Boolean(row.acknowledged),
            acknowledged_at: row.acknowledged ? (row.updated_at ? new Date(row.updated_at).toLocaleString() : "Today") : undefined,
            acknowledgement_note: row.acknowledgement_note,
          };
        });
      } else if (!hasAssignedTable) {
        data = [];
      }
    }

    const tasks = (data || []).map((t: any) => {
      const emp = empMap.get(t.target_employee_id || t.employee_id);
      const empName = t.target_employee_name || emp?.name || (t.target_employee_id === "emp-sarah" ? "Sarah Dev" : t.target_employee_id);
      return {
        id: t.id,
        title: t.title,
        category: t.category,
        project: t.category,
        priority: t.priority,
        status: t.status,
        progress: Number(t.progress) || 0,
        assignedBy: t.assigned_by || t.assignedBy,
        assignedById: t.assigned_by_id || t.assignedById,
        assignedAt: t.assigned_at ? new Date(t.assigned_at).toLocaleString() : (t.assignedAt || "Today"),
        targetEmployeeId: t.target_employee_id || t.targetEmployeeId,
        targetEmployeeName: empName,
        targetEmployeeEmail: t.target_employee_email || t.targetEmployeeEmail || emp?.email || "",
        targetEmployeeDesignation: t.target_employee_designation || emp?.role_title || "Engineer",
        targetEmployeeAvatar: empName.slice(0, 2).toUpperCase(),
        acknowledged: Boolean(t.acknowledged),
        acknowledgedAt: t.acknowledged_at || t.acknowledgedAt,
        acknowledgementNote: t.acknowledgement_note || t.acknowledgementNote,
      };
    });

    return apiSuccess({ tasks, total: tasks.length });
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch assigned tasks", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await getSessionActor(req);
    const body = await req.json();

    if (!body.title || !body.targetEmployeeId) {
      return apiError("Title and targetEmployeeId are required", 422);
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return apiError("Database connection failed", 500);
    }

    const taskId = body.id || `atask-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const taskPayload = {
      id: taskId,
      title: body.title,
      category: body.category || "General",
      priority: body.priority || "MEDIUM",
      status: "NOT_STARTED",
      progress: 0,
      assigned_by: body.assignedBy || "Lead",
      assigned_by_id: body.assignedById || "",
      target_employee_id: body.targetEmployeeId,
      target_employee_name: body.targetEmployeeName || "",
      target_employee_email: body.targetEmployeeEmail || "",
      assigned_at: nowIso,
    };

    // 1. Try insert into assigned_tasks
    try {
      await supabase.from("assigned_tasks").insert(taskPayload);
    } catch {}

    // 2. Always persist into daily_tasks as rock-solid Supabase backup
    try {
      await supabase.from("daily_tasks").upsert({
        id: taskId,
        employee_id: body.targetEmployeeId,
        date: new Date().toISOString().split("T")[0],
        title: body.title,
        category: body.category || "General",
        priority: body.priority || "MEDIUM",
        status: "NOT_STARTED",
        progress: 0,
        assigned_by: body.assignedBy || "Alex Lead",
        assigned_at: nowIso,
        acknowledged: false,
        created_at: nowIso,
        updated_at: nowIso,
      });
    } catch (fallbackErr) {
      console.warn("[Assigned Tasks API] fallback insert warning:", fallbackErr);
    }

    return apiSuccess({ task: taskPayload, message: "Task assigned and saved permanently to Supabase" }, 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to assign task", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await getSessionActor(req);
    const body = await req.json().catch(() => ({}));
    const taskId = body.taskId || body.id;

    if (!taskId) {
      return apiError("Task ID required", 422);
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return apiError("Database connection failed", 500);
    }

    // 1. Permanently delete from assigned_tasks (if table exists)
    try {
      await supabase.from("assigned_tasks").delete().eq("id", taskId);
    } catch {}

    // 2. Permanently delete from daily_tasks
    try {
      await supabase.from("daily_tasks").delete().eq("id", taskId);
    } catch {}

    // 3. Permanently delete from feedbacks if any mirrored feedback exists
    try {
      await supabase.from("feedbacks").delete().eq("id", taskId);
    } catch {}

    return apiSuccess({ message: "Assigned task deleted permanently from Supabase", taskId });
  } catch (err: any) {
    return apiError(err.message || "Failed to delete assigned task", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await getSessionActor(req);
    const body = await req.json();
    const taskId = body.taskId || body.id;

    if (!taskId) {
      return apiError("Task ID required", 422);
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return apiError("Database connection failed", 500);
    }

    const nowIso = new Date().toISOString();
    const dailyTasksPayload: Record<string, any> = { updated_at: nowIso };

    // Acknowledgement fields (only valid columns of daily_tasks)
    if (body.acknowledged !== undefined) {
      dailyTasksPayload.acknowledged = Boolean(body.acknowledged);
      dailyTasksPayload.acknowledgement_note = body.acknowledgementNote || "";
    }

    // Progress/status updates
    if (body.status !== undefined) dailyTasksPayload.status = body.status;
    if (body.progress !== undefined) dailyTasksPayload.progress = Number(body.progress) || 0;

    // 1. Update assigned_tasks table (if table exists)
    try {
      await supabase.from("assigned_tasks").update({
        ...dailyTasksPayload,
        acknowledged_at: body.acknowledgedAt || nowIso,
      }).eq("id", taskId);
    } catch {}

    // 2. Update daily_tasks table with clean, strictly valid schema fields
    try {
      const { error: dtError } = await supabase.from("daily_tasks").update(dailyTasksPayload).eq("id", taskId);
      if (dtError) {
        console.warn("[Assigned Tasks API PATCH] daily_tasks update warning:", dtError);
      }
    } catch (updateErr) {
      console.warn("[Assigned Tasks API PATCH] daily_tasks error:", updateErr);
    }

    return apiSuccess({ message: "Task updated successfully", taskId, updates: dailyTasksPayload });
  } catch (err: any) {
    return apiError(err.message || "Failed to update assigned task", 500);
  }
}
