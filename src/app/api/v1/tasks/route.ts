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
      .eq("date", date);

    if (status) {
      query = query.eq("status", status);
    }

    const { data: dbTasks, error } = await query;
    
    if (error) {
      console.error("[Tasks API] Error fetching from daily_tasks", error);
      return apiError("Database query failed", 500);
    }

    // Map DB fields back to the frontend expected format
    const tasks = (dbTasks || []).map((t: any) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      project: t.category, // map category to project
      priority: t.priority,
      status: t.status,
      progress: t.progress,
      assignedBy: t.assigned_by,
      assignedAt: t.assigned_at,
      acknowledged: t.acknowledged,
      acknowledgementNote: t.acknowledgement_note,
    }));

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

    const newTask = {
      id: `task-${Date.now()}`,
      title: body.title,
      description: body.description || "",
      project: body.project || "Core Application",
      priority: body.priority || "MEDIUM",
      taskType: body.taskType || "PLANNED",
      estimatedMinutes: body.estimatedMinutes || 60,
      dueDate: body.dueDate || null,
      weeklyGoalId: body.weeklyGoalId || null,
      externalUrl: body.externalUrl || null,
      status: "NOT_STARTED" as const,
      completionPercentage: 0,
      actualMinutes: 0,
      expectedOutput: body.expectedOutput || "",
      isConfidential: Boolean(body.isConfidential),
    };

    if (emp) {
      emp.plannedTasks.push(newTask as any);
    }

    try {
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin) {
        const today = new Date().toISOString().split("T")[0]!;

        await supabaseAdmin.from("daily_tasks").insert({
          id: newTask.id,
          employee_id: targetEmpId,
          date: today,
          title: newTask.title,
          category: newTask.project,
          priority: newTask.priority,
          status: newTask.status,
          progress: newTask.completionPercentage,
        });

        // Keep fallback sync to workdays for legacy code just in case
        const { data: existingWd } = await supabaseAdmin
          .from("workdays")
          .select("planned_tasks")
          .match({ employee_id: targetEmpId, date: today })
          .maybeSingle();
          
        const currentTasks: any[] = existingWd?.planned_tasks || [];
        currentTasks.push(newTask);

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
