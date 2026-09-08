"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { MetricTile3D } from "@/components/3d/MetricTile3D";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import {
  Users,
  Clock,
  Calendar,
  ShieldCheck,
  Building2,
  Cake,
  Gift,
  ArrowRight,
  Download,
  AlertTriangle,
} from "lucide-react";

interface HRTopLevelSummaryProps {
  onNavigateTab: (tab: string, filter?: string) => void;
  onOpenExportModal: () => void;
}

export function HRTopLevelSummary({
  onNavigateTab,
  onOpenExportModal,
}: HRTopLevelSummaryProps) {
  const { departments, allEmployees, leaveRequests, wfhRequests } = useWorkpulseSharedStore();

  // Dynamic calculations from live store
  const totalEmployeesCount = allEmployees.length;
  const pendingLeaves = leaveRequests.filter((r) => r.status === "FORWARDED_TO_HR");
  const pendingWfhs = wfhRequests.filter((r) => r.status === "FORWARDED_TO_HR");
  const pendingProbationsCount = 2; // Candidates due for 30/90-day confirmation
  const pendingPipReviewsCount = 1; // Active PIP milestone sign-off

  const totalPendingActionCount =
    pendingLeaves.length + pendingWfhs.length + pendingProbationsCount + pendingPipReviewsCount;

  // Live attendance aggregates based on department roster
  const onLeaveCount = leaveRequests.filter((r) => r.status === "APPROVED").length || 2;
  const wfhCount = wfhRequests.filter((r) => r.status === "APPROVED" || r.status === "FORWARDED_TO_HR").length || 3;
  const inOfficeCount = Math.max(0, totalEmployeesCount - onLeaveCount - wfhCount);
  const absentCount = 0;

  return (
    <div className="space-y-6">
      {/* 3D HR Executive Command Banner */}
      <Interactive3DCard className="p-6 md:p-8 border border-pink-500/30 bg-gradient-to-r from-card/80 via-card/60 to-pink-500/10 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="font-bold text-[10px] uppercase bg-pink-500/15 border-pink-500/30 text-pink-300">
                <ShieldCheck className="h-3 w-3 mr-1 text-pink-400" />
                HR Command & People Operations
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                Rachel HR · Full Visibility Across 6 Departments
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">
              Enterprise People Operations Hub
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Comprehensive organization governance: Headcount census, live biometric attendance & shift compliance (10:00 AM – 07:00 PM), Stage-2 leave authorizations, probation milestones, review turnaround, and wellbeing indicators across all 6 departments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-bold gap-1.5 h-9 border-pink-500/30 text-pink-300 hover:bg-pink-500/10"
              onClick={onOpenExportModal}
            >
              <Download className="h-3.5 w-3.5 text-pink-400" />
              <span>Payroll & Audit Muster</span>
            </Button>
          </div>
        </div>

        {/* Actionable Top Summary Pulse Row */}
        <div className="pt-3 border-t border-pink-500/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Item 1: Active Headcount by Dept */}
          <button
            type="button"
            onClick={() => onNavigateTab("directory")}
            className="p-3 rounded-xl bg-card/60 border border-border/80 hover:border-pink-500/40 text-left transition-all group space-y-1"
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-foreground">
                <Users className="h-3.5 w-3.5 text-cyan-400" />
                Total Headcount
              </span>
              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-pink-400" />
            </div>
            <div className="text-lg font-black text-cyan-400 font-mono">
              {totalEmployeesCount} Active Staff
            </div>
            <div className="text-[10px] text-muted-foreground truncate">
              6 Departments · 6 Designated Leads
            </div>
          </button>

          {/* Item 2: Today's Attendance Snapshot */}
          <button
            type="button"
            onClick={() => onNavigateTab("attendance_leave")}
            className="p-3 rounded-xl bg-card/60 border border-border/80 hover:border-pink-500/40 text-left transition-all group space-y-1"
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-foreground">
                <Clock className="h-3.5 w-3.5 text-emerald-400" />
                Today&apos;s Presence
              </span>
              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-pink-400" />
            </div>
            <div className="text-xs font-bold text-foreground font-mono flex items-center gap-2">
              <span className="text-emerald-400">{inOfficeCount} HQ</span> ·{" "}
              <span className="text-cyan-400">{wfhCount} WFH</span> ·{" "}
              <span className="text-amber-400">{onLeaveCount} Leave</span>
            </div>
            <div className="text-[10px] text-muted-foreground">
              {absentCount === 0 ? "Zero unexcused absences" : `${absentCount} unexcused absences`}
            </div>
          </button>

          {/* Item 3: Pending Approvals Needing HR Action Right Now (LIVE) */}
          <button
            type="button"
            onClick={() => onNavigateTab("attendance_leave", "pending_queue")}
            className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:border-rose-500/60 text-left transition-all group space-y-1"
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-rose-300">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                Pending HR Actions
              </span>
              <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4">
                Live: {totalPendingActionCount}
              </Badge>
            </div>
            <div className="text-lg font-black text-rose-400 font-mono">
              {totalPendingActionCount} Pending
            </div>
            <div className="text-[10px] text-rose-300/80 truncate">
              {pendingLeaves.length + pendingWfhs.length} Stage-2 · {pendingProbationsCount} Probation · {pendingPipReviewsCount} PIP
            </div>
          </button>

          {/* Item 4: Upcoming Milestones & Holidays */}
          <button
            type="button"
            onClick={() => onNavigateTab("talent_compliance", "holidays")}
            className="p-3 rounded-xl bg-card/60 border border-border/80 hover:border-pink-500/40 text-left transition-all group space-y-1"
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-foreground">
                <Cake className="h-3.5 w-3.5 text-purple-400" />
                Upcoming Dates
              </span>
              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-pink-400" />
            </div>
            <div className="text-xs font-bold text-foreground truncate">
              Alex B&apos;day · Sara 2y Anniv
            </div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Gift className="h-3 w-3 text-pink-400 shrink-0" />
              <span>Next Holiday: Gandhi Jayanti (Oct 02)</span>
            </div>
          </button>
        </div>
      </Interactive3DCard>

      {/* 3D Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile3D
          title="Departments & Teams"
          value={`${departments.length} Units`}
          subtitle="All 6 designated Team Leads"
          icon={Building2}
          change="Full Oversight"
          changePositive={true}
          badgeText="Active Org"
          accent="purple"
          onClick={() => onNavigateTab("directory", "org_matrix")}
        />

        <MetricTile3D
          title="Shift Punctuality"
          value="98.2%"
          subtitle="10:00 AM – 07:00 PM (Grace: 10:15 AM)"
          icon={Clock}
          change="Full-Time (M-F) / Prob (M-S)"
          changePositive={true}
          badgeText="Shift Clean"
          accent="emerald"
          onClick={() => onNavigateTab("attendance_leave", "anomalies")}
        />

        <MetricTile3D
          title="Stage-2 Sign-Off Queue"
          value={`${pendingLeaves.length + pendingWfhs.length} Pending`}
          subtitle="Lead-approved; awaiting HR final sign-off"
          icon={Calendar}
          change={pendingLeaves.length + pendingWfhs.length > 0 ? "Action Required" : "All Processed"}
          changePositive={pendingLeaves.length + pendingWfhs.length === 0}
          badgeText={`Live: ${pendingLeaves.length + pendingWfhs.length}`}
          accent="rose"
          onClick={() => onNavigateTab("attendance_leave", "pending_queue")}
        />

        <MetricTile3D
          title="Review Compliance"
          value="83.3% On-Time"
          subtitle="5 of 6 Leads submitted weekly appraisals"
          icon={ShieldCheck}
          change="1 Lead Overdue"
          changePositive={false}
          badgeText="Q3 2026"
          accent="gold"
          onClick={() => onNavigateTab("compliance", "reviews")}
        />
      </div>
    </div>
  );
}
