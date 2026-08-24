export interface ScoringWeights {
  execution: number;     // 40% default
  quality: number;       // 20% default
  timeliness: number;    // 15% default
  communication: number; // 10% default
  collaboration: number; // 10% default
  initiative: number;    // 5% default
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  execution: 40,
  quality: 20,
  timeliness: 15,
  communication: 10,
  collaboration: 10,
  initiative: 5,
};

export interface QualitativeRatings {
  quality: number;       // 1 - 5
  timeliness: number;    // 1 - 5
  communication: number; // 1 - 5
  collaboration: number; // 1 - 5
  initiative: number;    // 1 - 5
}

export interface GoalExecutionInput {
  title: string;
  weight: number;
  progressPercentage: number;
  approvedCompletionPercentage?: number;
}

export interface TaskFairnessContext {
  totalTasks: number;
  completedTasks: number;
  blockedTasksWithValidDependencies?: number;
  justifiedCancelledTasks?: number;
  unjustifiedCancelledTasks?: number;
}

export interface AttendanceFairnessContext {
  totalCalendarDays: number;
  approvedLeaveDays: number;
  companyHolidays: number;
  weeklyOffDays: number;
  workedDays: number;
}

export interface ReviewScoreCalculationResult {
  executionScore: number;       // 0 - 100
  qualitativeScores: {
    quality: { rating: number; weighted: number; max: number };
    timeliness: { rating: number; weighted: number; max: number };
    communication: { rating: number; weighted: number; max: number };
    collaboration: { rating: number; weighted: number; max: number };
    initiative: { rating: number; weighted: number; max: number };
  };
  totalCalculatedScore: number; // 0 - 100
  effectiveExpectedWorkdays: number;
  fairnessAdjustmentsApplied: string[];
  calculationSnapshot: {
    weights: ScoringWeights;
    goals: GoalExecutionInput[];
    ratings: QualitativeRatings;
    taskContext?: TaskFairnessContext;
    attendanceContext?: AttendanceFairnessContext;
    calculatedAt: string;
  };
}

export class ReviewCalculator {
  /**
   * Calculates weighted performance review score enforcing fairness rules
   */
  static calculate(params: {
    goals?: GoalExecutionInput[];
    ratings: QualitativeRatings;
    weights?: Partial<ScoringWeights>;
    taskContext?: TaskFairnessContext;
    attendanceContext?: AttendanceFairnessContext;
  }): ReviewScoreCalculationResult {
    const weights: ScoringWeights = {
      ...DEFAULT_SCORING_WEIGHTS,
      ...(params.weights || {}),
    };

    const fairnessAdjustments: string[] = [];

    // 1. Calculate Execution Score (40% weight default)
    let executionScore = 0;
    const goals = params.goals || [];

    if (goals.length > 0) {
      const totalGoalWeight = goals.reduce((sum, g) => sum + g.weight, 0);
      if (totalGoalWeight > 0) {
        const weightedSum = goals.reduce((sum, g) => {
          const comp = g.approvedCompletionPercentage ?? g.progressPercentage;
          return sum + g.weight * Math.min(100, Math.max(0, comp));
        }, 0);
        executionScore = Number((weightedSum / totalGoalWeight).toFixed(2));
      }
    } else if (params.taskContext) {
      // Fallback to task completion with fairness adjustments
      const { totalTasks, completedTasks, blockedTasksWithValidDependencies = 0, justifiedCancelledTasks = 0 } = params.taskContext;
      
      // Fairness Rule: Exclude justified cancellations and active external dependency blockers
      const excludedTasks = blockedTasksWithValidDependencies + justifiedCancelledTasks;
      const effectiveTotalTasks = Math.max(1, totalTasks - excludedTasks);

      if (excludedTasks > 0) {
        fairnessAdjustments.push(
          `Excluded ${excludedTasks} task(s) from execution denominator (${blockedTasksWithValidDependencies} dependency-blocked, ${justifiedCancelledTasks} justified cancellation).`
        );
      }

      executionScore = Number(Math.min(100, (completedTasks / effectiveTotalTasks) * 100).toFixed(2));
    } else {
      executionScore = 100; // Default baseline if no tasks/goals recorded
    }

    // 2. Normalize 1-5 Qualitative Criteria to weighted percentages
    const normalize = (rating: number, weight: number) => {
      const bounded = Math.min(5, Math.max(1, rating));
      return Number(((bounded / 5) * weight).toFixed(2));
    };

    const qScores = {
      quality: {
        rating: params.ratings.quality,
        weighted: normalize(params.ratings.quality, weights.quality),
        max: weights.quality,
      },
      timeliness: {
        rating: params.ratings.timeliness,
        weighted: normalize(params.ratings.timeliness, weights.timeliness),
        max: weights.timeliness,
      },
      communication: {
        rating: params.ratings.communication,
        weighted: normalize(params.ratings.communication, weights.communication),
        max: weights.communication,
      },
      collaboration: {
        rating: params.ratings.collaboration,
        weighted: normalize(params.ratings.collaboration, weights.collaboration),
        max: weights.collaboration,
      },
      initiative: {
        rating: params.ratings.initiative,
        weighted: normalize(params.ratings.initiative, weights.initiative),
        max: weights.initiative,
      },
    };

    // 3. Fairness Rule: Attendance Context - Exclude approved leave days from expected days
    let effectiveExpectedWorkdays = 5; // standard week
    if (params.attendanceContext) {
      const { totalCalendarDays, approvedLeaveDays, companyHolidays, weeklyOffDays } = params.attendanceContext;
      effectiveExpectedWorkdays = Math.max(0, totalCalendarDays - (approvedLeaveDays + companyHolidays + weeklyOffDays));

      if (approvedLeaveDays > 0) {
        fairnessAdjustments.push(
          `Excluded ${approvedLeaveDays} approved leave day(s) from expected workday denominator.`
        );
      }
    }

    // 4. Calculate Final Weighted Total Score (0 - 100)
    const weightedExecutionComponent = Number(((executionScore / 100) * weights.execution).toFixed(2));
    const qualitativeSum =
      qScores.quality.weighted +
      qScores.timeliness.weighted +
      qScores.communication.weighted +
      qScores.collaboration.weighted +
      qScores.initiative.weighted;

    const totalCalculatedScore = Number((weightedExecutionComponent + qualitativeSum).toFixed(1));

    return {
      executionScore,
      qualitativeScores: qScores,
      totalCalculatedScore: Math.min(100, Math.max(0, totalCalculatedScore)),
      effectiveExpectedWorkdays,
      fairnessAdjustmentsApplied: fairnessAdjustments,
      calculationSnapshot: {
        weights,
        goals,
        ratings: params.ratings,
        taskContext: params.taskContext,
        attendanceContext: params.attendanceContext,
        calculatedAt: new Date().toISOString(),
      },
    };
  }
}
