import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/server/api-helpers";
import { workpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const state = workpulseSharedStore.getState();

  for (const emp of state.allEmployees) {
    const task = emp.plannedTasks.find((t: any) => t.id === id);
    if (task) {
      task.status = "CARRIED_FORWARD" as any;

      // Create cloned next-day task linked to source
      const nextDayTask = {
        ...task,
        id: `task-cf-${Date.now()}`,
        carriedFromTaskId: task.id,
        status: "NOT_STARTED" as const,
        completionPercentage: 0,
        createdAt: new Date().toISOString(),
      };

      emp.plannedTasks.push(nextDayTask as any);

      return apiSuccess({
        sourceTask: task,
        carriedForwardTask: nextDayTask,
        message: "Task carried forward while preserving historical lineage.",
      }, 201);
    }
  }

  return apiError(`Task '${id}' not found`, 404, "NOT_FOUND");
}
