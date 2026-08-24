import { describe, it, expect, beforeEach } from "vitest";
import { WorkdayService } from "@/server/services/workday-service";
import { authorize, ForbiddenError } from "@/lib/authorization/authorize";
import { PERMISSIONS } from "@/lib/authorization/permissions";
import { AuthActor } from "@/lib/authorization/types";

describe("HR SOD/EOD Lifecycle & ManagerAssignment Authorization Suite", () => {
  // Primary HR employee actor (reports to hrDirectorActor via ManagerAssignment)
  const hrEmployeeActor: AuthActor = {
    userId: "user-rachel",
    employeeId: "emp-rachel",
    email: "hr.rachel@xorstack.com",
    roles: ["HR", "EMPLOYEE"],
    departmentId: "dept-hr",
    teamId: "team-people-ops",
  };

  // Assigned Manager for hrEmployeeActor
  const hrDirectorManagerActor: AuthActor = {
    userId: "user-victoria",
    employeeId: "emp-victoria",
    email: "victoria.director@xorstack.com",
    roles: ["MANAGER", "EMPLOYEE"],
    departmentId: "dept-hr",
    directReportIds: ["emp-rachel"],
  };

  // Another HR peer (same HR role, but NOT Rachel's manager)
  const hrPeerActor: AuthActor = {
    userId: "user-priya",
    employeeId: "emp-priya",
    email: "priya.hr@xorstack.com",
    roles: ["HR", "EMPLOYEE"],
    departmentId: "dept-hr",
    teamId: "team-talent-acq",
  };

  // Engineering Team Lead (has MANAGER role, but NOT Rachel's manager)
  const engLeadActor: AuthActor = {
    userId: "user-alex",
    employeeId: "emp-alex",
    email: "lead.alex@xorstack.com",
    roles: ["MANAGER", "EMPLOYEE"],
    departmentId: "dept-eng",
    directReportIds: ["emp-sarah", "emp-jordan"],
  };

  // Admin Actor (Organization-wide leadership)
  const adminActor: AuthActor = {
    userId: "user-david",
    employeeId: "emp-david",
    email: "admin@xorstack.com",
    roles: ["ADMIN", "EMPLOYEE"],
  };

  // Configured Fallback Reviewer Admin
  const fallbackAdminActor: AuthActor = {
    userId: "user-fallback-admin",
    employeeId: "emp-fallback-admin",
    email: "fallback.admin@xorstack.com",
    roles: ["ADMIN", "EMPLOYEE"],
  };

  // Unassigned HR employee (e.g. small org where HR reports to nobody formally)
  const unassignedHrActor: AuthActor = {
    userId: "user-solo-hr",
    employeeId: "emp-solo-hr",
    email: "solo.hr@xorstack.com",
    roles: ["HR", "EMPLOYEE"],
    departmentId: "dept-hr",
  };

  beforeEach(() => {
    WorkdayService.clearStore();
  });

  describe("1. Unified Workday Model & Lifecycle for HR Staff", () => {
    it("allows HR employee to submit SOD plan using the standard Workday model", async () => {
      const workday = await WorkdayService.submitSOD({
        actor: hrEmployeeActor,
        input: {
          workDate: "2026-08-21",
          workMode: "OFFICE",
          shift: "10:00-19:00",
          plannedHours: 8.0,
          tasks: [
            {
              title: "Execute Stage-2 Leave Approvals for Bangalore HQ",
              project: "People Operations",
              priority: "HIGH",
              taskType: "PLANNED",
              estimatedMinutes: 60,
              expectedOutput: "Process all pending manager-approved leave tickets",
              isConfidential: false,
            },
            {
              title: "Review 30-Day Probation Checkpoints with Team Leads",
              project: "Talent Ops",
              priority: "MEDIUM",
              taskType: "PLANNED",
              estimatedMinutes: 90,
              expectedOutput: "Complete probation recommendation notes",
              isConfidential: false,
            },
          ],
        },
      });

      expect(workday).toBeDefined();
      expect(workday.status).toBe("SOD_SUBMITTED");
      expect(workday.employeeId).toBe("emp-rachel");
      expect(workday.dailyTasks.length).toBe(2);
      expect(workday.dailyTasks[0]?.status).toBe("NOT_STARTED");
    });

    it("allows HR employee to submit standard EOD reflection", async () => {
      const sod = await WorkdayService.submitSOD({
        actor: hrEmployeeActor,
        input: {
          workDate: "2026-08-21",
          workMode: "OFFICE",
          shift: "10:00-19:00",
          plannedHours: 8.0,
          tasks: [
            {
              title: "Audit Biometric Punch Anomalies",
              project: "HR Compliance",
              priority: "HIGH",
              taskType: "PLANNED",
              estimatedMinutes: 60,
              isConfidential: false,
            },
          ],
        },
      });

      const taskId = sod.dailyTasks[0]!.id;

      const eod = await WorkdayService.submitEOD({
        actor: hrEmployeeActor,
        input: {
          workdayId: sod.id,
          tasks: [
            {
              id: taskId,
              title: "Audit Biometric Punch Anomalies",
              status: "COMPLETED",
              completionPercentage: 100,
              actualMinutes: 60,
              workCompleted: "Audited morning punch grace window logs and regularizations.",
            },
          ],
          dailySummary: {
            achievements: "Completed biometric muster audit for August payroll.",
            issues: "None",
            supportNeeded: "None",
            nextDayFocus: "Prepare POSH policy training deck",
          },
        },
      });

      expect(eod.status).toBe("EOD_SUBMITTED");
      expect(eod.achievements).toContain("Completed biometric muster audit");
      expect(eod.dailyTasks[0]?.completionPercentage).toBe(100);
    });
  });

  describe("2. ManagerAssignment-Based Review for HR Staff", () => {
    it("allows HR employee's designated manager to read daily tasks and request changes", async () => {
      // 1. HR employee submits SOD
      const sod = await WorkdayService.submitSOD({
        actor: hrEmployeeActor,
        input: {
          workDate: "2026-08-21",
          workMode: "OFFICE",
          shift: "10:00-19:00",
          plannedHours: 8.0,
          tasks: [
            {
              title: "Conduct candidate interview",
              project: "Talent Acquisition",
              priority: "HIGH",
              taskType: "PLANNED",
              estimatedMinutes: 60,
              isConfidential: false,
            },
          ],
        },
      });

      // 2. HR Director (assigned manager) reads daily tasks
      const authzRead = await authorize({
        actor: hrDirectorManagerActor,
        permission: PERMISSIONS.DAILY_TASK_READ_TEAM,
        resource: { employeeId: hrEmployeeActor.employeeId },
      });
      expect(authzRead.allowed).toBe(true);
      expect(authzRead.scope).toBe("direct_reports");

      // 3. HR Director requests change on workday
      const changed = await WorkdayService.requestChanges({
        actor: hrDirectorManagerActor,
        input: {
          workdayId: sod.id,
          requestedFields: ["tasks"],
          message: "Please specify the role and candidate name in the task title.",
        },
      });

      expect(changed.status).toBe("CHANGES_REQUESTED");
      expect(changed.requestedChanges?.message).toContain("Please specify the role");
    });

    it("allows Admin to read and lock HR employee's workday", async () => {
      const sod = await WorkdayService.submitSOD({
        actor: hrEmployeeActor,
        input: {
          workDate: "2026-08-21",
          workMode: "OFFICE",
          shift: "10:00-19:00",
          plannedHours: 8.0,
          tasks: [
            {
              title: "HR daily operations",
              project: "HR",
              priority: "MEDIUM",
              taskType: "PLANNED",
              estimatedMinutes: 60,
              isConfidential: false,
            },
          ],
        },
      });

      const locked = await WorkdayService.lockWorkday({
        actor: adminActor,
        workdayId: sod.id,
        reason: "Executive management sign-off",
      });

      expect(locked.status).toBe("LOCKED");
      expect(locked.lockedById).toBe("user-david");
    });
  });

  describe("3. Strict Access Control: No Blanket Visibility to HR Peers or Non-Manager Leads", () => {
    it("DENIES peer HR user from reading or reviewing HR employee's daily tasks", async () => {
      const sod = await WorkdayService.submitSOD({
        actor: hrEmployeeActor,
        input: {
          workDate: "2026-08-21",
          workMode: "OFFICE",
          shift: "10:00-19:00",
          plannedHours: 8.0,
          tasks: [
            {
              title: "Confidential employee relations review",
              project: "People Ops",
              priority: "HIGH",
              taskType: "PLANNED",
              estimatedMinutes: 60,
              isConfidential: true,
            },
          ],
        },
      });

      // Peer HR attempts to read daily tasks
      const authzPeer = await authorize({
        actor: hrPeerActor,
        permission: PERMISSIONS.DAILY_TASK_READ_TEAM,
        resource: { employeeId: hrEmployeeActor.employeeId },
      });
      expect(authzPeer.allowed).toBe(false);

      // Peer HR attempts to request changes on workday
      await expect(
        WorkdayService.requestChanges({
          actor: hrPeerActor,
          input: {
            workdayId: sod.id,
            requestedFields: ["tasks"],
            message: "Unauthorized peer change request",
          },
        })
      ).rejects.toThrow(ForbiddenError);
    });

    it("DENIES unrelated Team Lead from reading or reviewing HR employee's daily tasks", async () => {
      const sod = await WorkdayService.submitSOD({
        actor: hrEmployeeActor,
        input: {
          workDate: "2026-08-21",
          workMode: "OFFICE",
          shift: "10:00-19:00",
          plannedHours: 8.0,
          tasks: [
            {
              title: "HR SOD daily tasks",
              project: "People Ops",
              priority: "MEDIUM",
              taskType: "PLANNED",
              estimatedMinutes: 60,
              isConfidential: false,
            },
          ],
        },
      });

      // Engineering lead attempts to read HR employee's daily tasks
      const authzLead = await authorize({
        actor: engLeadActor,
        permission: PERMISSIONS.DAILY_TASK_READ_TEAM,
        resource: { employeeId: hrEmployeeActor.employeeId },
      });
      expect(authzLead.allowed).toBe(false);

      // Engineering lead attempts to lock HR employee's workday
      await expect(
        WorkdayService.lockWorkday({
          actor: engLeadActor,
          workdayId: sod.id,
        })
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("4. Unassigned HR Fallback Reviewer Handling", () => {
    it("authorizes configured orgFallbackReviewerId Admin when HR employee is unassigned", async () => {
      // Configure org fallback reviewer
      WorkdayService.setOrgFallbackReviewerId("user-fallback-admin");

      const sod = await WorkdayService.submitSOD({
        actor: unassignedHrActor,
        input: {
          workDate: "2026-08-21",
          workMode: "OFFICE",
          shift: "10:00-19:00",
          plannedHours: 8.0,
          tasks: [
            {
              title: "Organization onboarding process",
              project: "People Operations",
              priority: "HIGH",
              taskType: "PLANNED",
              estimatedMinutes: 120,
              isConfidential: false,
            },
          ],
        },
      });

      // Fallback Admin reviews unassigned HR workday
      const changed = await WorkdayService.requestChanges({
        actor: fallbackAdminActor,
        input: {
          workdayId: sod.id,
          requestedFields: ["tasks"],
          message: "Fallback reviewer feedback: please confirm orientation room booking.",
        },
      });

      expect(changed.status).toBe("CHANGES_REQUESTED");

      // Peer HR still denied even with fallback configured
      const peerAuth = await authorize({
        actor: hrPeerActor,
        permission: PERMISSIONS.DAILY_TASK_READ_TEAM,
        resource: {
          employeeId: unassignedHrActor.employeeId,
          fallbackReviewerId: "user-fallback-admin",
        },
      });
      expect(peerAuth.allowed).toBe(false);
    });

    it("submits and locks cleanly when NO fallback reviewer is configured (graceful self-containment)", async () => {
      // Ensure NO fallback reviewer is set
      WorkdayService.setOrgFallbackReviewerId(null);

      const sod = await WorkdayService.submitSOD({
        actor: unassignedHrActor,
        input: {
          workDate: "2026-08-21",
          workMode: "OFFICE",
          shift: "10:00-19:00",
          plannedHours: 8.0,
          tasks: [
            {
              title: "Independent HR compliance tasks",
              project: "HR",
              priority: "MEDIUM",
              taskType: "PLANNED",
              estimatedMinutes: 60,
              isConfidential: false,
            },
          ],
        },
      });

      expect(sod.status).toBe("SOD_SUBMITTED");

      // Unassigned HR employee can self-lock at end of shift without throwing error
      const locked = await WorkdayService.lockWorkday({
        actor: unassignedHrActor,
        workdayId: sod.id,
        reason: "End of shift self-lock",
      });

      expect(locked.status).toBe("LOCKED");
    });
  });
});
