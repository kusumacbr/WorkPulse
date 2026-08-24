"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import {
  Calendar,
  Briefcase,
  GraduationCap,
  Info,
} from "lucide-react";

export type HeatmapDayCondition =
  | "EOD_COMPLETED"
  | "SOD_ACTIVE"
  | "APPROVED_WFH"
  | "SATURDAY_DEMAND_WORKED"
  | "SATURDAY_OFF"
  | "SATURDAY_INTERN_FULL"
  | "SUNDAY_WEEK_OFF"
  | "COMPANY_HOLIDAY"
  | "FULL_DAY_LEAVE"
  | "LATE_ARRIVAL"
  | "FUTURE_SCHEDULED"
  | "OTHER_MONTH";

export interface HeatmapDayCell {
  date: string;
  dayName: string;
  dayNumber: number;
  isOtherMonth?: boolean;
  condition: HeatmapDayCondition;
  internCondition?: HeatmapDayCondition;
  taskCount: number;
  workedHours: number;
  inTime?: string;
  outTime?: string;
  note: string;
  location?: "HQ Office" | "WFH" | "Holiday" | "Leave" | "Off" | "Other";
}

// August 2026 accurately mapped to Mon–Sun calendar grid (Aug 1 is Saturday)
const AUGUST_2026_CALENDAR_WEEKS: HeatmapDayCell[][] = [
  // Week 1: Jul 27 - Aug 2 (Mon - Sun)
  [
    {
      date: "2026-07-27",
      dayName: "Mon",
      dayNumber: 27,
      isOtherMonth: true,
      condition: "OTHER_MONTH",
      taskCount: 0,
      workedHours: 0,
      note: "July 2026 (Previous Month)",
      location: "Other",
    },
    {
      date: "2026-07-28",
      dayName: "Tue",
      dayNumber: 28,
      isOtherMonth: true,
      condition: "OTHER_MONTH",
      taskCount: 0,
      workedHours: 0,
      note: "July 2026 (Previous Month)",
      location: "Other",
    },
    {
      date: "2026-07-29",
      dayName: "Wed",
      dayNumber: 29,
      isOtherMonth: true,
      condition: "OTHER_MONTH",
      taskCount: 0,
      workedHours: 0,
      note: "July 2026 (Previous Month)",
      location: "Other",
    },
    {
      date: "2026-07-30",
      dayName: "Thu",
      dayNumber: 30,
      isOtherMonth: true,
      condition: "OTHER_MONTH",
      taskCount: 0,
      workedHours: 0,
      note: "July 2026 (Previous Month)",
      location: "Other",
    },
    {
      date: "2026-07-31",
      dayName: "Fri",
      dayNumber: 31,
      isOtherMonth: true,
      condition: "OTHER_MONTH",
      taskCount: 0,
      workedHours: 0,
      note: "July 2026 (Previous Month)",
      location: "Other",
    },
    {
      date: "2026-08-01",
      dayName: "Sat",
      dayNumber: 1,
      condition: "SATURDAY_DEMAND_WORKED",
      internCondition: "SATURDAY_INTERN_FULL",
      taskCount: 2,
      workedHours: 6.0,
      inTime: "10:15 AM",
      outTime: "04:30 PM",
      note: "Saturday work demanded for critical Q3 production release",
      location: "HQ Office",
    },
    {
      date: "2026-08-02",
      dayName: "Sun",
      dayNumber: 2,
      condition: "SUNDAY_WEEK_OFF",
      internCondition: "SUNDAY_WEEK_OFF",
      taskCount: 0,
      workedHours: 0,
      note: "Sunday Official Week Off for All",
      location: "Off",
    },
  ],

  // Week 2: Aug 3 - Aug 9 (Mon - Sun)
  [
    {
      date: "2026-08-03",
      dayName: "Mon",
      dayNumber: 3,
      condition: "EOD_COMPLETED",
      internCondition: "EOD_COMPLETED",
      taskCount: 3,
      workedHours: 8.5,
      inTime: "10:05 AM",
      outTime: "07:10 PM",
      note: "Regular Mon-Fri shift (10 AM - 7 PM) · Shipped database schema migrations",
      location: "HQ Office",
    },
    {
      date: "2026-08-04",
      dayName: "Tue",
      dayNumber: 4,
      condition: "EOD_COMPLETED",
      internCondition: "EOD_COMPLETED",
      taskCount: 4,
      workedHours: 8.2,
      inTime: "10:02 AM",
      outTime: "07:05 PM",
      note: "Regular Mon-Fri shift (10 AM - 7 PM) · Refactored auth guards",
      location: "HQ Office",
    },
    {
      date: "2026-08-05",
      dayName: "Wed",
      dayNumber: 5,
      condition: "APPROVED_WFH",
      internCondition: "APPROVED_WFH",
      taskCount: 3,
      workedHours: 8.0,
      inTime: "10:00 AM",
      outTime: "07:00 PM",
      note: "Authorized Remote WFH · Sprint 32 architecture spec delivered",
      location: "WFH",
    },
    {
      date: "2026-08-06",
      dayName: "Thu",
      dayNumber: 6,
      condition: "EOD_COMPLETED",
      internCondition: "EOD_COMPLETED",
      taskCount: 3,
      workedHours: 8.5,
      inTime: "10:10 AM",
      outTime: "07:15 PM",
      note: "Regular Mon-Fri shift · Conducted peer code reviews",
      location: "HQ Office",
    },
    {
      date: "2026-08-07",
      dayName: "Fri",
      dayNumber: 7,
      condition: "EOD_COMPLETED",
      internCondition: "EOD_COMPLETED",
      taskCount: 4,
      workedHours: 8.0,
      inTime: "10:04 AM",
      outTime: "07:00 PM",
      note: "Sprint 32 retrospective & sign-off completed",
      location: "HQ Office",
    },
    {
      date: "2026-08-08",
      dayName: "Sat",
      dayNumber: 8,
      condition: "SATURDAY_OFF",
      internCondition: "SATURDAY_INTERN_FULL",
      taskCount: 0,
      workedHours: 0,
      note: "Employees: Saturday Off (No work demand) · Interns/Probation: Full Day (10 AM - 7 PM)",
      location: "Off",
    },
    {
      date: "2026-08-09",
      dayName: "Sun",
      dayNumber: 9,
      condition: "SUNDAY_WEEK_OFF",
      internCondition: "SUNDAY_WEEK_OFF",
      taskCount: 0,
      workedHours: 0,
      note: "Sunday Official Week Off for All",
      location: "Off",
    },
  ],

  // Week 3: Aug 10 - Aug 16 (Mon - Sun)
  [
    {
      date: "2026-08-10",
      dayName: "Mon",
      dayNumber: 10,
      condition: "EOD_COMPLETED",
      internCondition: "EOD_COMPLETED",
      taskCount: 4,
      workedHours: 8.5,
      inTime: "10:06 AM",
      outTime: "07:12 PM",
      note: "Sprint 33 kick-off and initial OKR weight allocations",
      location: "HQ Office",
    },
    {
      date: "2026-08-11",
      dayName: "Tue",
      dayNumber: 11,
      condition: "EOD_COMPLETED",
      internCondition: "EOD_COMPLETED",
      taskCount: 3,
      workedHours: 8.0,
      inTime: "10:00 AM",
      outTime: "07:00 PM",
      note: "Implemented RBAC authorization tests",
      location: "HQ Office",
    },
    {
      date: "2026-08-12",
      dayName: "Wed",
      dayNumber: 12,
      condition: "APPROVED_WFH",
      internCondition: "APPROVED_WFH",
      taskCount: 3,
      workedHours: 8.3,
      inTime: "10:00 AM",
      outTime: "07:15 PM",
      note: "Authorized Remote WFH · Frontend state machine build",
      location: "WFH",
    },
    {
      date: "2026-08-13",
      dayName: "Thu",
      dayNumber: 13,
      condition: "EOD_COMPLETED",
      internCondition: "EOD_COMPLETED",
      taskCount: 4,
      workedHours: 8.5,
      inTime: "10:08 AM",
      outTime: "07:18 PM",
      note: "Completed Biometric terminal sync algorithms",
      location: "HQ Office",
    },
    {
      date: "2026-08-14",
      dayName: "Fri",
      dayNumber: 14,
      condition: "EOD_COMPLETED",
      internCondition: "EOD_COMPLETED",
      taskCount: 4,
      workedHours: 8.0,
      inTime: "10:05 AM",
      outTime: "07:02 PM",
      note: "Sprint 33 demo and pre-holiday code freeze",
      location: "HQ Office",
    },
    {
      date: "2026-08-15",
      dayName: "Sat",
      dayNumber: 15,
      condition: "COMPANY_HOLIDAY",
      internCondition: "COMPANY_HOLIDAY",
      taskCount: 0,
      workedHours: 0,
      note: "National Independence Day — Official Public Company Holiday for All",
      location: "Holiday",
    },
    {
      date: "2026-08-16",
      dayName: "Sun",
      dayNumber: 16,
      condition: "SUNDAY_WEEK_OFF",
      internCondition: "SUNDAY_WEEK_OFF",
      taskCount: 0,
      workedHours: 0,
      note: "Sunday Official Week Off for All",
      location: "Off",
    },
  ],

  // Week 4: Aug 17 - Aug 23 (Mon - Sun)
  [
    {
      date: "2026-08-17",
      dayName: "Mon",
      dayNumber: 17,
      condition: "LATE_ARRIVAL",
      internCondition: "LATE_ARRIVAL",
      taskCount: 3,
      workedHours: 8.5,
      inTime: "10:22 AM",
      outTime: "07:30 PM",
      note: "Late check-in by 7 mins (Grace window: 10:15 AM). Regularized with manager approval.",
      location: "HQ Office",
    },
    {
      date: "2026-08-18",
      dayName: "Tue",
      dayNumber: 18,
      condition: "EOD_COMPLETED",
      internCondition: "EOD_COMPLETED",
      taskCount: 4,
      workedHours: 8.0,
      inTime: "10:04 AM",
      outTime: "07:10 PM",
      note: "Sprint 34 core workflow execution · Refactored state machine",
      location: "HQ Office",
    },
    {
      date: "2026-08-19",
      dayName: "Wed",
      dayNumber: 19,
      condition: "APPROVED_WFH",
      internCondition: "APPROVED_WFH",
      taskCount: 3,
      workedHours: 8.2,
      inTime: "10:00 AM",
      outTime: "07:05 PM",
      note: "Authorized Remote WFH · Extracted brand token definitions",
      location: "WFH",
    },
    {
      date: "2026-08-20",
      dayName: "Thu",
      dayNumber: 20,
      condition: "SOD_ACTIVE",
      internCondition: "SOD_ACTIVE",
      taskCount: 2,
      workedHours: 4.5,
      inTime: "10:08 AM",
      outTime: "In Progress",
      note: "TODAY: Shift active (10:00 AM – 07:00 PM) · 80% deliverables completed",
      location: "HQ Office",
    },
    {
      date: "2026-08-21",
      dayName: "Fri",
      dayNumber: 21,
      condition: "FUTURE_SCHEDULED",
      internCondition: "FUTURE_SCHEDULED",
      taskCount: 0,
      workedHours: 0,
      note: "Scheduled Mon-Fri shift (10:00 AM – 07:00 PM) · Sprint 34 wrap-up",
      location: "HQ Office",
    },
    {
      date: "2026-08-22",
      dayName: "Sat",
      dayNumber: 22,
      condition: "SATURDAY_OFF",
      internCondition: "SATURDAY_INTERN_FULL",
      taskCount: 0,
      workedHours: 0,
      note: "Employees: Work if work demands · Interns/Probation: Full Day (10:00 AM – 07:00 PM)",
      location: "Off",
    },
    {
      date: "2026-08-23",
      dayName: "Sun",
      dayNumber: 23,
      condition: "SUNDAY_WEEK_OFF",
      internCondition: "SUNDAY_WEEK_OFF",
      taskCount: 0,
      workedHours: 0,
      note: "Sunday Official Week Off for All",
      location: "Off",
    },
  ],

  // Week 5: Aug 24 - Aug 30 (Mon - Sun)
  [
    {
      date: "2026-08-24",
      dayName: "Mon",
      dayNumber: 24,
      condition: "FUTURE_SCHEDULED",
      internCondition: "FUTURE_SCHEDULED",
      taskCount: 0,
      workedHours: 0,
      note: "Scheduled Shift (10:00 AM – 07:00 PM)",
      location: "HQ Office",
    },
    {
      date: "2026-08-25",
      dayName: "Tue",
      dayNumber: 25,
      condition: "FUTURE_SCHEDULED",
      internCondition: "FUTURE_SCHEDULED",
      taskCount: 0,
      workedHours: 0,
      note: "Scheduled Shift (10:00 AM – 07:00 PM)",
      location: "HQ Office",
    },
    {
      date: "2026-08-26",
      dayName: "Wed",
      dayNumber: 26,
      condition: "FUTURE_SCHEDULED",
      internCondition: "FUTURE_SCHEDULED",
      taskCount: 0,
      workedHours: 0,
      note: "Scheduled Shift (10:00 AM – 07:00 PM)",
      location: "HQ Office",
    },
    {
      date: "2026-08-27",
      dayName: "Thu",
      dayNumber: 27,
      condition: "FUTURE_SCHEDULED",
      internCondition: "FUTURE_SCHEDULED",
      taskCount: 0,
      workedHours: 0,
      note: "Scheduled Shift (10:00 AM – 07:00 PM)",
      location: "HQ Office",
    },
    {
      date: "2026-08-28",
      dayName: "Fri",
      dayNumber: 28,
      condition: "FUTURE_SCHEDULED",
      internCondition: "FUTURE_SCHEDULED",
      taskCount: 0,
      workedHours: 0,
      note: "Scheduled Shift (10:00 AM – 07:00 PM)",
      location: "HQ Office",
    },
    {
      date: "2026-08-29",
      dayName: "Sat",
      dayNumber: 29,
      condition: "SATURDAY_OFF",
      internCondition: "SATURDAY_INTERN_FULL",
      taskCount: 0,
      workedHours: 0,
      note: "Employees: Saturday Off (work if work demands) · Interns/Probation: Full Day (10 AM - 7 PM)",
      location: "Off",
    },
    {
      date: "2026-08-30",
      dayName: "Sun",
      dayNumber: 30,
      condition: "SUNDAY_WEEK_OFF",
      internCondition: "SUNDAY_WEEK_OFF",
      taskCount: 0,
      workedHours: 0,
      note: "Sunday Official Week Off for All",
      location: "Off",
    },
  ],

  // Week 6: Aug 31 - Sep 6 (Mon - Sun)
  [
    {
      date: "2026-08-31",
      dayName: "Mon",
      dayNumber: 31,
      condition: "FUTURE_SCHEDULED",
      internCondition: "FUTURE_SCHEDULED",
      taskCount: 0,
      workedHours: 0,
      note: "Scheduled Shift (10:00 AM – 07:00 PM) · Monthly Review Calibration",
      location: "HQ Office",
    },
    {
      date: "2026-09-01",
      dayName: "Tue",
      dayNumber: 1,
      isOtherMonth: true,
      condition: "OTHER_MONTH",
      taskCount: 0,
      workedHours: 0,
      note: "September 2026 (Next Month)",
      location: "Other",
    },
    {
      date: "2026-09-02",
      dayName: "Wed",
      dayNumber: 2,
      isOtherMonth: true,
      condition: "OTHER_MONTH",
      taskCount: 0,
      workedHours: 0,
      note: "September 2026 (Next Month)",
      location: "Other",
    },
    {
      date: "2026-09-03",
      dayName: "Thu",
      dayNumber: 3,
      isOtherMonth: true,
      condition: "OTHER_MONTH",
      taskCount: 0,
      workedHours: 0,
      note: "September 2026 (Next Month)",
      location: "Other",
    },
    {
      date: "2026-09-04",
      dayName: "Fri",
      dayNumber: 4,
      isOtherMonth: true,
      condition: "OTHER_MONTH",
      taskCount: 0,
      workedHours: 0,
      note: "September 2026 (Next Month)",
      location: "Other",
    },
    {
      date: "2026-09-05",
      dayName: "Sat",
      dayNumber: 5,
      isOtherMonth: true,
      condition: "OTHER_MONTH",
      taskCount: 0,
      workedHours: 0,
      note: "September 2026 (Next Month)",
      location: "Other",
    },
    {
      date: "2026-09-06",
      dayName: "Sun",
      dayNumber: 6,
      isOtherMonth: true,
      condition: "OTHER_MONTH",
      taskCount: 0,
      workedHours: 0,
      note: "September 2026 (Next Month)",
      location: "Other",
    },
  ],
];

