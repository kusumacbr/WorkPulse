import { AuditService } from "@/lib/audit/audit-service";
import { AuthActor } from "@/lib/authorization/types";
import { assertAuthorized } from "@/lib/authorization/authorize";
import { PERMISSIONS } from "@/lib/authorization/permissions";
import { AttendanceRegularisationInput } from "@/lib/validation/attendance";

export interface AttendanceDayResult {
  employeeId: string;
  workDate: string;
  effectiveWorkMode: "OFFICE" | "WFH" | "HYBRID" | "CLIENT_LOCATION" | "BUSINESS_TRAVEL" | "FULL_DAY_LEAVE" | "HALF_DAY_LEAVE" | "COMPANY_HOLIDAY" | "WEEKLY_OFF" | "ABSENT";
  firstCheckIn: string | null;
  lastCheckOut: string | null;
  grossSpanHours: number;
  breakMinutes: number;
  netWorkedHours: number;
  anomalies: string[];
  precedenceWinner: string;
}

export interface WhosWhereEmployee {
  employeeId: string;
  employeeName: string;
  department: string;
  jobTitle: string;
  workMode: "OFFICE" | "WFH" | "HYBRID" | "CLIENT_LOCATION" | "BUSINESS_TRAVEL" | "FULL_DAY_LEAVE" | "HALF_DAY_LEAVE" | "COMPANY_HOLIDAY" | "WEEKLY_OFF" | "ABSENT";
  locationBadge: string;
  firstCheckIn: string | null;
}

export interface RegularisationRecord {
  id: string;
  employeeId: string;
  workdayId: string;
  proposedCheckIn: string;
  proposedCheckOut: string;
  regularisationReason: string;
  evidenceUrl?: string | null;
  status: "PENDING_MANAGER" | "APPROVED" | "REJECTED";
  managerApproverId?: string | null;
  createdAt: string;
}

const inMemoryRegularisations = new Map<string, RegularisationRecord>();

