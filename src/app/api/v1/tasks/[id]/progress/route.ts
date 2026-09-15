import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/server/api-helpers";
import { workpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const state = workpulseSharedStore.getState();

    for (const emp of state.allEmployees) {
      const task = emp.plannedTasks.find((t: any) => t.id === id);
      if (task) {
        if (body.completionPercentage !== undefined) {
          task.completionPercentage = Math.min(100, Math.max(0, body.completionPercentage));
        }
        if (body.actualMinutes !== undefined) {
          (task as any).actualMinutes = body.actualMinutes;
        }
        if (task.completionPercentage === 100) {
          task.status = "COMPLETED" as any;
        } else if (task.completionPercentage > 0) {
          task.status = "IN_PROGRESS" as any;
        }

        // Recalculate overall progress
        const total = emp.plannedTasks.length;
        const sum = emp.plannedTasks.reduce((acc: number, t: any) => acc + (t.completionPercentage || 0), 0);
        emp.overallProgress = total > 0 ? Math.round(sum / total) : 0;

        // Persist to Supabase
        try {
          const supabaseAdmin = createAdminClient();
          if (supabaseAdmin) {
            const updatePayload: Record<string, any> = {
              progress: task.completionPercentage,
              status: task.status,
            };
            await supabaseAdmin.from("daily_tasks").update(updatePayload).eq("id", id);
          }
        } catch (dbErr) {
          console.error("[Tasks Progress API] Failed to sync progress to Supabase", dbErr);
        }

        return apiSuccess({ task, message: "Task progress recorded." });
      }
    }

    return apiError(`Task '${id}' not found`, 404, "NOT_FOUND");
  } catch {
    return apiError("Invalid JSON body", 400, "BAD_REQUEST");
  }
}