export function MonthContributionHeatmap() {
  const [roleTier, setRoleTier] = useState<"EMPLOYEE" | "INTERN">("EMPLOYEE");
  // Default to today: Aug 20 (Week 4, index 3 = Thu Aug 20)
  const [selectedDay, setSelectedDay] = useState<HeatmapDayCell>(
    AUGUST_2026_CALENDAR_WEEKS[3]![3]!
  );

  const getEffectiveCondition = (cell: HeatmapDayCell): HeatmapDayCondition => {
    if (cell.isOtherMonth) return "OTHER_MONTH";
    if (roleTier === "INTERN" && cell.internCondition) {
      return cell.internCondition;
    }
    return cell.condition;
  };

  const getConditionStyle = (cond: HeatmapDayCondition) => {
    switch (cond) {
      case "EOD_COMPLETED":
        return {
          bg: "bg-emerald-500 hover:bg-emerald-400 border-emerald-600 text-white shadow-[0_0_8px_rgba(16,185,129,0.3)]",
          label: "EOD Verified (8h+)",
          tag: "Mon–Fri Shift Completed",
        };
      case "SOD_ACTIVE":
        return {
          bg: "bg-cyan-500 hover:bg-cyan-400 border-cyan-400 text-black font-black animate-pulse shadow-[0_0_14px_rgba(6,182,212,0.7)] ring-2 ring-cyan-300",
          label: "SOD Active (Today)",
          tag: "Active Shift (10AM - 7PM)",
        };
      case "APPROVED_WFH":
        return {
          bg: "bg-purple-500/85 hover:bg-purple-500 border-purple-400 text-white shadow-[0_0_8px_rgba(168,85,247,0.3)]",
          label: "Approved WFH",
          tag: "Remote Shift Verified",
        };
      case "SATURDAY_DEMAND_WORKED":
      case "SATURDAY_INTERN_FULL":
        return {
          bg: "bg-amber-500 hover:bg-amber-400 border-amber-400 text-black font-bold shadow-[0_0_8px_rgba(245,158,11,0.3)]",
          label: roleTier === "EMPLOYEE" ? "Sat Work on Demand" : "Sat Full Working",
          tag: roleTier === "EMPLOYEE" ? "Demanded Saturday Work" : "Intern Mon-Sat Schedule",
        };
      case "SATURDAY_OFF":
        return {
          bg: "bg-muted/40 hover:bg-muted/60 border-border/80 text-muted-foreground",
          label: "Saturday Off",
          tag: "Work If Demanded",
        };
      case "SUNDAY_WEEK_OFF":
        return {
          bg: "bg-slate-900/60 hover:bg-slate-900 border-border/50 text-slate-500",
          label: "Sunday Week Off",
          tag: "Official Week Off",
        };
      case "COMPANY_HOLIDAY":
        return {
          bg: "bg-blue-600 hover:bg-blue-500 border-blue-400 text-white shadow-[0_0_8px_rgba(37,99,235,0.4)]",
          label: "Company Holiday",
          tag: "Independence Day",
        };
      case "FULL_DAY_LEAVE":
        return {
          bg: "bg-rose-500/80 hover:bg-rose-400 border-rose-400 text-white",
          label: "Approved Leave",
          tag: "Leave Balance Used",
        };
      case "LATE_ARRIVAL":
        return {
          bg: "bg-amber-600/85 hover:bg-amber-500 border-amber-400 text-white",
          label: "Late Arrival",
          tag: "Past 10:15 AM Grace",
        };
      case "OTHER_MONTH":
        return {
          bg: "bg-card/20 border-dashed border-border/30 text-muted-foreground/30 pointer-events-none opacity-40",
          label: "Other Month",
          tag: "Calendar Boundary",
        };
      case "FUTURE_SCHEDULED":
      default:
        return {
          bg: "bg-muted/25 hover:bg-muted/40 border-border/50 text-muted-foreground/70",
          label: "Scheduled Shift",
          tag: "10:00 AM – 07:00 PM",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* 3D Container Card */}
      <Interactive3DCard className="p-6 border border-emerald-500/30 bg-gradient-to-r from-card/80 via-card/60 to-emerald-500/10 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="font-bold text-[10px] uppercase bg-emerald-500/15 border-emerald-500/30 text-emerald-300">
                <Calendar className="h-3 w-3 mr-1 text-emerald-400" />
                Condition-Driven Matrix
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">August 2026 (Mon – Sun Calendar Grid)</span>
            </div>
            <h3 className="text-xl font-bold text-foreground">
              Month Contribution & Attendance Heatmap
            </h3>
            <p className="text-xs text-muted-foreground">
              Accurately aligned Monday–Sunday calendar grid. Company timings (10:00 AM – 07:00 PM), employee Mon–Fri + Sat demand, intern Mon–Sat full, and Sunday off.
            </p>
          </div>

          {/* Role Policy Switcher: Employee vs Intern/Probation */}
          <div className="flex items-center p-1 rounded-xl bg-background/60 border border-border/80 shrink-0 gap-1 text-xs">
            <button
              type="button"
              onClick={() => setRoleTier("EMPLOYEE")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                roleTier === "EMPLOYEE"
                  ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>Full-Time Employee (Mon–Fri + Sat Demand)</span>
            </button>

            <button
              type="button"
              onClick={() => setRoleTier("INTERN")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                roleTier === "INTERN"
                  ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Probation / Intern (Mon–Sat Full)</span>
            </button>
          </div>
        </div>

        {/* Heatmap Conditions Legend */}
        <div className="p-3.5 rounded-xl bg-background/50 border border-border/70 flex flex-wrap items-center gap-3 text-xs">
          <span className="text-[11px] font-bold text-foreground mr-1 flex items-center gap-1">
            <Info className="h-3 w-3 text-cyan-400" />
            Conditions Legend:
          </span>

          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-emerald-500 inline-block shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
            <span className="text-[11px] text-foreground font-semibold">EOD Completed (8h+)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-cyan-400 inline-block animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <span className="text-[11px] text-cyan-300 font-bold">SOD Active (Today)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-purple-500 inline-block" />
            <span className="text-[11px] text-purple-300">Approved WFH</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-amber-500 inline-block" />
            <span className="text-[11px] text-amber-300 font-semibold">
              {roleTier === "EMPLOYEE" ? "Sat Work on Demand" : "Sat Full Working"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-blue-600 inline-block" />
            <span className="text-[11px] text-blue-300">Company Holiday</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-slate-900 border border-border inline-block" />
            <span className="text-[11px] text-slate-400">Sunday Week Off</span>
          </div>
        </div>

        {/* Heatmap Matrix Grid Aligned Accurately to Mon - Sun */}
        <div className="overflow-x-auto pb-2">
          <div className="flex flex-col gap-2 min-w-[640px]">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-black uppercase tracking-wider mb-1">
              <span className="text-foreground">MON</span>
              <span className="text-foreground">TUE</span>
              <span className="text-foreground">WED</span>
              <span className="text-foreground">THU</span>
              <span className="text-foreground">FRI</span>
              <span className="text-amber-400">SAT</span>
              <span className="text-slate-400">SUN</span>
            </div>

            {/* Weeks Rows */}
            {AUGUST_2026_CALENDAR_WEEKS.map((week, wIdx) => (
              <div key={wIdx} className="grid grid-cols-7 gap-2">
                {week.map((cell) => {
                  const effectiveCond = getEffectiveCondition(cell);
                  const style = getConditionStyle(effectiveCond);
                  const isSelected = selectedDay && selectedDay.date === cell.date && !cell.isOtherMonth;

                  if (cell.isOtherMonth) {
                    return (
                      <div
                        key={cell.date}
                        className="h-20 p-2 rounded-xl border border-dashed border-border/30 bg-card/10 flex flex-col justify-between opacity-30 select-none"
                      >
                        <span className="text-xs font-semibold text-muted-foreground">{cell.dayNumber}</span>
                        <span className="text-[8px] text-muted-foreground uppercase">{cell.dayName}</span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={cell.date}
                      onClick={() => setSelectedDay(cell)}
                      className={`h-20 p-2 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between select-none ${
                        style.bg
                      } ${
                        isSelected
                          ? "ring-2 ring-white scale-[1.03] shadow-xl z-10"
                          : "hover:scale-[1.01]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black">{cell.dayNumber}</span>
                        {cell.workedHours > 0 ? (
                          <span className="text-[10px] font-mono font-black opacity-90">
                            {cell.workedHours}h
                          </span>
                        ) : (
                          <span className="text-[9px] font-semibold opacity-70">
                            {cell.location}
                          </span>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[9px] font-extrabold uppercase truncate block">
                          {style.label}
                        </span>
                        {cell.taskCount > 0 && (
                          <span className="text-[8px] opacity-80 block truncate">
                            {cell.taskCount} deliverables
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Day Condition Inspector Card */}
        {selectedDay && !selectedDay.isOtherMonth && (
          <div className="p-4 md:p-5 rounded-2xl bg-card/80 border border-cyan-500/40 space-y-3 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-black font-mono text-sm shrink-0">
                  {selectedDay.dayNumber}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    {selectedDay.dayName}, August {selectedDay.dayNumber}, 2026
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Condition:{" "}
                    <strong className="text-cyan-300">
                      {getConditionStyle(getEffectiveCondition(selectedDay)).label}
                    </strong>{" "}
                    · {getConditionStyle(getEffectiveCondition(selectedDay)).tag}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs shrink-0">
                <Badge variant="outline" className="text-cyan-300 border-cyan-500/30 bg-cyan-500/10 font-mono font-bold">
                  Shift: 10:00 AM – 07:00 PM
                </Badge>
                {selectedDay.inTime && (
                  <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 font-mono">
                    Punch: {selectedDay.inTime} → {selectedDay.outTime || "Active"}
                  </Badge>
                )}
              </div>
            </div>

            <p className="text-xs text-foreground/90 leading-relaxed">
              <strong className="text-muted-foreground">Condition Note: </strong>
              {selectedDay.note}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="p-2.5 rounded-lg bg-background/50 border border-border">
                <span className="text-[10px] text-muted-foreground uppercase block font-bold">Location</span>
                <span className="font-bold text-foreground">{selectedDay.location || "Office HQ"}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-background/50 border border-border">
                <span className="text-[10px] text-muted-foreground uppercase block font-bold">Worked Time</span>
                <span className="font-mono font-bold text-cyan-400">{selectedDay.workedHours} Hours</span>
              </div>
              <div className="p-2.5 rounded-lg bg-background/50 border border-border">
                <span className="text-[10px] text-muted-foreground uppercase block font-bold">Deliverables</span>
                <span className="font-bold text-foreground">{selectedDay.taskCount} Tasks</span>
              </div>
              <div className="p-2.5 rounded-lg bg-background/50 border border-border">
                <span className="text-[10px] text-muted-foreground uppercase block font-bold">Schedule Rule</span>
                <span className="font-bold text-emerald-400">
                  {selectedDay.dayName === "Sat"
                    ? roleTier === "EMPLOYEE"
                      ? "Saturday Work if Demanded"
                      : "Monday–Saturday Full"
                    : selectedDay.dayName === "Sun"
                    ? "Sunday Week Off"
                    : "Monday–Friday Standard (10-7)"}
                </span>
              </div>
            </div>
          </div>
        )}
      </Interactive3DCard>
    </div>
  );
}
