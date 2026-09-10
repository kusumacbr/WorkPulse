"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { AnimatedTabContent } from "@/components/animations/AnimatedTabContent";
import { useCurrentUser } from "@/components/layout/UserContext";

const LoadingSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-48 rounded-2xl bg-card/40 border border-border/40" />
  </div>
);

const WhosWhereTodayBoard = dynamic(
  () => import("@/features/attendance/components/WhosWhereTodayBoard").then((m) => ({ default: m.WhosWhereTodayBoard })),
  { ssr: false, loading: LoadingSkeleton }
);
const HolidayCalendarGrid = dynamic(
  () => import("@/features/holidays/components/HolidayCalendarGrid").then((m) => ({ default: m.HolidayCalendarGrid })),
  { ssr: false, loading: LoadingSkeleton }
);
const HREnterpriseAttendanceOversight = dynamic(
  () => import("@/features/attendance/components/HREnterpriseAttendanceOversight").then((m) => ({ default: m.HREnterpriseAttendanceOversight })),
  { ssr: false, loading: LoadingSkeleton }
);
const LeadAttendanceManager = dynamic(
  () => import("@/features/attendance/components/LeadAttendanceManager").then((m) => ({ default: m.LeadAttendanceManager })),
  { ssr: false, loading: LoadingSkeleton }
);
import {
  Clock,
  Calendar,
  Users,
  ShieldCheck,
  CheckCircle2,
  Fingerprint,
} from "lucide-react";

