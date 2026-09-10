"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock,
  ShieldCheck,
  ListTodo,
  Target,
  TrendingUp,
  Calendar,
  Users,
  Building2,
} from "lucide-react";

// =========================================================================
// 1. MEMBER BESPOKE 4 HERO CARDS (Attendance, Tasks, Goals, Leave)
// =========================================================================

interface MemberHeroMetricsProps {
  checkInTime?: string;
  activeHoursStr?: string;
  shiftProgressPercent?: number;
  shiftStartStr?: string;
  shiftEndStr?: string;
  isCheckedIn?: boolean;
  tasksCount: number;
  completedTasksCount: number;
  taskProgressPercent?: number;
  goalsProgress: number;
  completedGoalsCount: number;
  totalGoalsCount: number;
  casualLeaveBalance: number;
  sickLeaveBalance: number;
  wfhCount: number;
  workMode?: string;
}

export function MemberHeroMetrics({
  checkInTime = "--",
  activeHoursStr = "0.0h Active",
  shiftProgressPercent = 0,
  shiftStartStr = "10:00 AM Start",
  shiftEndStr = "07:00 PM Out",
  isCheckedIn = false,
  tasksCount,
  completedTasksCount,
  taskProgressPercent,
  goalsProgress,
  completedGoalsCount,
  totalGoalsCount,
  casualLeaveBalance,
  sickLeaveBalance,
  wfhCount,
  workMode = "Office",
}: MemberHeroMetricsProps) {
  const safeTasksCount = tasksCount;
  const safeCompletedTasks = completedTasksCount;
  const safeTaskPercent = tasksCount > 0 ? (taskProgressPercent !== undefined ? taskProgressPercent : Math.round((safeCompletedTasks / safeTasksCount) * 100)) : 0;
  const isPresent = isCheckedIn || (checkInTime !== "--" && checkInTime !== "Not Checked In");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
      {/* -------------------------------------------------------------
          CARD 1: TODAY'S ATTENDANCE (Biometric Pulse & Shift Timeline)
         ------------------------------------------------------------- */}
      <Link prefetch={true} href="/attendance" className="block group">
        <div className="h-full p-5 rounded-3xl border border-cyan-500/30 dark:border-cyan-500/25 bg-card/90 dark:bg-card/75 backdrop-blur-xl shadow-sm relative overflow-hidden transition-all duration-300 group-hover:border-cyan-500/60 group-hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)] group-hover:-translate-y-1">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-3.5 flex flex-col justify-between h-full">
            {/* Top Row: Label & Status Dot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-cyan-500/15 dark:bg-cyan-500/20 border border-cyan-500/30 dark:border-cyan-500/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0 shadow-sm">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 block">
                    Today&apos;s Attendance
                  </span>
                </div>
              </div>

              <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                isPresent
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isPresent ? "bg-emerald-500 dark:bg-emerald-400 animate-pulse" : "bg-amber-500"}`} />
                {workMode === "WFH" ? "Remote (WFH)" : isPresent ? "In Office" : "Not Checked In"}
              </span>
            </div>

            {/* Middle: Big Metric & Check-In Tag */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-foreground tracking-tight font-mono">
                  {isPresent ? "Present" : "Not Checked In"}
                </span>
                <span className="text-xs font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 dark:bg-cyan-500/20 px-2 py-0.5 rounded-md border border-cyan-500/30 font-mono">
                  In: {checkInTime}
                </span>
              </div>
            </div>

            {/* Bottom: Shift Progress Timeline Track */}
            <div className="pt-2 border-t border-border/70 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-muted-foreground">{shiftStartStr}</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">{activeHoursStr}</span>
                <span className="text-muted-foreground">{shiftEndStr}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted/50 dark:bg-muted/30 overflow-hidden relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(0, shiftProgressPercent))}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* -------------------------------------------------------------
          CARD 2: MY TASKS VELOCITY (Circular Donut Ring & Pill Tags)
         ------------------------------------------------------------- */}
      <Link prefetch={true} href="/my-work" className="block group">
        <div className="h-full p-5 rounded-3xl border border-amber-500/30 dark:border-amber-500/25 bg-card/90 dark:bg-card/75 backdrop-blur-xl shadow-sm relative overflow-hidden transition-all duration-300 group-hover:border-amber-500/60 group-hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)] group-hover:-translate-y-1">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-3.5 flex flex-col justify-between h-full">
            {/* Top Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/30 dark:border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-sm">
                  <ListTodo className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                    My Tasks Velocity
                  </span>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold font-mono ${
                tasksCount === 0
                  ? "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400"
                  : "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              }`}>
                {tasksCount === 0 ? "Plan Not Started" : `${safeTaskPercent}% Done`}
              </span>
            </div>

            {/* Middle: Big Metric with Visual Ring */}
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-3xl font-black text-foreground tracking-tight font-mono">
                  {tasksCount === 0 ? (
                    <span className="text-xl text-amber-600 dark:text-amber-400">Not Started</span>
                  ) : (
                    <>
                      {safeCompletedTasks} <span className="text-lg text-muted-foreground">/ {safeTasksCount}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Mini SVG Progress Ring */}
              <div className="relative shrink-0 w-12 h-12">
                <svg viewBox="0 0 36 36" className="w-12 h-12 transform -rotate-90">
                  <path
                    className="text-muted/40 dark:text-muted/20"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <motion.path
                    className="text-amber-500 dark:text-amber-400"
                    strokeDasharray={`${safeTaskPercent}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    initial={{ strokeDasharray: "0, 100" }}
                    animate={{ strokeDasharray: `${safeTaskPercent}, 100` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-mono font-black text-[10px] text-amber-600 dark:text-amber-400">
                  {safeTaskPercent}%
                </div>
              </div>
            </div>

            {/* Bottom: Task Domain Tags */}
            <div className="pt-2 border-t border-border/70 flex flex-wrap items-center gap-1.5 text-[10px]">
              <span className="px-2 py-0.5 rounded-md bg-muted/60 dark:bg-card/80 border border-border/80 text-foreground font-semibold">
                ⚡ Active Standup
              </span>
              <span className="px-2 py-0.5 rounded-md bg-muted/60 dark:bg-card/80 border border-border/80 text-foreground font-semibold">
                📊 {safeCompletedTasks} Finished
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* -------------------------------------------------------------
          CARD 3: OVERALL GOAL PROGRESS (OKR Trajectory & Milestones)
         ------------------------------------------------------------- */}
      <Link prefetch={true} href="/goals" className="block group">
        <div className="h-full p-5 rounded-3xl border border-emerald-500/30 dark:border-emerald-500/25 bg-card/90 dark:bg-card/75 backdrop-blur-xl shadow-sm relative overflow-hidden transition-all duration-300 group-hover:border-emerald-500/60 group-hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)] group-hover:-translate-y-1">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-3.5 flex flex-col justify-between h-full">
            {/* Top Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/30 dark:border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                    OKR Goal Progress
                  </span>
                </div>
              </div>

              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3 w-3" />
                +14% Pace
              </span>
            </div>

            {/* Middle: Big Metric with Delta */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-foreground tracking-tight font-mono">
                  {goalsProgress}%
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {completedGoalsCount} of {totalGoalsCount} OKRs Done
                </span>
              </div>
            </div>

            {/* Bottom: 4 Milestone Step Dots */}
            <div className="pt-2 border-t border-border/70 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-muted-foreground">Milestone Delivery</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{completedGoalsCount} / {totalGoalsCount} Achieved</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full ${
                      i < completedGoalsCount
                        ? "bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]"
                        : i === completedGoalsCount
                        ? "bg-emerald-500/40"
                        : "bg-muted/50 dark:bg-muted/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* -------------------------------------------------------------
          CARD 4: LEAVE BALANCE & TIME-OFF (Dual Quota Gauges)
         ------------------------------------------------------------- */}
      <Link prefetch={true} href="/leave" className="block group">
        <div className="h-full p-5 rounded-3xl border border-rose-500/30 dark:border-rose-500/25 bg-card/90 dark:bg-card/75 backdrop-blur-xl shadow-sm relative overflow-hidden transition-all duration-300 group-hover:border-rose-500/60 group-hover:shadow-[0_8px_30px_rgba(244,63,94,0.15)] group-hover:-translate-y-1">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-3.5 flex flex-col justify-between h-full">
            {/* Top Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-rose-500/15 dark:bg-rose-500/20 border border-rose-500/30 dark:border-rose-500/40 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-sm">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                    Leave &amp; Time-Off
                  </span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                Available
              </span>
            </div>

            {/* Middle: Big Metric with Days */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight">
                  {casualLeaveBalance} <span className="text-xl text-foreground font-black">Days</span>
                </span>
                <span className="text-xs text-muted-foreground font-medium">/ 12 Casual</span>
              </div>
            </div>

            {/* Bottom: Dual Quota Breakdown Badges */}
            <div className="pt-2 border-t border-border/70 flex items-center justify-between text-[10px] font-mono">
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-rose-500 dark:bg-rose-400" />
                <span>Sick: <strong className="text-foreground">{sickLeaveBalance}d</strong></span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-purple-500 dark:bg-purple-400" />
                <span>WFH: <strong className="text-purple-600 dark:text-purple-400">{wfhCount}d</strong></span>
              </div>
              <span className="text-rose-600 dark:text-rose-400 font-bold hover:underline">Apply &rarr;</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

// =========================================================================
// 2. TEAM LEAD BESPOKE 4 HERO CARDS
// =========================================================================

interface LeadHeroMetricsProps {
  presentCount: number;
  totalTeamCount: number;
  morningPlansCount: number;
  pendingRequestsCount: number;
  pendingLeavesCount: number;
  pendingWfhsCount: number;
  sprintVelocityPercent: number;
  achievedOkrsCount: number;
  totalOkrsCount: number;
}

export function LeadHeroMetrics({
  presentCount,
  totalTeamCount,
  morningPlansCount,
  pendingRequestsCount,
  sprintVelocityPercent,
}: LeadHeroMetricsProps) {
  const safeTotal = Math.max(totalTeamCount, 1);
  const attendanceRate = Math.round((presentCount / safeTotal) * 100);
  const sodRate = Math.round((morningPlansCount / safeTotal) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. Team Attendance Card */}
      <Link prefetch={true} href="/attendance" className="block group">
        <div className="h-full p-5 rounded-3xl border border-emerald-500/30 dark:border-emerald-500/25 bg-card/90 dark:bg-card/75 backdrop-blur-xl shadow-sm relative overflow-hidden transition-all duration-300 group-hover:border-emerald-500/60 group-hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)] group-hover:-translate-y-1">
          <div className="relative z-10 space-y-3.5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/30 dark:border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                    Team Attendance
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                {attendanceRate}% Present
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-black text-foreground font-mono">
                {presentCount} <span className="text-lg text-muted-foreground">/ {safeTotal} Present</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/70">
              <div className="h-2 w-full rounded-full bg-muted/50 dark:bg-muted/30 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${attendanceRate}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* 2. Morning SOD Plans Card */}
      <Link prefetch={true} href="/my-work" className="block group">
        <div className="h-full p-5 rounded-3xl border border-cyan-500/30 dark:border-cyan-500/25 bg-card/90 dark:bg-card/75 backdrop-blur-xl shadow-sm relative overflow-hidden transition-all duration-300 group-hover:border-cyan-500/60 group-hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)] group-hover:-translate-y-1">
          <div className="relative z-10 space-y-3.5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-cyan-500/15 dark:bg-cyan-500/20 border border-cyan-500/30 dark:border-cyan-500/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <ListTodo className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 block">
                    Morning SOD Plans
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                {sodRate}% Shared
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-black text-foreground font-mono">
                {morningPlansCount} <span className="text-lg text-muted-foreground">/ {safeTotal} Shared</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/70 flex items-center justify-between text-[10px] font-mono">
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">Audit Plans &rarr;</span>
              <span className="text-muted-foreground">{morningPlansCount === safeTotal ? "100% Compliant" : "Review pending"}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* 3. Team Leave Approvals Card */}
      <Link prefetch={true} href="/leave" className="block group">
        <div className="h-full p-5 rounded-3xl border border-rose-500/30 dark:border-rose-500/25 bg-card/90 dark:bg-card/75 backdrop-blur-xl shadow-sm relative overflow-hidden transition-all duration-300 group-hover:border-rose-500/60 group-hover:shadow-[0_8px_30px_rgba(244,63,94,0.15)] group-hover:-translate-y-1">
          <div className="relative z-10 space-y-3.5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-rose-500/15 dark:bg-rose-500/20 border border-rose-500/30 dark:border-rose-500/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                    Team Leave Queue
                  </span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                pendingRequestsCount > 0
                  ? "bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 animate-pulse"
                  : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              }`}>
                {pendingRequestsCount > 0 ? "Action Required" : "All Clear"}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">
                {pendingRequestsCount} <span className="text-lg text-foreground font-black">Pending</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/70 flex items-center justify-between text-[10px] font-mono">
              <span className="text-rose-600 dark:text-rose-400 font-bold">Sign-Off Desk &rarr;</span>
              <span className="text-muted-foreground">{pendingRequestsCount === 0 ? "Up to date" : "Needs Lead approval"}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* 4. Sprint Velocity Card */}
      <Link prefetch={true} href="/goals" className="block group">
        <div className="h-full p-5 rounded-3xl border border-purple-500/30 dark:border-purple-500/25 bg-card/90 dark:bg-card/75 backdrop-blur-xl shadow-sm relative overflow-hidden transition-all duration-300 group-hover:border-purple-500/60 group-hover:shadow-[0_8px_30px_rgba(168,85,247,0.15)] group-hover:-translate-y-1">
          <div className="relative z-10 space-y-3.5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-purple-500/15 dark:bg-purple-500/20 border border-purple-500/30 dark:border-purple-500/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
                    Team OKR Velocity
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-[10px] font-bold text-purple-600 dark:text-purple-400">
                On Schedule
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-black text-purple-600 dark:text-purple-400 font-mono">
                {sprintVelocityPercent}%
              </div>
            </div>

            <div className="pt-2 border-t border-border/70">
              <div className="h-2 w-full rounded-full bg-muted/50 dark:bg-muted/30 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${sprintVelocityPercent}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

