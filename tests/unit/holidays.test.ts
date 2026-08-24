import { describe, it, expect } from "vitest";
import { HolidayService } from "@/server/services/holiday-service";
import { AuthActor } from "@/lib/authorization/types";

describe("Holiday Management & Countdown Engine (Phase 3)", () => {
  const hrActor: AuthActor = {
    userId: "user-rachel",
    employeeId: "emp-rachel",
    email: "hr.rachel@xorstack.com",
    roles: ["HR"],
    departmentId: "dept-hr",
  };

  it("lists company holidays for 2026", async () => {
    const list = await HolidayService.listHolidays(2026);
    expect(list.length).toBeGreaterThanOrEqual(9);
    expect(list.some((h) => h.name === "Independence Day")).toBe(true);
  });

  it("calculates countdown in days to next upcoming holiday", async () => {
    const countdown = await HolidayService.getNextUpcomingHoliday("2026-08-20");

    expect(countdown.holiday).toBeDefined();
    // Next after Aug 20 is Gandhi Jayanti (2026-10-02)
    expect(countdown.holiday?.name).toBe("Gandhi Jayanti");
    expect(countdown.daysRemaining).toBeGreaterThan(0);
  });

  it("supports HR bulk-import of holidays from list", async () => {
    const bulk = await HolidayService.bulkImportHolidays({
      actor: hrActor,
      input: {
        year: 2026,
        holidays: [
          { name: "Karnataka Rajyotsava", date: "2026-11-01", holidayType: "COMPANY_OPTIONAL", description: "State holiday" },
          { name: "New Year's Eve", date: "2026-12-31", holidayType: "COMPANY_OPTIONAL", description: "Year end holiday" },
        ],
      },
    });

    expect(bulk.importedCount).toBe(2);

    const updatedList = await HolidayService.listHolidays(2026);
    expect(updatedList.some((h) => h.name === "Karnataka Rajyotsava")).toBe(true);
  });
});
