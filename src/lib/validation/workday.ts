import { z } from "zod";

export const WorkModeEnum = z.enum([
  "OFFICE",
  "WFH",
  "HYBRID",
  "CLIENT_LOCATION",
  "BUSINESS_TRAVEL",
  "FULL_DAY_LEAVE",
  "HALF_DAY_LEAVE",
  "COMPANY_HOLIDAY",
  "WEEKLY_OFF",
  "ABSENT",
]);

export const TaskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

export const TaskTypeEnum = z.enum([
  "PLANNED",
  "SUPPORT",
  "MEETING",
  "INCIDENT",
  "LEARNING",
  "ADMINISTRATIVE",
]);

export const TaskStatusEnum = z.enum([
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
  "PARTIALLY_COMPLETED",
  "BLOCKED",
  "CARRIED_FORWARD",
  "CANCELLED",
]);

// ----------------------------------------------------
// Start-of-Day (SOD) Task & Workday Schemas
// ----------------------------------------------------

export const sodTaskSchema = z.object({
  title: z.string().min(3, "Task title must be at least 3 characters long"),
  description: z.string().optional(),
  project: z.string().min(1, "Project or category name is required"),
  priority: TaskPriorityEnum.default("MEDIUM"),
  taskType: TaskTypeEnum.default("PLANNED"),
  expectedOutput: z.string().optional(),
  estimatedMinutes: z.coerce.number().min(5, "Minimum 5 minutes").max(960, "Maximum 16 hours").default(60),
  dueDate: z.string().optional(),
  weeklyGoalId: z.string().optional().nullable(),
  externalTicketUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  dependencies: z.string().optional(),
  isConfidential: z.boolean().default(false),
});

export type SodTaskInput = z.infer<typeof sodTaskSchema>;

export const sodSubmissionSchema = z.object({
  workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Work date must be YYYY-MM-DD"),
  workMode: WorkModeEnum.default("OFFICE"),
  shift: z.string().default("10:00-19:00"),
  plannedHours: z.coerce.number().min(0).max(24).default(8.0),
  tasks: z.array(sodTaskSchema).min(1, "At least one task is required for an active workday"),
});

export type SodSubmissionInput = z.infer<typeof sodSubmissionSchema>;

// ----------------------------------------------------
// End-of-Day (EOD) Task & Daily Summary Schemas
// ----------------------------------------------------

export const eodTaskUpdateSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    status: TaskStatusEnum,
    completionPercentage: z.coerce.number().min(0).max(100).default(0),
    workCompleted: z.string().optional().nullable(),
    actualMinutes: z.coerce.number().min(0).optional().nullable(),
    remainingWork: z.string().optional().nullable(),
    delayReason: z.string().optional().nullable(),
    blockerReference: z.string().optional().nullable(),
    evidenceUrl: z.string().optional().nullable(),
    nextAction: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    // 1. A COMPLETED task must be 100%
    if (data.status === "COMPLETED" && data.completionPercentage !== 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Completed tasks must have completion percentage set to 100%",
        path: ["completionPercentage"],
      });
    }

    // 2. A CANCELLED task requires a reason and can never be 100% completed
    if (data.status === "CANCELLED") {
      if (!data.delayReason || data.delayReason.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Cancelled tasks require a mandatory explanation/reason",
          path: ["delayReason"],
        });
      }
      if (data.completionPercentage === 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "A cancelled task cannot be 100% completed",
          path: ["completionPercentage"],
        });
      }
    }

    // 3. A BLOCKED task requires a blocker reference or delay reason
    if (data.status === "BLOCKED" && (!data.blockerReference || data.blockerReference.trim().length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Blocked tasks require a blocker reference or explanation",
        path: ["blockerReference"],
      });
    }
  });

export type EodTaskUpdateInput = z.infer<typeof eodTaskUpdateSchema>;

export const dailySummarySchema = z.object({
  achievements: z.string().min(3, "Please describe your key achievements today"),
  issues: z.string().optional().nullable(),
  supportNeeded: z.string().optional().nullable(),
  nextDayFocus: z.string().optional().nullable(),
});

export type DailySummaryInput = z.infer<typeof dailySummarySchema>;

export const eodSubmissionSchema = z.object({
  workdayId: z.string(),
  tasks: z.array(eodTaskUpdateSchema).min(1, "At least one task must be submitted"),
  dailySummary: dailySummarySchema,
});

export type EodSubmissionInput = z.infer<typeof eodSubmissionSchema>;

// ----------------------------------------------------
// Manager Change Request & Amendment Schemas
// ----------------------------------------------------

export const managerChangeRequestSchema = z.object({
  workdayId: z.string(),
  requestedFields: z.array(z.string()).min(1, "Specify at least one field needing correction"),
  message: z.string().min(5, "Please provide actionable feedback on requested changes"),
});

export type ManagerChangeRequestInput = z.infer<typeof managerChangeRequestSchema>;

export const workdayAmendmentSchema = z.object({
  workdayId: z.string(),
  reason: z.string().min(10, "A detailed reason (min 10 chars) is required for audit trail"),
  achievements: z.string().optional(),
  issues: z.string().optional(),
  supportNeeded: z.string().optional(),
  nextDayFocus: z.string().optional(),
  managerComment: z.string().optional(),
});

export type WorkdayAmendmentInput = z.infer<typeof workdayAmendmentSchema>;
