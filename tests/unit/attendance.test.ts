import { describe, it, expect } from "vitest";
import { AttendanceService } from "@/server/services/attendance-service";

describe("Attendance Calculation Engine & Conflict Precedence (Phase 3)", () => {
  it("enforces Conflict Precedence Rule 1: Approved full-day leave overrides biometric punches", () => {
    const result = AttendanceService.calculateDayAttendance({
      employeeId: "emp-sarah",
      workDate: "2026-08-20",
      hasApprovedFullDayLeave: true,
      biometricPunches: [{ time: "09:00", type: "IN" }, { time: "18:00", type: "OUT" }],
    });

    expect(result.effectiveWorkMode).toBe("FULL_DAY_LEAVE");
    expect(result.precedenceWinner).toContain("Approved Full-Day Leave (Priority 1)");
  });

  it("enforces Conflict Precedence Rule 2: Company holiday overrides biometric punches", () => {
    const result = AttendanceService.calculateDayAttendance({
      employeeId: "emp-sarah",
      workDate: "2026-08-15",
      isCompanyHoliday: true,
      biometricPunches: [{ time: "10:00", type: "IN" }],
    });

    expect(result.effectiveWorkMode).toBe("COMPANY_HOLIDAY");
    expect(result.precedenceWinner).toContain("Company Holiday (Priority 2)");
  });

  it("enforces Conflict Precedence Rule 3: Approved Business Travel overrides standard punches", () => {
    const result = AttendanceService.calculateDayAttendance({
      employeeId: "emp-sarah",
      workDate: "2026-08-20",
      hasApprovedBusinessTravel: true,
    });

    expect(result.effectiveWorkMode).toBe("BUSINESS_TRAVEL");
    expect(result.netWorkedHours).toBe(8);
  });

  it("enforces Conflict Precedence Rule 4: Approved WFH sets WFH status", () => {
    const result = AttendanceService.calculateDayAttendance({
      employeeId: "emp-sarah",
      workDate: "2026-08-20",
      hasApprovedWfh: true,
    });

    expect(result.effectiveWorkMode).toBe("WFH");
    expect(result.firstCheckIn).toBe("10:00");
  });

  it("correctly pairs biometric punches and flags anomalies (odd punch count, late arrival, early departure)", () => {
    const result = AttendanceService.calculateDayAttendance({
      employeeId: "emp-sarah",
      workDate: "2026-08-20",
      biometricPunches: [
        { time: "10:25", type: "IN" }, // Late (grace 10:15)
        { time: "13:00", type: "OUT" },
        { time: "14:00", type: "IN" }, // Odd punches (no last OUT) and early departure (< 18:30)
      ],
    });

    expect(result.effectiveWorkMode).toBe("OFFICE");
    expect(result.firstCheckIn).toBe("10:25");
    expect(result.anomalies.length).toBe(3);
    expect(result.anomalies[0]).toContain("Odd punch count detected");
    expect(result.anomalies[1]).toContain("Late arrival at 10:25");
    expect(result.anomalies[2]).toContain("Early departure at 14:00");
  });

  it("evaluates absent status only after configured post-cutoff processing", () => {
    const preCutoff = AttendanceService.calculateDayAttendance({
      employeeId: "emp-sarah",
      workDate: "2026-08-20",
      isPostCutoff: false,
    });

    expect(preCutoff.effectiveWorkMode).toBe("OFFICE"); // Still open

    const postCutoff = AttendanceService.calculateDayAttendance({
      employeeId: "emp-sarah",
      workDate: "2026-08-20",
      isPostCutoff: true,
    });

    expect(postCutoff.effectiveWorkMode).toBe("ABSENT");
    expect(postCutoff.anomalies[0]).toContain("No attendance recorded by end-of-day cutoff");
  });

  it("queries company-wide Who's Where Today presence board", async () => {
    const directory = await AttendanceService.getWhosWhereToday();

    expect(directory.totalEmployees).toBeGreaterThan(0);
    expect(directory.inOfficeCount).toBeGreaterThan(0);
    expect(directory.wfhCount).toBeGreaterThan(0);
  });
});
