import { describe, it, expect } from "vitest";
import {
  ReviewCalculator,
  DEFAULT_SCORING_WEIGHTS,
} from "@/lib/scoring/review-calculator";

describe("Performance Review Scoring Calculator & Fairness Engine (Phase 2)", () => {
  it("correctly calculates weighted execution score and normalized qualitative criteria", () => {
    const result = ReviewCalculator.calculate({
      goals: [
        { title: "G1", weight: 60, progressPercentage: 100 },
        { title: "G2", weight: 40, progressPercentage: 50 },
      ],
      ratings: {
        quality: 4,       // (4/5) * 20 = 16
        timeliness: 5,    // (5/5) * 15 = 15
        communication: 4, // (4/5) * 10 = 8
        collaboration: 5, // (5/5) * 10 = 10
        initiative: 4,    // (4/5) * 5  = 4
      },
    });

    // Execution score: (60*100 + 40*50) / 100 = 80.0
    expect(result.executionScore).toBe(80);

    // Weighted execution (40% weight): (80/100) * 40 = 32.0
    // Qualitative sum: 16 + 15 + 8 + 10 + 4 = 53.0
    // Total: 32 + 53 = 85.0
    expect(result.totalCalculatedScore).toBe(85.0);
    expect(result.qualitativeScores.quality.weighted).toBe(16);
    expect(result.qualitativeScores.timeliness.weighted).toBe(15);
  });

  describe("Fairness Rules Enforcement", () => {
    it("Fairness Rule 1: Excludes approved leave days from expected workday denominator", () => {
      const result = ReviewCalculator.calculate({
        ratings: { quality: 5, timeliness: 5, communication: 5, collaboration: 5, initiative: 5 },
        attendanceContext: {
          totalCalendarDays: 7,
          approvedLeaveDays: 2, // 2 days approved leave
          companyHolidays: 0,
          weeklyOffDays: 2,
          workedDays: 3,
        },
      });

      // Expected workdays: 7 - (2 + 0 + 2) = 3 days
      expect(result.effectiveExpectedWorkdays).toBe(3);
      expect(result.fairnessAdjustmentsApplied.length).toBeGreaterThan(0);
      expect(result.fairnessAdjustmentsApplied[0]).toContain("Excluded 2 approved leave day(s)");
    });

    it("Fairness Rule 2 & 3: Excludes justified cancellations and external dependency blockers from execution denominator", () => {
      const result = ReviewCalculator.calculate({
        ratings: { quality: 4, timeliness: 4, communication: 4, collaboration: 4, initiative: 4 },
        taskContext: {
          totalTasks: 10,
          completedTasks: 7,
          blockedTasksWithValidDependencies: 1, // External API blocker with revised due date
          justifiedCancelledTasks: 2,           // Approved cancelled tasks
        },
      });

      // Effective denominator: 10 - (1 + 2) = 7
      // Execution Score: (7 / 7) * 100 = 100%
      expect(result.executionScore).toBe(100);
      expect(result.fairnessAdjustmentsApplied.length).toBeGreaterThan(0);
      expect(result.fairnessAdjustmentsApplied[0]).toContain("Excluded 3 task(s)");
    });
  });

  it("Preserves immutable calculation snapshot for historical version integrity", () => {
    const result = ReviewCalculator.calculate({
      goals: [{ title: "Feature Alpha", weight: 100, progressPercentage: 90 }],
      ratings: { quality: 4, timeliness: 4, communication: 4, collaboration: 4, initiative: 4 },
    });

    expect(result.calculationSnapshot).toBeDefined();
    expect(result.calculationSnapshot.weights).toEqual(DEFAULT_SCORING_WEIGHTS);
    expect(result.calculationSnapshot.goals[0]?.title).toBe("Feature Alpha");
    expect(result.calculationSnapshot.calculatedAt).toBeDefined();
  });
});
