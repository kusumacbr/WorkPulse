import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { workpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const { actor } = await getSessionActor(req);
  const searchParams = req.nextUrl.searchParams;
  const employeeId = searchParams.get("employeeId") || actor.employeeId;
  const status = searchParams.get("status");
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0]!;

  try {
    const supabaseAdmin = createAdminClient();
    if (!supabaseAdmin) {
      return apiError("Database connection failed", 500);
    }

    let query = supabaseAdmin
      .from("daily_tasks")
      .select("*")
      .eq("employee_id", employeeId)
      .or(`date.eq.${date},assigned_by.not.is.null`)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data: dbTasks, error } = await query;
    
    if (error) {
      console.error("[Tasks API] Error fetching from daily_tasks", error);
      return apiError("Database query failed", 500);
    }

    // Map DB fields and deduplicate by id and title
    const seenIds = new Set<string>();
    const seenTitles = new Map<string, number>();
    const tasks: any[] = [];

    for (const t of (dbTasks || [])) {
      const id = String(t.id || "").trim();
      const rawTitle = String(t.title || "").trim();
      if (!rawTitle) continue;
      const titleKey = rawTitle.toLowerCase();

      if (id && seenIds.has(id)) continue;

      const progress = Number(t.progress !== undefined ? t.progress : (t.completion_percentage !== undefined ? t.completion_percentage : 0)) || 0;

      const taskItem = {
        id: t.id,
        title: rawTitle,
        category: t.category || "General",
        project: t.category || "General",
        priority: t.priority || "MEDIUM",
        status: t.status || (progress === 100 ? "COMPLETED" : progress > 0 ? "IN_PROGRESS" : "NOT_STARTED"),
        progress,
        completionPercentage: progress,
        assignedBy: t.assigned_by,
        assignedAt: t.assigned_at,
        acknowledged: Boolean(t.acknowledged),
        acknowledgementNote: t.acknowledgement_note,
      };

      if (seenTitles.has(titleKey)) {
        const existingIdx = seenTitles.get(titleKey)!;
        const existing = tasks[existingIdx];
        if (existing) {
          // If the new item is assigned by lead, or acknowledged, or has higher progress, upgrade it
          if ((taskItem.assignedBy && !existing.assignedBy) || (taskItem.acknowledged && !existing.acknowledged) || progress > existing.progress) {
            tasks[existingIdx] = {
              ...existing,
              ...taskItem,
              assignedBy: taskItem.assignedBy || existing.assignedBy,
              acknowledged: Boolean(taskItem.acknowledged || existing.acknowledged),
              acknowledgementNote: taskItem.acknowledgementNote || existing.acknowledgementNote,
            };
          }
        }
        continue;
      }

      if (id) seenIds.add(id);
      seenTitles.set(titleKey, tasks.length);
      tasks.push(taskItem);
    }

    return apiSuccess({ tasks, total: tasks.length });
  } catch (err) {
    return apiError("Failed to fetch tasks", 500);
  }
}

export async function POST(req: NextRequest) {
  const { actor } = await getSessionActor(req);

  try {
    const body = await req.json();
    if (!body.title) {
      return apiError("Missing required field: title", 422, "VALIDATION_FAILED");
    }

    const state = workpulseSharedStore.getState();
    const targetEmpId = body.employeeId || actor.employeeId;
    const emp = state.allEmployees.find((e: any) => e.id === targetEmpId);

    const taskId = body.id || `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const progress = Number(body.progress !== undefined ? body.progress : (body.completionPercentage || 0)) || 0;

    const newTask = {
      id: taskId,
      title: body.title,
      description: body.description || "",
      project: body.project || body.category || "General",
      category: body.category || body.project || "General",
      priority: body.priority || "MEDIUM",
      taskType: body.taskType || "PLANNED",
      estimatedMinutes: body.estimatedMinutes || 60,
      dueDate: body.dueDate || null,
      weeklyGoalId: body.weeklyGoalId || null,
      externalUrl: body.externalUrl || null,
      status: (body.status || (progress === 100 ? "COMPLETED" : progress > 0 ? "IN_PROGRESS" : "NOT_STARTED")) as "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED",
      completionPercentage: progress,
      progress,
      actualMinutes: 0,
      expectedOutput: body.expectedOutput || body.title,
      isConfidential: Boolean(body.isConfidential),
    };

    if (emp) {
      const existingIdx = emp.plannedTasks.findIndex((t: any) => t.id === taskId || t.title.toLowerCase() === newTask.title.toLowerCase());
      if (existingIdx !== -1) {
        emp.plannedTasks[existingIdx] = { ...emp.plannedTasks[existingIdx], ...newTask };
      } else {
        emp.plannedTasks = [newTask as any, ...emp.plannedTasks];
      }
    }

    try {
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin) {
        const today = new Date().toISOString().split("T")[0]!;

        await supabaseAdmin.from("daily_tasks").upsert({
          id: newTask.id,
          employee_id: targetEmpId,
          date: today,
          title: newTask.title,
          category: newTask.project,
          priority: newTask.priority,
          status: newTask.status,
          progress: newTask.completionPercentage,
        });

        // Sync to workdays
        const { data: existingWd } = await supabaseAdmin
          .from("workdays")
          .select("planned_tasks")
          .match({ employee_id: targetEmpId, date: today })
          .maybeSingle();
          
        let currentTasks: any[] = existingWd?.planned_tasks || [];
        const existingIdx = currentTasks.findIndex((t: any) => t.id === taskId || t.title?.toLowerCase() === newTask.title.toLowerCase());
        if (existingIdx !== -1) {
          currentTasks[existingIdx] = newTask;
        } else {
          currentTasks.push(newTask);
        }

        await supabaseAdmin.from("workdays").upsert({
          id: `wd-${targetEmpId}-${today}`,
          employee_id: targetEmpId,
          employee_name: emp?.name || "Employee",
          date: today,
          planned_tasks: currentTasks,
        });
      }
    } catch (dbErr) {
      console.error("[Tasks API] Failed to sync task to Supabase", dbErr);
    }

    return apiSuccess({ task: newTask, message: "Task created successfully." }, 201);
  } catch {
    return apiError("Invalid JSON body", 400, "BAD_REQUEST");
  }
}
