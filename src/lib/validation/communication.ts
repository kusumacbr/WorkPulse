import { z } from "zod";

export const AnnouncementCategoryEnum = z.enum([
  "GENERAL",
  "POLICY",
  "BIRTHDAY",
  "FESTIVAL",
  "HOLIDAY",
  "EVENT",
  "EMERGENCY",
  "COMPANY_NEWS",
]);

export const AnnouncementPriorityEnum = z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]);
export const AudienceTypeEnum = z.enum(["ALL", "DEPARTMENT", "TEAM", "EMPLOYEE"]);
export const ExportFormatEnum = z.enum(["CSV", "XLSX", "PDF"]);
export const ReportTypeEnum = z.enum([
  "DAILY_WORK",
  "PERFORMANCE",
  "ATTENDANCE_LEAVE",
  "BLOCKERS",
  "BADGES",
  "PIP_STATUS",
]);

export const announcementCreateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  body: z.string().min(10, "Announcement body must be at least 10 characters"),
  category: AnnouncementCategoryEnum.default("GENERAL"),
  priority: AnnouncementPriorityEnum.default("NORMAL"),
  audienceType: AudienceTypeEnum.default("ALL"),
  audienceTargetId: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  attachmentUrl: z.string().optional().nullable(),
  acknowledgementRequired: z.boolean().default(false),
  channels: z.array(z.string()).default(["IN_APP"]),
});

export type AnnouncementCreateInput = z.input<typeof announcementCreateSchema>;
export type AnnouncementCreateOutput = z.output<typeof announcementCreateSchema>;

export const exportJobRequestSchema = z.object({
  reportType: ReportTypeEnum,
  filters: z
    .object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      departmentId: z.string().optional(),
      teamId: z.string().optional(),
      employeeId: z.string().optional(),
    })
    .optional()
    .default({}),
  format: ExportFormatEnum.default("CSV"),
});

export type ExportJobRequestInput = z.input<typeof exportJobRequestSchema>;
export type ExportJobRequestOutput = z.output<typeof exportJobRequestSchema>;
