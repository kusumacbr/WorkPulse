import { z } from "zod";

export const BlockerSeverityEnum = z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);
export const BlockerStatusEnum = z.enum([
  "OPEN",
  "ACKNOWLEDGED",
  "IN_PROGRESS",
  "RESOLVED",
  "VERIFIED",
  "CLOSED",
  "DUPLICATE",
  "INVALID",
  "WITHDRAWN",
]);

export const blockerCreateSchema = z.object({
  taskId: z.string().optional().nullable(),
  description: z.string().min(5, "Please describe the blocker clearly"),
  category: z.string().default("TECHNICAL"),
  severity: BlockerSeverityEnum.default("MEDIUM"),
  responsibleTeam: z.string().default("Engineering"),
  supportRequired: z.string().min(5, "Please explain support required to unblock"),
  targetResolutionAt: z.string().optional().nullable(),
  isConfidential: z.boolean().optional().default(false),
});

export type BlockerCreateInput = z.input<typeof blockerCreateSchema>;
export type BlockerCreateOutput = z.output<typeof blockerCreateSchema>;

export const blockerResolveSchema = z.object({
  blockerId: z.string(),
  resolutionSummary: z.string().min(5, "Please provide summary of resolution"),
  status: z.enum(["RESOLVED", "CLOSED", "DUPLICATE", "INVALID", "WITHDRAWN"]).default("RESOLVED"),
});

export type BlockerResolveInput = z.infer<typeof blockerResolveSchema>;

export const oneToOneScheduleSchema = z.object({
  employeeId: z.string(),
  scheduledAt: z.string(),
  durationMinutes: z.number().default(30),
  agenda: z.string().optional().nullable(),
});

export type OneToOneScheduleInput = z.infer<typeof oneToOneScheduleSchema>;

export const oneToOneUpdateSchema = z.object({
  meetingId: z.string(),
  discussionNotes: z.string().optional().nullable(),
  employeeConcerns: z.string().optional().nullable(),
  achievements: z.string().optional().nullable(),
  developmentTopics: z.string().optional().nullable(),
  sharedNotes: z.string().optional().nullable(),
  privateManagerNotes: z.string().optional().nullable(), // Confidential
  followUpDate: z.string().optional().nullable(),
});

export type OneToOneUpdateInput = z.infer<typeof oneToOneUpdateSchema>;

export const badgeAwardCreateSchema = z.object({
  badgeDefinitionId: z.string(),
  recipientEmployeeId: z.string(),
  reason: z.string().min(5, "Please provide meaningful reason for recognition"),
  relatedTaskId: z.string().optional().nullable(),
  relatedGoalId: z.string().optional().nullable(),
  points: z.number().default(10),
});

export type BadgeAwardCreateInput = z.infer<typeof badgeAwardCreateSchema>;

export const goalTemplateCreateSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  items: z.array(
    z.object({
      title: z.string().min(3),
      description: z.string().optional().nullable(),
      category: z.string().default("TECHNICAL"),
      measurableOutcome: z.string(),
      targetValue: z.number().optional().nullable(),
      targetUnit: z.string().optional().nullable(),
      defaultWeight: z.number().default(20),
      evidenceRequired: z.boolean().default(false),
    })
  ).min(1),
});

export type GoalTemplateCreateInput = z.infer<typeof goalTemplateCreateSchema>;

export const probationRecommendSchema = z.object({
  employeeId: z.string(),
  checkpointDay: z.number().default(90),
  managerRecommendation: z.enum([
    "CONFIRM_EMPLOYMENT",
    "EXTEND_PROBATION",
    "TRAINING_REQUIRED",
    "START_PIP",
    "TERMINATE_PROBATION",
  ]),
  managerComments: z.string().min(5, "Detailed manager feedback required"),
  workQualityScore: z.number().min(1).max(5).default(4),
  taskCompletionScore: z.number().min(1).max(5).default(4),
  attendanceScore: z.number().min(1).max(5).default(4),
  communicationScore: z.number().min(1).max(5).default(4),
  collaborationScore: z.number().min(1).max(5).default(4),
  learningScore: z.number().min(1).max(5).default(4),
  technicalScore: z.number().min(1).max(5).default(4),
  conductScore: z.number().min(1).max(5).default(4),
});

export type ProbationRecommendInput = z.infer<typeof probationRecommendSchema>;

export const pipCreateSchema = z.object({
  employeeId: z.string(),
  reason: z.string().min(5, "Reason for PIP required"),
  performanceConcerns: z.string().min(5, "Detailed performance concerns required"),
  measurableGoals: z.string().min(5, "Actionable measurable goals required"),
  supportOffered: z.string().min(5, "Coaching and support offered required"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkInFrequency: z.string().default("WEEKLY"),
});

export type PipCreateInput = z.infer<typeof pipCreateSchema>;

export const skillGoalCreateSchema = z.object({
  skillName: z.string().min(2),
  currentLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]).default("BEGINNER"),
  targetLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]).default("INTERMEDIATE"),
  learningActivity: z.string().min(5),
  certificationName: z.string().optional().nullable(),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  evidenceUrl: z.string().optional().nullable(),
});

export type SkillGoalCreateInput = z.infer<typeof skillGoalCreateSchema>;
