import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { workpulseSharedStore, WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export async function POST(req: NextRequest) {
  try {
    const { actor } = await getSessionActor(req);
    const body = await req.json().catch(() => ({}));
    const employeeId = body.employeeId || actor.employeeId;

    const supabaseAdmin = createAdminClient();
    if (!supabaseAdmin) {
      return apiError("Database connection failed", 500);
    }

    const today = new Date().toISOString().split("T")[0]!;

    const isSarah = !employeeId || employeeId === "emp-sarah" || employeeId?.toLowerCase().includes("employee.test") || employeeId?.toLowerCase().includes("sarah");
    const isAlex = employeeId === "lead-alex" || employeeId?.toLowerCase().includes("lead.test");
    
    // Comprehensive alias set covering all development, production, and email formats
    const employeeIds = Array.from(new Set([
      employeeId,
      actor.employeeId,
      ...(isSarah ? ["emp-sarah", "employee.test@xorstack.com", "dev-employee-test-xorstack-com", "emp-sarah-devi"] : []),
      ...(isAlex ? ["lead-alex", "lead.test@xorstack.com", "dev-lead-test-xorstack-com"] : []),
    ].filter(Boolean)));

    // 1. Delete 100% completed tasks for this employee / aliases & across the table from Supabase daily_tasks
    const delPromises = [
      supabaseAdmin.from("daily_tasks").delete().in("employee_id", employeeIds).eq("status", "COMPLETED").select(),
      supabaseAdmin.from("daily_tasks").delete().in("employee_id", employeeIds).gte("progress", 100).select(),
      supabaseAdmin.from("daily_tasks").delete().eq("status", "COMPLETED").select(),
      supabaseAdmin.from("daily_tasks").delete().gte("progress", 100).select(),
    ];

    const delResults = await Promise.allSettled(delPromises);
    const deleted: any[] = [];
    for (const res of delResults) {
      if (res.status === "fulfilled" && res.value.data) {
        deleted.push(...res.value.data);
      }
    }

    // 2. If rollover tasks are provided (tasks with progress < 100%), upsert them into daily_tasks for the new day
    const rolloverTasks: any[] = Array.isArray(body.rolloverTasks) ? body.rolloverTasks : [];
    if (rolloverTasks.length > 0) {
      const canonicalEmpId = isSarah ? "emp-sarah" : isAlex ? "lead-alex" : (employeeId || "emp-sarah");
      const rows = rolloverTasks.map((t: any, idx: number) => {
        const p = Number(t.progress !== undefined ? t.progress : (t.completionPercentage !== undefined ? t.completionPercentage : 0)) || 0;
        return {
          id: t.id && t.id.length > 5 ? t.id : `task-${Date.now()}-${idx}`,
          employee_id: canonicalEmpId,
          date: today,
          title: t.title,
          category: t.category || t.project || "General",
          priority: t.priority || "MEDIUM",
          status: p > 0 ? "IN_PROGRESS" : "NOT_STARTED",
          progress: p,
        };
      });
      await supabaseAdmin.from("daily_tasks").upsert(rows);
    }

    // 3. Update in-memory store for this employee to keep only rollover tasks
    try {
      const state = workpulseSharedStore.getState();
      const emp = state.allEmployees.find((e: any) => employeeIds.includes(e.id) || (e.email && employeeIds.includes(e.email.toLowerCase())));
      if (emp) {
        const keptTasks = (emp.plannedTasks || []).filter((t: any) => {
          const p = Number(t.completionPercentage !== undefined ? t.completionPercentage : t.progress) || 0;
          return p < 100 && t.status !== "COMPLETED";
        });
        emp.plannedTasks = keptTasks;
        WorkpulseSharedStore.updateEmployee(emp.id, { plannedTasks: keptTasks });
      }
    } catch {}

    // 4. Reset Supabase workdays, sod_submissions, and eod_submissions for today → PENDING (fresh new day)
    try {
      const resetPromises: PromiseLike<any>[] = [];

      // Reset workdays table: set statuses to PENDING, clear all verification/feedback fields
      for (const eid of employeeIds) {
        resetPromises.push(
          supabaseAdmin.from("workdays").update({
            sod_status: "PENDING",
            sod_time: null,
            sod_verified_by: null,
            sod_verified_at: null,
            sod_lead_note: null,
            eod_status: "PENDING",
            eod_time: null,
            eod_verified_by: null,
            eod_verified_at: null,
            lead_rating: null,
            lead_feedback_note: null,
            lead_action_item: null,
            achievements: null,
            blockers: null,
            tomorrow_focus: null,
            overall_progress: 0,
            planned_tasks: rolloverTasks.length > 0 ? rolloverTasks : [],
          }).eq("employee_id", eid).eq("date", today).select()
        );
      }

      // Reset sod_submissions for today
      for (const eid of employeeIds) {
        resetPromises.push(
          supabaseAdmin.from("sod_submissions").update({
            status: "PENDING",
            sod_time: null,
          }).eq("employee_id", eid).eq("date", today).select()
        );
      }

      // Reset eod_submissions for today
      for (const eid of employeeIds) {
        resetPromises.push(
          supabaseAdmin.from("eod_submissions").update({
            status: "PENDING",
            eod_time: null,
            achievements: null,
            blockers: null,
            tomorrow_focus: null,
          }).eq("employee_id", eid).eq("date", today).select()
        );
      }

      await Promise.allSettled(resetPromises);
    } catch (resetErr) {
      console.warn("[Cleanup] Supabase workday/sod/eod reset error:", resetErr);
    }

    // 5. Reset in-memory WorkpulseSharedStore employee status to PENDING for the new day
    try {
      for (const eid of employeeIds) {
        WorkpulseSharedStore.updateEmployee(eid, {
          sodStatus: "PENDING",
          sodTime: undefined,
          sodVerifiedBy: undefined,
          sodVerifiedAt: undefined,
          sodLeadNote: undefined,
          eodStatus: "PENDING",
          eodTime: undefined,
          eodVerifiedBy: undefined,
          eodVerifiedAt: undefined,
          eodLeadRating: undefined,
          eodLeadComment: undefined,
          eodLeadActionItem: undefined,
          overallProgress: 0,
        });
      }
    } catch {}

    return apiSuccess({ deletedCount: deleted.length, message: "Completed tasks deleted, workday/sod/eod reset to PENDING, rollover tasks preserved" });
  } catch (err: any) {
    return apiError(err.message || "Failed to cleanup tasks", 500);
  }
}
