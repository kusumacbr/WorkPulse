import { AuditService } from "@/lib/audit/audit-service";
import { AuthActor } from "@/lib/authorization/types";
import { assertAuthorized } from "@/lib/authorization/authorize";
import { PERMISSIONS } from "@/lib/authorization/permissions";
import {
  LeaveRequestCreateInput,
  ManagerLeaveReviewInput,
  HrLeaveReviewInput,
  WfhRequestCreateInput,
  ManagerWfhReviewInput,
} from "@/lib/validation/leave";

export interface LeaveBalanceRecord {
  employeeId: string;
  year: number;
  leaveType: "CASUAL" | "SICK" | "PRIVILEGE" | "UNPAID";
  annualAllotment: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
}

export interface LeaveRequestRecord {
  id: string;
  employeeId: string;
  leaveType: "CASUAL" | "SICK" | "PRIVILEGE" | "UNPAID";
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  halfDayType?: string | null;
  daysCount: number;
  reason: string;
  attachmentUrl?: string | null;
  handoverNotes?: string | null;
  backupEmployeeId?: string | null;
  managerApproverId?: string | null;
  managerApprovedAt?: string | null;
  managerComment?: string | null;
  hrApproverId?: string | null;
  hrApprovedAt?: string | null;
  hrComment?: string | null;
  status: "PENDING_MANAGER" | "PENDING_HR" | "APPROVED" | "REJECTED" | "CANCELLED";
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WfhRequestRecord {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  isSelfMarked: boolean;
  reason: string;
  availabilityHours: string;
  contactMethod: string;
  plannedDeliverables: string;
  managerApproverId?: string | null;
  managerApprovedAt?: string | null;
  status: "PENDING_MANAGER" | "APPROVED" | "REJECTED" | "CANCELLED";
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

// In-memory mock store
const inMemoryBalances = new Map<string, LeaveBalanceRecord>();
const inMemoryLeaveRequests = new Map<string, LeaveRequestRecord>();
const inMemoryWfhRequests = new Map<string, WfhRequestRecord>();

// Configurable monthly self-mark WFH threshold (HR-managed, default 2 days/month)
let monthlySelfMarkThreshold = 2;

export class LeaveService {
  /**
   * Set company-wide monthly self-mark threshold (HR-only)
   */
  static setMonthlySelfMarkThreshold(threshold: number): void {
    monthlySelfMarkThreshold = threshold;
  }

  static getMonthlySelfMarkThreshold(): number {
    return monthlySelfMarkThreshold;
  }

  /**
   * Get or initialize leave balance for employee
   */
  static async getLeaveBalance(params: {
    employeeId: string;
    year?: number;
    leaveType?: "CASUAL" | "SICK" | "PRIVILEGE" | "UNPAID";
  }): Promise<LeaveBalanceRecord> {
    const yr = params.year || new Date().getFullYear();
    const type = params.leaveType || "CASUAL";
    const key = `${params.employeeId}_${yr}_${type}`;

    let balance = inMemoryBalances.get(key);
    if (!balance) {
      balance = {
        employeeId: params.employeeId,
        year: yr,
        leaveType: type,
        annualAllotment: 12.0,
        usedDays: 0.0,
        pendingDays: 0.0,
        remainingDays: 12.0,
      };
      inMemoryBalances.set(key, balance);
    }
    return balance;
  }

  /**
   * Submit Leave Request (Stage 0 -> PENDING_MANAGER)
   */
  static async submitLeaveRequest(params: {
    actor: AuthActor;
    input: LeaveRequestCreateInput;
    employeeId?: string;
  }): Promise<LeaveRequestRecord> {
    const targetEmployeeId = params.employeeId || params.actor.employeeId || params.actor.userId;

    await assertAuthorized({
      actor: params.actor,
      permission: PERMISSIONS.LEAVE_CREATE,
      resource: { employeeId: targetEmployeeId },
    });

    // Check for overlapping approved leave or WFH
    const start = new Date(params.input.startDate);
    const end = new Date(params.input.endDate);
    const daysCount = params.input.isHalfDay ? 0.5 : Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    for (const req of inMemoryLeaveRequests.values()) {
      if (req.employeeId === targetEmployeeId && req.status === "APPROVED") {
        if (params.input.startDate <= req.endDate && params.input.endDate >= req.startDate) {
          throw new Error(`Overlapping approved leave request (${req.startDate} to ${req.endDate}) already exists.`);
        }
      }
    }

    for (const req of inMemoryWfhRequests.values()) {
      if (req.employeeId === targetEmployeeId && req.status === "APPROVED") {
        if (params.input.startDate <= req.endDate && params.input.endDate >= req.startDate) {
          throw new Error(`Overlapping approved WFH request (${req.startDate} to ${req.endDate}) already exists.`);
        }
      }
    }

    // Check leave balance
    const balance = await this.getLeaveBalance({
      employeeId: targetEmployeeId,
      leaveType: params.input.leaveType as any,
    });

    if (balance.remainingDays < daysCount) {
      throw new Error(`Insufficient leave balance: Requested ${daysCount} days, but only ${balance.remainingDays} days remaining.`);
    }

    const now = new Date().toISOString();
    const requestId = `leave-${crypto.randomUUID()}`;

    const request: LeaveRequestRecord = {
      id: requestId,
      employeeId: targetEmployeeId,
      leaveType: params.input.leaveType as any,
      startDate: params.input.startDate,
      endDate: params.input.endDate,
      isHalfDay: params.input.isHalfDay,
      halfDayType: params.input.halfDayType || null,
      daysCount,
      reason: params.input.reason,
      attachmentUrl: params.input.attachmentUrl || null,
      handoverNotes: params.input.handoverNotes || null,
      backupEmployeeId: params.input.backupEmployeeId || null,
      managerApproverId: null,
      managerApprovedAt: null,
      managerComment: null,
      hrApproverId: null,
      hrApprovedAt: null,
      hrComment: null,
      status: "PENDING_MANAGER",
      rejectionReason: null,
      createdAt: now,
      updatedAt: now,
    };

    inMemoryLeaveRequests.set(requestId, request);

    await AuditService.record({
      actorId: params.actor.userId,
      action: "leave_request_submitted",
      entity: "LeaveRequest",
      entityId: request.id,
      reason: `Leave requested: ${request.daysCount} days (${request.leaveType})`,
      afterState: { ...request } as any,
    });

    return request;
  }

  /**
   * Stage 1: Team Lead / Manager Approval
   */
  static async managerReviewLeave(params: {
    actor: AuthActor;
    input: ManagerLeaveReviewInput;
  }): Promise<LeaveRequestRecord> {
    const request = inMemoryLeaveRequests.get(params.input.requestId);
    if (!request) {
      throw new Error(`Leave request ${params.input.requestId} not found.`);
    }

    // Authorization rule: Employee can NEVER approve own leave
    if (params.actor.employeeId === request.employeeId || params.actor.userId === request.employeeId) {
      throw new Error("Self-approval forbidden: An employee cannot approve their own leave request.");
    }

    await assertAuthorized({
      actor: params.actor,
      permission: PERMISSIONS.LEAVE_APPROVE_MANAGER,
      resource: { employeeId: request.employeeId },
    });

    if (request.status !== "PENDING_MANAGER") {
      throw new Error(`Cannot review leave request in ${request.status} state.`);
    }

    const now = new Date().toISOString();
    request.managerApproverId = params.actor.employeeId || params.actor.userId;
    request.managerApprovedAt = now;
    request.managerComment = params.input.comment || null;
    request.updatedAt = now;

    if (params.input.action === "REJECT") {
      // Closes immediately as REJECTED; HR never sees it
      request.status = "REJECTED";
      request.rejectionReason = params.input.rejectionReason || "Rejected by manager";
    } else {
      // Moves into HR queue
      request.status = "PENDING_HR";
    }

    await AuditService.record({
      actorId: params.actor.userId,
      action: `leave_manager_${params.input.action.toLowerCase()}`,
      entity: "LeaveRequest",
      entityId: request.id,
      reason: request.rejectionReason || request.managerComment || "Manager approved stage 1",
      afterState: { ...request } as any,
    });

    return request;
  }

  /**
   * Stage 2: Final HR Approval (Enforces Strict Server-Side Sequencing)
   */
  static async hrReviewLeave(params: {
    actor: AuthActor;
    input: HrLeaveReviewInput;
  }): Promise<LeaveRequestRecord> {
    const request = inMemoryLeaveRequests.get(params.input.requestId);
    if (!request) {
      throw new Error(`Leave request ${params.input.requestId} not found.`);
    }

    // Self-approval check
    if (params.actor.employeeId === request.employeeId || params.actor.userId === request.employeeId) {
      throw new Error("Self-approval forbidden: An employee cannot approve their own leave request.");
    }

    await assertAuthorized({
      actor: params.actor,
      permission: PERMISSIONS.LEAVE_APPROVE_HR,
      resource: { employeeId: request.employeeId },
    });

    // SEQUENCING ENFORCEMENT: HR literally cannot act on requests manager hasn't approved
    if (request.status !== "PENDING_HR") {
      throw new Error(
        `Strict sequencing error: HR can only review requests in PENDING_HR state. Current status is ${request.status}.`
      );
    }

    const now = new Date().toISOString();
    request.hrApproverId = params.actor.employeeId || params.actor.userId;
    request.hrApprovedAt = now;
    request.hrComment = params.input.comment || null;
    request.updatedAt = now;

    if (params.input.action === "REJECT") {
      request.status = "REJECTED";
      request.rejectionReason = params.input.rejectionReason || "Rejected by HR";
    } else {
      request.status = "APPROVED";

      // Decrement Leave Balance only on final HR approval
      const balance = await this.getLeaveBalance({
        employeeId: request.employeeId,
        leaveType: request.leaveType,
      });

      balance.usedDays += request.daysCount;
      balance.remainingDays = Math.max(0, balance.annualAllotment - balance.usedDays);
    }

    await AuditService.record({
      actorId: params.actor.userId,
      action: `leave_hr_${params.input.action.toLowerCase()}`,
      entity: "LeaveRequest",
      entityId: request.id,
      reason: request.rejectionReason || request.hrComment || "HR final approval granted",
      afterState: { ...request } as any,
    });

    return request;
  }

  /**
   * Submit Work-From-Home (WFH) Request (Single-Stage Manager Approval & Self-Mark Threshold)
   */
  static async submitWfhRequest(params: {
    actor: AuthActor;
    input: WfhRequestCreateInput;
    employeeId?: string;
  }): Promise<WfhRequestRecord> {
    const targetEmployeeId = params.employeeId || params.actor.employeeId || params.actor.userId;

    await assertAuthorized({
      actor: params.actor,
      permission: PERMISSIONS.WFH_CREATE,
      resource: { employeeId: targetEmployeeId },
    });

    const start = new Date(params.input.startDate);
    const end = new Date(params.input.endDate);
    const daysCount = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    // Overlapping check
    for (const req of inMemoryLeaveRequests.values()) {
      if (req.employeeId === targetEmployeeId && req.status === "APPROVED") {
        if (params.input.startDate <= req.endDate && params.input.endDate >= req.startDate) {
          throw new Error(`Overlapping approved leave request (${req.startDate} to ${req.endDate}) already exists.`);
        }
      }
    }

    const now = new Date().toISOString();
    const requestId = `wfh-${crypto.randomUUID()}`;

    let status: WfhRequestRecord["status"] = "PENDING_MANAGER";
    const isSelfMarked = Boolean(params.input.isSelfMarked);

    // Self-mark threshold logic
    if (isSelfMarked) {
      // Calculate self-marked days in current month
      const currentMonth = params.input.startDate.slice(0, 7); // YYYY-MM
      const usedSelfMarkDays = Array.from(inMemoryWfhRequests.values())
        .filter(
          (w) =>
            w.employeeId === targetEmployeeId &&
            w.isSelfMarked &&
            w.startDate.startsWith(currentMonth) &&
            w.status === "APPROVED"
        )
        .reduce((sum, w) => sum + w.daysCount, 0);

      if (usedSelfMarkDays + daysCount <= monthlySelfMarkThreshold) {
        status = "APPROVED"; // Auto-approved via self-mark threshold
      } else {
        throw new Error(
          `Monthly self-mark WFH threshold exceeded (${usedSelfMarkDays}/${monthlySelfMarkThreshold} used). Please submit a standard manager-approved WFH request.`
        );
      }
    }

    const wfhRecord: WfhRequestRecord = {
      id: requestId,
      employeeId: targetEmployeeId,
      startDate: params.input.startDate,
      endDate: params.input.endDate,
      daysCount,
      isSelfMarked,
      reason: params.input.reason,
      availabilityHours: params.input.availabilityHours || "09:00-18:00",
      contactMethod: params.input.contactMethod || "Slack & Google Meet",
      plannedDeliverables: params.input.plannedDeliverables,
      managerApproverId: status === "APPROVED" ? "SYSTEM_SELF_MARK" : null,
      managerApprovedAt: status === "APPROVED" ? now : null,
      status,
      rejectionReason: null,
      createdAt: now,
      updatedAt: now,
    };

    inMemoryWfhRequests.set(requestId, wfhRecord);

    await AuditService.record({
      actorId: params.actor.userId,
      action: status === "APPROVED" ? "wfh_self_marked_auto_approved" : "wfh_request_submitted",
      entity: "WfhRequest",
      entityId: wfhRecord.id,
      reason: `WFH ${wfhRecord.daysCount} days: ${wfhRecord.reason}`,
      afterState: { ...wfhRecord } as any,
    });

    return wfhRecord;
  }

  /**
   * Manager reviews WFH request (Single-stage)
   */
  static async managerReviewWfh(params: {
    actor: AuthActor;
    input: ManagerWfhReviewInput;
  }): Promise<WfhRequestRecord> {
    const request = inMemoryWfhRequests.get(params.input.requestId);
    if (!request) {
      throw new Error(`WFH request ${params.input.requestId} not found.`);
    }

    if (params.actor.employeeId === request.employeeId || params.actor.userId === request.employeeId) {
      throw new Error("Self-approval forbidden: An employee cannot approve their own WFH request.");
    }

    await assertAuthorized({
      actor: params.actor,
      permission: PERMISSIONS.WFH_APPROVE,
      resource: { employeeId: request.employeeId },
    });

    const now = new Date().toISOString();
    request.managerApproverId = params.actor.employeeId || params.actor.userId;
    request.managerApprovedAt = now;
    request.updatedAt = now;

    if (params.input.action === "REJECT") {
      request.status = "REJECTED";
      request.rejectionReason = params.input.rejectionReason || "Rejected by manager";
    } else {
      request.status = "APPROVED";
    }

    await AuditService.record({
      actorId: params.actor.userId,
      action: `wfh_manager_${params.input.action.toLowerCase()}`,
      entity: "WfhRequest",
      entityId: request.id,
      reason: request.rejectionReason || "Manager approved WFH",
      afterState: { ...request } as any,
    });

    return request;
  }

  static getEmployeeRequests(employeeId: string): {
    leaveRequests: LeaveRequestRecord[];
    wfhRequests: WfhRequestRecord[];
  } {
    const leave = Array.from(inMemoryLeaveRequests.values()).filter((r) => r.employeeId === employeeId);
    const wfh = Array.from(inMemoryWfhRequests.values()).filter((r) => r.employeeId === employeeId);
    return { leaveRequests: leave, wfhRequests: wfh };
  }

  static clearStore(): void {
    inMemoryBalances.clear();
    inMemoryLeaveRequests.clear();
    inMemoryWfhRequests.clear();
    monthlySelfMarkThreshold = 2;
  }
}
