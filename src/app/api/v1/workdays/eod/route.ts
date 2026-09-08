import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { WorkdayService } from "@/server/services/workday-service";

export async function POST(req: NextRequest) {
  try {
    const { user, actor } = await getSessionActor(req);
    const body = await req.json().catch(() => ({}));
    const employeeId = body.employeeId || actor.employeeId || user.id;
    const workdayId = body.workdayId || `wd-${employeeId}`;

    const workday = await WorkdayService.submitEOD({
      actor,
      input: {
        workdayId,
        tasks: body.tasks || body.taskUpdates || [],
        dailySummary: {
          achievements: body.achievements || "Finished assigned tasks",
          issues: body.issues || null,
          supportNeeded: body.supportNeeded || null,
          nextDayFocus: body.nextDayFocus || "Continue sprint deliverables",
        },
      },
    });

    return apiSuccess({ workday, message: "End-of-Day wrap-up submitted successfully" }, 200);
  } catch (err: any) {
    return apiError(err.message || "Failed to submit End-of-Day wrap-up", 400);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user, actor } = await getSessionActor(req);
    const body = await req.json().catch(() => ({}));
    const employeeId = body.employeeId || actor.employeeId || user.id;
    const workDate = body.workDate || new Date().toISOString().split("T")[0]!;

    const result = await WorkdayService.deleteEOD({
      actor,
      employeeId,
      workDate,
    });

    return apiSuccess(result, 200);
  } catch (err: any) {
    return apiError(err.message || "Failed to delete End-of-Day wrap-up", 400);
  }
}

