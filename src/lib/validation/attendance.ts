import { z } from "zod";

export const attendanceRegularisationSchema = z.object({
  workdayId: z.string(),
  proposedCheckIn: z.string().min(4, "Please provide proposed check-in time"),
  proposedCheckOut: z.string().min(4, "Please provide proposed check-out time"),
  regularisationReason: z.string().min(5, "Please explain reason for missing punch/discrepancy"),
  evidenceUrl: z.string().optional().nullable(),
});

export type AttendanceRegularisationInput = z.infer<typeof attendanceRegularisationSchema>;

export const manualPunchSchema = z.object({
  punchType: z.enum(["IN", "OUT"]),
  punchTime: z.string(),
  source: z.enum(["BIOMETRIC", "WEB_MANUAL"]).default("WEB_MANUAL"),
});

export type ManualPunchInput = z.infer<typeof manualPunchSchema>;