export default function AttendancePage() {
  const user = useCurrentUser();
  const isHR =
    user.roles.includes("HR") ||
    user.primaryRole === "HR" ||
    user.userEmail.toLowerCase().includes("hr");
  const isLead =
    !isHR &&
    (user.roles.includes("MANAGER") ||
      user.primaryRole === "MANAGER" ||
      user.userEmail.toLowerCase().includes("lead"));

  const [activeTab, setActiveTab] = useState<"hr_oversight" | "directory" | "punches" | "holidays">(
    isHR ? "hr_oversight" : "punches"
  );
  const [punchStatus, setPunchStatus] = useState<"IN" | "OUT">("OUT");
  const [punchTime, setPunchTime] = useState<string>("--");
  const [isPunching, setIsPunching] = useState(false);
  const [punchToast, setPunchToast] = useState<string | null>(null);
  const [attendanceLog, setAttendanceLog] = useState<any[]>([]);

  // Load punches from Supabase on mount
  useEffect(() => {
    const loadPunches = async () => {
      try {
        const res = await fetch("/api/v1/attendance/punches");
        if (res.ok) {
          const data = await res.json();
          if (data.data?.punches?.length > 0) {
            // Group punches by date
            const punchesByDate: Record<string, any[]> = {};
            data.data.punches.forEach((p: any) => {
              const punchDate = p.date || new Date(p.punch_time || p.time).toISOString().split("T")[0];
              if (!punchesByDate[punchDate]) punchesByDate[punchDate] = [];
              punchesByDate[punchDate].push(p);
            });

            const logs = Object.entries(punchesByDate)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([date, punches]) => {
                const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                const d = new Date(date + "T00:00:00");
                const dayName = dayNames[d.getDay()] || "";
                const punchIn = punches.find((p: any) => p.direction === "IN" || p.punch_type === "IN");
                const punchOut = punches.find((p: any) => p.direction === "OUT" || p.punch_type === "OUT");
                const firstIn = punchIn?.time || (punchIn?.punch_time ? new Date(punchIn.punch_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--");
                const lastOut = punchOut?.time || (punchOut?.punch_time ? new Date(punchOut.punch_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "In Progress");

                let workedHours = 0;
                if (punchIn && punchOut) {
                  const inTime = new Date(punchIn.punch_time || punchIn.time).getTime();
                  const outTime = new Date(punchOut.punch_time || punchOut.time).getTime();
                  workedHours = Math.round(((outTime - inTime) / (1000 * 60 * 60)) * 100) / 100;
                } else if (punchIn) {
                  const inTime = new Date(punchIn.punch_time || punchIn.time).getTime();
                  workedHours = Math.round(((Date.now() - inTime) / (1000 * 60 * 60)) * 100) / 100;
                }

                return {
                  date,
                  dayName,
                  workMode: punchIn?.work_mode || "OFFICE",
                  firstIn,
                  lastOut,
                  workedHours: Math.min(workedHours, 12),
                  anomalies: [],
                  status: lastOut === "In Progress" ? "IN_PROGRESS" : "ON_TIME",
                };
              });

            setAttendanceLog(logs);

            // Set current punch status based on latest punch
            const latestPunch = data.data.punches[0];
            if (latestPunch) {
              const latestType = latestPunch.direction || latestPunch.punch_type;
              setPunchStatus(latestType === "IN" ? "IN" : "OUT");
              setPunchTime(latestPunch.time || new Date(latestPunch.punch_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
            }
          }
        }
      } catch (err) {
        console.warn("Failed to load punches:", err);
      }
    };
    loadPunches();
  }, []);

  const handleBiometricPunch = async () => {
    setIsPunching(true);
    const nextType = punchStatus === "IN" ? "OUT" : "IN";
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    try {
      await fetch("/api/v1/attendance/punch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: user.userEmail || "emp-sarah",
          type: nextType,
          terminalId: "TERM-BLR-01",
          timestamp: now.toISOString(),
        }),
      });
    } catch (err) {
      console.warn("Punch logged locally:", err);
    }

    setPunchStatus(nextType);
    setPunchTime(timeStr);
    setIsPunching(false);
    setPunchToast(`Biometric Punch-${nextType} registered at ${timeStr} via Bangalore HQ Terminal #1! ✓`);
    setTimeout(() => setPunchToast(null), 4000);

    // Reload punches from Supabase
    try {
      const res = await fetch("/api/v1/attendance/punches");
      if (res.ok) {
        const data = await res.json();
        if (data.data?.punches?.length > 0) {
          const punchesByDate: Record<string, any[]> = {};
          data.data.punches.forEach((p: any) => {
            const punchDate = p.date || new Date(p.punch_time || p.time).toISOString().split("T")[0];
            if (!punchesByDate[punchDate]) punchesByDate[punchDate] = [];
            punchesByDate[punchDate].push(p);
          });

          const logs = Object.entries(punchesByDate)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, punches]) => {
              const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
              const d = new Date(date + "T00:00:00");
              const dayName = dayNames[d.getDay()] || "";
              const punchIn = punches.find((p: any) => p.direction === "IN" || p.punch_type === "IN");
              const punchOut = punches.find((p: any) => p.direction === "OUT" || p.punch_type === "OUT");
              const firstIn = punchIn?.time || "--";
              const lastOut = punchOut?.time || "In Progress";

              let workedHours = 0;
              if (punchIn && punchOut) {
                const inTime = new Date(punchIn.punch_time || punchIn.time).getTime();
                const outTime = new Date(punchOut.punch_time || punchOut.time).getTime();
                workedHours = Math.round(((outTime - inTime) / (1000 * 60 * 60)) * 100) / 100;
              } else if (punchIn) {
                const inTime = new Date(punchIn.punch_time || punchIn.time).getTime();
                workedHours = Math.round(((Date.now() - inTime) / (1000 * 60 * 60)) * 100) / 100;
              }

              return {
                date,
                dayName,
                workMode: "OFFICE",
                firstIn,
                lastOut,
                workedHours: Math.min(workedHours, 12),
                anomalies: [],
                status: lastOut === "In Progress" ? "IN_PROGRESS" : "ON_TIME",
              };
            });

          setAttendanceLog(logs);
        }
      }
    } catch {}
  };

  if (isLead) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <Interactive3DCard className="p-6 border border-border/80 bg-gradient-to-r from-card/90 via-card/70 to-card/50">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="brand" className="font-bold text-[10px] uppercase">
                  <Users className="h-3 w-3 mr-1 text-indigo-400" />
                  <span>Team Attendance Oversight</span>
                </Badge>
                <span className="text-[11px] text-muted-foreground font-medium">
                  Development Team · 4 Direct Reports
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                Team Attendance & Presence
              </h2>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Track direct report biometric punches, verify office vs. remote presence, and check shift grace compliance.
              </p>
            </div>
          </Interactive3DCard>

          <LeadAttendanceManager />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      {/* Simplified Clean Header */}
      <Interactive3DCard className="p-5 border border-border/80 bg-gradient-to-r from-card/90 via-card/70 to-card/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black tracking-tight text-foreground">
              Attendance Monitor
            </h2>
            <Badge variant="outline" className="text-[11px] font-mono text-cyan-300 border-cyan-500/30 bg-cyan-500/10">
              10:00 AM – 07:00 PM (10:15 AM Grace)
            </Badge>
          </div>

          {/* Simplified Tab Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-card/80 border border-border/80 backdrop-blur-md overflow-x-auto shrink-0 gap-1">
            {isHR && (
              <button
                type="button"
                onClick={() => setActiveTab("hr_oversight")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === "hr_oversight"
                    ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Overview</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab("punches")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === "punches"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>{isHR ? "My Punch-In" : "My Punches"}</span>
            </button>

            {!isHR && (
              <button
                type="button"
                onClick={() => setActiveTab("directory")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === "directory"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Who&apos;s Where</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab("holidays")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === "holidays"
                  ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Holidays</span>
            </button>
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