// =========================================================================
// 3. HR & PEOPLE OPERATIONS BESPOKE 4 HERO CARDS
// =========================================================================

interface HRHeroMetricsProps {
  totalStaff: number;
  presentStaff: number;
  attendanceRate: number;
  totalHRPending: number;
  stage2Leaves: number;
  stage2Wfhs: number;
  inOfficeStaff: number;
  remoteStaff: number;
  onLeaveStaff: number;
  deptCount: number;
}

export function HRHeroMetrics({
  totalStaff,
  presentStaff,
  attendanceRate,
  totalHRPending,
  inOfficeStaff,
  remoteStaff,
  onLeaveStaff,
}: HRHeroMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. Total Headcount Card */}
      <Link prefetch={true} href="/my-work" className="block group">
        <div className="h-full p-5 rounded-3xl border border-cyan-500/30 dark:border-cyan-500/25 bg-card/90 dark:bg-card/75 backdrop-blur-xl shadow-sm relative overflow-hidden transition-all duration-300 group-hover:border-cyan-500/60 group-hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)] group-hover:-translate-y-1">
          <div className="relative z-10 space-y-3.5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-cyan-500/15 dark:bg-cyan-500/20 border border-cyan-500/30 dark:border-cyan-500/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 block">
                    Enterprise Staff
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-bold text-cyan-600 dark:text-cyan-400">
                Active Roster
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-black text-foreground font-mono">
                {totalStaff} <span className="text-lg text-muted-foreground">Staff</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/70 flex items-center justify-between text-[10px] font-mono">
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">Roster Directory &rarr;</span>
              <span className="text-muted-foreground">0 vacancies</span>
            </div>
          </div>
        </div>
      </Link>

      {/* 2. Present Today Attendance */}
      <Link prefetch={true} href="/attendance" className="block group">
        <div className="h-full p-5 rounded-3xl border border-emerald-500/30 dark:border-emerald-500/25 bg-card/90 dark:bg-card/75 backdrop-blur-xl shadow-sm relative overflow-hidden transition-all duration-300 group-hover:border-emerald-500/60 group-hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)] group-hover:-translate-y-1">
          <div className="relative z-10 space-y-3.5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/30 dark:border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                    Present Today
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                {attendanceRate}% Turnout
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-black text-foreground font-mono">
                {presentStaff} <span className="text-lg text-muted-foreground">/ {totalStaff}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/70">
              <div className="h-2 w-full rounded-full bg-muted/50 dark:bg-muted/30 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${attendanceRate}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* 3. Pending HR Stage-2 Approvals */}
      <Link prefetch={true} href="/leave" className="block group">
        <div className="h-full p-5 rounded-3xl border border-rose-500/30 dark:border-rose-500/25 bg-card/90 dark:bg-card/75 backdrop-blur-xl shadow-sm relative overflow-hidden transition-all duration-300 group-hover:border-rose-500/60 group-hover:shadow-[0_8px_30px_rgba(244,63,94,0.15)] group-hover:-translate-y-1">
          <div className="relative z-10 space-y-3.5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-rose-500/15 dark:bg-rose-500/20 border border-rose-500/30 dark:border-rose-500/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                    HR Stage-2 Queue
                  </span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                totalHRPending > 0
                  ? "bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 animate-pulse"
                  : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              }`}>
                {totalHRPending > 0 ? `${totalHRPending} Pending` : "All Clear"}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">
                {totalHRPending} <span className="text-lg text-foreground font-black">Authorizations</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/70 flex items-center justify-between text-[10px] font-mono">
              <span className="text-rose-600 dark:text-rose-400 font-bold">Governance Desk &rarr;</span>
              <span className="text-muted-foreground">{totalHRPending === 0 ? "Payroll locked" : "Sync required"}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* 4. Shift Mode Distribution */}
      <Link prefetch={true} href="/attendance" className="block group">
        <div className="h-full p-5 rounded-3xl border border-purple-500/30 dark:border-purple-500/25 bg-card/90 dark:bg-card/75 backdrop-blur-xl shadow-sm relative overflow-hidden transition-all duration-300 group-hover:border-purple-500/60 group-hover:shadow-[0_8px_30px_rgba(168,85,247,0.15)] group-hover:-translate-y-1">
          <div className="relative z-10 space-y-3.5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-purple-500/15 dark:bg-purple-500/20 border border-purple-500/30 dark:border-purple-500/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
                    Workplace Split
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-[10px] font-bold text-purple-600 dark:text-purple-400">
                {onLeaveStaff} on Leave
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-black text-purple-600 dark:text-purple-400 font-mono">
                {inOfficeStaff} <span className="text-lg text-muted-foreground font-medium">Office</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/70 flex items-center justify-between text-[10px] font-mono">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{inOfficeStaff} HQ</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">{remoteStaff} WFH</span>
              <span className="text-rose-600 dark:text-rose-400 font-bold">{onLeaveStaff} Leave</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
