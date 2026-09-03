import { AuditService } from "@/lib/audit/audit-service";
import { AuthActor } from "@/lib/authorization/types";
import { assertAuthorized } from "@/lib/authorization/authorize";
import { PERMISSIONS } from "@/lib/authorization/permissions";
import {
  SodSubmissionInput,
  EodSubmissionInput,
  ManagerChangeRequestInput,
  WorkdayAmendmentInput,
} from "@/lib/validation/workday";

export interface WorkdayRecord {
  id: string;
  employeeId: string;
  workDate: string; // YYYY-MM-DD
  workMode: string;
  shift: string;
  plannedHours: number;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  calculatedWorkedHours?: number | null;
  sodSubmittedAt?: string | null;
  eodSubmittedAt?: string | null;
  status: "OPEN" | "SOD_SUBMITTED" | "EOD_SUBMITTED" | "CHANGES_REQUESTED" | "LOCKED" | "AMENDED";
  achievements?: string | null;
  issues?: string | null;
  supportNeeded?: string | null;
  nextDayFocus?: string | null;
  managerComment?: string | null;
  requestedChanges?: { fields: string[]; message: string; requestedAt: string } | null;
  correctionWindowUntil?: string | null;
  lockedAt?: string | null;
  lockedById?: string | null;
  lockReason?: string | null;
  dailyTasks: TaskRecord[];
}

export interface TaskRecord {
  id: string;
  workdayId: string;
  employeeId: string;
  title: string;
  description?: string | null;
  project: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  taskType: "PLANNED" | "SUPPORT" | "MEETING" | "INCIDENT" | "LEARNING" | "ADMINISTRATIVE";
  expectedOutput?: string | null;
  estimatedMinutes: number;
  dueDate?: string | null;
  weeklyGoalId?: string | null;
  externalTicketUrl?: string | null;
  dependencies?: string | null;
  isConfidential: boolean;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "PARTIALLY_COMPLETED" | "BLOCKED" | "CARRIED_FORWARD" | "CANCELLED";
  completionPercentage: number;
  workCompleted?: string | null;
  actualMinutes?: number | null;
  remainingWork?: string | null;
  delayReason?: string | null;
  blockerReference?: string | null;
  evidenceUrl?: string | null;
  nextAction?: string | null;
  carriedForwardToTaskId?: string | null;
  sortOrder: number;
}

export interface AmendmentRecord {
  id: string;
  workdayId: string;
  amendedById: string;
  amendedAt: string;
  reason: string;
  priorSnapshot: Record<string, unknown>;
  newSnapshot: Record<string, unknown>;
}

// In-memory mock store for unit testing & decoupled execution
const inMemoryWorkdays = new Map<string, WorkdayRecord>();
const inMemoryAmendments: AmendmentRecord[] = [];

export class WorkdayService {
  private static orgFallbackReviewerId: string | null = null;

  /**
   * Set org-wide fallback reviewer for unassigned employees (e.g. HR with no formal manager)
   */
  static setOrgFallbackReviewerId(id: string | null): void {
    WorkdayService.orgFallbackReviewerId = id;
  }

  /**
   * Get current org fallback reviewer ID
   */
  static getOrgFallbackReviewerId(): string | null {
    return WorkdayService.orgFallbackReviewerId;
  }

