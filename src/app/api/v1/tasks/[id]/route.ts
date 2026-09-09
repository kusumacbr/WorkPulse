import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/server/api-helpers";
import { workpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const state = workpulseSharedStore.getState();

  for (const emp of state.allEmployees) {
    const task = emp.plannedTasks.find((t: any) => t.id === id);
    if (task) {
      return apiSuccess({ task });
    }
  }

  return apiError(`Task '${id}' not found`, 404, "NOT_FOUND");
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const state = workpulseSharedStore.getState();

    const rawProgress = body.progress !== undefined ? body.progress : body.completionPercentage;
    const progress = rawProgress !== undefined ? Math.max(0, Math.min(100, Math.round(Number(rawProgress) || 0))) : undefined;

    let targetTask: any = null;
    let targetEmp: any = null;

    for (const emp of state.allEmployees) {
      const taskIndex = emp.plannedTasks.findIndex((t: any) => t.id === id);
      if (taskIndex !== -1) {
        targetTask = emp.plannedTasks[taskIndex];
        targetEmp = emp;

        const updated = {
          ...targetTask,
          ...body,
          ...(progress !== undefined ? { completionPercentage: progress, progress } : {}),
        };

        if (updated.status === "COMPLETED") {
          updated.completionPercentage = 100;
          updated.progress = 100;
        } else if (progress !== undefined && progress > 0 && updated.status === "NOT_STARTED") {
          updated.status = "IN_PROGRESS";
        }

        emp.plannedTasks[taskIndex] = updated;

        // Recalculate employee overall progress
        const total = emp.plannedTasks.length;
        const sum = emp.plannedTasks.reduce((acc: number, t: any) => acc + (t.completionPercentage || t.progress || 0), 0);
        emp.overallProgress = total > 0 ? Math.round(sum / total) : 0;
        targetTask = updated;
        break;
      }
    }

    try {
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin) {
        const updatePayload: Record<string, any> = {};
        if (body.title) updatePayload.title = body.title;
        if (body.category || body.project) updatePayload.category = body.category || body.project;
        if (body.priority) updatePayload.priority = body.priority;
        if (body.status) updatePayload.status = body.status;
        if (progress !== undefined) {
          updatePayload.progress = progress;
          if (progress === 100) updatePayload.status = "COMPLETED";
          else if (progress > 0 && (!body.status || body.status === "NOT_STARTED")) updatePayload.status = "IN_PROGRESS";
        }
        if (body.acknowledged !== undefined) updatePayload.acknowledged = body.acknowledged;
        if (body.acknowledgementNote !== undefined || body.acknowledgement_note !== undefined) {
          updatePayload.acknowledgement_note = body.acknowledgementNote || body.acknowledgement_note;
        }

        await supabaseAdmin.from("daily_tasks").update(updatePayload).eq("id", id);

        // Legacy sync to workdays
        if (targetEmp) {
          const today = new Date().toISOString().split("T")[0]!;
          const { data: existingWd } = await supabaseAdmin
            .from("workdays")
            .select("planned_tasks")
            .match({ employee_id: targetEmp.id, date: today })
            .maybeSingle();

          if (existingWd && targetTask) {
            const currentTasks: any[] = existingWd.planned_tasks || [];
            const taskDbIndex = currentTasks.findIndex((t: any) => t.id === id);
            
            if (taskDbIndex !== -1) {
              currentTasks[taskDbIndex] = targetTask;
            } else {
              currentTasks.push(targetTask);
            }

            await supabaseAdmin.from("workdays").update({
              planned_tasks: currentTasks,
            }).eq("employee_id", targetEmp.id).eq("date", today);
          }
        }
      }
    } catch (dbErr) {
      console.error("[Tasks API] Failed to sync task update to Supabase", dbErr);
    }

    return apiSuccess({ task: targetTask || { id, ...body, progress }, message: "Task updated successfully." });
  } catch {
    return apiError("Invalid request payload", 400, "BAD_REQUEST");
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const state = workpulseSharedStore.getState();

  for (const emp of state.allEmployees) {
    emp.plannedTasks = emp.plannedTasks.filter((t: any) => t.id !== id);
  }

  try {
    const supabaseAdmin = createAdminClient();
    if (supabaseAdmin) {
      await supabaseAdmin.from("daily_tasks").delete().eq("id", id);
    }
  } catch (err) {
    console.error("[Tasks API] Error deleting task:", err);
  }

  return apiSuccess({ message: `Task ${id} deleted successfully.` });
}


