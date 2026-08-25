import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { WorkdayService } from "@/server/services/workday-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user, actor } = await getSessionActor(req);
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId") || actor.employeeId || user.id;
    const workDate = searchParams.get("workDate") || new Date().toISOString().split("T")[0]!;

    let workday = await WorkdayService.getWorkday({
      employeeId,
      workDate,
    });

    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin) {
        const { data } = await supabaseAdmin
          .from("workdays")
          .select("*")
          .eq("employee_id", employeeId)
          .eq("date", workDate)
          .maybeSingle();

        if (data && (!workday || workday.status === "OPEN")) {
          workday = {
            id: data.id,
            employeeId: data.employee_id,
            workDate: data.date,
            workMode: data.work_mode || "OFFICE",
            shift: "10:00 AM - 07:00 PM",
            plannedHours: 8.0,
            checkInTime: data.sod_time ? `${data.date}T${data.sod_time}:00Z` : new Date().toISOString(),
            checkOutTime: data.eod_time ? `${data.date}T${data.eod_time}:00Z` : null,
            calculatedWorkedHours: Number(data.actual_hours) || null,
            sodSubmittedAt: data.sod_time ? `${data.date}T${data.sod_time}:00Z` : null,
            eodSubmittedAt: data.eod_time ? `${data.date}T${data.eod_time}:00Z` : null,
            status: data.eod_status === "SUBMITTED" ? "EOD_SUBMITTED" : data.sod_status === "SUBMITTED" ? "SOD_SUBMITTED" : "OPEN",
            achievements: data.achievements || null,
            issues: data.blockers || null,
            supportNeeded: null,
            nextDayFocus: data.tomorrow_focus || null,
            managerComment: data.lead_feedback_note || null,
            requestedChanges: null,
            correctionWindowUntil: null,
            lockedAt: null,
            lockedById: null,
            lockReason: null,
            dailyTasks: Array.isArray(data.planned_tasks) ? data.planned_tasks : [],
          };
        }
      }
    } catch {
      // safe fallback
    }

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
