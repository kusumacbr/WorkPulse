"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
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
import { formatWorkedHours, calculateWorkedHoursFromTimeStrings } from "@/lib/ui/time-formatter";
import { SAMPLE_BIOMETRIC_PUNCHES } from "@/features/attendance/components/UploadBiometricModal";
import {
  Clock,
  Calendar,
  Users,
  ShieldCheck,
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

  const userEmailKey = (user?.userEmail || "user").toLowerCase().replace(/[^a-z0-9]/g, "_");
  const punchStateKey = `workpulse_header_punch_state_${userEmailKey}`;
  const virtualPunchesKey = `workpulse_virtual_punches_${userEmailKey}`;
  const attendanceTabKey = `workpulse_attendance_tab_${userEmailKey}`;

  const [activeTab, setActiveTab] = useState<"hr_oversight" | "directory" | "punches" | "holidays">("punches");
  const [biometricLogs, setBiometricLogs] = useState<any[]>([]);
  const [virtualLogs, setVirtualLogs] = useState<any[]>([]);
  const [activeVirtualSession, setActiveVirtualSession] = useState<{
    isLive: boolean;
    loginTimeStr: string;
    elapsedSeconds: number;
    roleLabel: string;
  }>({
    isLive: false,
    loginTimeStr: "--",
    elapsedSeconds: 0,
    roleLabel: "Core Member",
  });

  // Ensure active tab strictly defaults to HR oversight for HR, or remembers chosen tab per role
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedTab = localStorage.getItem(attendanceTabKey);
      if (savedTab && ["hr_oversight", "directory", "punches", "holidays"].includes(savedTab)) {
        if (isHR || savedTab !== "hr_oversight") {
          setActiveTab(savedTab as any);
          return;
        }
      }
    } catch {}

    if (isHR) {
      setActiveTab("hr_oversight");
    } else {
      setActiveTab("punches");
    }
  }, [isHR, attendanceTabKey]);

  const handleTabChange = (tab: "hr_oversight" | "directory" | "punches" | "holidays") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(attendanceTabKey, tab);
      } catch {}
    }
  };

  const formatRunningTimer = (totalSeconds: number): string => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  // Load punches: 1. Biometric CSV/Terminal logs; 2. Role-specific Virtual Punches
  useEffect(() => {
    const loadPunches = async () => {
      try {
        // --- 1. BIOMETRIC PUNCH LOGS (HR Biometric CSV File & Physical Terminals) ---
        let allBiometricRecords: any[] = SAMPLE_BIOMETRIC_PUNCHES;

        if (typeof window !== "undefined") {
          try {
            const rawCsv = localStorage.getItem("workpulse_uploaded_biometric_punches");
            if (rawCsv) {
              const parsed = JSON.parse(rawCsv);
              if (Array.isArray(parsed) && parsed.length > 0) {
                allBiometricRecords = parsed;
              }
            }
          } catch {}
        }

        const currEmail = (user?.userEmail || "").toLowerCase();
        const currName = (user?.userName || "").toLowerCase();

        // Match biometric records for active user
        let matchedRecords = allBiometricRecords.filter((r: any) => {
          const empId = (r.employeeId || "").toLowerCase();
          const empName = (r.employeeName || "").toLowerCase();

          if (currEmail.includes("sarah") || currEmail.includes("employee") || currName.includes("sara")) {
            return empId === "emp-sarah" || empName.includes("sara");
          }
          if (currEmail.includes("alex") || currEmail.includes("lead") || currName.includes("alex")) {
            return empId === "lead-alex" || empName.includes("alex");
          }
          if (currEmail.includes("rachel") || currEmail.includes("hr") || currName.includes("rachel")) {
            return empId === "emp-rachel" || empName.includes("rachel");
          }
          if (currEmail.includes("rohit") || currName.includes("rohit")) {
            return empId === "emp-rohit" || empName.includes("rohit");
          }
          return empId === currEmail || empName.includes(currName);
        });

        if (matchedRecords.length === 0) {
          // Fallback to sample matching or first records if no direct email hit
          matchedRecords = [
            {
              id: "biom-fallback-1",
              employeeId: user?.userEmail || "emp-sarah",
              employeeName: user?.userName || "Sara Devi",
              date: new Date().toISOString().split("T")[0],
              firstIn: "09:58 AM",
              lastOut: "07:12 PM",
              workMode: "OFFICE",
              terminalId: "TERM-BLR-GATE2",
              status: "ON_TIME",
            },
            {
              id: "biom-fallback-2",
              employeeId: user?.userEmail || "emp-sarah",
              employeeName: user?.userName || "Sara Devi",
              date: "2026-09-08",
              firstIn: "09:50 AM",
              lastOut: "06:55 PM",
              workMode: "OFFICE",
              terminalId: "TERM-BLR-GATE1",
              status: "ON_TIME",
            },
          ];
        }

        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const formattedBiometric = matchedRecords.map((r: any, idx: number) => {
          const d = new Date((r.date || "2026-09-10") + "T00:00:00");
          const dayName = isNaN(d.getDay()) ? "Thu" : dayNames[d.getDay()];
          const worked = calculateWorkedHoursFromTimeStrings(r.firstIn || "09:58 AM", r.lastOut || "07:12 PM");

          return {
            id: r.id || `biom-formatted-${idx}`,
            date: r.date || new Date().toISOString().split("T")[0],
            dayName,
            workMode: r.workMode || "OFFICE",
            firstIn: r.firstIn || "09:58 AM",
            lastOut: r.lastOut || "07:12 PM",
            workedHours: worked,
            terminalId: r.terminalId || "TERM-BLR-GATE2",
            status: r.status || "ON_TIME",
          };
        });

        setBiometricLogs(formattedBiometric);

        // --- 2. VIRTUAL PUNCH LOGS (Role Header Bar Login & Logout Time) ---
        if (typeof window !== "undefined") {
          try {
            // Active session state for this role
            const storedState = localStorage.getItem(punchStateKey);
            if (storedState) {
              const parsedState = JSON.parse(storedState);
              if (parsedState.status === "IN" && parsedState.startTimeMs) {
                const diffSecs = Math.floor((Date.now() - parsedState.startTimeMs) / 1000);
                setActiveVirtualSession({
                  isLive: true,
                  loginTimeStr: parsedState.punchInTimeStr || "10:00 AM",
                  elapsedSeconds: diffSecs,
                  roleLabel: parsedState.roleLabel || "Active Role",
                });
              } else {
                setActiveVirtualSession({
                  isLive: false,
                  loginTimeStr: "--",
                  elapsedSeconds: 0,
                  roleLabel: "Active Role",
                });
              }
            } else {
              setActiveVirtualSession({
                isLive: false,
                loginTimeStr: "--",
                elapsedSeconds: 0,
                roleLabel: "Active Role",
              });
            }

            // Historical Virtual Punches logged via Header Login/Logout Time
            const rawVirtual = localStorage.getItem(virtualPunchesKey);
            if (rawVirtual) {
              const parsedVirtual = JSON.parse(rawVirtual);
              if (Array.isArray(parsedVirtual)) {
                setVirtualLogs(parsedVirtual);
              }
            } else {
              setVirtualLogs([]);
            }
          } catch {}
        }
      } catch (err) {
        console.warn("Failed to load attendance logs:", err);
      }
    };

    loadPunches();

    const handleSyncEvent = () => loadPunches();
    window.addEventListener("workday:biometric_uploaded", handleSyncEvent);
    window.addEventListener("workpulse_sync", handleSyncEvent);
    window.addEventListener("attendance:punched", handleSyncEvent);
    window.addEventListener("storage", handleSyncEvent);

    return () => {
      window.removeEventListener("workday:biometric_uploaded", handleSyncEvent);
      window.removeEventListener("workpulse_sync", handleSyncEvent);
      window.removeEventListener("attendance:punched", handleSyncEvent);
      window.removeEventListener("storage", handleSyncEvent);
    };
  }, [punchStateKey, virtualPunchesKey]);

  // Live ticking interval for active virtual session display
  useEffect(() => {
    if (!activeVirtualSession.isLive) return;

    const interval = setInterval(() => {
      setActiveVirtualSession((prev) => ({
        ...prev,
        elapsedSeconds: prev.elapsedSeconds + 1,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeVirtualSession.isLive]);

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
                onClick={() => handleTabChange("hr_oversight")}
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
              onClick={() => handleTabChange("punches")}
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
                onClick={() => handleTabChange("directory")}
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
              onClick={() => handleTabChange("holidays")}
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

        {/* TAB 2: PUNCH LOGS SPLIT INTO TWO DISTINCT PARTS */}
        {activeTab === "punches" && (
          <div className="space-y-6">
            {/* PART 1: BIOMETRIC PUNCH LOGS (Hardware Terminal / HR CSV Upload) */}
            <Interactive3DCard className="p-6 space-y-4 border-border/80 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/50">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Fingerprint className="h-5 w-5 text-cyan-400" />
                    <span>Biometric Punch Logs</span>
                    <Badge variant="outline" className="text-[10px] font-bold text-cyan-300 border-cyan-500/30 bg-cyan-500/10">
                      HR Biometric CSV Data
                    </Badge>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Official hardware terminal scans imported via HR Daily Attendance CSV files (Bangalore HQ Gate #1, Turnstiles).
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                {biometricLogs.map((log, idx) => (
                  <div
                    key={`biom-log-${idx}`}
                    className="p-4 rounded-xl bg-card/50 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-cyan-500/40 transition-all text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-cyan-500/20">
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
                            className="text-[9px] font-mono text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                          >
                            {log.terminalId || "TERM-BLR-01"}
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
                        {formatWorkedHours(log.workedHours)}
                      </span>
                      <span className="text-[10px] text-muted-foreground block font-medium">
                        Biometric Terminal Punch ✓
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Interactive3DCard>

            {/* PART 2: VIRTUAL PUNCH LOGS (Header Bar Login & Logout Sessions) */}
            <Interactive3DCard className="p-6 space-y-4 border-border/80 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/50">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Clock className="h-5 w-5 text-emerald-400" />
                    <span>Virtual Punch Logs</span>
                    <Badge variant="outline" className="text-[10px] font-bold text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                      Header Role Bar Timer
                    </Badge>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Recorded directly via the Top Header Bar Login Time &amp; Logout Time buttons for your active role.
                  </p>
                </div>
              </div>

              {/* Live Active Virtual Punch Session Indicator */}
              {activeVirtualSession.isLive && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                      <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-xs font-bold text-emerald-400">Live Virtual Session Active</strong>
                        <Badge variant="brand" className="text-[9px] px-2 py-0">
                          {activeVirtualSession.roleLabel}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        Login Time: <strong className="text-foreground font-mono">{activeVirtualSession.loginTimeStr}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-black text-emerald-400 font-mono">
                      In: {formatRunningTimer(activeVirtualSession.elapsedSeconds)}
                    </div>
                    <span className="text-[10px] text-emerald-300/80 font-medium block">
                      Click &quot;Logout Time&quot; in header to end session
                    </span>
                  </div>
                </div>
              )}

              {/* Completed Virtual Punches History */}
              <div className="space-y-3 pt-1">
                {virtualLogs.map((vlog, idx) => (
                  <div
                    key={vlog.id || `virt-log-${idx}`}
                    className="p-4 rounded-xl bg-card/50 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-500/40 transition-all text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/20">
                        {vlog.dayName || "Thu"}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">{vlog.date}</span>
                          <Badge variant="outline" className="text-[9px] font-bold text-emerald-300 border-emerald-500/30">
                            {vlog.roleLabel || "Core Member"}
                          </Badge>
                          <Badge variant="outline" className="text-[9px] font-mono text-muted-foreground">
                            Virtual Header Session
                          </Badge>
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          Login: <strong className="text-foreground">{vlog.firstIn}</strong> · Logout:{" "}
                          <strong className="text-foreground">{vlog.lastOut}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-emerald-400 font-mono">
                        {formatWorkedHours(vlog.workedHours)}
                      </span>
                      <span className="text-[10px] text-muted-foreground block font-medium">
                        Completed Virtual Session ✓
                      </span>
                    </div>
                  </div>
                ))}

                {!activeVirtualSession.isLive && virtualLogs.length === 0 && (
                  <div className="p-6 text-center text-xs text-muted-foreground bg-card/30 rounded-2xl border border-border/50">
                    No virtual punch sessions logged yet. Click <strong className="text-emerald-400 font-bold">&quot;Login Time&quot;</strong> in the top header bar to record your first virtual session!
                  </div>
                )}
              </div>
            </Interactive3DCard>
          </div>
        )}

        {/* TAB 3: HOLIDAYS */}
        {activeTab === "holidays" && <HolidayCalendarGrid />}
      </AnimatedTabContent>
    </PageTransition>
  );
}
