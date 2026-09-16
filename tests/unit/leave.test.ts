import { describe, it, expect, beforeEach } from "vitest";
import { LeaveService } from "@/server/services/leave-service";
import { AuthActor } from "@/lib/authorization/types";

describe("Leave & WFH Management Engine (Phase 3)", () => {
  const employeeActor: AuthActor = {
    userId: "user-sarah",
    employeeId: "emp-sarah",
    email: "dev.sarah@xorstack.com",
    roles: ["EMPLOYEE"],
    departmentId: "dept-eng",
  };

  const managerActor: AuthActor = {
    userId: "user-alex",
    employeeId: "emp-alex",
    email: "lead.alex@xorstack.com",
    roles: ["MANAGER", "EMPLOYEE"],
    departmentId: "dept-eng",
    directReportIds: ["emp-sarah"],
  };

  const hrActor: AuthActor = {
    userId: "user-rachel",
    employeeId: "emp-rachel",
    email: "hr.rachel@xorstack.com",
    roles: ["HR", "EMPLOYEE"],
    departmentId: "dept-hr",
  };

  beforeEach(() => {
    LeaveService.clearStore();
  });

  describe("Two-Stage Mandatory Leave Approval Sequencing", () => {
    it("executes full 2-stage approval flow: Employee -> Manager (Stage 1) -> HR (Stage 2) -> Approved", async () => {
      // 1. Employee submits leave request
      const req = await LeaveService.submitLeaveRequest({
        actor: employeeActor,
        input: {
          leaveType: "CASUAL",
          startDate: "2026-08-28",
          endDate: "2026-08-28",
          isHalfDay: false,
          reason: "Family gathering",
          handoverNotes: "Tasks covered by John UI",
          backupEmployeeId: "emp-john",
        },
      });

      expect(req.status).toBe("PENDING_MANAGER");
      expect(req.daysCount).toBe(1.0);

      // 2. HR attempts to approve directly BEFORE Manager approval -> Must fail with sequencing error!
      await expect(
        LeaveService.hrReviewLeave({
          actor: hrActor,
          input: {
            requestId: req.id,
            action: "APPROVE",
          },
        })
      ).rejects.toThrow(/Strict sequencing error: HR can only review requests in PENDING_HR state/);

      // 3. Manager approves Stage 1
      const managerApproved = await LeaveService.managerReviewLeave({
        actor: managerActor,
        input: {
          requestId: req.id,
          action: "APPROVE",
          comment: "Coverage confirmed.",
        },
      });

      expect(managerApproved.status).toBe("PENDING_HR");
      expect(managerApproved.managerApproverId).toBe("emp-alex");

      // 4. HR gives final approval (Stage 2)
      const finalApproved = await LeaveService.hrReviewLeave({
        actor: hrActor,
        input: {
          requestId: req.id,
          action: "APPROVE",
          comment: "HR final sign-off.",
        },
      });

      expect(finalApproved.status).toBe("APPROVED");
      expect(finalApproved.hrApproverId).toBe("emp-rachel");

      // 5. Verify Leave Balance was decremented upon final HR approval
      const balance = await LeaveService.getLeaveBalance({
        employeeId: "emp-sarah",
        leaveType: "CASUAL",
      });

      expect(balance.usedDays).toBe(1.0);
      expect(balance.remainingDays).toBe(11.0);
    });

    it("terminates immediately if manager rejects at Stage 1 (HR never sees it)", async () => {
      const req = await LeaveService.submitLeaveRequest({
        actor: employeeActor,
        input: {
          leaveType: "CASUAL",
          startDate: "2026-09-01",
          endDate: "2026-09-02",
          isHalfDay: false,
          reason: "Trip",
        },
      });

      const rejected = await LeaveService.managerReviewLeave({
        actor: managerActor,
        input: {
          requestId: req.id,
          action: "REJECT",
          rejectionReason: "Critical sprint release scheduled on these dates.",
        },
      });

      expect(rejected.status).toBe("REJECTED");
      expect(rejected.rejectionReason).toContain("Critical sprint release");

      // Balance remains intact
      const balance = await LeaveService.getLeaveBalance({
        employeeId: "emp-sarah",
        leaveType: "CASUAL",
      });
      expect(balance.usedDays).toBe(0);
      expect(balance.remainingDays).toBe(12.0);
    });

    it("blocks self-approval under all circumstances", async () => {
      const req = await LeaveService.submitLeaveRequest({
        actor: employeeActor,
        input: {
          leaveType: "CASUAL",
          startDate: "2026-09-05",
          endDate: "2026-09-05",
          isHalfDay: false,
          reason: "Appointment",
        },
      });

      // Employee tries to approve own leave
      await expect(
        LeaveService.managerReviewLeave({
          actor: employeeActor,
          input: {
            requestId: req.id,
            action: "APPROVE",
          },
        })
      ).rejects.toThrow(/Self-approval forbidden/);
    });

    it("prevents overlapping approved leave and WFH requests", async () => {
      // 1. Create and approve leave for 2026-08-25
      const req = await LeaveService.submitLeaveRequest({
        actor: employeeActor,
        input: {
          leaveType: "CASUAL",
          startDate: "2026-08-25",
          endDate: "2026-08-25",
          isHalfDay: false,
          reason: "Doctor appointment",
        },
      });

      await LeaveService.managerReviewLeave({ actor: managerActor, input: { requestId: req.id, action: "APPROVE" } });
      await LeaveService.hrReviewLeave({ actor: hrActor, input: { requestId: req.id, action: "APPROVE" } });

      // 2. Attempt to request WFH for same date -> Must fail with overlap error!
      await expect(
        LeaveService.submitWfhRequest({
          actor: employeeActor,
          input: {
            startDate: "2026-08-25",
            endDate: "2026-08-25",
            reason: "WFH on same day",
            plannedDeliverables: "Coding",
          },
        })
      ).rejects.toThrow(/Overlapping approved leave request/);
    });
  });

  describe("Single-Stage WFH Approval & Monthly Self-Mark Threshold", () => {
    it("auto-approves same-day WFH if within monthly self-mark threshold (<= 2 days)", async () => {
      const wfh1 = await LeaveService.submitWfhRequest({
        actor: employeeActor,
        input: {
          startDate: "2026-08-10",
          endDate: "2026-08-10",
          isSelfMarked: true,
          reason: "Deep focus day",
          plannedDeliverables: "Refactoring database indexes",
        },
      });

      expect(wfh1.status).toBe("APPROVED");
      expect(wfh1.isSelfMarked).toBe(true);

      const wfh2 = await LeaveService.submitWfhRequest({
        actor: employeeActor,
        input: {
          startDate: "2026-08-11",
          endDate: "2026-08-11",
          isSelfMarked: true,
          reason: "Deep focus day 2",
          plannedDeliverables: "PR Reviews",
        },
      });

      expect(wfh2.status).toBe("APPROVED");

      // 3rd self-mark in same month exceeds threshold (2) -> must throw error
      await expect(
        LeaveService.submitWfhRequest({
          actor: employeeActor,
          input: {
            startDate: "2026-08-12",
            endDate: "2026-08-12",
            isSelfMarked: true,
            reason: "Deep focus day 3",
            plannedDeliverables: "Testing",
          },
        })
      ).rejects.toThrow(/Monthly self-mark WFH threshold exceeded/);
    });

    it("allows standard manager-approved WFH beyond self-mark threshold through 2-stage pipeline", async () => {
      const standardWfh = await LeaveService.submitWfhRequest({
        actor: employeeActor,
        input: {
          startDate: "2026-08-15",
          endDate: "2026-08-16",
          isSelfMarked: false, // Standard request
          reason: "Home repairs scheduled",
          plannedDeliverables: "API Documentation",
        },
      });

      expect(standardWfh.status).toBe("PENDING_MANAGER");

      // Stage 1: Manager Review
      const stage1 = await LeaveService.managerReviewWfh({
        actor: managerActor,
        input: {
          requestId: standardWfh.id,
          action: "APPROVE",
        },
      });

      expect(stage1.status).toBe("PENDING_HR");

      // Stage 2: HR Final Sign-off
      const stage2 = await LeaveService.hrReviewWfh({
        actor: hrActor,
        input: {
          requestId: standardWfh.id,
          action: "APPROVE",
          comment: "HR Authorized remote work",
        },
      });

      expect(stage2.status).toBe("APPROVED");
    });
  });
});
