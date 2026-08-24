import { describe, it, expect, beforeEach } from "vitest";
import { WorkdayService } from "@/server/services/workday-service";
import { AuthActor } from "@/lib/authorization/types";

describe("Workday & Task Execution Engine (Phase 1)", () => {
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

  beforeEach(() => {
    WorkdayService.clearStore();
  });

  describe("Start-of-Day (SOD) Workflow", () => {
    it("successfully creates a workday in SOD_SUBMITTED state with planned tasks", async () => {
      const workday = await WorkdayService.submitSOD({
        actor: employeeActor,
        input: {
          workDate: "2026-08-20",
          workMode: "OFFICE",
          shift: "09:00-18:00",
          plannedHours: 8.0,
          tasks: [
            {
              title: "Build Central Authorization Library",
              project: "Core Platform",
              priority: "HIGH",
              taskType: "PLANNED",
              estimatedMinutes: 180,
              expectedOutput: "Zero lint errors and 100% test pass",
              isConfidential: false,
            },
            {
              title: "Review PR for database migrations",
              project: "Core Platform",
              priority: "MEDIUM",
              taskType: "SUPPORT",
              estimatedMinutes: 60,
              isConfidential: false,
            },
          ],
        },
      });

      expect(workday).toBeDefined();
      expect(workday.status).toBe("SOD_SUBMITTED");
      expect(workday.sodSubmittedAt).toBeDefined();
      expect(workday.dailyTasks.length).toBe(2);
      expect(workday.dailyTasks[0]?.status).toBe("NOT_STARTED");
      expect(workday.dailyTasks[0]?.completionPercentage).toBe(0);
    });
  });

  describe("End-of-Day (EOD) Workflow & Task Rules", () => {
    it("successfully submits EOD results and daily reflection", async () => {
      // 1. Submit SOD first
      const sod = await WorkdayService.submitSOD({
        actor: employeeActor,
        input: {
          workDate: "2026-08-20",
          workMode: "OFFICE",
          shift: "09:00-18:00",
          plannedHours: 8.0,
          tasks: [
            {
              title: "Implement Workday State Machine",
              project: "Core Platform",
              priority: "HIGH",
              taskType: "PLANNED",
              estimatedMinutes: 240,
              isConfidential: false,
            },
          ],
        },
      });

      const taskId = sod.dailyTasks[0]!.id;

      // 2. Submit EOD
      const eod = await WorkdayService.submitEOD({
        actor: employeeActor,
        input: {
          workdayId: sod.id,
          tasks: [
            {
              id: taskId,
              title: "Implement Workday State Machine",
              status: "COMPLETED",
              completionPercentage: 100,
              workCompleted: "All state machine transitions implemented with full test coverage.",
              actualMinutes: 240,
              evidenceUrl: "https://github.com/xorstack/workpulse/pull/4",
            },
          ],
          dailySummary: {
            achievements: "Delivered complete Workday state machine engine.",
            issues: "None",
            supportNeeded: "None",
            nextDayFocus: "Build Day/Week/Month heatmap UI switcher",
          },
        },
      });

      expect(eod.status).toBe("EOD_SUBMITTED");
      expect(eod.eodSubmittedAt).toBeDefined();
      expect(eod.calculatedWorkedHours).toBe(4);
      expect(eod.achievements).toContain("Delivered complete Workday state machine");
      expect(eod.dailyTasks[0]?.status).toBe("COMPLETED");
      expect(eod.dailyTasks[0]?.completionPercentage).toBe(100);
    });

    it("enforces 100% completion rule: COMPLETED status requires 100%", async () => {
      const sod = await WorkdayService.submitSOD({
        actor: employeeActor,
        input: {
          workDate: "2026-08-20",
          workMode: "OFFICE",
          shift: "09:00-18:00",
          plannedHours: 8.0,
          tasks: [
            {
              title: "Test Task",
              project: "Core Platform",
              priority: "MEDIUM",
              taskType: "PLANNED",
              estimatedMinutes: 60,
              isConfidential: false,
            },
          ],
        },
      });

      const taskId = sod.dailyTasks[0]!.id;

      await expect(
        WorkdayService.submitEOD({
          actor: employeeActor,
          input: {
            workdayId: sod.id,
            tasks: [
              {
                id: taskId,
                title: "Test Task",
                status: "COMPLETED",
                completionPercentage: 80, // Invalid!
              },
            ],
            dailySummary: { achievements: "Tried my best" },
          },
        })
      ).rejects.toThrow(/completion is not 100%/);
    });

    it("enforces cancelled task rule: CANCELLED requires mandatory reason", async () => {
      const sod = await WorkdayService.submitSOD({
        actor: employeeActor,
        input: {
          workDate: "2026-08-20",
          workMode: "OFFICE",
          shift: "09:00-18:00",
          plannedHours: 8.0,
          tasks: [
            {
              title: "Non-critical investigation",
              project: "Core Platform",
              priority: "LOW",
              taskType: "SUPPORT",
              estimatedMinutes: 60,
              isConfidential: false,
            },
          ],
        },
      });

      const taskId = sod.dailyTasks[0]!.id;

      await expect(
        WorkdayService.submitEOD({
          actor: employeeActor,
          input: {
            workdayId: sod.id,
            tasks: [
              {
                id: taskId,
                title: "Non-critical investigation",
                status: "CANCELLED",
                completionPercentage: 0,
                delayReason: "", // Empty reason!
              },
            ],
            dailySummary: { achievements: "Other priorities took precedence" },
          },
        })
      ).rejects.toThrow(/lacks a mandatory reason/);
    });

    it("handles CARRIED_FORWARD task linking", async () => {
      const sod = await WorkdayService.submitSOD({
        actor: employeeActor,
        input: {
          workDate: "2026-08-20",
          workMode: "OFFICE",
          shift: "09:00-18:00",
          plannedHours: 8.0,
          tasks: [
            {
              title: "Complex feature development",
              project: "Core Platform",
              priority: "HIGH",
              taskType: "PLANNED",
              estimatedMinutes: 360,
              isConfidential: false,
            },
          ],
        },
      });

      const taskId = sod.dailyTasks[0]!.id;

      const eod = await WorkdayService.submitEOD({
        actor: employeeActor,
        input: {
          workdayId: sod.id,
          tasks: [
            {
              id: taskId,
              title: "Complex feature development",
              status: "CARRIED_FORWARD",
              completionPercentage: 50,
              actualMinutes: 180,
              nextAction: "Complete remaining test cases tomorrow morning",
            },
          ],
          dailySummary: { achievements: "Completed phase 1 of complex feature" },
        },
      });

      expect(eod.dailyTasks[0]?.status).toBe("CARRIED_FORWARD");
      expect(eod.dailyTasks[0]?.carriedForwardToTaskId).toBeDefined();
    });
  });

  describe("Manager Review, Changes Requested & Lock Lifecycle", () => {
    it("allows manager to request correction on specific fields", async () => {
      const sod = await WorkdayService.submitSOD({
        actor: employeeActor,
        input: {
          workDate: "2026-08-20",
          workMode: "OFFICE",
          shift: "09:00-18:00",
          plannedHours: 8.0,
          tasks: [{ title: "Task 1", project: "P1", priority: "MEDIUM", taskType: "PLANNED", estimatedMinutes: 60, isConfidential: false }],
        },
      });

      await WorkdayService.submitEOD({
        actor: employeeActor,
        input: {
          workdayId: sod.id,
          tasks: [{ id: sod.dailyTasks[0]!.id, title: "Task 1", status: "COMPLETED", completionPercentage: 100 }],
          dailySummary: { achievements: "Done" },
        },
      });

      // Manager requests changes
      const updated = await WorkdayService.requestChanges({
        actor: managerActor,
        input: {
          workdayId: sod.id,
          requestedFields: ["dailySummary.achievements", "dailyTasks[0].workCompleted"],
          message: "Please detail unit test metrics for Task 1.",
        },
      });

      expect(updated.status).toBe("CHANGES_REQUESTED");
      expect(updated.requestedChanges?.fields).toContain("dailySummary.achievements");
    });

    it("locks workday and prevents subsequent standard mutations", async () => {
      const sod = await WorkdayService.submitSOD({
        actor: employeeActor,
        input: {
          workDate: "2026-08-20",
          workMode: "OFFICE",
          shift: "09:00-18:00",
          plannedHours: 8.0,
          tasks: [{ title: "Task 1", project: "P1", priority: "MEDIUM", taskType: "PLANNED", estimatedMinutes: 60, isConfidential: false }],
        },
      });

      // Lock Workday
      const locked = await WorkdayService.lockWorkday({
        actor: managerActor,
        workdayId: sod.id,
        reason: "Shift completed and verified by lead.",
      });

      expect(locked.status).toBe("LOCKED");
      expect(locked.lockedAt).toBeDefined();

      // Attempting EOD on locked workday throws error
      await expect(
        WorkdayService.submitEOD({
          actor: employeeActor,
          input: {
            workdayId: sod.id,
            tasks: [{ id: sod.dailyTasks[0]!.id, title: "Task 1", status: "COMPLETED", completionPercentage: 100 }],
            dailySummary: { achievements: "Trying to submit" },
          },
        })
      ).rejects.toThrow(/Cannot submit EOD for a locked workday/);
    });

    it("allows authorized amendment while preserving complete prior snapshot", async () => {
      const sod = await WorkdayService.submitSOD({
        actor: employeeActor,
        input: {
          workDate: "2026-08-20",
          workMode: "OFFICE",
          shift: "09:00-18:00",
          plannedHours: 8.0,
          tasks: [{ title: "Task 1", project: "P1", priority: "MEDIUM", taskType: "PLANNED", estimatedMinutes: 60, isConfidential: false }],
        },
      });

      await WorkdayService.lockWorkday({
        actor: managerActor,
        workdayId: sod.id,
      });

      // Amend Workday
      const { workday, amendment } = await WorkdayService.amendWorkday({
        actor: managerActor,
        input: {
          workdayId: sod.id,
          reason: "Approved late submission of missing incident log per DevOps review.",
          achievements: "Corrected achievements including incident response details.",
        },
      });

      expect(workday.status).toBe("AMENDED");
      expect(workday.achievements).toContain("Corrected achievements");
      expect(amendment.priorSnapshot).toBeDefined();
      expect(amendment.reason).toContain("Approved late submission");
    });
  });

  describe("Week Summary & Month Heatmap Aggregation", () => {
    it("generates 7-day week summary with active and missing days", async () => {
      await WorkdayService.submitSOD({
        actor: employeeActor,
        input: {
          workDate: "2026-08-17",
          workMode: "OFFICE",
          shift: "09:00-18:00",
          plannedHours: 8.0,
          tasks: [{ title: "T1", project: "P", priority: "MEDIUM", taskType: "PLANNED", estimatedMinutes: 60, isConfidential: false }],
        },
      });

      const week = await WorkdayService.getWeekSummary({
        employeeId: "emp-sarah",
        startDate: "2026-08-17",
      });

      expect(week.length).toBe(7);
      expect(week[0]?.hasUpdate).toBe(true);
      expect(week[1]?.hasUpdate).toBe(false); // Missing day (No update)
    });

    it("generates month heatmap data for all calendar days", async () => {
      await WorkdayService.submitSOD({
        actor: employeeActor,
        input: {
          workDate: "2026-08-01",
          workMode: "OFFICE",
          shift: "09:00-18:00",
          plannedHours: 8.0,
          tasks: [{ title: "T1", project: "P", priority: "MEDIUM", taskType: "PLANNED", estimatedMinutes: 60, isConfidential: false }],
        },
      });

      const heatmap = await WorkdayService.getMonthHeatmap({
        employeeId: "emp-sarah",
        year: 2026,
        month: 8,
      });

      expect(heatmap.length).toBe(31); // August has 31 days
      expect(heatmap[0]?.status).toBe("SOD_SUBMITTED");
      expect(heatmap[1]?.status).toBe("NO_DATA");
    });
  });
});
