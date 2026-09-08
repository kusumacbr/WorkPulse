import { z } from "zod";

export const LeaveTypeEnum = z.enum(["CASUAL", "SICK", "PRIVILEGE", "UNPAID"]);
export const LeaveStatusEnum = z.enum(["PENDING_MANAGER", "PENDING_HR", "APPROVED", "REJECTED", "CANCELLED"]);
export const WfhStatusEnum = z.enum(["PENDING_MANAGER", "APPROVED", "REJECTED", "CANCELLED"]);

export const leaveRequestCreateSchema = z.object({
  leaveType: LeaveTypeEnum.default("CASUAL"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD"),
  isHalfDay: z.boolean().default(false),
  halfDayType: z.enum(["FIRST_HALF", "SECOND_HALF"]).optional().nullable(),
  reason: z.string().min(5, "Please provide a clear reason for the leave request"),
  handoverNotes: z.string().optional().nullable(),
  backupEmployeeId: z.string().optional().nullable(),
  attachmentUrl: z.string().optional().nullable(),
});

export type LeaveRequestCreateInput = z.infer<typeof leaveRequestCreateSchema>;

export const managerLeaveReviewSchema = z
  .object({
    requestId: z.string(),
    action: z.enum(["APPROVE", "REJECT"]),
    comment: z.string().optional().nullable(),
    rejectionReason: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.action === "REJECT" && (!data.rejectionReason || data.rejectionReason.trim().length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Mandatory reason is required when rejecting a leave request",
        path: ["rejectionReason"],
      });
    }
  });

export type ManagerLeaveReviewInput = z.infer<typeof managerLeaveReviewSchema>;

export const hrLeaveReviewSchema = z
  .object({
    requestId: z.string(),
    action: z.enum(["APPROVE", "REJECT"]),
    comment: z.string().optional().nullable(),
    rejectionReason: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.action === "REJECT" && (!data.rejectionReason || data.rejectionReason.trim().length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Mandatory reason is required when rejecting a leave request",
        path: ["rejectionReason"],
      });
    }
  });

export type HrLeaveReviewInput = z.infer<typeof hrLeaveReviewSchema>;

export const wfhRequestCreateSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD"),
  isSelfMarked: z.boolean().optional().default(false),
  reason: z.string().min(5, "Please specify reason for WFH"),
  availabilityHours: z.string().optional().default("10:00-19:00"),
  contactMethod: z.string().optional().default("Slack & Google Meet"),
  plannedDeliverables: z.string().min(5, "Please list planned deliverables for WFH session"),
});

export type WfhRequestCreateInput = z.input<typeof wfhRequestCreateSchema>;
export type WfhRequestCreateOutput = z.output<typeof wfhRequestCreateSchema>;

export const managerWfhReviewSchema = z
  .object({
    requestId: z.string(),
    action: z.enum(["APPROVE", "REJECT"]),
    rejectionReason: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.action === "REJECT" && (!data.rejectionReason || data.rejectionReason.trim().length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Reason is required when rejecting a WFH request",
        path: ["rejectionReason"],
      });
    }
  });

export type ManagerWfhReviewInput = z.infer<typeof managerWfhReviewSchema>;
