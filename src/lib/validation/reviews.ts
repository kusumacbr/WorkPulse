import { z } from "zod";

export const ReviewTypeEnum = z.enum(["WEEKLY", "MONTHLY", "MANAGER_EVALUATION"]);

export const ReviewStatusEnum = z.enum([
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "CHANGES_REQUESTED",
  "RESUBMITTED",
  "APPROVED",
  "ACKNOWLEDGED",
  "LOCKED",
  "AMENDED",
]);

export const qualitativeRatingsSchema = z.object({
  quality: z.coerce.number().min(1).max(5).default(4),
  timeliness: z.coerce.number().min(1).max(5).default(4),
  communication: z.coerce.number().min(1).max(5).default(4),
  collaboration: z.coerce.number().min(1).max(5).default(4),
  initiative: z.coerce.number().min(1).max(5).default(4),
});

export type QualitativeRatingsInput = z.infer<typeof qualitativeRatingsSchema>;

export const selfReviewSubmissionSchema = z.object({
  reviewId: z.string(),
  selfSummary: z.string().min(5, "Please provide a self-summary of your work"),
  selfAchievements: z.string().min(5, "Highlight key achievements during this period"),
  selfMissedCommitments: z.string().optional().nullable(),
  selfBlockers: z.string().optional().nullable(),
  selfRatings: qualitativeRatingsSchema,
});

export type SelfReviewSubmissionInput = z.infer<typeof selfReviewSubmissionSchema>;

export const managerReviewSubmissionSchema = z
  .object({
    reviewId: z.string(),
    managerFeedback: z.string().min(10, "Please provide constructive manager feedback (min 10 chars)"),
    improvementActions: z.string().optional().nullable(),
    managerRatings: qualitativeRatingsSchema,
    calculatedScore: z.coerce.number().min(0).max(100),
    finalScore: z.coerce.number().min(0).max(100),
    scoreOverrideReason: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    // Fairness Rule: Any rating change/override requires a mandatory written reason
    if (Math.abs(data.finalScore - data.calculatedScore) > 0.5) {
      if (!data.scoreOverrideReason || data.scoreOverrideReason.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "A mandatory written justification (min 5 chars) is required when overriding the calculated score.",
          path: ["scoreOverrideReason"],
        });
      }
    }
  });

export type ManagerReviewSubmissionInput = z.infer<typeof managerReviewSubmissionSchema>;

export const reviewAcknowledgementSchema = z.object({
  reviewId: z.string(),
  employeeComment: z.string().optional().nullable(),
});

export type ReviewAcknowledgementInput = z.infer<typeof reviewAcknowledgementSchema>;

export const reviewAmendmentSchema = z.object({
  reviewId: z.string(),
  reason: z.string().min(10, "Detailed amendment reason required for audit trail"),
  managerFeedback: z.string().optional(),
  improvementActions: z.string().optional(),
  finalScore: z.coerce.number().min(0).max(100).optional(),
});

export type ReviewAmendmentInput = z.infer<typeof reviewAmendmentSchema>;
