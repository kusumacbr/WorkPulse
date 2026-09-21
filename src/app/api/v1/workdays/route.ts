import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { WorkdayService } from "@/server/services/workday-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user, actor } = await getSessionActor(req);
    const { searchParams } = new URL(req.url);
    const workDate = searchParams.get("workDate") || searchParams.get("date") || new Date().toISOString().split("T")[0]!;

    // Return all workdays for the given date (used by shared store sync)
    if (searchParams.get("all") === "true") {
      try {
        const { createAdminClient } = await import("@/lib/supabase/admin");
        const supabaseAdmin = createAdminClient();
        if (supabaseAdmin) {
          const { data, error } = await supabaseAdmin
            .from("workdays")
            .select("*")
            .eq("date", workDate);
          if (!error && data) {
            return apiSuccess({ workdays: data });
          }
        }
      } catch (err) {
        console.warn("Error fetching all workdays via admin:", err);
      }
      return apiSuccess({ workdays: [] });
    }

    const employeeId = searchParams.get("employeeId") || actor.employeeId || user.id;

    let workday = await WorkdayService.getWorkday({
      employeeId,
      workDate,
    });

    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin) {
        const isSarah = employeeId === "emp-sarah" || employeeId?.toLowerCase().includes("employee.test");
        const isAlex = employeeId === "lead-alex" || employeeId?.toLowerCase().includes("lead.test");
        const employeeIds = isSarah
          ? ["emp-sarah", "employee.test@xorstack.com"]
          : isAlex
          ? ["lead-alex", "lead.test@xorstack.com"]
          : [employeeId];

        const [{ data }, { data: dtData }] = await Promise.all([
          supabaseAdmin
            .from("workdays")
            .select("*")
            .in("employee_id", employeeIds)
            .eq("date", workDate)
            .maybeSingle(),
          supabaseAdmin
            .from("daily_tasks")
            .select("*")
            .in("employee_id", employeeIds)
            .or(`date.eq.${workDate},status.neq.COMPLETED`),
        ]);

        const filteredTasks = (dtData || []).filter((t: any) => {
          const progress = Number(t.progress !== undefined ? t.progress : (t.completion_percentage || 0)) || 0;
          const isCompleted = t.status === "COMPLETED" || progress >= 100;
          const taskDate = t.date || workDate;
          if (taskDate < workDate && isCompleted) return false;
          return true;
        });

        const supaTasks = filteredTasks.map((t: any) => ({
          id: t.id,
          workdayId: data?.id || `wd-${employeeId}-${workDate}`,
          employeeId,
          title: t.title,
          project: t.category || "General",
          category: t.category || "General",
          priority: t.priority || "MEDIUM",
          taskType: "PLANNED" as const,
          estimatedMinutes: 60,
          status: (t.status || (t.progress === 100 ? "COMPLETED" : t.progress > 0 ? "IN_PROGRESS" : "NOT_STARTED")) as any,
          progress: Number(t.progress !== undefined ? t.progress : (t.completion_percentage || 0)) || 0,
          completionPercentage: Number(t.completion_percentage !== undefined ? t.completion_percentage : (t.progress || 0)) || 0,
          assignedBy: t.assigned_by,
          assignedAt: t.assigned_at,
          acknowledged: Boolean(t.acknowledged),
          isConfidential: false,
          sortOrder: 0,
        }));

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
            dailyTasks: supaTasks,
          };
        } else if (workday) {
          workday.dailyTasks = supaTasks;
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
    const workDate = body.date || body.workDate || new Date().toISOString().split("T")[0]!;
    const workMode = body.workMode || "OFFICE";
    const shift = body.shift || "10:00 AM - 07:00 PM";
    const plannedHours = body.plannedHours || 8.0;

    // Handle EOD submission
    if (body.eodStatus === "SUBMITTED" || body.dailySummary) {
      const workday = await WorkdayService.submitEOD({
        actor,
        input: {
          workdayId: body.id || `wd-${employeeId}-${workDate}`,
          tasks: body.plannedTasks || body.tasks || [],
          dailySummary: {
            achievements: body.eodAchievements || body.achievements || body.dailySummary?.achievements || "Finished planned tasks",
            issues: body.eodBlockers || body.blockers || body.dailySummary?.issues || null,
            supportNeeded: body.supportNeeded || body.dailySummary?.supportNeeded || null,
            nextDayFocus: body.eodTomorrowFocus || body.tomorrowFocus || body.dailySummary?.nextDayFocus || "Continue sprint deliverables",
          },
        },
      });
      return apiSuccess({ workday }, 200);
    }

    // Handle SOD submission
    const workday = await WorkdayService.submitSOD({
      actor,
      employeeId,
      input: {
        workDate,
        workMode: workMode as any,
        shift,
        plannedHours,
        tasks: body.plannedTasks || body.tasks || [],
      },
    });

    return apiSuccess({ workday }, 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to initialize workday", 400);
  }
}
