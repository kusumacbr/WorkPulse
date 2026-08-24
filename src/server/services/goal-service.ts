import { AuthActor } from "@/lib/authorization/types";
import { assertAuthorized } from "@/lib/authorization/authorize";
import { PERMISSIONS } from "@/lib/authorization/permissions";
import { WeeklyGoalCreateInput, WeeklyGoalUpdateProgressInput } from "@/lib/validation/goals";
import { AuditService } from "@/lib/audit/audit-service";

export interface WeeklyGoalRecord {
  id: string;
  employeeId: string;
  title: string;
  description?: string | null;
  category: string;
  measurableOutcome: string;
  targetValue?: number | null;
  targetUnit?: string | null;
  currentValue?: number | null;
  weight: number;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  startDate: string;
  endDate: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  relatedProject?: string | null;
  evidenceRequired: boolean;
  managerApprovalRequired: boolean;
  progressPercentage: number;
  approvedById?: string | null;
  approvedAt?: string | null;
  createdAt: string;
}

const inMemoryGoals: WeeklyGoalRecord[] = [];

export class GoalService {
  /**
   * Create a new weekly goal
   */
  static async createWeeklyGoal(params: {
    actor: AuthActor;
    input: WeeklyGoalCreateInput;
    employeeId?: string;
  }): Promise<WeeklyGoalRecord> {
    const targetEmployeeId = params.employeeId || params.actor.employeeId || params.actor.userId;

    await assertAuthorized({
      actor: params.actor,
      permission: PERMISSIONS.WEEKLY_GOAL_CREATE,
      resource: { employeeId: targetEmployeeId },
    });

    // Check active weekly goals weight sum
    const activeGoals = inMemoryGoals.filter(
      (g) =>
        g.employeeId === targetEmployeeId &&
        g.startDate === params.input.startDate &&
        g.status !== "CANCELLED"
    );

    const currentTotalWeight = activeGoals.reduce((sum, g) => sum + g.weight, 0);
    const newTotalWeight = currentTotalWeight + params.input.weight;

    if (newTotalWeight > 100) {
      console.warn(
        `[GoalService Warning] Active goal weight total (${newTotalWeight}) exceeds standard 100% budget.`
      );
    }

    const goal: WeeklyGoalRecord = {
      id: `goal-${crypto.randomUUID()}`,
      employeeId: targetEmployeeId,
      title: params.input.title,
      description: params.input.description || null,
      category: params.input.category,
      measurableOutcome: params.input.measurableOutcome,
      targetValue: params.input.targetValue || null,
      targetUnit: params.input.targetUnit || null,
      currentValue: 0,
      weight: params.input.weight,
      priority: params.input.priority,
      startDate: params.input.startDate,
      endDate: params.input.endDate,
      status: params.input.managerApprovalRequired ? "PENDING_APPROVAL" : "IN_PROGRESS",
      relatedProject: params.input.relatedProject || null,
      evidenceRequired: params.input.evidenceRequired,
      managerApprovalRequired: params.input.managerApprovalRequired,
      progressPercentage: 0,
      approvedById: null,
      approvedAt: null,
      createdAt: new Date().toISOString(),
    };

    inMemoryGoals.push(goal);

    await AuditService.record({
      actorId: params.actor.userId,
      action: "weekly_goal_created",
      entity: "WeeklyGoal",
      entityId: goal.id,
      reason: `Goal '${goal.title}' created with weight ${goal.weight}%`,
      afterState: { ...goal } as any,
    });

    return goal;
  }

  /**
   * Update goal progress
   */
  static async updateProgress(params: {
    actor: AuthActor;
    input: WeeklyGoalUpdateProgressInput;
  }): Promise<WeeklyGoalRecord> {
    const goal = inMemoryGoals.find((g) => g.id === params.input.goalId);
    if (!goal) {
      throw new Error(`Goal with ID ${params.input.goalId} not found.`);
    }

    await assertAuthorized({
      actor: params.actor,
      permission: PERMISSIONS.PROFILE_UPDATE,
      resource: { employeeId: goal.employeeId },
    });

    const priorState = { ...goal };
    goal.currentValue = params.input.currentValue;
    goal.progressPercentage = params.input.progressPercentage;

    if (params.input.status) {
      goal.status = params.input.status;
    } else if (goal.progressPercentage >= 100) {
      goal.status = "COMPLETED";
    }

    await AuditService.record({
      actorId: params.actor.userId,
      action: "weekly_goal_progress_updated",
      entity: "WeeklyGoal",
      entityId: goal.id,
      beforeState: priorState as any,
      afterState: { ...goal } as any,
    });

    return goal;
  }

  /**
   * Query weekly goals with weight sum validation
   */
  static async getWeeklyGoals(params: {
    employeeId: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ goals: WeeklyGoalRecord[]; totalWeight: number; isWeightComplete: boolean }> {
    const goals = inMemoryGoals.filter((g) => {
      if (g.employeeId !== params.employeeId) return false;
      if (params.startDate && g.startDate !== params.startDate) return false;
      return true;
    });

    const totalWeight = goals
      .filter((g) => g.status !== "CANCELLED")
      .reduce((sum, g) => sum + g.weight, 0);

    return {
      goals,
      totalWeight,
      isWeightComplete: totalWeight === 100,
    };
  }

  /**
   * Clear store for test resets
   */
  static clearStore(): void {
    inMemoryGoals.length = 0;
  }
}
