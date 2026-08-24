"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { AnimatedTabContent } from "@/components/animations/AnimatedTabContent";
import { WhosWhereTodayBoard } from "@/features/attendance/components/WhosWhereTodayBoard";
import { HolidayCalendarGrid } from "@/features/holidays/components/HolidayCalendarGrid";
import { HREnterpriseAttendanceOversight } from "@/features/attendance/components/HREnterpriseAttendanceOversight";
import { useCurrentUser } from "@/components/layout/UserContext";
import { WorkpulseApi } from "@/lib/api/api-client";
import {
  Clock,
  Calendar,
  Users,
  Radio,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Fingerprint,
} from "lucide-react";

export default function AttendancePage() {
  const user = useCurrentUser();
  const isHR = user.roles.includes("HR") || user.primaryRole === "HR" || user.roles.includes("ADMIN");

  const [activeTab, setActiveTab] = useState<"hr_oversight" | "directory" | "punches" | "holidays">(
    isHR ? "hr_oversight" : "directory"
  );
  const [punchStatus, setPunchStatus] = useState<"IN" | "OUT">("IN");
  const [punchTime, setPunchTime] = useState<string>("10:08 AM");
  const [isPunching, setIsPunching] = useState(false);
  const [punchToast, setPunchToast] = useState<string | null>(null);

  const handleBiometricPunch = async () => {
    setIsPunching(true);
    const nextType = punchStatus === "IN" ? "OUT" : "IN";
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    try {
      await WorkpulseApi.attendance.punch({
        employeeId: user.userEmail || "emp-sarah",
        type: nextType,
        terminalId: "TERM-BLR-01",
        timestamp: now.toISOString(),
      });
    } catch (err) {
      console.warn("Punch logged locally:", err);
    }

    setPunchStatus(nextType);
    setPunchTime(timeStr);
    setIsPunching(false);
    setPunchToast(`Biometric Punch-${nextType} registered at ${timeStr} via Bangalore HQ Terminal #1! ✓`);
    setTimeout(() => setPunchToast(null), 4000);
  };

  const attendanceLog = [
    {
      date: "2026-08-20",
      dayName: "Thu",
      workMode: "OFFICE",
      firstIn: "10:08 AM",
      lastOut: "In Progress",
      workedHours: 4.5,
      anomalies: [],
      status: "ON_TIME",
    },
    {
      date: "2026-08-19",
      dayName: "Wed",
      workMode: "WFH",
      firstIn: "10:00 AM",
      lastOut: "07:05 PM",
      workedHours: 8.25,
      anomalies: [],
      status: "APPROVED_WFH",
    },
    {
      date: "2026-08-18",
      dayName: "Tue",
      workMode: "OFFICE",
      firstIn: "10:04 AM",
      lastOut: "07:10 PM",
      workedHours: 8.0,
      anomalies: [],
      status: "ON_TIME",
    },
    {
      date: "2026-08-17",
      dayName: "Mon",
      workMode: "OFFICE",
      firstIn: "10:22 AM",
      lastOut: "07:30 PM",
      workedHours: 8.5,
      anomalies: ["Late arrival by 7 minutes (Grace Window: 10:15 AM)"],
      status: "LATE_ARRIVAL",
    },
  ];

  return (
    <PageTransition>
      {/* 3D Hero */}
      <Interactive3DCard className="p-6 md:p-8 border border-cyan-500/30 bg-gradient-to-r from-card/80 via-card/60 to-cyan-500/10 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="font-bold text-[10px] uppercase bg-cyan-500/15 border-cyan-500/30 text-cyan-300">
                <Radio className="h-3 w-3 mr-1 animate-pulse text-cyan-400" />
                Live Attendance Sync
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">10:00 AM – 07:00 PM Shift</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {isHR ? "Enterprise Attendance & Shift Policy Control" : "Attendance, Logs & Presence Radar"}
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {isHR
                ? "Organization-wide biometric punch telemetry, 10:00 AM – 07:00 PM shift compliance monitoring, missed swipe regularizations, and payroll muster roll audit."
                : "Official company shift timings are 10:00 AM to 07:00 PM. Verify biometric punch transactions, monitor shift compliance, review office vs WFH distribution, and inspect public holidays."}
            </p>
          </div>

          {/* Tab Switcher in Glass Pill */}
          <div className="flex items-center p-1 rounded-xl bg-background/50 border border-cyan-500/30 backdrop-blur-md overflow-x-auto shrink-0 shadow-sm gap-1">
            {isHR && (
              <button
                type="button"
                onClick={() => setActiveTab("hr_oversight")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === "hr_oversight"
                    ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>HR Oversight</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab("directory")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "directory"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Who&apos;s Where</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("punches")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "punches"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>My Punches</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("holidays")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "holidays"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Holidays</span>
            </button>
          </div>
        </div>

        {/* OFFICIAL COMPANY TIMINGS & SCHEDULE POLICY BANNER */}
        <div className="p-4 rounded-2xl bg-background/60 border border-cyan-500/30 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-400" />
              <strong className="text-foreground text-sm">Company Timings: 10:00 AM – 07:00 PM</strong>
            </div>
            <p className="text-muted-foreground text-[11px]">
              9.0 Hrs Gross Span (8.0 Hrs Core Work + 1.0 Hr Break). Grace punch window up to 10:15 AM.
            </p>
          </div>

          <div className="space-y-1 border-t md:border-t-0 md:border-l border-border/70 md:pl-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-purple-400" />
              <strong className="text-foreground text-sm">Full-Time Employees</strong>
            </div>
            <p className="text-muted-foreground text-[11px]">
              <strong className="text-purple-300">Monday to Friday</strong> (10 AM - 7 PM). <em>If work demands, work on Saturday.</em>
            </p>
          </div>

          <div className="space-y-1 border-t md:border-t-0 md:border-l border-border/70 md:pl-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-amber-400" />
              <strong className="text-foreground text-sm">Probation & Interns</strong>
            </div>
            <p className="text-muted-foreground text-[11px]">
              <strong className="text-amber-300">Monday to Saturday Full</strong> (10 AM - 7 PM). <span className="text-emerald-400 font-bold">Sunday Week Off for All</span>.
            </p>
          </div>
        </div>
      </Interactive3DCard>

      {/* Animated Tab Content Rendering */}
      <AnimatedTabContent tabKey={activeTab}>
        {/* TAB 0: HR ENTERPRISE ATTENDANCE & BIOMETRIC OVERSIGHT */}
        {activeTab === "hr_oversight" && <HREnterpriseAttendanceOversight />}

        {/* TAB 1: WHO'S WHERE TODAY (Office vs WFH vs Leave) */}
        {activeTab === "directory" && <WhosWhereTodayBoard />}

        {/* TAB 2: PERSONAL BIOMETRIC PUNCH LOGS */}
        {activeTab === "punches" && (
          <Interactive3DCard className="p-6 space-y-4 border-border/80">
            {punchToast && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="font-bold">{punchToast}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Fingerprint className="h-4 w-4 text-cyan-400" />
                  Official Biometric Transactions & Virtual Punch
                </h3>
                <p className="text-xs text-muted-foreground">
                  Logged from Bangalore HQ Terminal #1 (10:00 AM – 07:00 PM Shift Schedule).
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Button
                  variant="brand"
                  size="sm"
                  disabled={isPunching}
                  onClick={handleBiometricPunch}
                  className={`text-xs font-bold gap-1.5 h-8.5 px-3.5 shadow-sm transition-all cursor-pointer ${
                    punchStatus === "IN"
                      ? "bg-gradient-to-r from-amber-500 to-rose-600 text-white hover:opacity-95 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                      : "bg-gradient-to-r from-cyan-500 to-emerald-600 text-black hover:opacity-95 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                  }`}
                >
                  <Fingerprint className="h-3.5 w-3.5" />
                  <span>
                    {isPunching
                      ? "Registering Punch..."
                      : punchStatus === "IN"
                      ? "Punch-Out (End of Shift)"
                      : "Punch-In (Start of Shift)"}
                  </span>
                </Button>

                <Badge variant="outline" className="text-[10px] text-cyan-300 border-cyan-500/30 font-mono">
                  Current: {punchStatus} ({punchTime})
                </Badge>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {attendanceLog.map((log, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-card/50 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-cyan-500/40 transition-all text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-8 w-8 rounded-lg bg-muted text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {log.dayName}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{log.date}</span>
                        <Badge
                          variant="outline"
                          className={`text-[9px] uppercase font-bold ${
                            log.workMode === "OFFICE"
                              ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                              : "bg-purple-500/15 text-purple-300 border-purple-500/30"
                          }`}
                        >
                          {log.workMode}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[9px] uppercase font-bold ${
                            log.status === "ON_TIME"
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : log.status === "LATE_ARRIVAL"
                              ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                              : "bg-blue-500/15 text-blue-400 border-blue-500/30"
                          }`}
                        >
                          {log.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        In: <strong className="text-foreground">{log.firstIn}</strong> · Out:{" "}
                        <strong className="text-foreground">{log.lastOut}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-cyan-400 font-mono">
                      {log.workedHours} hrs
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      {log.workedHours >= 8 ? "Full Day Completed ✓" : "In Progress (Shift: 10AM - 7PM)"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Interactive3DCard>
        )}

        {/* TAB 3: HOLIDAYS */}
        {activeTab === "holidays" && <HolidayCalendarGrid />}
      </AnimatedTabContent>
    </PageTransition>
  );
}
