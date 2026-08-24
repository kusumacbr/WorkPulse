import { z } from "zod";

export const HolidayTypeEnum = z.enum(["NATIONAL", "FESTIVAL", "COMPANY_OPTIONAL"]);

export const holidayCreateSchema = z.object({
  name: z.string().min(3, "Holiday title must be at least 3 characters"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  holidayType: HolidayTypeEnum.default("NATIONAL"),
  description: z.string().optional().nullable(),
  year: z.coerce.number().min(2020).max(2050),
});

export type HolidayCreateInput = z.infer<typeof holidayCreateSchema>;

export const holidayBulkImportSchema = z.object({
  year: z.coerce.number().min(2020).max(2050),
  holidays: z
    .array(
      z.object({
        name: z.string().min(2),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        holidayType: HolidayTypeEnum.default("NATIONAL"),
        description: z.string().optional().nullable(),
      })
    )
    .min(1, "At least one holiday item required in bulk import"),
});

export type HolidayBulkImportInput = z.infer<typeof holidayBulkImportSchema>;