  /**
   * Submit Start-of-Day (SOD) plan with tasks
   */
  static async submitSOD(params: {
    actor: AuthActor;
    input: SodSubmissionInput;
    employeeId?: string;
  }): Promise<WorkdayRecord> {
    const targetEmployeeId = params.employeeId || params.actor.employeeId || params.actor.userId;

    // 1. Authorize actor
    await assertAuthorized({
      actor: params.actor,
      permission: PERMISSIONS.DAILY_TASK_CREATE,
      resource: { employeeId: targetEmployeeId },
    });

    const key = `${targetEmployeeId}_${params.input.workDate}`;
    let workday = inMemoryWorkdays.get(key);

    const now = new Date().toISOString();
    const workdayId = workday?.id || `wd-${crypto.randomUUID()}`;

    const tasks: TaskRecord[] = params.input.tasks.map((t, idx) => ({
      id: `task-${crypto.randomUUID()}`,
      workdayId,
      employeeId: targetEmployeeId,
      title: t.title,
      description: t.description || null,
      project: t.project,
      priority: t.priority as any,
      taskType: t.taskType as any,
      expectedOutput: t.expectedOutput || null,
      estimatedMinutes: t.estimatedMinutes,
      dueDate: t.dueDate || null,
      weeklyGoalId: t.weeklyGoalId || null,
      externalTicketUrl: t.externalTicketUrl || null,
      dependencies: t.dependencies || null,
      isConfidential: t.isConfidential,
      status: "NOT_STARTED",
      completionPercentage: 0,
      workCompleted: null,
      actualMinutes: null,
      remainingWork: null,
      delayReason: null,
      blockerReference: null,
      evidenceUrl: null,
      nextAction: null,
      carriedForwardToTaskId: null,
      sortOrder: idx,
    }));

    workday = {
      id: workdayId,
      employeeId: targetEmployeeId,
      workDate: params.input.workDate,
      workMode: params.input.workMode,
      shift: params.input.shift,
      plannedHours: params.input.plannedHours,
      checkInTime: workday?.checkInTime || now,
      checkOutTime: workday?.checkOutTime || null,
      calculatedWorkedHours: workday?.calculatedWorkedHours || null,
      sodSubmittedAt: now,
      eodSubmittedAt: workday?.eodSubmittedAt || null,
      status: "SOD_SUBMITTED",
      achievements: workday?.achievements || null,
      issues: workday?.issues || null,
      supportNeeded: workday?.supportNeeded || null,
      nextDayFocus: workday?.nextDayFocus || null,
      managerComment: workday?.managerComment || null,
      requestedChanges: null,
      correctionWindowUntil: null,
      lockedAt: null,
      lockedById: null,
      lockReason: null,
      dailyTasks: tasks,
    };

    inMemoryWorkdays.set(key, workday);

    // Persist to Supabase public.workdays table
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();
      if (supabase) {
        let empName = params.actor.userId;
        try {
          const { WorkpulseSharedStore } = await import("@/lib/stores/workpulse-shared-store");
          const emp = WorkpulseSharedStore.getEmployeeById(targetEmployeeId);
          if (emp?.name) empName = emp.name;
        } catch {}

        await supabase.from("workdays").upsert({
          id: workday.id,
          employee_id: targetEmployeeId,
          employee_name: empName,
          date: params.input.workDate,
          work_mode: workday.workMode,
          sod_status: "SUBMITTED",
          sod_time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          planned_tasks: tasks,
          overall_progress: 0,
        });
      }
      const { broadcastServerEvent } = await import("@/lib/supabase/broadcast");
      await broadcastServerEvent("workday:sod_submitted", workday);
    } catch {
      // Graceful fallback
    }

    // Record Audit event
    await AuditService.record({
      actorId: params.actor.userId,
      action: "sod_submission",
      entity: "Workday",
      entityId: workday.id,
      reason: `Start-of-Day submitted with ${tasks.length} tasks`,
      afterState: { ...workday } as any,
    });

