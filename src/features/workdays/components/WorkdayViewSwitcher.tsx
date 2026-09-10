"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DynamicSODExecutionFlow } from "./DynamicSODExecutionFlow";
import { MonthContributionHeatmap } from "./MonthContributionHeatmap";
import {
  Calendar,
  CalendarDays,
  Grid,
  Clock,
  RotateCcw,
  ChevronRight,
} from "lucide-react";

interface WorkdayViewSwitcherProps {
  defaultTab?: "sod" | "day" | "week" | "month";
}

export function WorkdayViewSwitcher({ defaultTab = "sod" }: WorkdayViewSwitcherProps) {
  const [activeTab, setActiveTab] = useState<"sod" | "day" | "week" | "month">(defaultTab);
  const [, setSelectedDate] = useState<string>("2026-08-20");

  // 7-day week sequence (Mon - Sun)
  const weekDays = [
    {
      date: "2026-08-17",
      dayName: "Mon",
      status: "LOCKED",
      workMode: "OFFICE",
      workedHours: 8.5,
      taskCount: 3,
      preview: "10:00 AM - 07:00 PM · Authorization library integration & audit tests",
    },
    {
      date: "2026-08-18",
      dayName: "Tue",
      workMode: "OFFICE",
      workedHours: 8.0,
      taskCount: 4,
      status: "LOCKED",
      preview: "10:00 AM - 07:00 PM · Refactored Prisma migrations & role policies",
    },
    {
      date: "2026-08-19",
      dayName: "Wed",
      status: "EOD_SUBMITTED",
      workMode: "WFH",
      workedHours: 8.2,
      taskCount: 3,
      preview: "10:00 AM - 07:05 PM · Extracted official brand color & Tailwind tokens",
    },
    {
      date: "2026-08-20",
      dayName: "Thu",
      status: "SOD_SUBMITTED",
      workMode: "OFFICE",
      workedHours: 4.5,
      taskCount: 2,
      preview: "10:08 AM - 07:00 PM · Core employee workflow: SOD, EOD & OKR Goals",
      isToday: true,
    },
    {
      date: "2026-08-21",
      dayName: "Fri",
      status: "SCHEDULED",
      workMode: "HYBRID",
      workedHours: 0,
      taskCount: 0,
      preview: "10:00 AM - 07:00 PM · Scheduled sprint review and retrospective",
    },
    {
      date: "2026-08-22",
      dayName: "Sat",
      status: "ON_DEMAND",
      workMode: "SAT_SCHEDULE",
      workedHours: 0,
      taskCount: 0,
      preview: "Employees: Work if work demands · Interns/Probation: Full Day (10 AM - 7 PM)",
    },
    {
      date: "2026-08-23",
      dayName: "Sun",
      status: "WEEKLY_OFF",
      workMode: "WEEKLY_OFF",
      workedHours: 0,
      taskCount: 0,
      preview: "Sunday Official Week Off for All",
    },
  ];

  return (
    <div className="space-y-6">
      {/* View Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">Workday & Execution Hub</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time daily tasks, weekly sprint progress, and condition-driven attendance heatmap.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border shrink-0 overflow-x-auto gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("sod")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "sod"
                ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>SOD Planner</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-950 dark:text-amber-200 border border-amber-400/30 text-[9px] font-extrabold flex items-center gap-0.5">
              <RotateCcw className="h-2.5 w-2.5" />
              Rollover Work
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("day")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "day"
                ? "bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Day Execution</span>
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-400/30 text-[9px] font-mono font-bold">
              80% Live
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("week")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "week"
                ? "bg-indigo-600 text-white font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            <span>Week View</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("month")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "month"
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Grid className="h-3.5 w-3.5" />
            <span>Month Heatmap</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-[9px] font-bold">
              Conditions Active
            </span>
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------
          TAB 0: DEDICATED START-OF-DAY (SOD) PLANNER
          ---------------------------------------------------- */}
      {activeTab === "sod" && (
        <div className="animate-in fade-in duration-200">
          <DynamicSODExecutionFlow initialPhase="SOD_PLANNING" />
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 1: PRESENT DAY LIVE WORK EXECUTION UPDATE
          ---------------------------------------------------- */}
      {activeTab === "day" && (
        <div className="animate-in fade-in duration-200">
          <DynamicSODExecutionFlow initialPhase="WORK_EXECUTION" />
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 2: WEEK VIEW (7 Mon-Sun Cards with Policy Banner)
          ---------------------------------------------------- */}
      {activeTab === "week" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Policy Banner */}
          <div className="p-3.5 rounded-xl bg-card/60 border border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-400 shrink-0" />
              <span className="text-foreground">
                <strong>Company Timings: 10:00 AM – 07:00 PM</strong> (8.0h Core Work + 1.0h Break)
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
              <span>👔 <strong>Employees:</strong> Mon–Fri (Sat if work demands)</span>
              <span>🎓 <strong>Probation / Interns:</strong> Mon–Sat (10 AM - 7 PM)</span>
              <span className="text-emerald-400 font-bold">🏖️ Sunday: Week Off</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">Current Sprint Week (Mon–Sun)</h4>
            <span className="text-xs text-muted-foreground">Aug 17 – Aug 23, 2026</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
            {weekDays.map((day) => {
              const isScheduled = day.status === "SCHEDULED";

              return (
                <div
                  key={day.date}
                  onClick={() => {
                    setSelectedDate(day.date);
                    setActiveTab("day");
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-44 select-none ${
                    day.isToday
                      ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 shadow-md ring-1 ring-[var(--brand-primary)]"
                      : "border-border bg-card/60 hover:border-[var(--brand-primary)]/50 hover:bg-card/90"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-foreground">
                        {day.dayName} {new Date(day.date).getDate()}
                      </span>
                      {day.isToday && (
                        <Badge variant="brand" className="text-[9px] px-1.5 py-0">
                          Today
                        </Badge>
                      )}
                    </div>

                    <div className="mt-1">
                      {isScheduled ? (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground border-border">
                          Scheduled
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          {day.status.replace("_", " ")}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">
                      {day.preview}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/60">
                      <span>{day.workedHours > 0 ? `${day.workedHours}h` : day.workMode}</span>
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 3: MONTH HEATMAP VIEW (Condition-Driven Matrix)
          ---------------------------------------------------- */}
      {activeTab === "month" && (
        <div className="animate-in fade-in duration-200">
          <MonthContributionHeatmap />
        </div>
      )}
    </div>
  );
}
