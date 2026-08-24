import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { workpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export async function GET(req: NextRequest) {
  const { actor } = await getSessionActor(req);
  const searchParams = req.nextUrl.searchParams;
  const employeeId = searchParams.get("employeeId") || actor.employeeId;
  const status = searchParams.get("status");

  const state = workpulseSharedStore.getState();
  const emp = state.allEmployees.find((e: any) => e.id === employeeId);
  let tasks = emp ? emp.plannedTasks : [];

  if (status) {
    tasks = tasks.filter((t: any) => t.status === status);
  }

  return apiSuccess({ tasks, total: tasks.length });
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

    return apiSuccess({ task: newTask, message: "Task created successfully." }, 201);
  } catch {
    return apiError("Invalid JSON body", 400, "BAD_REQUEST");
  }
}