    return workday;
  }

  /**
   * Submit End-of-Day (EOD) results & Daily summary
   */
  static async submitEOD(params: {
    actor: AuthActor;
    input: EodSubmissionInput;
  }): Promise<WorkdayRecord> {
    // Find workday
    let existingWorkday: WorkdayRecord | undefined;
    let workdayKey = "";
    for (const [k, wd] of inMemoryWorkdays.entries()) {
      if (wd.id === params.input.workdayId) {
        existingWorkday = wd;
        workdayKey = k;
        break;
      }
    }

    if (!existingWorkday) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/admin");
        const supabase = createAdminClient();
        if (supabase) {
          const today = new Date().toISOString().split("T")[0]!;
          let query = supabase.from("workdays").select("*");
          if (params.input.workdayId && !params.input.workdayId.startsWith("wd-")) {
            query = query.eq("id", params.input.workdayId);
          } else {
            const empId = params.actor.employeeId || params.actor.userId;
            query = query.eq("employee_id", empId).eq("date", today);
          }
          const { data } = await query.maybeSingle();
          if (data) {
            existingWorkday = {
              id: data.id,
              employeeId: data.employee_id,
              workDate: data.date,
              workMode: data.work_mode || "OFFICE",
              shift: "10:00 AM - 07:00 PM",
              plannedHours: 8.0,
              checkInTime: data.sod_time ? `${data.date}T${data.sod_time}:00Z` : new Date().toISOString(),
              checkOutTime: null,
              calculatedWorkedHours: null,
              sodSubmittedAt: data.sod_time,
              eodSubmittedAt: null,
              status: data.sod_status === "SUBMITTED" ? "SOD_SUBMITTED" : "OPEN",
              achievements: data.achievements,
              issues: data.blockers,
              supportNeeded: null,
              nextDayFocus: data.tomorrow_focus,
              managerComment: data.lead_feedback_note,
              requestedChanges: null,
              correctionWindowUntil: null,
              lockedAt: null,
              lockedById: null,
              lockReason: null,
              dailyTasks: Array.isArray(data.planned_tasks) ? data.planned_tasks : [],
            };
            workdayKey = `${existingWorkday.employeeId}_${existingWorkday.workDate}`;
          }
        }
      } catch (e) {
        console.warn("Supabase fallback lookup error in submitEOD:", e);
      }
    }

    if (!existingWorkday) {
      const empId = params.actor.employeeId || params.actor.userId;
      const today = new Date().toISOString().split("T")[0]!;
      workdayKey = `${empId}_${today}`;
      existingWorkday = {
        id: params.input.workdayId || `wd-${empId}`,
        employeeId: empId,
        workDate: today,
        workMode: "OFFICE",
        shift: "10:00 AM - 07:00 PM",
        plannedHours: 8.0,
        checkInTime: new Date().toISOString(),
        checkOutTime: null,
        calculatedWorkedHours: null,
        sodSubmittedAt: new Date().toISOString(),
        eodSubmittedAt: null,
        status: "SOD_SUBMITTED",
        achievements: null,
        issues: null,
        supportNeeded: null,
        nextDayFocus: null,
        managerComment: null,
        requestedChanges: null,
        correctionWindowUntil: null,
        lockedAt: null,
        lockedById: null,
        lockReason: null,
        dailyTasks: [],
      };
    }

    // 1. Authorize actor
    await assertAuthorized({
      actor: params.actor,
      permission: PERMISSIONS.DAILY_TASK_UPDATE,
      resource: { employeeId: existingWorkday.employeeId },
    });

    // Check state machine validity
    if (existingWorkday.status === "LOCKED") {
      throw new Error("Cannot submit EOD for a locked workday.");
    }

    const now = new Date().toISOString();
    let totalActualMinutes = 0;

    // Update Tasks & validate rules
    const updatedTasks: TaskRecord[] = params.input.tasks.map((tInput) => {
      const existingTask = existingWorkday!.dailyTasks.find((t) => t.id === tInput.id);
      const estimated = existingTask?.estimatedMinutes || 60;

      // 100% completion rule
      if (tInput.status === "COMPLETED" && tInput.completionPercentage !== 100) {
        throw new Error(`Task '${tInput.title}' is marked COMPLETED but completion is not 100%.`);
      }

      // Cancelled rule
      if (tInput.status === "CANCELLED" && (!tInput.delayReason || tInput.delayReason.trim().length === 0)) {
        throw new Error(`Task '${tInput.title}' is marked CANCELLED but lacks a mandatory reason.`);
      }

      // Handle carry forward task linkage
      let carriedForwardId = existingTask?.carriedForwardToTaskId || null;
      if (tInput.status === "CARRIED_FORWARD" && !carriedForwardId) {
        carriedForwardId = `task-cf-${crypto.randomUUID()}`;
      }

      const actualMins = tInput.actualMinutes ?? estimated;
      totalActualMinutes += actualMins;

      return {
        id: tInput.id,
        workdayId: existingWorkday!.id,
        employeeId: existingWorkday!.employeeId,
        title: tInput.title || existingTask?.title || "Untitled Task",
        description: existingTask?.description || null,
        project: existingTask?.project || "General",
        priority: existingTask?.priority || "MEDIUM",
        taskType: existingTask?.taskType || "PLANNED",
        expectedOutput: existingTask?.expectedOutput || null,
        estimatedMinutes: estimated,
        dueDate: existingTask?.dueDate || null,
        weeklyGoalId: existingTask?.weeklyGoalId || null,
        externalTicketUrl: existingTask?.externalTicketUrl || null,
        dependencies: existingTask?.dependencies || null,
        isConfidential: existingTask?.isConfidential || false,
        status: tInput.status as any,
        completionPercentage: tInput.completionPercentage,
        workCompleted: tInput.workCompleted || null,
        actualMinutes: actualMins,
        remainingWork: tInput.remainingWork || null,
        delayReason: tInput.delayReason || null,
        blockerReference: tInput.blockerReference || null,
        evidenceUrl: tInput.evidenceUrl || null,
        nextAction: tInput.nextAction || null,
        carriedForwardToTaskId: carriedForwardId,
        sortOrder: existingTask?.sortOrder || 0,
      };
    });

    const workedHours = Number((totalActualMinutes / 60).toFixed(2));
    const priorState = { ...existingWorkday };

    const updatedWorkday: WorkdayRecord = {
      ...existingWorkday,
      status: "EOD_SUBMITTED",
      eodSubmittedAt: now,
      checkOutTime: now,
      calculatedWorkedHours: workedHours,
      achievements: params.input.dailySummary.achievements,
      issues: params.input.dailySummary.issues || null,
      supportNeeded: params.input.dailySummary.supportNeeded || null,
      nextDayFocus: params.input.dailySummary.nextDayFocus || null,
      requestedChanges: null,
      dailyTasks: updatedTasks,
    };

    inMemoryWorkdays.set(workdayKey, updatedWorkday);

    // Persist to Supabase public.workdays table
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();
      if (supabase) {
        await supabase.from("workdays").upsert({
          id: updatedWorkday.id,
          employee_id: updatedWorkday.employeeId,
          date: updatedWorkday.workDate,
          work_mode: updatedWorkday.workMode,
          eod_status: "SUBMITTED",
          eod_time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          actual_hours: workedHours,
          achievements: params.input.dailySummary.achievements,
          blockers: params.input.dailySummary.issues || null,
          tomorrow_focus: params.input.dailySummary.nextDayFocus || null,
          planned_tasks: updatedTasks,
          overall_progress: 100,
        });
      }
      const { broadcastServerEvent } = await import("@/lib/supabase/broadcast");
      await broadcastServerEvent("workday:eod_submitted", updatedWorkday);
    } catch {
      // Graceful fallback
    }

    // Record Audit Event
    await AuditService.record({
      actorId: params.actor.userId,
      action: "eod_submission",
      entity: "Workday",
      entityId: updatedWorkday.id,
      reason: "End-of-Day results and daily summary submitted",
      beforeState: priorState as any,
      afterState: { ...updatedWorkday } as any,
    });

    return updatedWorkday;
  }

  /**
   * Manager requests correction on specific workday fields
   */
  static async requestChanges(params: {
    actor: AuthActor;
    input: ManagerChangeRequestInput;
  }): Promise<WorkdayRecord> {
    let existingWorkday: WorkdayRecord | undefined;
    let workdayKey = "";
    for (const [k, wd] of inMemoryWorkdays.entries()) {
      if (wd.id === params.input.workdayId) {
        existingWorkday = wd;
        workdayKey = k;
        break;
      }
    }

    if (!existingWorkday) {
      throw new Error(`Workday with ID ${params.input.workdayId} not found.`);
    }

    // Authorize Manager or designated Fallback Reviewer or Admin
    await assertAuthorized({
      actor: params.actor,
      permission: PERMISSIONS.DAILY_TASK_READ_TEAM,
      resource: {
        employeeId: existingWorkday.employeeId,
        fallbackReviewerId: WorkdayService.orgFallbackReviewerId || undefined,
      },
    });

    const now = new Date().toISOString();
    const updatedWorkday: WorkdayRecord = {
      ...existingWorkday,
      status: "CHANGES_REQUESTED",
      requestedChanges: {
        fields: params.input.requestedFields,
        message: params.input.message,
        requestedAt: now,
      },
    };

    inMemoryWorkdays.set(workdayKey, updatedWorkday);

    await AuditService.record({
      actorId: params.actor.userId,
      action: "workday_change_requested",
      entity: "Workday",
      entityId: updatedWorkday.id,
      reason: params.input.message,
      afterState: { requestedChanges: updatedWorkday.requestedChanges } as any,
    });

    return updatedWorkday;
  }

  /**
   * Lock Workday
   */
  static async lockWorkday(params: {
    actor: AuthActor;
    workdayId: string;
    reason?: string;
  }): Promise<WorkdayRecord> {
    let existingWorkday: WorkdayRecord | undefined;
    let workdayKey = "";
    for (const [k, wd] of inMemoryWorkdays.entries()) {
      if (wd.id === params.workdayId) {
        existingWorkday = wd;
        workdayKey = k;
        break;
      }
    }

    if (!existingWorkday) {
      throw new Error(`Workday with ID ${params.workdayId} not found.`);
    }

    // Authorize Manager or Fallback Reviewer or Admin or Self
    await assertAuthorized({
      actor: params.actor,
      permission: PERMISSIONS.DAILY_TASK_READ_TEAM,
      resource: {
        employeeId: existingWorkday.employeeId,
        fallbackReviewerId: WorkdayService.orgFallbackReviewerId || undefined,
      },
    });

    const now = new Date().toISOString();
    const updatedWorkday: WorkdayRecord = {
      ...existingWorkday,
      status: "LOCKED",
      lockedAt: now,
      lockedById: params.actor.userId,
      lockReason: params.reason || "Workday submission finalized and locked",
    };

    inMemoryWorkdays.set(workdayKey, updatedWorkday);

    await AuditService.record({
      actorId: params.actor.userId,
      action: "workday_locked",
      entity: "Workday",
      entityId: updatedWorkday.id,
      reason: params.reason || "Locked by manager / system",
    });

    return updatedWorkday;
  }

  /**
   * Amend Workday with historical snapshot preservation
   */
  static async amendWorkday(params: {
    actor: AuthActor;
    input: WorkdayAmendmentInput;
  }): Promise<{ workday: WorkdayRecord; amendment: AmendmentRecord }> {
    let existingWorkday: WorkdayRecord | undefined;
    let workdayKey = "";
    for (const [k, wd] of inMemoryWorkdays.entries()) {
      if (wd.id === params.input.workdayId) {
        existingWorkday = wd;
        workdayKey = k;
        break;
      }
    }

    if (!existingWorkday) {
      throw new Error(`Workday with ID ${params.input.workdayId} not found.`);
    }

    const priorSnapshot = { ...existingWorkday };
    const now = new Date().toISOString();

    const updatedWorkday: WorkdayRecord = {
      ...existingWorkday,
      status: "AMENDED",
      achievements: params.input.achievements ?? existingWorkday.achievements,
      issues: params.input.issues ?? existingWorkday.issues,
      supportNeeded: params.input.supportNeeded ?? existingWorkday.supportNeeded,
      nextDayFocus: params.input.nextDayFocus ?? existingWorkday.nextDayFocus,
      managerComment: params.input.managerComment ?? existingWorkday.managerComment,
    };

    inMemoryWorkdays.set(workdayKey, updatedWorkday);

    const amendment: AmendmentRecord = {
      id: `amend-${crypto.randomUUID()}`,
      workdayId: existingWorkday.id,
      amendedById: params.actor.userId,
      amendedAt: now,
      reason: params.input.reason,
      priorSnapshot: priorSnapshot as any,
      newSnapshot: updatedWorkday as any,
    };

    inMemoryAmendments.push(amendment);

    await AuditService.record({
      actorId: params.actor.userId,
      action: "workday_amended",
      entity: "Workday",
      entityId: existingWorkday.id,
      reason: params.input.reason,
      beforeState: priorSnapshot as any,
      afterState: updatedWorkday as any,
    });

    return { workday: updatedWorkday, amendment };
  }

  /**
   * Retrieve Workday for specific date
   */
  static async getWorkday(params: {
    employeeId: string;
    workDate: string;
  }): Promise<WorkdayRecord | null> {
    const key = `${params.employeeId}_${params.workDate}`;
    let wd = inMemoryWorkdays.get(key);

    if (!wd) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/admin");
        const supabase = createAdminClient();
        if (supabase) {
          const { data } = await supabase
            .from("workdays")
            .select("*")
            .eq("employee_id", params.employeeId)
            .eq("date", params.workDate)
            .maybeSingle();

          if (data) {
            wd = {
              id: data.id,
              employeeId: data.employee_id,
              workDate: data.date,
              workMode: data.work_mode || "OFFICE",
              shift: "10:00 AM - 07:00 PM",
              plannedHours: 8.0,
              checkInTime: data.sod_time ? `${data.date}T${data.sod_time}:00Z` : null,
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
            inMemoryWorkdays.set(key, wd);
          }
        }
      } catch {
        // safe fallback
      }
    }

    return wd || null;
  }

  /**
   * Retrieve Week View Days (7 days Mon–Sun)
   */
  static async getWeekSummary(params: {
    employeeId: string;
    startDate: string; // YYYY-MM-DD
  }): Promise<{ date: string; dayOfWeek: string; workday: WorkdayRecord | null; hasUpdate: boolean }[]> {
    const start = new Date(params.startDate);
    const days: { date: string; dayOfWeek: string; workday: WorkdayRecord | null; hasUpdate: boolean }[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateStr = d.toISOString().split("T")[0]!;
      const dayOfWeek = d.toLocaleDateString("en-US", { weekday: "short" });
      const wd = await this.getWorkday({ employeeId: params.employeeId, workDate: dateStr });

      days.push({
        date: dateStr,
        dayOfWeek,
        workday: wd,
        hasUpdate: Boolean(wd && (wd.status === "SOD_SUBMITTED" || wd.status === "EOD_SUBMITTED" || wd.status === "LOCKED" || wd.status === "AMENDED")),
      });
    }

    return days;
  }

  /**
   * Retrieve Month Heatmap Data (Contribution Grid)
   */
  static async getMonthHeatmap(params: {
    employeeId: string;
    year: number;
    month: number; // 1 - 12
  }): Promise<{ date: string; status: string; taskCount: number; workedHours: number }[]> {
    const daysInMonth = new Date(params.year, params.month, 0).getDate();
    const result = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${params.year}-${String(params.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const wd = await this.getWorkday({ employeeId: params.employeeId, workDate: dateStr });

      result.push({
        date: dateStr,
        status: wd?.status || "NO_DATA",
        taskCount: wd?.dailyTasks?.length || 0,
        workedHours: wd?.calculatedWorkedHours || (wd?.plannedHours || 0),
      });
    }

    return result;
  }

  /**
   * Reset in-memory store for unit test isolation
   */
  static clearStore(): void {
    inMemoryWorkdays.clear();
    inMemoryAmendments.length = 0;
    WorkdayService.orgFallbackReviewerId = null;
  }
}