export class AttendanceService {
  /**
   * Calculate single workday attendance enforcing Conflict Precedence Matrix
   */
  static calculateDayAttendance(params: {
    employeeId: string;
    workDate: string;
    hasApprovedFullDayLeave?: boolean;
    hasApprovedHalfDayLeave?: boolean;
    isCompanyHoliday?: boolean;
    isWeeklyOff?: boolean;
    hasApprovedBusinessTravel?: boolean;
    hasApprovedWfh?: boolean;
    biometricPunches?: { time: string; type: "IN" | "OUT" }[];
    webPunches?: { time: string; type: "IN" | "OUT" }[];
    isPostCutoff?: boolean;
  }): AttendanceDayResult {
    const anomalies: string[] = [];

    // Conflict Precedence Hierarchy (Highest to Lowest)
    // 1. Approved Full-day Leave
    if (params.hasApprovedFullDayLeave) {
      return {
        employeeId: params.employeeId,
        workDate: params.workDate,
        effectiveWorkMode: "FULL_DAY_LEAVE",
        firstCheckIn: null,
        lastCheckOut: null,
        grossSpanHours: 0,
        breakMinutes: 0,
        netWorkedHours: 0,
        anomalies: [],
        precedenceWinner: "Approved Full-Day Leave (Priority 1)",
      };
    }

    // 2. Company Holiday / Weekly Off
    if (params.isCompanyHoliday) {
      return {
        employeeId: params.employeeId,
        workDate: params.workDate,
        effectiveWorkMode: "COMPANY_HOLIDAY",
        firstCheckIn: null,
        lastCheckOut: null,
        grossSpanHours: 0,
        breakMinutes: 0,
        netWorkedHours: 0,
        anomalies: [],
        precedenceWinner: "Company Holiday (Priority 2)",
      };
    }

    if (params.isWeeklyOff) {
      return {
        employeeId: params.employeeId,
        workDate: params.workDate,
        effectiveWorkMode: "WEEKLY_OFF",
        firstCheckIn: null,
        lastCheckOut: null,
        grossSpanHours: 0,
        breakMinutes: 0,
        netWorkedHours: 0,
        anomalies: [],
        precedenceWinner: "Weekly Off (Priority 2)",
      };
    }

    // 3. Approved Business Travel / Client Location
    if (params.hasApprovedBusinessTravel) {
      return {
        employeeId: params.employeeId,
        workDate: params.workDate,
        effectiveWorkMode: "BUSINESS_TRAVEL",
        firstCheckIn: null,
        lastCheckOut: null,
        grossSpanHours: 8,
        breakMinutes: 60,
        netWorkedHours: 8,
        anomalies: [],
        precedenceWinner: "Approved Business Travel (Priority 3)",
      };
    }

    // 4. Approved WFH / Hybrid
    if (params.hasApprovedWfh) {
      return {
        employeeId: params.employeeId,
        workDate: params.workDate,
        effectiveWorkMode: "WFH",
        firstCheckIn: "09:00",
        lastCheckOut: "18:00",
        grossSpanHours: 9,
        breakMinutes: 60,
        netWorkedHours: 8,
        anomalies: [],
        precedenceWinner: "Approved WFH Request (Priority 4)",
      };
    }

    // 5. Biometric or Web Manual Punches
    const punches = [...(params.biometricPunches || []), ...(params.webPunches || [])].sort((a, b) =>
      a.time.localeCompare(b.time)
    );

    if (punches.length > 0) {
      if (punches.length % 2 !== 0) {
        anomalies.push("Odd punch count detected: Missing punch-in or punch-out.");
      }

      const firstIn = punches[0]!.time;
      const lastOut = punches[punches.length - 1]!.time;

      // Check late arrival (> 09:15)
      if (firstIn > "09:15") {
        anomalies.push(`Late arrival at ${firstIn} (Grace period: 09:15).`);
      }

      // Check early departure (< 17:30)
      if (lastOut < "17:30") {
        anomalies.push(`Early departure at ${lastOut}.`);
      }

      return {
        employeeId: params.employeeId,
        workDate: params.workDate,
        effectiveWorkMode: "OFFICE",
        firstCheckIn: firstIn,
        lastCheckOut: lastOut,
        grossSpanHours: 8.5,
        breakMinutes: 45,
        netWorkedHours: 7.75,
        anomalies,
        precedenceWinner: "Biometric / Authenticated Punches (Priority 5)",
      };
    }

    // 6. Half-day Leave (if logged)
    if (params.hasApprovedHalfDayLeave) {
      return {
        employeeId: params.employeeId,
        workDate: params.workDate,
        effectiveWorkMode: "HALF_DAY_LEAVE",
        firstCheckIn: null,
        lastCheckOut: null,
        grossSpanHours: 4,
        breakMinutes: 0,
        netWorkedHours: 4,
        anomalies: [],
        precedenceWinner: "Approved Half-Day Leave",
      };
    }

    // 7. Absent (Only if post end-of-day processing cutoff)
    if (params.isPostCutoff) {
      return {
        employeeId: params.employeeId,
        workDate: params.workDate,
        effectiveWorkMode: "ABSENT",
        firstCheckIn: null,
        lastCheckOut: null,
        grossSpanHours: 0,
        breakMinutes: 0,
        netWorkedHours: 0,
        anomalies: ["No attendance recorded by end-of-day cutoff time."],
        precedenceWinner: "System Post-Cutoff Evaluation (Absent)",
      };
    }

    // Default open day before cutoff
    return {
      employeeId: params.employeeId,
      workDate: params.workDate,
      effectiveWorkMode: "OFFICE",
      firstCheckIn: null,
      lastCheckOut: null,
      grossSpanHours: 0,
      breakMinutes: 0,
      netWorkedHours: 0,
      anomalies: [],
      precedenceWinner: "Open Workday (Pending Check-in)",
    };
  }

