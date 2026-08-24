import { describe, it, expect, beforeEach } from "vitest";
import { GoalService } from "@/server/services/goal-service";
import { AuthActor } from "@/lib/authorization/types";

describe("Weekly Goals Engine (Phase 1)", () => {
  const employeeActor: AuthActor = {
    userId: "user-sarah",
    employeeId: "emp-sarah",
    email: "dev.sarah@xorstack.com",
    roles: ["EMPLOYEE"],
    departmentId: "dept-eng",
  };

  beforeEach(() => {
    GoalService.clearStore();
  });

  it("successfully creates weekly goals and tracks weight budget sum", async () => {
    const goal1 = await GoalService.createWeeklyGoal({
      actor: employeeActor,
      input: {
        title: "Deliver Phase 1 Workday State Machine",
        category: "Engineering",
        measurableOutcome: "100% test coverage and zero lint errors",
        weight: 60,
        priority: "HIGH",
        startDate: "2026-08-17",
        endDate: "2026-08-23",
        evidenceRequired: true,
        managerApprovalRequired: false,
      },
    });

    const goal2 = await GoalService.createWeeklyGoal({
      actor: employeeActor,
      input: {
        title: "Build GitHub-style Contribution Heatmap",
        category: "Frontend",
        measurableOutcome: "Heatmap component rendered with Day/Week/Month switcher",
        weight: 40,
        priority: "MEDIUM",
        startDate: "2026-08-17",
        endDate: "2026-08-23",
        evidenceRequired: false,
        managerApprovalRequired: false,
      },
    });

    expect(goal1).toBeDefined();
    expect(goal2).toBeDefined();

    const summary = await GoalService.getWeeklyGoals({
      employeeId: "emp-sarah",
      startDate: "2026-08-17",
    });

    expect(summary.goals.length).toBe(2);
    expect(summary.totalWeight).toBe(100);
    expect(summary.isWeightComplete).toBe(true);
  });

  it("updates goal progress and marks completed when reaching 100%", async () => {
    const goal = await GoalService.createWeeklyGoal({
      actor: employeeActor,
      input: {
        title: "Write documentation and architecture walkthrough",
        category: "Documentation",
        measurableOutcome: "Complete Phase 1 walkthrough document",
        weight: 20,
        priority: "MEDIUM",
        startDate: "2026-08-17",
        endDate: "2026-08-23",
        evidenceRequired: false,
        managerApprovalRequired: false,
      },
    });

    const updated = await GoalService.updateProgress({
      actor: employeeActor,
      input: {
        goalId: goal.id,
        currentValue: 1,
        progressPercentage: 100,
      },
    });

    expect(updated.progressPercentage).toBe(100);
    expect(updated.status).toBe("COMPLETED");
  });
});
