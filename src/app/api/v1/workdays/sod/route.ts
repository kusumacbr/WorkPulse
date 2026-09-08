import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { WorkdayService } from "@/server/services/workday-service";

export async function POST(req: NextRequest) {
  try {
    const { user, actor } = await getSessionActor(req);
    const body = await req.json().catch(() => ({}));
    const employeeId = body.employeeId || actor.employeeId || user.id;
    const workDate = body.workDate || new Date().toISOString().split("T")[0]!;

    const tasks = (body.tasks || []).map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      project: t.project || "General",
      priority: t.priority || "MEDIUM",
      taskType: t.taskType || "PLANNED",
      expectedOutput: t.expectedOutput,
      estimatedMinutes: Number(t.estimatedMinutes) || 60,
      isConfidential: Boolean(t.isConfidential),
      status: t.status || "NOT_STARTED",
      completionPercentage: t.completionPercentage || t.progress || 0,
    }));

    const workday = await WorkdayService.submitSOD({
      actor,
      employeeId,
      input: {
        workDate,
        workMode: (body.workMode || "OFFICE") as any,
        shift: body.shift || "10:00 AM - 07:00 PM",
        plannedHours: Number(body.plannedHours) || 8.0,
        tasks,
      },
    });

    return apiSuccess({ workday, message: "Start-of-Day plan submitted successfully" }, 200);
  } catch (err: any) {
    return apiError(err.message || "Failed to submit Start-of-Day plan", 400);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user, actor } = await getSessionActor(req);
    const body = await req.json().catch(() => ({}));
    const employeeId = body.employeeId || actor.employeeId || user.id;
    const workDate = body.workDate || new Date().toISOString().split("T")[0]!;

    const result = await WorkdayService.deleteSOD({
      actor,
      employeeId,
      workDate,
    });

    return apiSuccess(result, 200);
  } catch (err: any) {
    return apiError(err.message || "Failed to delete Start-of-Day plan", 400);
  }
}

