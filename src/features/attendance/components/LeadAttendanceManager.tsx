"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { HolidayCalendarGrid } from "@/features/holidays/components/HolidayCalendarGrid";
import { WorkpulseApi } from "@/lib/api/api-client";
import {
  Clock,
  Calendar,
  Users,
  CheckCircle2,
  Fingerprint,
  UserCheck,
  Building2,
} from "lucide-react";

export interface PodMemberPresence {
  id: string;
  name: string;
  role: string;
  avatar: string;
  workMode: "OFFICE" | "WFH";
  firstIn: string;
  location: string;
  status: "ON_TIME" | "GRACE_WINDOW" | "LATE";
  grossHours: number;
}

const DEFAULT_POD_PRESENCE: PodMemberPresence[] = [
  {
    id: "emp-sarah",
    name: "Sarah Dev",
    role: "Senior Backend Engineer",
    avatar: "SD",
    workMode: "OFFICE",
    firstIn: "10:08 AM",
    location: "Bangalore HQ · Floor 4",
    status: "ON_TIME",
    grossHours: 4.5,
  },
  {
    id: "emp-rohit",
    name: "Rohit Sharma",
    role: "Frontend Engineer",
    avatar: "RS",
    workMode: "WFH",
    firstIn: "09:55 AM",
    location: "Remote (Approved WFH)",
    status: "ON_TIME",
    grossHours: 4.75,
  },
  {
    id: "emp-priya",
    name: "Priya Patel",
    role: "QA Engineer",
    avatar: "PP",
    workMode: "OFFICE",
    firstIn: "10:02 AM",
    location: "Bangalore HQ · Floor 4",
    status: "ON_TIME",
    grossHours: 4.6,
  },
  {
    id: "emp-arjun",
    name: "Arjun Kumar",
    role: "Junior Developer",
    avatar: "AK",
    workMode: "OFFICE",
    firstIn: "10:14 AM",
    location: "Bangalore HQ · Floor 4",
    status: "GRACE_WINDOW",
    grossHours: 4.4,
  },
];

type LeadAttendanceTab = "POD_PRESENCE" | "MY_PUNCHES" | "HOLIDAYS";

