"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCurrentUser } from "@/components/layout/UserContext";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { MetricTile3D } from "@/components/3d/MetricTile3D";
import { PageTransition } from "@/components/animations/PageTransition";
import { OrgLiveExecutionMonitor } from "@/features/monitoring/components/OrgLiveExecutionMonitor";
import {
  Clock,
  Calendar,
  ChevronRight,
  FileCheck2,
  AlertOctagon,
  Users,
  Target,
  Sparkles,
  Zap,
  UserCheck,
  Building2,
  Cpu,
  Lock,
  CheckCircle2,
  ShieldCheck,
  Check,
  X,
  ArrowRight,
  ListTodo,
  TrendingUp,
  UserPlus,
} from "lucide-react";

export default function DashboardPage() {
  const user = useCurrentUser();
  const primaryRole = user.primaryRole || user.roles?.[0] || "EMPLOYEE";
  const {
    leaveRequests,
    wfhRequests,
    departments,
    allEmployees,
    hrApproveLeave,
    hrRejectLeave,
  } = useWorkpulseSharedStore();

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // HR checklist state
  const [hrChecklist, setHrChecklist] = useState([
    { id: "chk-1", text: "Execute Stage-2 Leave authorizations for Sprint 34", done: false },
    { id: "chk-2", text: "Audit Bangalore HQ Biometric punch anomalies (Grace: 10:15 AM)", done: true },
    { id: "chk-3", text: "Review 30-Day Probation evaluation for Rohit Sharma with Alex Lead", done: false },
    { id: "chk-4", text: "Broadcast POSH 2026 Annual Compliance reminder notice", done: true },
    { id: "chk-5", text: "Prepare month-end biometric attendance muster roll for Payroll", done: false },
  ]);

  const toggleChecklist = (id: string) => {
    setHrChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const pendingLeaves = leaveRequests.filter((r) => r.status === "FORWARDED_TO_HR");
  const pendingWfhs = wfhRequests.filter((r) => r.status === "FORWARDED_TO_HR");
  const totalPendingStage2 = pendingLeaves.length + pendingWfhs.length;

  const handleQuickApproveLeave = (id: string, name: string) => {
    hrApproveLeave(id, "Authorized from HR Dashboard command desk.");
    setToastMsg(`Stage-2 Leave for ${name} approved and finalized! ✓`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleQuickRejectLeave = (id: string, name: string) => {
    hrRejectLeave(id, "Rejected from HR Dashboard.");
    setToastMsg(`Leave application for ${name} rejected.`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Toast Feedback */}
        {toastMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="font-bold">{toastMsg}</span>
          </div>
        )}

        {/* ============================================================= */}
        {/* 1. ROLE: EMPLOYEE VIEW (CLEAR, SIMPLE & ACTION-FOCUSED)        */}
        {/* ============================================================= */}
        {primaryRole === "EMPLOYEE" && (
          <div className="space-y-6">
            {/* Clean Hero Header */}
            <Interactive3DCard className="p-6 md:p-8 border border-cyan-500/30 bg-gradient-to-r from-card/90 via-card/70 to-cyan-500/10 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <Badge variant="brand" className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-cyan-500/15 border-cyan-500/30 text-cyan-300">
                      <Zap className="h-3 w-3 mr-1 text-cyan-400" />
                      Employee Dashboard
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">
                      {user.userName} · {user.designation}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                    Welcome back,{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-amber-200 to-[var(--brand-primary)]">
                      {user.userName}
                    </span>
                  </h2>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Today: <strong className="text-foreground">Office (HQ)</strong> · Punch In: <strong className="text-cyan-300">10:08 AM</strong> · Morning SOD plan submitted. You have <strong className="text-cyan-300">2 active tasks</strong> scheduled for today.
                  </p>
                </div>

                {/* Primary Direct CTAs */}
                <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
                  <Link
                    href="/my-work"
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-500 to-emerald-500 text-black font-extrabold text-xs flex items-center justify-between gap-2 shadow-[0_4px_20px_rgba(6,182,212,0.25)] hover:opacity-95 transition-all"
                  >
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Today's Work Execution & SOD</span>
                    </span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>

                  <Link
                    href="/goals"
                    className="px-4 py-2 rounded-xl bg-card border border-border/80 text-foreground font-semibold text-xs flex items-center justify-between gap-2 transition-all hover:border-cyan-500/40"
                  >
                    <span className="flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Weekly Goals & OKRs (78%)</span>
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </Link>
                </div>
              </div>

              {/* Reporting Lead & 1-on-1 Notice Bar */}
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-purple-300">
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-purple-400" />
                  <span>
                    Reporting Lead: <strong className="text-foreground">Alex Lead</strong> (Engineering Manager · Platform Pod)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-muted-foreground">Next 1-on-1: Today at 03:30 PM</span>
                  <Link href="/development" className="text-[11px] font-bold text-cyan-400 hover:underline flex items-center gap-0.5">
                    <span>View Notes</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </Interactive3DCard>

            {/* 4 Clean Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricTile3D
                title="Today's Attendance"
                value="Office (HQ)"
                subtitle="Biometric punch logged at 10:08 AM"
                icon={Clock}
                change="10:00 AM – 07:00 PM"
                changePositive={true}
                badgeText="Verified"
                accent="cyan"
              />

              <MetricTile3D
                title="Workday State"
                value="SOD Active (80%)"
                subtitle="1 of 2 tasks completed"
                icon={Sparkles}
                change="In Execution"
                changePositive={true}
                badgeText="Active"
                accent="gold"
              />

              <MetricTile3D
                title="Weekly Goals"
                value="78% Progress"
                subtitle="3 Sprint OKRs allocated"
                icon={Target}
                change="+12% this week"
                changePositive={true}
                badgeText="On Track"
                accent="emerald"
              />

              <MetricTile3D
                title="Leave Balance"
                value="11.0 Days"
                subtitle="Casual & Sick leaves available"
                icon={Calendar}
                change="Policy Verified"
                changePositive={true}
                badgeText="Available"
                accent="rose"
              />
            </div>

            {/* Clean Section: Today's Tasks & Execution Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Today's Planned Deliverables */}
              <div className="lg:col-span-2 space-y-4">
                <Interactive3DCard className="p-6 border border-border/80 space-y-4 bg-card/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ListTodo className="h-4 w-4 text-cyan-400" />
                      <h3 className="text-sm font-bold text-foreground">Today's Scheduled Deliverables</h3>
                    </div>
                    <Link href="/my-work" className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1">
                      <span>Full SOD Editor</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-card border border-border/80 hover:border-cyan-500/40 transition-all space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <strong className="text-foreground text-xs block">
                            Implement dedicated SOD Carryover section with rolled-over task pile-up
                          </strong>
                          <span className="text-[11px] text-muted-foreground">Project: Frontend & UI · Estimated: 180 mins</span>
                        </div>
                        <Badge variant="brand" className="text-[9px] bg-cyan-500/15 text-cyan-300 border-cyan-500/30">
                          80% Done
                        </Badge>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 w-[80%]" />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-card border border-border/80 hover:border-cyan-500/40 transition-all space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <strong className="text-foreground text-xs block">
                            Conduct technical code review on Stage-2 Leave & HR approval PRs
                          </strong>
                          <span className="text-[11px] text-muted-foreground">Project: Core Platform · Estimated: 90 mins</span>
                        </div>
                        <Badge variant="brand" className="text-[9px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                          Completed ✓
                        </Badge>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-emerald-400 w-full" />
                      </div>
                    </div>
                  </div>
                </Interactive3DCard>
              </div>

              {/* Right Col: Quick Cultural & Wellbeing Shortcuts */}
              <div className="space-y-4">
                <Interactive3DCard className="p-6 border border-pink-500/20 bg-pink-500/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-pink-400" />
                      <h4 className="text-xs font-bold text-foreground">Culture & Celebrations</h4>
                    </div>
                    <Badge variant="brand" className="text-[9px] bg-pink-500/20 text-pink-300 border-pink-500/30">
                      Live
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Check out today's employee birthdays and upcoming cultural festivals with 3D greeting cards and company broadcasts.
                  </p>

                  <Link href="/hr" className="block pt-1">
                    <Button size="sm" variant="brand" className="w-full text-xs font-bold bg-pink-500 hover:bg-pink-600 text-white h-8">
                      Open Celebrations Hub 🎉
                    </Button>
                  </Link>
                </Interactive3DCard>

                <Interactive3DCard className="p-6 border border-border/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Shift Adherence</span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">100% On-Time</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Shift: 10:00 AM – 07:00 PM (Grace: 10:15 AM). Your biometric punch was verified on Floor 0.
                  </p>
                </Interactive3DCard>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* 2. ROLE: TEAM LEAD / MANAGER VIEW (SIMPLE & POD-CENTRIC)       */}
        {/* ============================================================= */}
        {primaryRole === "MANAGER" && (
          <div className="space-y-6">
            <Interactive3DCard className="p-6 md:p-8 border border-purple-500/30 bg-gradient-to-r from-card/90 via-card/70 to-purple-500/10 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <Badge variant="brand" className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-500/15 border-purple-500/30 text-purple-300">
                      <Users className="h-3 w-3 mr-1 text-purple-400" />
                      Team Lead Dashboard
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">Platform Pod · 6 Direct Reports</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                    Pod Execution & Delivery Health
                  </h2>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Pod delivery velocity is <strong className="text-emerald-400">98.4%</strong>. All 6 direct reports have submitted their morning SOD plan. 2 weekly reviews require sign-off.
                  </p>
                </div>

                <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
                  <Link
                    href="/team"
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-between gap-2 shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:opacity-95 transition-all"
                  >
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      <span>Team Management Hub</span>
                    </span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>

                  <Link
                    href="/team"
                    className="px-4 py-2 rounded-xl bg-card border border-border/80 text-foreground font-semibold text-xs flex items-center justify-between gap-2 transition-all hover:border-purple-500/40"
                  >
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-purple-400" />
                      <span>SOD & EOD Inspector</span>
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </Link>

                  <Link
                    href="/reviews"
                    className="px-4 py-2 rounded-xl bg-card border border-border/80 text-foreground font-semibold text-xs flex items-center justify-between gap-2 transition-all hover:border-cyan-500/40"
                  >
                    <span className="flex items-center gap-1.5">
                      <FileCheck2 className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Appraisal Reviews</span>
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </Link>
                </div>
              </div>
            </Interactive3DCard>

            {/* 4 Clean Metric Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricTile3D
                title="Direct Reports Roster"
                value={`${allEmployees.length} Members`}
                subtitle="Live pod management roster"
                icon={Users}
                change="Active Pod"
                changePositive={true}
                badgeText="Managed"
                accent="cyan"
              />

              <MetricTile3D
                title="Pod Presence"
                value={`${allEmployees.filter((e) => e.workMode !== "WFH").length} HQ · ${allEmployees.filter((e) => e.workMode === "WFH").length} WFH`}
                subtitle="Zero unexcused absences"
                icon={Users}
                change="Full Pod"
                changePositive={true}
                badgeText="Present"
                accent="emerald"
              />

              <MetricTile3D
                title="Stage 1 Leaves"
                value={`${leaveRequests.filter((r) => r.status === "PENDING_TL_STAGE_1").length} Pending`}
                subtitle="Pod leave requests to review"
                icon={Calendar}
                change={leaveRequests.filter((r) => r.status === "PENDING_TL_STAGE_1").length > 0 ? "Review Req" : "All Clear"}
                changePositive={leaveRequests.filter((r) => r.status === "PENDING_TL_STAGE_1").length === 0}
                badgeText={`Queue: ${leaveRequests.filter((r) => r.status === "PENDING_TL_STAGE_1").length}`}
                accent="purple"
              />

              <MetricTile3D
                title="Active Blockers"
                value="0 Open"
                subtitle="Zero SLA impediments in sprint"
                icon={AlertOctagon}
                change="SLA Clean"
                changePositive={true}
                badgeText="Safe"
                accent="gold"
              />
            </div>

            {/* Direct Reports Execution Table */}
            <Interactive3DCard className="p-6 border border-border/80 space-y-4 bg-card/60">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                  Direct Reports Team Execution Pulse
                </h3>
                <Link href="/team" className="text-xs font-bold text-indigo-400 hover:underline flex items-center gap-1">
                  <span>Open Full Team Management</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {(allEmployees.length > 0 ? allEmployees.slice(0, 6) : [
                  { id: "1", name: "Sara Dev", designation: "Sr. Backend Engineer", workMode: "OFFICE" as const, overallProgress: 80, sodStatus: "SUBMITTED" },
                  { id: "2", name: "Rohit Sharma", designation: "Frontend UI/UX", workMode: "OFFICE" as const, overallProgress: 65, sodStatus: "SUBMITTED" },
                  { id: "3", name: "Priya QA", designation: "QA & Automation Lead", workMode: "WFH" as const, overallProgress: 95, sodStatus: "SUBMITTED" },
                ]).map((member) => (
                  <div key={member.id} className="p-3.5 rounded-xl bg-card border border-border/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-foreground text-xs">{member.name}</strong>
                      <Badge variant="outline" className="text-[9px] text-purple-300 border-purple-500/30">
                        {member.workMode || "OFFICE"}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-muted-foreground block truncate">{member.designation}</span>
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">{member.sodStatus || "SOD Active"}</span>
                        <strong className="text-emerald-400 font-mono">{member.overallProgress || 75}%</strong>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-400 to-cyan-400" style={{ width: `${member.overallProgress || 75}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Interactive3DCard>
          </div>
        )}

        {/* ============================================================= */}
        {/* 3. ROLE: HR / PEOPLE OPERATIONS VIEW (STREAMLINED & CLEAR)     */}
        {/* ============================================================= */}
        {primaryRole === "HR" && (
          <div className="space-y-6">
            <Interactive3DCard className="p-6 md:p-8 border border-pink-500/30 bg-gradient-to-r from-card/90 via-card/70 to-pink-500/10 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <Badge variant="brand" className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-pink-500/15 border-pink-500/30 text-pink-300">
                      <Building2 className="h-3 w-3 mr-1 text-pink-400" />
                      HR & People Operations Hub
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">
                      Rachel HR · Oversight Across 6 Departments
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                    People Operations Command Desk
                  </h2>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Headcount census: <strong className="text-foreground">19 Staff</strong>. Shift adherence: <strong className="text-emerald-400">98.2%</strong>. Stage-2 leave authorizations and cultural broadcasts active.
                  </p>
                </div>

                <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
                  <Link
                    href="/hr"
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-extrabold text-xs flex items-center justify-between gap-2 shadow-[0_4px_20px_rgba(244,63,94,0.25)] hover:opacity-95 transition-all"
                  >
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>Open HR Command Center</span>
                    </span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>

                  <Link
                    href="/hr"
                    className="px-4 py-2 rounded-xl bg-card border border-border/80 text-foreground font-semibold text-xs flex items-center justify-between gap-2 transition-all hover:border-pink-500/40"
                  >
                    <span className="flex items-center gap-1.5">
                      <UserPlus className="h-3.5 w-3.5 text-pink-400" />
                      <span>Onboard Staff & Directory (CRUD)</span>
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </Link>

                  <Link
                    href="/attendance"
                    className="px-4 py-2 rounded-xl bg-card border border-border/80 text-foreground font-semibold text-xs flex items-center justify-between gap-2 transition-all hover:border-cyan-500/40"
                  >
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Biometrics & Shift Roster</span>
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </Link>
                </div>
              </div>
            </Interactive3DCard>

            {/* 4 Clean Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricTile3D
                title="Active Headcount"
                value={`${departments.reduce((acc, d) => acc + d.employees.length + 1, 0)} Staff`}
                subtitle="6 functional departments"
                icon={Users}
                change="Full Roster"
                changePositive={true}
                badgeText="Active Org"
                accent="cyan"
              />

              <MetricTile3D
                title="Stage-2 Queue"
                value={`${totalPendingStage2} Pending`}
                subtitle="Lead-approved leaves & WFH"
                icon={Calendar}
                change={totalPendingStage2 > 0 ? "Action Required" : "All Reviewed"}
                changePositive={totalPendingStage2 === 0}
                badgeText={`Queue: ${totalPendingStage2}`}
                accent="rose"
              />

              <MetricTile3D
                title="Probation Checkpoints"
                value="3 In Pipeline"
                subtitle="30/60/90 day reviews active"
                icon={UserCheck}
                change="2 Ready"
                changePositive={true}
                badgeText="Pipeline"
                accent="purple"
              />

              <MetricTile3D
                title="Shift Punctuality"
                value="98.2%"
                subtitle="10:00 AM – 07:00 PM shift"
                icon={Clock}
                change="Grace: 10:15 AM"
                changePositive={true}
                badgeText="Grade A"
                accent="emerald"
              />
            </div>

            {/* 2-Column Action Desk */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Stage-2 Leaves Quick Actions */}
              <div className="lg:col-span-2 space-y-4">
                <Interactive3DCard className="p-6 border border-pink-500/30 space-y-4 bg-card/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-pink-400" />
                        Stage-2 Leave & WFH Authorization Queue
                      </h3>
                      <p className="text-xs text-muted-foreground">Applications approved by Team Leads requiring final HR authorization.</p>
                    </div>
                    <Link href="/leave" className="text-xs font-bold text-pink-400 hover:underline flex items-center gap-1">
                      <span>View All</span>
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>

                  {pendingLeaves.length === 0 ? (
                    <div className="p-6 text-center bg-card/40 rounded-xl border border-border/60 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-1" />
                      <span>All Stage-2 leave applications are processed and cleared.</span>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {pendingLeaves.map((req) => {
                        const matchedEmp = allEmployees.find(
                          (e) => e.id === req.employeeId || (req.employeeId === "emp-sarah" && (e.id === "emp-sarah" || e.name.toLowerCase().includes("sara")))
                        );
                        const employeeName = matchedEmp ? matchedEmp.name : req.employeeName;
                        const departmentName = matchedEmp ? matchedEmp.departmentName : req.departmentName;

                        return (
                          <div
                            key={req.id}
                            className="p-3.5 rounded-xl bg-card border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <strong className="text-foreground">{employeeName}</strong>
                                <span className="text-[11px] text-muted-foreground">({departmentName})</span>
                                <Badge variant="outline" className="text-[9px] text-pink-300 border-pink-500/30">
                                  {req.leaveType} ({req.daysCount}d)
                                </Badge>
                              </div>
                              <span className="text-[11px] text-muted-foreground block">
                                Date: {req.startDate} · Reason: "{req.reason}"
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <Button
                                size="sm"
                                variant="brand"
                                onClick={() => handleQuickApproveLeave(req.id, employeeName)}
                                className="text-xs font-bold h-7 px-3 bg-pink-500 hover:bg-pink-600 text-white gap-1"
                              >
                                <Check className="h-3 w-3" />
                                <span>Authorize</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuickRejectLeave(req.id, employeeName)}
                                className="text-xs font-bold h-7 px-2.5 border-rose-500/40 text-rose-400 hover:bg-rose-500/10 gap-1"
                              >
                                <X className="h-3 w-3" />
                                <span>Reject</span>
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Interactive3DCard>

                {/* 6 Department Shift Presence Overview */}
                <Interactive3DCard className="p-6 border border-border/80 space-y-3 bg-card/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Department Presence Summary</span>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">100% In Attendance</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    {departments.map((d) => (
                      <div key={d.id} className="p-2.5 rounded-xl bg-card border border-border/60 flex items-center justify-between">
                        <span className="font-bold text-foreground">{d.shortName}</span>
                        <span className="text-[10px] text-muted-foreground">{d.employees.length + 1} Staff</span>
                      </div>
                    ))}
                  </div>
                </Interactive3DCard>
              </div>

              {/* Right Col: HR Operations Checklist */}
              <div className="space-y-4">
                <Interactive3DCard className="p-6 border border-border/80 space-y-4 bg-card/60">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      Daily HR Operations Checklist
                    </h3>
                    <Badge variant="outline" className="text-[10px] text-cyan-300 border-cyan-500/30">
                      {hrChecklist.filter((c) => c.done).length} / {hrChecklist.length}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-xs">
                    {hrChecklist.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleChecklist(item.id)}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                          item.done
                            ? "bg-muted/30 border-border/50 text-muted-foreground line-through"
                            : "bg-card border-border hover:border-pink-500/40 text-foreground"
                        }`}
                      >
                        <div
                          className={`h-4 w-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                            item.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-border bg-background"
                          }`}
                        >
                          {item.done && <Check className="h-3 w-3" />}
                        </div>
                        <span className="leading-snug">{item.text}</span>
                      </button>
                    ))}
                  </div>
                </Interactive3DCard>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* 4. ROLE: ADMIN VIEW (CLEAN & SECURITY-FOCUSED)                 */}
        {/* ============================================================= */}
        {primaryRole === "ADMIN" && (
          <div className="space-y-6">
            <Interactive3DCard className="p-6 md:p-8 border border-red-500/30 bg-gradient-to-r from-card/90 via-card/70 to-red-500/10 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-500/15 border-red-500/30 text-red-300">
                      <Lock className="h-3 w-3 mr-1 text-red-400" />
                      Root Security & System Vault
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">Hardware · HMAC · Zero Raw Biometrics</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                    System Administration Console
                  </h2>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    2 biometric hardware terminals online. Zero security breaches detected. Audit telemetry encrypted and active.
                  </p>
                </div>

                <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
                  <Link
                    href="/admin"
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-extrabold text-xs flex items-center justify-between gap-2 shadow-[0_4px_20px_rgba(239,68,68,0.25)] hover:opacity-95 transition-all"
                  >
                    <span className="flex items-center gap-1.5">
                      <Cpu className="h-3.5 w-3.5" />
                      <span>Open Hardware Vault</span>
                    </span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </Interactive3DCard>

            {/* 4 Clean Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricTile3D
                title="Hardware Terminals"
                value="2 Online"
                subtitle="HQ Floor 0 & Floor 3"
                icon={Cpu}
                change="Heartbeat Active"
                changePositive={true}
                badgeText="Verified"
                accent="cyan"
              />

              <MetricTile3D
                title="Quarantine Buffer"
                value="1 Pending"
                subtitle="Unmapped biometric event"
                icon={AlertOctagon}
                change="Action Req"
                changePositive={false}
                badgeText="Action Req"
                accent="rose"
              />

              <MetricTile3D
                title="HMAC Security"
                value="SHA-256 Valid"
                subtitle="Zero replay tampering"
                icon={Lock}
                change="Secure"
                changePositive={true}
                badgeText="Verified"
                accent="emerald"
              />

              <MetricTile3D
                title="Audit Vault Logs"
                value="1,240 Events"
                subtitle="Tamper-evident logs"
                icon={FileCheck2}
                change="Encrypted"
                changePositive={true}
                badgeText="Verified"
                accent="purple"
              />
            </div>

            <div className="mt-6">
              <OrgLiveExecutionMonitor />
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
