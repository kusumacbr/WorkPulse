import { z } from "zod";

export const GoalPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export const GoalStatusEnum = z.enum([
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

export const weeklyGoalCreateSchema = z.object({
  title: z.string().min(3, "Goal title must be at least 3 characters long"),
  description: z.string().optional(),
  category: z.string().min(1, "Goal category is required"),
  measurableOutcome: z.string().min(5, "Please define a concrete measurable outcome"),
  targetValue: z.coerce.number().optional().nullable(),
  targetUnit: z.string().optional().nullable(),
  weight: z.coerce.number().min(1, "Minimum weight is 1").max(100, "Maximum weight is 100").default(20),
  priority: GoalPriorityEnum.default("MEDIUM"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD"),
  relatedProject: z.string().optional().nullable(),
  evidenceRequired: z.boolean().default(false),
  managerApprovalRequired: z.boolean().default(false),
});

export type WeeklyGoalCreateInput = z.infer<typeof weeklyGoalCreateSchema>;

export const weeklyGoalUpdateProgressSchema = z.object({
  goalId: z.string(),
  currentValue: z.coerce.number().min(0),
  progressPercentage: z.coerce.number().min(0).max(100),
  status: GoalStatusEnum.optional(),
});

export type WeeklyGoalUpdateProgressInput = z.infer<typeof weeklyGoalUpdateProgressSchema>;