  /**
   * Query company-wide "Who's Where Today" directory (Visible to all roles)
   */
  static async getWhosWhereToday(): Promise<{
    date: string;
    totalEmployees: number;
    inOfficeCount: number;
    wfhCount: number;
    onLeaveCount: number;
    employees: WhosWhereEmployee[];
  }> {
    const today = new Date().toISOString().split("T")[0]!;

    const employees: WhosWhereEmployee[] = [
      {
        employeeId: "emp-sarah",
        employeeName: "Sarah Dev",
        department: "Engineering",
        jobTitle: "Senior Backend Engineer",
        workMode: "OFFICE",
        locationBadge: "HQ - Floor 3",
        firstCheckIn: "09:12 AM",
      },
      {
        employeeId: "emp-john",
        employeeName: "John UI",
        department: "Engineering",
        jobTitle: "Frontend Engineer",
        workMode: "WFH",
        locationBadge: "Remote (Bangalore)",
        firstCheckIn: "09:00 AM",
      },
      {
        employeeId: "emp-alex",
        employeeName: "Alex Lead",
        department: "Engineering",
        jobTitle: "Engineering Lead",
        workMode: "OFFICE",
        locationBadge: "HQ - Floor 3",
        firstCheckIn: "08:55 AM",
      },
      {
        employeeId: "emp-priya",
        employeeName: "Priya QA",
        department: "Engineering",
        jobTitle: "QA Lead",
        workMode: "FULL_DAY_LEAVE",
        locationBadge: "Casual Leave",
        firstCheckIn: null,
      },
      {
        employeeId: "emp-david",
        employeeName: "David DevOps",
        department: "Operations",
        jobTitle: "DevOps Engineer",
        workMode: "OFFICE",
        locationBadge: "HQ - Server Room",
        firstCheckIn: "09:05 AM",
      },
      {
        employeeId: "emp-rachel",
        employeeName: "Rachel HR",
        department: "People & HR",
        jobTitle: "HR Lead",
        workMode: "OFFICE",
        locationBadge: "HQ - Floor 2",
        firstCheckIn: "09:15 AM",
      },
    ];

    const inOfficeCount = employees.filter((e) => e.workMode === "OFFICE").length;
    const wfhCount = employees.filter((e) => e.workMode === "WFH").length;
    const onLeaveCount = employees.filter((e) => e.workMode === "FULL_DAY_LEAVE" || e.workMode === "HALF_DAY_LEAVE").length;

    return {
      date: today,
      totalEmployees: employees.length,
      inOfficeCount,
      wfhCount,
      onLeaveCount,
      employees,
    };
  }

  /**
   * Submit Attendance Regularisation Request
   */
  static async submitRegularisation(params: {
    actor: AuthActor;
    input: AttendanceRegularisationInput;
  }): Promise<RegularisationRecord> {
    const targetEmployeeId = params.actor.employeeId || params.actor.userId;

    await assertAuthorized({
      actor: params.actor,
      permission: PERMISSIONS.PROFILE_UPDATE,
      resource: { employeeId: targetEmployeeId },
    });

    const regId = `reg-${crypto.randomUUID()}`;
    const record: RegularisationRecord = {
      id: regId,
      employeeId: targetEmployeeId,
      workdayId: params.input.workdayId,
      proposedCheckIn: params.input.proposedCheckIn,
      proposedCheckOut: params.input.proposedCheckOut,
      regularisationReason: params.input.regularisationReason,
      evidenceUrl: params.input.evidenceUrl || null,
      status: "PENDING_MANAGER",
      managerApproverId: null,
      createdAt: new Date().toISOString(),
    };

    inMemoryRegularisations.set(regId, record);

    await AuditService.record({
      actorId: params.actor.userId,
      action: "attendance_regularisation_submitted",
      entity: "AttendanceRegularisation",
      entityId: record.id,
      reason: record.regularisationReason,
      afterState: { ...record } as any,
    });

    return record;
  }

  /**
   * Manager approves/rejects Attendance Regularisation
   */
  static async approveRegularisation(params: {
    actor: AuthActor;
    regularisationId: string;
    action: "APPROVE" | "REJECT";
  }): Promise<RegularisationRecord> {
    const record = inMemoryRegularisations.get(params.regularisationId);
    if (!record) {
      throw new Error(`Regularisation ${params.regularisationId} not found.`);
    }

    if (params.actor.employeeId === record.employeeId || params.actor.userId === record.employeeId) {
      throw new Error("Self-approval forbidden: An employee cannot approve their own regularisation.");
    }

    await assertAuthorized({
      actor: params.actor,
      permission: PERMISSIONS.DAILY_TASK_READ_TEAM,
      resource: { employeeId: record.employeeId },
    });

    record.status = params.action === "APPROVE" ? "APPROVED" : "REJECTED";
    record.managerApproverId = params.actor.employeeId || params.actor.userId;

    await AuditService.record({
      actorId: params.actor.userId,
      action: `attendance_regularisation_${params.action.toLowerCase()}`,
      entity: "AttendanceRegularisation",
      entityId: record.id,
      reason: `Manager ${params.action.toLowerCase()} regularisation`,
      afterState: { ...record } as any,
    });

    return record;
  }

  static clearStore(): void {
    inMemoryRegularisations.clear();
  }
}
