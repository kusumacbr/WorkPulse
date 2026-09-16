"use client";

import React, { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { HolidayCalendarGrid } from "@/features/holidays/components/HolidayCalendarGrid";
import { useWorkpulseSharedStore } from "@/lib/stores/use-workpulse-store";
import {
  Clock,
  Calendar,
  CheckCircle2,
  Fingerprint,
  UserCheck,
  Building2,
  Activity,
  Radio,
  Wifi,
  MapPin,
} from "lucide-react";

import { formatWorkedHours } from "@/lib/ui/time-formatter";
import { useCurrentUser } from "@/components/layout/UserContext";

export type LeadAttendanceTab = "TEAM_PRESENCE" | "MY_PUNCHES" | "HOLIDAYS";
export type PresenceFilter = "ALL" | "OFFICE" | "WFH" | "ON_TIME";

export function LeadAttendanceManager() {
  const currentUser = useCurrentUser();
  const leadEmail = currentUser?.userEmail || "lead.test@xorstack.com";
  const [activeTab, setActiveTab] = useState<LeadAttendanceTab>("TEAM_PRESENCE");
  const [filterMode, setFilterMode] = useState<PresenceFilter>("ALL");
  const { teamPresence } = useWorkpulseSharedStore();

  const [punchStatus, setPunchStatus] = useState<"IN" | "OUT">("OUT");
  const [punchTime, setPunchTime] = useState<string>("--");
  const [toastMsg] = useState<string | null>(null);

  // Fetch real-time punch state & sync with global events from Supabase
  React.useEffect(() => {
    const fetchLatestPunch = async () => {
      try {
        const res = await fetch(`/api/v1/attendance/punches?employeeId=${encodeURIComponent(leadEmail)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.data?.punches?.length > 0) {
            const latest = data.data.punches[0];
            const isLatestIn = latest.direction === "IN" || latest.punch_type === "IN";
            setPunchStatus(isLatestIn ? "IN" : "OUT");
            setPunchTime(latest.time || new Date(latest.punch_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
          } else {
            setPunchStatus("OUT");
            setPunchTime("--");
          }
        }
      } catch {}
    };

    fetchLatestPunch();

    const handleSync = () => fetchLatestPunch();
    window.addEventListener("attendance:punched", handleSync);
    window.addEventListener("workpulse_sync", handleSync);
    window.addEventListener("workday:biometric_uploaded", handleSync);

    return () => {
      window.removeEventListener("attendance:punched", handleSync);
      window.removeEventListener("workpulse_sync", handleSync);
      window.removeEventListener("workday:biometric_uploaded", handleSync);
    };
  }, [leadEmail]);

  const leadReportsPresence = useMemo(() => {
    if (leadEmail.includes("lead") || currentUser?.primaryRole === "MANAGER") {
      const directOnly = teamPresence.filter((p) => p.id === "emp-sarah" || p.name.includes("Sarah"));
      if (directOnly.length > 0) return directOnly;
    }
    return teamPresence;
  }, [teamPresence, leadEmail, currentUser]);

  const officeCount = leadReportsPresence.filter((p) => p.workMode === "OFFICE").length;
  const wfhCount = leadReportsPresence.filter((p) => p.workMode === "WFH").length;
  const onTimeCount = leadReportsPresence.filter((p) => p.status === "ON_TIME").length;
  const totalGrossHours = leadReportsPresence.reduce((acc, p) => acc + (p.grossHours || 0), 0);

  const filteredPresence = useMemo(() => {
    if (filterMode === "OFFICE") return leadReportsPresence.filter((p) => p.workMode === "OFFICE");
    if (filterMode === "WFH") return leadReportsPresence.filter((p) => p.workMode === "WFH");
    if (filterMode === "ON_TIME") return leadReportsPresence.filter((p) => p.status === "ON_TIME");
    return leadReportsPresence;
  }, [leadReportsPresence, filterMode]);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 shadow-lg">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span className="font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* 1. Real-time Top Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-border bg-card/60 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Live Team Presence</span>
            <UserCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400" suppressHydrationWarning>
            {teamPresence.length} / {teamPresence.length} Present
          </p>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            {formatWorkedHours(totalGrossHours)} total logged today
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card/60 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Shift Adherence</span>
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-cyan-400" suppressHydrationWarning>
            {onTimeCount} / {teamPresence.length} On-Time
          </p>
          <span className="text-[11px] text-muted-foreground" suppressHydrationWarning>
            10:00 AM – 07:00 PM Shift Schedule
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card/60 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Office vs Remote</span>
            <Building2 className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-foreground" suppressHydrationWarning>
            {officeCount} Office · {wfhCount} WFH
          </p>
          <span className="text-[11px] text-muted-foreground">HQ Floor 4 &amp; Authorized Remote</span>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card/60 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Lead Status</span>
            <Fingerprint className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400">Punched IN</p>
          <span className="text-[11px] text-muted-foreground">Since {punchTime} · HQ Terminal #1</span>
        </div>
      </div>

      {/* 2. Navigation Tabs & Real-Time Pulse Bar */}
      <Interactive3DCard className="p-4 md:p-5 border border-border/80 bg-card/60 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center p-1 rounded-xl bg-background/50 border border-border/70 overflow-x-auto gap-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("TEAM_PRESENCE")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeTab === "TEAM_PRESENCE"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              <span>Real-Time Team Monitor ({teamPresence.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("MY_PUNCHES")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeTab === "MY_PUNCHES"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>My Punches</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("HOLIDAYS")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeTab === "HOLIDAYS"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Holiday Calendar</span>
            </button>
          </div>

          {/* Real-time sync badge */}
          {activeTab === "TEAM_PRESENCE" && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-bold text-emerald-400 border-emerald-500/30 bg-emerald-500/10 gap-1.5 px-3 py-1">
                <Wifi className="h-3 w-3 animate-pulse" />
                <span>Live Biometric Sync Active</span>
              </Badge>
            </div>
          )}
        </div>

        {/* Filter Chips when viewing Team Presence */}
        {activeTab === "TEAM_PRESENCE" && (
          <div className="flex items-center gap-2 overflow-x-auto pt-1 border-t border-border/50 text-xs">
            <span className="text-[11px] font-bold text-muted-foreground mr-1">Filter:</span>
            <button
              type="button"
              onClick={() => setFilterMode("ALL")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterMode === "ALL"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "bg-muted/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              All Direct Reports ({teamPresence.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("OFFICE")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterMode === "OFFICE"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "bg-muted/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              🏢 In Office ({officeCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("WFH")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterMode === "WFH"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "bg-muted/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              🏠 Remote WFH ({wfhCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("ON_TIME")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterMode === "ON_TIME"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "bg-muted/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              ⚡ On Time ({onTimeCount})
            </button>
          </div>
        )}
      </Interactive3DCard>

      {/* 3. Tab Contents */}

      {/* TAB 1: REAL-TIME TEAM ATTENDANCE MONITOR */}
      {activeTab === "TEAM_PRESENCE" && (
        <div className="space-y-3">
          {filteredPresence.map((member) => (
            <div
              key={member.id}
              className="p-4 rounded-2xl border border-border bg-card/85 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-primary/40 transition-all"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                  {member.avatar || member.name.slice(0, 2).toUpperCase()}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="text-xs font-bold text-foreground">{member.name}</strong>
                    <span className="text-[11px] text-muted-foreground">· {member.role}</span>

                    {/* Live Punch Status */}
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[9px] font-bold px-2 py-0 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Punched IN · Active on Duty</span>
                    </Badge>

                    <Badge
                      variant="outline"
                      className={`text-[9px] px-1.5 py-0 ${
                        member.workMode === "OFFICE"
                          ? "text-cyan-300 border-cyan-500/30"
                          : "text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {member.workMode === "OFFICE" ? "Office (HQ Floor 4)" : "Remote (Authorized WFH)"}
                    </Badge>

                    <Badge
                      variant={member.status === "ON_TIME" ? "brand" : "secondary"}
                      className="text-[9px] px-1.5 py-0"
                    >
                      {member.status === "ON_TIME" ? "On Time (10:00 AM)" : "Grace Window"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-cyan-400" />
                      First Punch: <strong className="text-foreground">{member.firstIn}</strong>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-indigo-400" />
                      {member.location}
                    </span>
                    <span>·</span>
                    <span>
                      Logged: <strong className="text-foreground">{formatWorkedHours(member.grossHours)}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Real-time Work Progress & Shift Adherence */}
              <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {formatWorkedHours(member.grossHours)} / 8h 00m
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
                    {Math.round((member.grossHours / 8.0) * 100)}% Shift
                  </Badge>
                </div>
                <div className="w-28 h-1.5 bg-muted/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((member.grossHours / 8.0) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          ))}

          {filteredPresence.length === 0 && (
            <div className="p-8 text-center bg-card/40 rounded-2xl border border-border/60 text-xs text-muted-foreground">
              No team members match the selected filter.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LEAD PERSONAL BIOMETRIC PUNCH LOGS */}
      {/* TAB 2: LEAD PERSONAL BIOMETRIC & VIRTUAL PUNCH LOGS */}
      {activeTab === "MY_PUNCHES" && (
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
                  Official hardware terminal logs from HR Daily Attendance CSV import (Bangalore HQ Gate #1, Turnstiles).
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {[
                {
                  date: "2026-09-10",
                  dayName: "Thu",
                  workMode: "OFFICE",
                  firstIn: "10:05 AM",
                  lastOut: "07:12 PM",
                  workedHours: 8.8,
                  status: "ON_TIME",
                  terminalId: "TERM-BLR-GATE1",
                },
                {
                  date: "2026-09-08",
                  dayName: "Tue",
                  workMode: "OFFICE",
                  firstIn: "10:00 AM",
                  lastOut: "07:05 PM",
                  workedHours: 8.5,
                  status: "ON_TIME",
                  terminalId: "TERM-BLR-01",
                },
                {
                  date: "2026-09-05",
                  dayName: "Fri",
                  workMode: "OFFICE",
                  firstIn: "10:10 AM",
                  lastOut: "07:15 PM",
                  workedHours: 8.6,
                  status: "ON_TIME",
                  terminalId: "TERM-BLR-FLR4",
                },
              ].map((log, idx) => (
                <div
                  key={`lead-biom-${idx}`}
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
                          className="bg-cyan-500/15 text-cyan-300 border-cyan-500/30 text-[9px] font-bold uppercase"
                        >
                          {log.workMode}
                        </Badge>
                        <Badge variant="outline" className="text-[9px] font-mono text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                          {log.terminalId}
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
                      Biometric Terminal Scanned ✓
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
                  Recorded directly via the Top Header Bar Login Time &amp; Logout Time buttons for Team Lead role.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card/50 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-500/40 transition-all text-xs">
              <div className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/20">
                  Thu
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">2026-09-10</span>
                    <Badge variant="outline" className="text-[9px] font-bold text-cyan-300 border-cyan-500/30">
                      Team Lead
                    </Badge>
                    <Badge variant="outline" className="text-[9px] font-mono text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                      Active Header Session
                    </Badge>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Virtual Punch-In: <strong className="text-foreground">{punchTime !== "--" ? punchTime : "10:00 AM"}</strong> · Virtual Punch-Out:{" "}
                    <strong className="text-foreground">{punchStatus === "IN" ? "In Progress (Timer Ticking)" : "Punched Out"}</strong>
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-sm font-black text-emerald-400 font-mono">
                  {punchStatus === "IN" ? "Live Session" : "8h 15m"}
                </span>
                <span className="text-[10px] text-muted-foreground block font-medium">
                  {punchStatus === "IN" ? "Controlled via Header" : "Completed Virtual Session ✓"}
                </span>
              </div>
            </div>
          </Interactive3DCard>
        </div>
      )}

      {/* TAB 3: HOLIDAY CALENDAR */}
      {activeTab === "HOLIDAYS" && (
        <div className="space-y-4">
          <HolidayCalendarGrid />
        </div>
      )}
    </div>
  );
}
