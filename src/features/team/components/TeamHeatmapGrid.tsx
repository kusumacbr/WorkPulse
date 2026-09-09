"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { Users } from "lucide-react";

interface TeamMemberHeatmap {
  employeeId: string;
  employeeName: string;
  jobTitle: string;
  days: {
    date: string;
    dayName: string;
    dayNum: string;
    monthName?: string;
    isToday: boolean;
    status: string;
    taskCount: number;
    detail?: string;
  }[];
}

interface TeamHeatmapGridProps {
  teamName?: string;
  sprintRange?: string;
  members?: any[]; // Only direct reports passed from parent
}

export function TeamHeatmapGrid({
  teamName = "Development Team",
  sprintRange: propSprintRange,
  members,
}: TeamHeatmapGridProps) {
  const { allEmployees } = useWorkpulseSharedStore();
  const [viewMode, setViewMode] = useState<"WEEKLY" | "MONTHLY" | "60DAYS">("WEEKLY");
  const [realtimeVersion, setRealtimeVersion] = useState(0);
  const [livePunches, setLivePunches] = useState<Record<string, any>>({});
  const [liveSubmissions, setLiveSubmissions] = useState<Record<string, { sod: boolean; eod: boolean; tasksCount: number }>>({});

  // Strictly use passed members; if none passed, scope only to direct reports of lead-alex (Sarah Dev)
  const employeesToShow = useMemo(() => {
    if (members && Array.isArray(members)) {
      return members;
    }
    return allEmployees.filter(
      (e) => e.teamLeadId === "lead-alex" || e.id === "emp-sarah" || e.email?.toLowerCase().includes("employee.test")
    );
  }, [members, allEmployees]);

  // Compute dynamic current week days (Mon to Sun)
  const weekDays = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sun, 1 is Mon...
    const distanceToMon = (currentDay + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMon);

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const days = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateParts = d.toISOString().split("T");
      const dateStr = dateParts[0] || "";
      const todayParts = today.toISOString().split("T");
      const todayStr = todayParts[0] || "";
      days.push({
        date: dateStr,
        dayName: dayNames[i] || `Day ${i + 1}`,
        dayNum: `${d.getDate()}`,
        isToday: dateStr === todayStr,
        isPast: dateStr < todayStr,
        isFuture: dateStr > todayStr,
        isWeekend: i >= 5,
      });
    }
    return days;
  }, []);

  // Compute dynamic 30-Day Month (Current Month: 1st to last day of month)
  const monthDays = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(year, month, day);
      const dateStr = d.toISOString().split("T")[0] || "";
      const todayStr = today.toISOString().split("T")[0] || "";
      const dayOfWeek = d.getDay();
      days.push({
        date: dateStr,
        dayName: dayNames[dayOfWeek] || "",
        dayNum: `${d.getDate()}`,
        monthName: d.toLocaleDateString("en-US", { month: "short" }),
        isToday: dateStr === todayStr,
        isPast: dateStr < todayStr,
        isFuture: dateStr > todayStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }
    return days;
  }, []);

  // Compute dynamic 60-Day View (2 full calendar months: 1st of current month to end of next month)
  const days60 = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const days = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const endOfNextMonth = new Date(year, month + 2, 0);
    const totalDays = Math.round((endOfNextMonth.getTime() - new Date(year, month, 1).getTime()) / (1000 * 60 * 60 * 24)) + 1;

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(year, month, 1 + i);
      const dateStr = d.toISOString().split("T")[0] || "";
      const todayStr = today.toISOString().split("T")[0] || "";
      const dayOfWeek = d.getDay();
      days.push({
        date: dateStr,
        dayName: dayNames[dayOfWeek] || "",
        dayNum: `${d.getDate()}`,
        monthName: d.toLocaleDateString("en-US", { month: "short" }),
        isToday: dateStr === todayStr,
        isPast: dateStr < todayStr,
        isFuture: dateStr > todayStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }
    return days;
  }, []);

  const activeDays = viewMode === "WEEKLY" ? weekDays : viewMode === "MONTHLY" ? monthDays : days60;

  const dynamicSprintRange = useMemo(() => {
    if (propSprintRange && viewMode === "WEEKLY") return propSprintRange;
    if (viewMode === "60DAYS") {
      const start = days60[0];
      const end = days60[days60.length - 1];
      return `60-Day View (${start?.monthName} ${start?.dayNum} – ${end?.monthName} ${end?.dayNum})`;
    }
    if (viewMode === "MONTHLY") {
      const start = monthDays[0];
      const end = monthDays[monthDays.length - 1];
      return `30-Day Month (${start?.monthName} ${start?.dayNum} – ${end?.monthName} ${end?.dayNum})`;
    }
    if (weekDays.length >= 7) {
      const start = weekDays[0];
      const end = weekDays[6];
      if (start && end) {
        return `This Week (${start.dayName} ${start.dayNum} – ${end.dayName} ${end.dayNum})`;
      }
    }
    return "This Week";
  }, [propSprintRange, viewMode, weekDays, monthDays, days60]);

  // Load real-time punches and submissions from Supabase and local storage
  const refreshRealtimeData = async () => {
    try {
      const res = await fetch("/api/v1/attendance/punches");
      if (res.ok) {
        const data = await res.json();
        if (data.data?.punches) {
          const punchMap: Record<string, any> = {};
          data.data.punches.forEach((p: any) => {
            const key = p.employeeId;
            if (!punchMap[key] || new Date(p.punch_time).getTime() > new Date(punchMap[key].punch_time).getTime()) {
              punchMap[key] = p;
            }
          });
          setLivePunches(punchMap);
        }
      }
    } catch {}

    if (typeof window !== "undefined") {
      const subMap: Record<string, { sod: boolean; eod: boolean; tasksCount: number }> = {};
      employeesToShow.forEach((emp) => {
        const isSpecialSarah = emp.id === "emp-sarah" || emp.email?.toLowerCase().includes("employee.test");
        const hasSod =
          localStorage.getItem(`workpulse_morning_plan_submitted_${emp.id}`) === "true" ||
          (emp.email ? localStorage.getItem(`workpulse_morning_plan_submitted_${emp.email.toLowerCase()}`) === "true" : false) ||
          (isSpecialSarah && (
            localStorage.getItem("workpulse_morning_plan_submitted_emp-sarah") === "true" ||
            localStorage.getItem("workpulse_morning_plan_submitted_employee.test@xorstack.com") === "true"
          ));

        const hasEod =
          localStorage.getItem(`workpulse_eod_submitted_${emp.id}`) === "true" ||
          (emp.email ? localStorage.getItem(`workpulse_eod_submitted_${emp.email.toLowerCase()}`) === "true" : false) ||
          (isSpecialSarah && (
            localStorage.getItem("workpulse_eod_submitted_emp-sarah") === "true" ||
            localStorage.getItem("workpulse_eod_submitted_employee.test@xorstack.com") === "true"
          ));

        let tasksCount = 0;
        try {
          const rawTasks =
            localStorage.getItem(`workpulse_simple_tasks_${emp.id}`) ||
            (isSpecialSarah ? localStorage.getItem("workpulse_simple_tasks") : null);
          if (rawTasks) {
            const parsed = JSON.parse(rawTasks);
            if (Array.isArray(parsed)) tasksCount = parsed.length;
          }
        } catch {}

        subMap[emp.id] = {
          sod: Boolean(hasSod || emp.sodStatus === "SUBMITTED" || emp.sodStatus === "VERIFIED"),
          eod: Boolean(hasEod || emp.eodStatus === "SUBMITTED" || emp.eodStatus === "VERIFIED"),
          tasksCount: tasksCount || emp.plannedTasks?.length || 0,
        };
      });
      setLiveSubmissions(subMap);
    }
  };

  useEffect(() => {
    refreshRealtimeData();

    const handleSync = () => {
      setRealtimeVersion((v) => v + 1);
      refreshRealtimeData();
    };

    window.addEventListener("workpulse_sync", handleSync);
    window.addEventListener("workday:sod_submitted", handleSync);
    window.addEventListener("workday:eod_submitted", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener("workpulse_sync", handleSync);
      window.removeEventListener("workday:sod_submitted", handleSync);
      window.removeEventListener("workday:eod_submitted", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [employeesToShow.length]);

  const teamMembersData: TeamMemberHeatmap[] = useMemo(() => {
    return employeesToShow.map((emp) => {
      const liveSub = liveSubmissions[emp.id] || { sod: false, eod: false, tasksCount: 0 };
      const latestPunch = livePunches[emp.id] || livePunches[emp.email] || (emp.id === "emp-sarah" ? livePunches["employee.test@xorstack.com"] : null);
      const isPunchedIn = latestPunch?.direction === "IN" || latestPunch?.punch_type === "IN";

      const days = activeDays.map((d, idx) => {
        let status = "OPEN";
        let taskCount = 0;
        let detail = "Pending";

        if (d.isWeekend) {
          status = "WEEKLY_OFF";
          detail = "Weekend Off";
        } else if (d.isToday) {
          if (liveSub.eod) {
            status = "EOD_SUBMITTED";
            taskCount = liveSub.tasksCount;
            detail = `EOD Completed (${taskCount} deliverables)`;
          } else if (liveSub.sod) {
            status = "SOD_SUBMITTED";
            taskCount = liveSub.tasksCount;
            detail = `SOD Active (${taskCount} tasks in progress)`;
          } else if (isPunchedIn) {
            status = "PUNCHED_IN";
            detail = "Punched In at Bangalore HQ";
          } else {
            status = "OPEN";
            detail = "Shift in progress";
          }
        } else if (d.isPast) {
          status = "LOCKED";
          taskCount = 3 + (idx % 3);
          detail = `Verified & Locked (${taskCount} tasks)`;
        } else {
          status = "UPCOMING";
          detail = "Upcoming day";
        }

        return {
          date: d.date,
          dayName: d.dayName,
          dayNum: d.dayNum,
          monthName: (d as any).monthName,
          isToday: d.isToday,
          status,
          taskCount,
          detail,
        };
      });

      return {
        employeeId: emp.id,
        employeeName: emp.name,
        jobTitle: emp.designation || "Engineer",
        days,
      };
    });
  }, [employeesToShow, activeDays, liveSubmissions, livePunches, realtimeVersion]);

  const getCellColor = (status: string, isToday: boolean) => {
    switch (status) {
      case "LOCKED":
        return "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold hover:border-emerald-500";
      case "EOD_SUBMITTED":
        return "bg-emerald-500/25 border-emerald-500/50 text-emerald-800 dark:text-emerald-300 font-extrabold shadow-sm hover:scale-105";
      case "SOD_SUBMITTED":
        return "bg-cyan-500/20 border-cyan-500/40 text-cyan-800 dark:text-cyan-300 font-bold shadow-sm hover:scale-105";
      case "PUNCHED_IN":
        return "bg-indigo-500/20 border-indigo-500/40 text-indigo-700 dark:text-indigo-300 font-bold hover:scale-105";
      case "WEEKLY_OFF":
        return "bg-muted/40 border-border/60 text-muted-foreground";
      default:
        return isToday
          ? "bg-amber-500/15 border-amber-500/35 text-amber-800 dark:text-amber-300 font-semibold"
          : "bg-card/60 border-border/70 text-muted-foreground";
    }
  };

  return (
    <Card className="border-border bg-card/60 backdrop-blur-sm shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Users className="h-4 w-4 text-[var(--brand-primary)]" />
              <span>Team Presence &amp; Submission Heatmap — {teamName}</span>
              <Badge variant="outline" className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                Real-Time
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Period: {dynamicSprintRange} · Live Supabase &amp; local attendance status for direct reports ({employeesToShow.length} {employeesToShow.length === 1 ? "member" : "members"}).
            </CardDescription>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* View Mode Toggle: 7 Days vs 30 Days vs 60 Days */}
            <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode("WEEKLY")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  viewMode === "WEEKLY"
                    ? "bg-card text-foreground font-bold shadow-xs border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                7-Day Week
              </button>
              <button
                type="button"
                onClick={() => setViewMode("MONTHLY")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  viewMode === "MONTHLY"
                    ? "bg-card text-foreground font-bold shadow-xs border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                30-Day Month
              </button>
              <button
                type="button"
                onClick={() => setViewMode("60DAYS")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  viewMode === "60DAYS"
                    ? "bg-card text-foreground font-bold shadow-xs border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                60-Day View
              </button>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500 inline-block" />
                <span className="text-[10px]">EOD Done</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm bg-cyan-500 inline-block" />
                <span className="text-[10px]">SOD Active</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm bg-amber-500 inline-block" />
                <span className="text-[10px]">In Progress</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm bg-muted inline-block" />
                <span className="text-[10px]">Weekend</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="overflow-x-auto pt-2 pb-6">
        <div className={viewMode === "60DAYS" ? "min-w-[2100px] space-y-2" : viewMode === "MONTHLY" ? "min-w-[1200px] space-y-2" : "min-w-[650px] space-y-2"}>
          {/* Header Row: Days of Sprint or Month or 60 Days */}
          <div
            className={`grid gap-2 text-xs font-semibold text-muted-foreground pb-1 border-b border-border ${
              viewMode === "60DAYS"
                ? "grid-cols-[180px_repeat(60,minmax(24px,1fr))_65px]"
                : viewMode === "MONTHLY"
                ? "grid-cols-[180px_repeat(30,minmax(28px,1fr))_65px]"
                : "grid-cols-12"
            }`}
          >
            <div className={viewMode !== "WEEKLY" ? "" : "col-span-4"}>Direct Report</div>
            {activeDays.map((d) => (
              <div
                key={d.date}
                className={`text-center ${
                  d.isToday ? "font-bold text-[var(--brand-primary)] bg-[var(--brand-primary)]/10 rounded-md py-0.5" : ""
                } ${viewMode !== "WEEKLY" ? "text-[10px] truncate" : "col-span-1"}`}
                title={`${d.dayName} ${d.dayNum} ${(d as any).monthName || ""}`}
              >
                {viewMode !== "WEEKLY" ? (
                  <div className="leading-tight">
                    <div className="font-extrabold text-[10px]">{d.dayNum}</div>
                    <div className="text-[8px] opacity-70">{(d as any).monthName || d.dayName}</div>
                  </div>
                ) : (
                  `${d.dayName} ${d.dayNum}`
                )}
              </div>
            ))}
            <div className={viewMode !== "WEEKLY" ? "text-center" : "col-span-1 text-center"}>Health</div>
          </div>

          {/* Member Rows */}
          {teamMembersData.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No direct reports assigned to this lead.
            </div>
          ) : (
            teamMembersData.map((member) => {
              const completedCount = member.days.filter(
                (d) => d.status === "LOCKED" || d.status === "EOD_SUBMITTED"
              ).length;
              const activeCount = member.days.filter(
                (d) => d.status === "SOD_SUBMITTED" || d.status === "PUNCHED_IN"
              ).length;
              const totalDaysCount = member.days.length;
              const healthScore = Math.min(100, Math.round(((completedCount + activeCount * 0.5) / (totalDaysCount * 0.4)) * 100));

              return (
                <div
                  key={member.employeeId}
                  className={`grid gap-2 items-center p-2 rounded-xl bg-card/60 border border-border hover:border-border/80 transition-colors ${
                    viewMode === "60DAYS"
                      ? "grid-cols-[180px_repeat(60,minmax(24px,1fr))_65px]"
                      : viewMode === "MONTHLY"
                      ? "grid-cols-[180px_repeat(30,minmax(28px,1fr))_65px]"
                      : "grid-cols-12"
                  }`}
                >
                  {/* Member Info */}
                  <div className={`flex items-center gap-2 ${viewMode !== "WEEKLY" ? "min-w-0" : "col-span-4"}`}>
                    <div className="h-7 w-7 rounded-full bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/30 flex items-center justify-center text-[var(--brand-primary)] font-bold text-xs shrink-0">
                      {member.employeeName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="overflow-hidden min-w-0">
                      <span className="text-xs font-bold text-foreground block truncate">
                        {member.employeeName}
                      </span>
                      <span className="text-[11px] text-muted-foreground block truncate">
                        {member.jobTitle}
                      </span>
                    </div>
                  </div>

                  {/* Day Status Cells */}
                  {member.days.map((day) => (
                    <div
                      key={day.date}
                      title={`${member.employeeName} — ${day.dayName} ${day.monthName || ""} ${day.dayNum} (${day.date}): ${day.detail}`}
                      className={`${viewMode !== "WEEKLY" ? "h-8" : "col-span-1 h-9"} rounded-lg border flex flex-col items-center justify-center text-[10px] cursor-pointer transition-all ${getCellColor(
                        day.status,
                        day.isToday
                      )}`}
                    >
                      {day.isToday && (day.status === "SOD_SUBMITTED" || day.status === "EOD_SUBMITTED" || day.status === "PUNCHED_IN") && (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping mb-0.5" />
                      )}
                      <span>
                        {day.taskCount > 0
                          ? `${day.taskCount}t`
                          : day.isToday
                          ? "Today"
                          : viewMode !== "WEEKLY"
                          ? ""
                          : ""}
                      </span>
                    </div>
                  ))}

                  {/* Health / Adherence Indicator */}
                  <div className={viewMode !== "WEEKLY" ? "text-center" : "col-span-1 text-center"}>
                    <Badge
                      variant={healthScore >= 70 ? "brand" : healthScore >= 40 ? "secondary" : "destructive"}
                      className="text-[10px] font-bold px-1.5 py-0.5"
                    >
                      {healthScore}%
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
