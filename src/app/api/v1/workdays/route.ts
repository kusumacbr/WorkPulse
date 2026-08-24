import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { WorkdayService } from "@/server/services/workday-service";

export async function GET(req: NextRequest) {
  try {
    const { user, actor } = await getSessionActor(req);
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId") || actor.employeeId || user.id;
    const workDate = searchParams.get("workDate") || new Date().toISOString().split("T")[0]!;

    const workday = await WorkdayService.getWorkday({
      employeeId,
      workDate,
    });
    return apiSuccess({ workday });
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch workday", 400);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, actor } = await getSessionActor(req);
    const body = await req.json().catch(() => ({}));
    const employeeId = body.employeeId || actor.employeeId || user.id;
    const workDate = body.workDate || new Date().toISOString().split("T")[0]!;
    const workMode = body.workMode || "OFFICE";
    const shift = body.shift || "10:00 AM - 07:00 PM";
    const plannedHours = body.plannedHours || 8.0;

    const workday = await WorkdayService.submitSOD({
      actor,
      employeeId,
      input: {
        workDate,
        workMode: workMode as any,
        shift,
        plannedHours,
        tasks: body.tasks || [],
      },
    });

    return apiSuccess({ workday }, 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to initialize workday", 400);
  }
}