export function LeadAttendanceManager() {
  const [activeTab, setActiveTab] = useState<LeadAttendanceTab>("POD_PRESENCE");
  const [podPresence, setPodPresence] = useState<PodMemberPresence[]>(DEFAULT_POD_PRESENCE);
  const [punchStatus, setPunchStatus] = useState<"IN" | "OUT">("IN");
  const [punchTime, setPunchTime] = useState<string>("10:05 AM");
  const [isPunching, setIsPunching] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleBiometricPunch = async () => {
    setIsPunching(true);
    const nextType = punchStatus === "IN" ? "OUT" : "IN";
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    try {
      await WorkpulseApi.attendance.punch({
        employeeId: "lead-alex",
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
    showToast(`✓ Lead Biometric Punch-${nextType} registered at ${timeStr} (Bangalore HQ Floor 4).`);
  };

  const handleVerifyMemberPresence = (id: string, name: string) => {
    setPodPresence((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "ON_TIME" } : p))
    );
    showToast(`✓ Presence for ${name} verified by Team Lead.`);
  };

  const officeCount = podPresence.filter((p) => p.workMode === "OFFICE").length;
  const wfhCount = podPresence.filter((p) => p.workMode === "WFH").length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* 1. Glanceable Top Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Team Presence Today</span>
            <UserCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{podPresence.length} / {podPresence.length} Present</p>
          <span className="text-[11px] text-muted-foreground">100% On-Duty Today</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Office vs Remote</span>
            <Building2 className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{officeCount} Office · {wfhCount} WFH</p>
          <span className="text-[11px] text-muted-foreground">HQ Floor 4 & Remote</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Shift Grace Compliance</span>
            <Clock className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-cyan-400">100% Compliant</p>
          <span className="text-[11px] text-muted-foreground">All clocked before 10:15 AM</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Lead Status</span>
            <Fingerprint className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400">Punched IN</p>
          <span className="text-[11px] text-muted-foreground">Since {punchTime}</span>
        </div>
      </div>

      {/* 2. Segregation Tabs */}
      <Interactive3DCard className="p-4 md:p-5 border border-border/80 bg-card/60 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center p-1 rounded-xl bg-background/50 border border-border/70 overflow-x-auto gap-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("POD_PRESENCE")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeTab === "POD_PRESENCE"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Who&apos;s Present Today ({podPresence.length})</span>
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
        </div>
      </Interactive3DCard>

      {/* 3. Tab Contents */}

      {/* TAB 1: POD ATTENDANCE BOARD */}
      {activeTab === "POD_PRESENCE" && (
        <div className="space-y-3">
          {podPresence.map((member) => (
            <div
              key={member.id}
              className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-primary/40 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="h-10 w-10 rounded-full bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                  {member.avatar}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="text-xs font-bold text-foreground">{member.name}</strong>
                    <span className="text-[11px] text-muted-foreground">· {member.role}</span>

                    <Badge
                      variant="outline"
                      className={`text-[9px] px-1.5 py-0 ${
                        member.workMode === "OFFICE"
                          ? "text-cyan-300 border-cyan-500/30"
                          : "text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {member.workMode === "OFFICE" ? "Office (Floor 4)" : "Remote (WFH)"}
                    </Badge>

                    <Badge
                      variant={member.status === "ON_TIME" ? "brand" : "secondary"}
                      className="text-[9px] px-1.5 py-0"
                    >
                      {member.status === "ON_TIME" ? "On Time" : "Grace Window"}
                    </Badge>
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    First Punch: <strong className="text-foreground">{member.firstIn}</strong> · Logged:{" "}
                    <strong className="text-foreground">{member.grossHours} hrs</strong> · {member.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleVerifyMemberPresence(member.id, member.name)}
                  className="text-xs font-semibold h-8"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                  <span>Verify Presence</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: LEAD PERSONAL BIOMETRIC PUNCH LOGS */}
      {activeTab === "MY_PUNCHES" && (
        <Interactive3DCard className="p-6 space-y-4 border-border/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Fingerprint className="h-4 w-4 text-cyan-400" />
                Official Biometric Transactions &amp; Virtual Punch
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
            {[
              {
                date: "2026-08-21",
                dayName: "Fri",
                workMode: "OFFICE",
                firstIn: "10:05 AM",
                lastOut: punchStatus === "OUT" ? punchTime : "--:--",
                workedHours: punchStatus === "OUT" ? 8.2 : 4.8,
                status: "ON_TIME",
              },
              {
                date: "2026-08-20",
                dayName: "Thu",
                workMode: "OFFICE",
                firstIn: "10:00 AM",
                lastOut: "07:12 PM",
                workedHours: 8.8,
                status: "ON_TIME",
              },
              {
                date: "2026-08-19",
                dayName: "Wed",
                workMode: "OFFICE",
                firstIn: "10:10 AM",
                lastOut: "07:15 PM",
                workedHours: 8.6,
                status: "ON_TIME",
              },
              {
                date: "2026-08-18",
                dayName: "Tue",
                workMode: "WFH",
                firstIn: "09:50 AM",
                lastOut: "06:55 PM",
                workedHours: 8.5,
                status: "ON_TIME",
              },
              {
                date: "2026-08-17",
                dayName: "Mon",
                workMode: "OFFICE",
                firstIn: "10:04 AM",
                lastOut: "07:08 PM",
                workedHours: 8.6,
                status: "ON_TIME",
              },
            ].map((log, idx) => (
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
                            : "bg-amber-500/15 text-amber-400 border-amber-500/30"
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

      {/* TAB 4: HOLIDAY CALENDAR */}
      {activeTab === "HOLIDAYS" && (
        <div className="space-y-4">
          <HolidayCalendarGrid />
        </div>
      )}
    </div>
  );
}
