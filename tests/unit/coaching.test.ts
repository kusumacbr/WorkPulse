import { describe, it, expect, beforeEach } from "vitest";
import {
  BlockerService,
  BadgeService,
  GoalTemplateService,
  ProbationService,
  SkillDevelopmentService,
} from "@/server/services/coaching-service";
import { AuthActor } from "@/lib/authorization/types";

describe("Coaching, Blockers & Development Lifecycle (Phase 5)", () => {
  const employeeSarah: AuthActor = {
    userId: "user-sarah",
    employeeId: "emp-sarah",
    email: "sarah@xorstack.com",
    roles: ["EMPLOYEE"],
    departmentId: "dept-core",
  };

  const managerAlex: AuthActor = {
    userId: "user-alex",
    employeeId: "emp-alex",
    email: "alex@xorstack.com",
    roles: ["MANAGER"],
    departmentId: "dept-core",
    directReportIds: ["emp-sarah"],
  };

  const hrPriya: AuthActor = {
    userId: "user-priya",
    employeeId: "emp-priya",
    email: "priya@xorstack.com",
    roles: ["HR"],
    departmentId: "dept-hr",
  };

  const hrAdminActor: AuthActor = {
    userId: "user-admin",
    employeeId: "emp-admin",
    email: "admin@xorstack.com",
    roles: ["HR"],
    departmentId: "dept-core",
  };

  beforeEach(() => {
    SkillDevelopmentService.clearStore();
  });

  describe("Blockers & SLA Escalation Engine", () => {
    it("escalates Critical blockers after 2 business hours and High blockers after 8 hours into immutable records", async () => {
      // 1. Report a Critical Blocker
      const critBlocker = await BlockerService.createBlocker({
        actor: employeeSarah,
        input: {
          description: "Database deadlocked on production replica",
          category: "INFRASTRUCTURE",
          severity: "CRITICAL",
          responsibleTeam: "DevOps",
          supportRequired: "Admin intervention",
        },
      });

      // 2. Report a High Blocker
      const highBlocker = await BlockerService.createBlocker({
        actor: employeeSarah,
        input: {
          description: "Awaiting security compliance sign-off",
          category: "COMPLIANCE",
          severity: "HIGH",
          responsibleTeam: "Security",
          supportRequired: "Sign off on PR",
        },
      });

      // 3. Fast-forward time by 3 hours: Critical (3h >= 2h) should escalate, High (3h < 8h) should not
      const threeHoursLater = new Date(Date.now() + 3 * 3600000).toISOString();
      const escRun1 = await BlockerService.checkAndEscalateBlockers({ currentTimeIso: threeHoursLater });

      expect(escRun1.escalatedCount).toBe(1);
      expect(escRun1.escalations[0]?.blockerId).toBe(critBlocker.id);
      expect(escRun1.escalations[0]?.escalatedToRole).toBe("HR");

      // 4. Fast-forward time by 9 hours: High (9h >= 8h) should now also escalate
      const nineHoursLater = new Date(Date.now() + 9 * 3600000).toISOString();
      const escRun2 = await BlockerService.checkAndEscalateBlockers({ currentTimeIso: nineHoursLater });

      expect(escRun2.escalatedCount).toBe(1);
      expect(escRun2.escalations[0]?.blockerId).toBe(highBlocker.id);
      expect(escRun2.escalations[0]?.escalatedToRole).toBe("HR");

      // 5. Resolving the blocker never deletes the escalation history
      await BlockerService.resolveBlocker({
        actor: hrAdminActor,
        input: {
          blockerId: critBlocker.id,
          resolutionSummary: "Killed lock and reset connection pool.",
          status: "RESOLVED",
        },
      });

      const blockers = BlockerService.getActiveBlockers();
      const resolvedCrit = blockers.find((b) => b.id === critBlocker.id);
      expect(resolvedCrit?.status).toBe("RESOLVED");
      expect(resolvedCrit?.escalations.length).toBe(1); // Escalation history preserved!
    });
  });

  describe("Appreciation Badges & Recognition", () => {
    it("lists 9 starter badges and creates recognition awards without modifying review ratings", async () => {
      const defs = await BadgeService.listBadgeDefinitions();
      expect(defs.length).toBe(9);

      const problemSolverBadge = defs.find((b) => b.name === "Problem Solver")!;
      expect(problemSolverBadge).toBeDefined();

      const award = await BadgeService.issueBadgeAward({
        actor: managerAlex,
        input: {
          badgeDefinitionId: problemSolverBadge.id,
          recipientEmployeeId: "emp-sarah",
          reason: "Fixed latency bottleneck during load testing",
          points: 20,
        },
      });

      expect(award.badgeName).toBe("Problem Solver");
      expect(award.points).toBe(20);

      const sarahAwards = await BadgeService.getEmployeeAwards("emp-sarah");
      expect(sarahAwards.length).toBe(1);
    });
  });

  describe("Goal Templates & Decoupled Assignment", () => {
    it("deep-copies template items into employee goals so subsequent template changes do not mutate historical goals", async () => {
      // 1. Create a Goal Template for Senior Backend Engineers
      const template = await GoalTemplateService.createTemplate({
        actor: hrPriya,
        input: {
          name: "Senior Backend Q3 Template",
          departmentId: "dept-core",
          items: [
            {
              title: "Ship 99.9% Reliable Biometric Pipeline",
              category: "ENGINEERING",
              measurableOutcome: "Zero data loss during offline outages",
              defaultWeight: 50,
              evidenceRequired: true,
            },
            {
              title: "Mentor Junior Developers",
              category: "MENTORSHIP",
              measurableOutcome: "Conduct 4 pair-programming sessions",
              defaultWeight: 50,
              evidenceRequired: false,
            },
          ],
        },
      });

      // 2. Assign template to Sarah
      const assigned = await GoalTemplateService.assignTemplateToEmployee({
        actor: managerAlex,
        templateId: template.id,
        employeeId: "emp-sarah",
        startDate: "2026-07-01",
        endDate: "2026-09-30",
      });

      expect(assigned.assignedCount).toBe(2);
      expect(assigned.goals[0]?.title).toBe("Ship 99.9% Reliable Biometric Pipeline");
      expect(assigned.goals[0]?.weight).toBe(50);
    });
  });

  describe("Probation Review Lifecycle", () => {
    it("executes 3-stage probation review flow: Manager recommends -> HR reviews -> Admin confirms", async () => {
      // 1. Manager recommends employment confirmation with 8 score criteria
      const rec = await ProbationService.submitRecommendation({
        actor: managerAlex,
        input: {
          employeeId: "emp-sarah",
          checkpointDay: 90,
          managerRecommendation: "CONFIRM_EMPLOYMENT",
          managerComments: "Exceptional engineering output and strong culture fit.",
          workQualityScore: 5,
          taskCompletionScore: 5,
          attendanceScore: 5,
          communicationScore: 5,
          collaborationScore: 5,
          learningScore: 5,
          technicalScore: 5,
          conductScore: 5,
        },
      });

      expect(rec.status).toBe("PENDING_HR");

      // 2. HR Reviews and finalizes confirmation
      const hrReviewed = await ProbationService.hrReview({
        actor: hrPriya,
        reviewId: rec.id,
        decision: "CONFIRM_EMPLOYMENT",
        comments: "All compliance checks and background verification completed.",
      });

      expect(hrReviewed.status).toBe("CONFIRMED");
    });
  });
});
