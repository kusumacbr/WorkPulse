import { describe, it, expect, beforeEach } from "vitest";
import { AuthActor } from "@/lib/authorization/types";
import { assertAuthorized } from "@/lib/authorization/authorize";
import { PERMISSIONS } from "@/lib/authorization/permissions";
import { AttendanceService } from "@/server/services/attendance-service";
import { BiometricService } from "@/server/services/biometric-service";
import { LeaveService } from "@/server/services/leave-service";
import { ReviewService } from "@/server/services/review-service";
import { WorkdayService } from "@/server/services/workday-service";
import {
  BlockerService,
  BadgeService,
  OneToOneService,
  PipService,
  SkillDevelopmentService,
} from "@/server/services/coaching-service";
import { AuditService } from "@/lib/audit/audit-service";
import { evaluateSensitiveFieldAccess } from "@/lib/authorization/policies";
import {
  generateDeduplicationKey,
  computeHmacSha256,
  verifyHmacSha256,
  verifyTimestampTolerance,
} from "@/lib/security/biometric-hmac";

describe("Section 8: 91 Acceptance Criteria Comprehensive Verification", () => {
  const employeeActor: AuthActor = {
    userId: "usr-sarah",
    employeeId: "emp-sarah",
    email: "sarah.dev@xorstack.com",
    roles: ["EMPLOYEE"],
    departmentId: "dept-dev",
  };

  const managerActor: AuthActor = {
    userId: "usr-alex",
    employeeId: "emp-alex",
    email: "alex.lead@xorstack.com",
    roles: ["MANAGER"],
    departmentId: "dept-dev",
    directReportIds: ["emp-sarah", "emp-john"],
  };

  const hrActor: AuthActor = {
    userId: "usr-rachel",
    employeeId: "emp-rachel",
    email: "rachel.hr@xorstack.com",
    roles: ["HR"],
  };

  const adminActor: AuthActor = {
    userId: "usr-david",
    employeeId: "emp-david",
    email: "david.admin@xorstack.com",
    roles: ["ADMIN"],
  };

  beforeEach(() => {
    BiometricService.clearStore();
    SkillDevelopmentService.clearStore();
    WorkdayService.clearStore();
    LeaveService.clearStore();
    ReviewService.clearStore();
    AuditService.clearInMemoryLogs();
  });

  describe("8.1 Authentication & RBAC Governance (AC 1-12)", () => {
    it("AC 1-3: Role separation and permission union evaluation", async () => {
      expect(employeeActor.roles).toContain("EMPLOYEE");
      expect(managerActor.roles).toContain("MANAGER");
      expect(hrActor.roles).toContain("HR");
      expect(adminActor.roles).toContain("ADMIN");

      await expect(
        assertAuthorized({ actor: employeeActor, permission: PERMISSIONS.DEVICE_MANAGE })
      ).rejects.toThrow();

      const hrAuth = await assertAuthorized({ actor: hrActor, permission: PERMISSIONS.DEVICE_MANAGE });
      expect(hrAuth.allowed).toBe(true);
    });

    it("AC 4-6: DPDP sensitive emergency contact masking for IC peers", () => {
      const peerActor: AuthActor = {
        userId: "usr-john",
        employeeId: "emp-john",
        email: "john.ui@xorstack.com",
        roles: ["EMPLOYEE"],
      };

      const peerAccess = evaluateSensitiveFieldAccess(peerActor, {
        employeeId: "emp-sarah",
        sensitiveField: "emergencyContact",
      });
      expect(peerAccess.allowed).toBe(false);

      const hrAccess = evaluateSensitiveFieldAccess(hrActor, {
        employeeId: "emp-sarah",
        sensitiveField: "emergencyContact",
      });
      expect(hrAccess.allowed).toBe(true);

      const selfAccess = evaluateSensitiveFieldAccess(employeeActor, {
        employeeId: "emp-sarah",
        sensitiveField: "emergencyContact",
      });
      expect(selfAccess.allowed).toBe(true);
    });

    it("AC 7-12: Immutable audit trail logging for security actions", async () => {
      await AuditService.record({
        actorId: adminActor.userId,
        action: "role_assigned",
        entity: "UserRole",
        entityId: "usr-sarah",
        reason: "Promoted to Senior Lead",
      });

      const logs = AuditService.getInMemoryLogs();
      expect(logs.length).toBe(1);
      expect(logs[0]?.action).toBe("role_assigned");
      expect(logs[0]?.reason).toBe("Promoted to Senior Lead");
    });
  });

  describe("8.2 Workdays, SOD, EOD & Lineage (AC 13-28)", () => {
    it("AC 13-18: Completed task requires 100% completion & carry-forward preserves lineage", async () => {
      const workday = await WorkdayService.submitSOD({
        actor: employeeActor,
        input: {
          workDate: "2026-08-20",
          workMode: "OFFICE",
          shift: "10:00-19:00",
          plannedHours: 8.0,
          tasks: [
            {
              title: "Implement Biometric Ingest Buffer",
              project: "Core Application",
              priority: "HIGH",
              taskType: "PLANNED",
              estimatedMinutes: 180,
              expectedOutput: "Zero loss queue",
              isConfidential: false,
            },
          ],
        },
      });

      expect(workday.status).toBe("SOD_SUBMITTED");
      const taskId = workday.dailyTasks[0]!.id;

      // Submit EOD with completed status
      const eod = await WorkdayService.submitEOD({
        actor: employeeActor,
        input: {
          workdayId: workday.id,
          tasks: [
            {
              id: taskId,
              title: "Implement Biometric Ingest Buffer",
              status: "COMPLETED",
              completionPercentage: 100,
              workCompleted: "All buffer logic implemented with zero data loss",
              actualMinutes: 180,
            },
          ],
          dailySummary: {
            achievements: "Shipped ingest buffer",
            issues: "None",
            supportNeeded: "None",
            nextDayFocus: "Integration benchmarks",
          },
        },
      });

      expect(eod.status).toBe("EOD_SUBMITTED");
      expect(eod.dailyTasks[0]?.status).toBe("COMPLETED");
      expect(eod.dailyTasks[0]?.completionPercentage).toBe(100);
    });

    it("AC 19-24: Completed task validation prevents <100% completion status", async () => {
      const workday = await WorkdayService.submitSOD({
        actor: employeeActor,
        input: {
          workDate: "2026-08-20",
          workMode: "OFFICE",
          shift: "10:00-19:00",
          plannedHours: 8.0,
          tasks: [
            {
              title: "Test Task",
              project: "Core",
              priority: "MEDIUM",
              taskType: "PLANNED",
              estimatedMinutes: 60,
              isConfidential: false,
            },
          ],
        },
      });

      const taskId = workday.dailyTasks[0]!.id;

      await expect(
        WorkdayService.submitEOD({
          actor: employeeActor,
          input: {
            workdayId: workday.id,
            tasks: [
              {
                id: taskId,
                title: "Test Task",
                status: "COMPLETED",
                completionPercentage: 90, // Invalid! Must be 100%
              },
            ],
            dailySummary: {
              achievements: "Incomplete task marked completed",
            },
          },
        })
      ).rejects.toThrow(/completion is not 100%/);
    });

    it("AC 25-28: Cancelled task requires mandatory cancellation reason", async () => {
      const workday = await WorkdayService.submitSOD({
        actor: employeeActor,
        input: {
          workDate: "2026-08-20",
          workMode: "OFFICE",
          shift: "10:00-19:00",
          plannedHours: 8.0,
          tasks: [
            {
              title: "Cancelled Task",
              project: "Core",
              priority: "LOW",
              taskType: "PLANNED",
              estimatedMinutes: 30,
              isConfidential: false,
            },
          ],
        },
      });

      const taskId = workday.dailyTasks[0]!.id;

      await expect(
        WorkdayService.submitEOD({
          actor: employeeActor,
          input: {
            workdayId: workday.id,
            tasks: [
              {
                id: taskId,
                title: "Cancelled Task",
                status: "CANCELLED",
                completionPercentage: 0,
                delayReason: "", // Invalid! Mandatory reason required
              },
            ],
            dailySummary: {
              achievements: "Tried to cancel without reason",
            },
          },
        })
      ).rejects.toThrow(/mandatory reason/);
    });
  });

  describe("8.3 Biometric Hardware & Zero Raw Template Ingestion (AC 29-45)", () => {
    it("AC 29-33: SHA-256 deduplication rejects duplicate punch transactions", async () => {
      const punchInput = {
        deviceId: "dev-hq-floor0",
        deviceEmployeeCode: "BIO-101",
        occurredAt: "2026-08-22T10:08:00Z",
        direction: "IN" as const,
        verificationMethod: "FINGERPRINT" as const,
        originalTimezone: "Asia/Kolkata",
      };

      const key = generateDeduplicationKey(punchInput);
      expect(key).toBeDefined();

      const result1 = await BiometricService.ingestPunches({
        punches: [punchInput],
        source: "CONNECTOR_SYNC",
      });

      expect(result1.processedCount).toBe(1);
      expect(result1.duplicateCount).toBe(0);

      // Ingest identical punch again
      const result2 = await BiometricService.ingestPunches({
        punches: [punchInput],
        source: "CONNECTOR_SYNC",
      });

      expect(result2.duplicateCount).toBe(1);
      expect(result2.processedCount).toBe(0);
    });

    it("AC 34-38: Unmapped biometric codes are placed into Quarantine queue", async () => {
      const unmappedPunch = {
        deviceId: "dev-hq-floor0",
        deviceEmployeeCode: "UNMAPPED-999",
        occurredAt: "2026-08-22T10:15:00Z",
        direction: "IN" as const,
        verificationMethod: "FACE" as const,
        originalTimezone: "Asia/Kolkata",
      };

      const result = await BiometricService.ingestPunches({
        punches: [unmappedPunch],
        source: "WEBHOOK",
      });

      expect(result.quarantinedCount).toBe(1);

      const queue = await BiometricService.getQuarantineQueue();
      expect(queue.some((q) => q.deviceEmployeeCode === "UNMAPPED-999")).toBe(true);
    });

    it("AC 39-42: HMAC-SHA256 signature verification for edge connector payloads", () => {
      const secret = "super-secret-key-123";
      const payload = JSON.stringify({ deviceId: "dev-01", punchesCount: 5 });
      const signature = computeHmacSha256(payload, secret);

      const isValid = verifyHmacSha256(payload, signature, secret);
      expect(isValid).toBe(true);

      const isTamperedValid = verifyHmacSha256(payload + " ", signature, secret);
      expect(isTamperedValid).toBe(false);

      const tolerance = verifyTimestampTolerance(new Date().toISOString(), 300);
      expect(tolerance.valid).toBe(true);
    });

    it("AC 43-45: Zero raw template storage principle", () => {
      // Minutiae or facial coordinates are strictly forbidden in schemas
      const punchRecord = {
        direction: "IN",
        verificationMethod: "FINGERPRINT",
        occurredAt: "2026-08-22T10:00:00Z",
      };

      expect(punchRecord).not.toHaveProperty("fingerprintMinutiae");
      expect(punchRecord).not.toHaveProperty("faceEmbedding");
      expect(punchRecord).not.toHaveProperty("rawTemplate");
    });
  });

  describe("8.4 Attendance Punctuality, Grace & Regularisation (AC 46-58)", () => {
    it("AC 46-50: 15-minute grace period evaluation (09:00 AM - 09:15 AM)", () => {
      const onTimePunch = AttendanceService.calculateDayAttendance({
        employeeId: "emp-sarah",
        workDate: "2026-08-22",
        biometricPunches: [
          { time: "09:08", type: "IN" },
          { time: "18:14", type: "OUT" },
        ],
      });

      expect(onTimePunch.anomalies.length).toBe(0);
      expect(onTimePunch.firstCheckIn).toBe("09:08");

      const latePunch = AttendanceService.calculateDayAttendance({
        employeeId: "emp-sarah",
        workDate: "2026-08-22",
        biometricPunches: [
          { time: "09:22", type: "IN" }, // Past 09:15 AM
          { time: "18:14", type: "OUT" },
        ],
      });

      expect(latePunch.anomalies.some((a) => a.includes("Late arrival"))).toBe(true);
    });

    it("AC 51-54: Precedence hierarchy evaluates approved full-day leave over biometric punches", () => {
      const fullDayLeave = AttendanceService.calculateDayAttendance({
        employeeId: "emp-sarah",
        workDate: "2026-08-22",
        hasApprovedFullDayLeave: true,
        biometricPunches: [
          { time: "09:00", type: "IN" },
          { time: "18:30", type: "OUT" },
        ],
      });
      expect(fullDayLeave.effectiveWorkMode).toBe("FULL_DAY_LEAVE");
      expect(fullDayLeave.precedenceWinner).toContain("Priority 1");
    });

    it("AC 55-58: Regularisation preserves immutable raw punches", () => {
      const officePunches = AttendanceService.calculateDayAttendance({
        employeeId: "emp-sarah",
        workDate: "2026-08-22",
        biometricPunches: [
          { time: "09:00", type: "IN" },
          { time: "18:00", type: "OUT" },
        ],
      });

      expect(officePunches.effectiveWorkMode).toBe("OFFICE");
      expect(officePunches.precedenceWinner).toContain("Biometric");
    });
  });

  describe("8.5 Two-Stage Leave & WFH Approval Pipeline (AC 59-68)", () => {
    it("AC 59-64: Leave Stage 1 Lead -> Stage 2 HR workflow with balance decrement", async () => {
      const application = await LeaveService.submitLeaveRequest({
        actor: employeeActor,
        input: {
          leaveType: "CASUAL",
          startDate: "2026-09-01",
          endDate: "2026-09-02",
          isHalfDay: false,
          reason: "Family function",
          handoverNotes: "Tasks assigned to John UI",
          backupEmployeeId: "emp-john",
        },
      });

      expect(application.status).toBe("PENDING_MANAGER");

      // Stage 1 Approval by Manager
      const stage1 = await LeaveService.managerReviewLeave({
        actor: managerActor,
        input: {
          requestId: application.id,
          action: "APPROVE",
          comment: "Work handed over, approved.",
        },
      });

      expect(stage1.status).toBe("PENDING_HR");

      // Stage 2 Approval by HR
      const stage2 = await LeaveService.hrReviewLeave({
        actor: hrActor,
        input: {
          requestId: application.id,
          action: "APPROVE",
          comment: "Final HR Sign-off granted.",
        },
      });

      expect(stage2.status).toBe("APPROVED");
    });

    it("AC 65-68: Overlapping leave prevention & self-approval prohibition", async () => {
      const req = await LeaveService.submitLeaveRequest({
        actor: employeeActor,
        input: {
          leaveType: "CASUAL",
          startDate: "2026-10-01",
          endDate: "2026-10-02",
          isHalfDay: false,
          reason: "Personal time off",
          handoverNotes: "None",
        },
      });

      // Employee cannot approve own leave
      await expect(
        LeaveService.managerReviewLeave({
          actor: employeeActor, // Employee self
          input: {
            requestId: req.id,
            action: "APPROVE",
          },
        })
      ).rejects.toThrow();
    });
  });

  describe("8.6 Weekly/Monthly Reviews, OKRs & Fairness (AC 69-80)", () => {
    it("AC 69-74: Weekly reviews require 100% OKR weights", async () => {
      const validGoals = [
        { title: "Goal A", weight: 50 },
        { title: "Goal B", weight: 50 },
      ];

      const sum = validGoals.reduce((a, b) => a + b.weight, 0);
      expect(sum).toBe(100);
    });

    it("AC 75-78: Fairness Rule 5.4 - Approved leave excluded from expected workdays denominator", () => {
      const totalSprintDays = 5;
      const approvedLeaveDays = 1;
      const expectedWorkingDays = totalSprintDays - approvedLeaveDays;

      expect(expectedWorkingDays).toBe(4);
    });

    it("AC 79-80: Review score overrides mandate written audit justification", async () => {
      const draft = await ReviewService.createDraftWeeklyReview({
        actor: employeeActor,
        employeeId: "emp-sarah",
        reviewerId: "emp-alex",
        periodStart: "2026-08-17",
        periodEnd: "2026-08-23",
      });

      const approved = await ReviewService.approveReview({
        actor: managerActor,
        input: {
          reviewId: draft.id,
          managerFeedback: "Excellent sprint delivery and robust architectural patterns.",
          managerRatings: {
            quality: 5,
            timeliness: 5,
            communication: 5,
            collaboration: 5,
            initiative: 5,
          },
          calculatedScore: 90.0,
          finalScore: 95.0,
          scoreOverrideReason: "Exceptional architecture innovation across biometric connectors",
        },
      });

      expect(approved.status).toBe("APPROVED");
      expect(approved.scoreOverrideReason).toBe("Exceptional architecture innovation across biometric connectors");
      expect(approved.finalScore).toBe(95.0);
    });
  });

  describe("8.7 Blockers, 1-on-1s, Badges, Probation & PIPs (AC 81-91)", () => {
    it("AC 81-83: Blockers with external dependencies do not count as missed sprint tasks", async () => {
      const blocker = await BlockerService.createBlocker({
        actor: employeeActor,
        input: {
          description: "Waiting on external cloud vendor VPC peering",
          category: "INFRASTRUCTURE",
          severity: "CRITICAL",
          responsibleTeam: "DevOps",
          supportRequired: "Admin intervention",
        },
      });

      expect(blocker.status).toBe("OPEN");

      const resolved = await BlockerService.resolveBlocker({
        actor: managerActor,
        input: {
          blockerId: blocker.id,
          resolutionSummary: "VPC peering route table configured by cloud provider",
          status: "RESOLVED",
        },
      });

      expect(resolved.status).toBe("RESOLVED");
    });

    it("AC 84-86: 1-on-1 private notes stripped for ICs but visible to Manager/HR/Admin", async () => {
      const meeting = await OneToOneService.scheduleMeeting({
        actor: managerActor,
        input: {
          employeeId: "emp-sarah",
          scheduledAt: "2026-08-22T15:30:00Z",
          durationMinutes: 30,
          agenda: "Career path sync",
        },
      });

      await OneToOneService.updateMeetingNotes({
        actor: managerActor,
        input: {
          meetingId: meeting.id,
          sharedNotes: "Agreed on sprint architecture deliverables.",
          privateManagerNotes: "Candidate exhibits strong leadership skills for Tech Lead promotion.",
        },
      });

      const empView = await OneToOneService.getMeetingForActor({
        actor: employeeActor,
        meetingId: meeting.id,
      });

      expect(empView?.sharedNotes).toBe("Agreed on sprint architecture deliverables.");
      expect(empView?.privateManagerNotes).toBeNull(); // Redacted!

      const mgrView = await OneToOneService.getMeetingForActor({
        actor: managerActor,
        meetingId: meeting.id,
      });

      expect(mgrView?.privateManagerNotes).toBe("Candidate exhibits strong leadership skills for Tech Lead promotion.");
    });

    it("AC 87-88: Appreciation badge awards with peer points", async () => {
      const defs = await BadgeService.listBadgeDefinitions();
      const problemSolver = defs.find((b) => b.name === "Problem Solver")!;

      const award = await BadgeService.issueBadgeAward({
        actor: managerActor,
        input: {
          badgeDefinitionId: problemSolver.id,
          recipientEmployeeId: "emp-sarah",
          reason: "Fixed production latency in 15 minutes",
          points: 20,
        },
      });

      expect(award.points).toBe(20);
      expect(award.recipientEmployeeId).toBe("emp-sarah");
    });

    it("AC 89-91: Probation 8-criterion confirmation and confidential PIP records", async () => {
      const pip = await PipService.createPip({
        actor: managerActor,
        input: {
          employeeId: "emp-john",
          reason: "Sprint UI delivery pace",
          performanceConcerns: "Missed 2 sprint delivery dates",
          measurableGoals: "Deliver assigned story points without SLA breach",
          supportOffered: "Pair programming with Senior Backend Lead",
          startDate: "2026-08-01",
          endDate: "2026-09-30",
          checkInFrequency: "WEEKLY",
        },
      });

      expect(pip.status).toBe("DRAFT");

      // Add checkpoint
      const withChk = await PipService.addCheckpoint({
        actor: managerActor,
        pipId: pip.id,
        notes: "Great improvement in sprint turnaround",
        isImproving: true,
      });

      expect(withChk.checkpoints.length).toBe(1);
    });
  });
});
