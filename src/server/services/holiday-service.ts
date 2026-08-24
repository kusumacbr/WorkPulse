import { AuditService } from "@/lib/audit/audit-service";
import { AuthActor } from "@/lib/authorization/types";
import { assertAuthorized } from "@/lib/authorization/authorize";
import { PERMISSIONS } from "@/lib/authorization/permissions";
import { HolidayCreateInput, HolidayBulkImportInput } from "@/lib/validation/holidays";

export interface HolidayRecord {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  holidayType: "NATIONAL" | "FESTIVAL" | "COMPANY_OPTIONAL";
  description?: string | null;
  year: number;
  createdAt: string;
}

const inMemoryHolidays = new Map<string, HolidayRecord>();

// Pre-populate standard Indian / National Holidays for 2026
const initial2026Holidays: HolidayRecord[] = [
  { id: "h-1", name: "Republic Day", date: "2026-01-26", holidayType: "NATIONAL", description: "National holiday celebrating the Constitution of India", year: 2026, createdAt: new Date().toISOString() },
  { id: "h-2", name: "Maha Shivratri", date: "2026-02-15", holidayType: "FESTIVAL", description: "Festival celebrating Lord Shiva", year: 2026, createdAt: new Date().toISOString() },
  { id: "h-3", name: "Holi", date: "2026-03-04", holidayType: "FESTIVAL", description: "Festival of colors", year: 2026, createdAt: new Date().toISOString() },
  { id: "h-4", name: "Eid-ul-Fitr", date: "2026-03-21", holidayType: "FESTIVAL", description: "Islamic festival marking the end of Ramadan", year: 2026, createdAt: new Date().toISOString() },
  { id: "h-5", name: "Independence Day", date: "2026-08-15", holidayType: "NATIONAL", description: "National Independence Day of India", year: 2026, createdAt: new Date().toISOString() },
  { id: "h-6", name: "Gandhi Jayanti", date: "2026-10-02", holidayType: "NATIONAL", description: "Birth anniversary of Mahatma Gandhi", year: 2026, createdAt: new Date().toISOString() },
  { id: "h-7", name: "Dussehra", date: "2026-10-20", holidayType: "FESTIVAL", description: "Victory of Good over Evil", year: 2026, createdAt: new Date().toISOString() },
  { id: "h-8", name: "Diwali", date: "2026-11-08", holidayType: "FESTIVAL", description: "Festival of Lights", year: 2026, createdAt: new Date().toISOString() },
  { id: "h-9", name: "Christmas", date: "2026-12-25", holidayType: "FESTIVAL", description: "Christmas celebration", year: 2026, createdAt: new Date().toISOString() },
];

initial2026Holidays.forEach((h) => inMemoryHolidays.set(h.id, h));

export class HolidayService {
  /**
   * List holidays for a specific year
   */
  static async listHolidays(year = 2026): Promise<HolidayRecord[]> {
    return Array.from(inMemoryHolidays.values())
      .filter((h) => h.year === year)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Create single holiday (HR-only)
   */
  static async createHoliday(params: {
    actor: AuthActor;
    input: HolidayCreateInput;
  }): Promise<HolidayRecord> {
    await assertAuthorized({
      actor: params.actor,
      permission: PERMISSIONS.HOLIDAY_MANAGE,
    });

    const holiday: HolidayRecord = {
      id: `h-${crypto.randomUUID()}`,
      name: params.input.name,
      date: params.input.date,
      holidayType: params.input.holidayType,
      description: params.input.description || null,
      year: params.input.year,
      createdAt: new Date().toISOString(),
    };

    inMemoryHolidays.set(holiday.id, holiday);

    await AuditService.record({
      actorId: params.actor.userId,
      action: "holiday_created",
      entity: "Holiday",
      entityId: holiday.id,
      reason: `Created holiday: ${holiday.name} (${holiday.date})`,
      afterState: { ...holiday } as any,
    });

    return holiday;
  }

  /**
   * Bulk import holidays from JSON / CSV list (HR-only)
   */
  static async bulkImportHolidays(params: {
    actor: AuthActor;
    input: HolidayBulkImportInput;
  }): Promise<{ importedCount: number; holidays: HolidayRecord[] }> {
    await assertAuthorized({
      actor: params.actor,
      permission: PERMISSIONS.HOLIDAY_MANAGE,
    });

    const created: HolidayRecord[] = [];
    const now = new Date().toISOString();

    for (const item of params.input.holidays) {
      const holiday: HolidayRecord = {
        id: `h-${crypto.randomUUID()}`,
        name: item.name,
        date: item.date,
        holidayType: item.holidayType,
        description: item.description || null,
        year: params.input.year,
        createdAt: now,
      };

      inMemoryHolidays.set(holiday.id, holiday);
      created.push(holiday);
    }

    await AuditService.record({
      actorId: params.actor.userId,
      action: "holidays_bulk_imported",
      entity: "Holiday",
      entityId: `year-${params.input.year}`,
      reason: `Bulk imported ${created.length} holidays for year ${params.input.year}`,
    });

    return { importedCount: created.length, holidays: created };
  }

  /**
   * Compute next upcoming holiday and countdown in days
   */
  static async getNextUpcomingHoliday(referenceDate = new Date().toISOString().split("T")[0]!): Promise<{
    holiday: HolidayRecord | null;
    daysRemaining: number;
  }> {
    const holidays = Array.from(inMemoryHolidays.values())
      .filter((h) => h.date >= referenceDate)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (holidays.length === 0) {
      return { holiday: null, daysRemaining: 0 };
    }

    const next = holidays[0]!;
    const ref = new Date(referenceDate);
    const target = new Date(next.date);
    const diffTime = target.getTime() - ref.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return { holiday: next, daysRemaining: Math.max(0, daysRemaining) };
  }

  static clearStore(): void {
    inMemoryHolidays.clear();
  }
}
