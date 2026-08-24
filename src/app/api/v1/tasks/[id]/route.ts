import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/server/api-helpers";
import { workpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

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

    for (const emp of state.allEmployees) {
      const taskIndex = emp.plannedTasks.findIndex((t: any) => t.id === id);
      if (taskIndex !== -1) {
        const task = emp.plannedTasks[taskIndex];

        // Completed task requires 100% completion
        if (body.status === "COMPLETED" && body.completionPercentage !== undefined && body.completionPercentage < 100) {
          return apiError("Validation Error: Completed tasks must have 100% completion percentage.", 422, "VALIDATION_FAILED");
        }

        // Cancelled task requires reason
        if (body.status === "CANCELLED" && !body.delayReason && !body.reason) {
          return apiError("Validation Error: A cancelled task requires a cancellation reason.", 422, "VALIDATION_FAILED");
        }

        const updated = {
          ...task,
          ...body,
        };

        if (updated.status === "COMPLETED") {
          updated.completionPercentage = 100;
        }

        emp.plannedTasks[taskIndex] = updated;

        // Recalculate employee overall progress
        const total = emp.plannedTasks.length;
        const sum = emp.plannedTasks.reduce((acc: number, t: any) => acc + (t.completionPercentage || 0), 0);
        emp.overallProgress = total > 0 ? Math.round(sum / total) : 0;

        return apiSuccess({ task: updated, message: "Task updated successfully." });
      }
    }

    return apiError(`Task '${id}' not found`, 404, "NOT_FOUND");
  } catch {
    return apiError("Invalid request payload", 400, "BAD_REQUEST");
  }
}
