"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useCurrentUser } from "@/components/layout/UserContext";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { MetricTile3D } from "@/components/3d/MetricTile3D";
import { PageTransition } from "@/components/animations/PageTransition";
import { fireCelebrationConfetti } from "@/lib/ui/confetti";
import {
  Clock,
  Calendar,
  Users,
  Target,
  CheckCircle2,
  Check,
  X,
  ListTodo,
  ArrowRight,
  UserCheck,
  Sun,
  PartyPopper,
} from "lucide-react";

export default function DashboardPage() {
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

  const {
    leaveRequests,
    allEmployees,
    departments,
    hrApproveLeave,
    hrRejectLeave,
  } = useWorkpulseSharedStore();

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const pendingLeaves = leaveRequests.filter(
    (r) => r.status.includes("PENDING") || r.status === "FORWARDED_TO_HR"
  );

  const cleanPodMembers = useMemo(() => {
    return [
      {
        id: "emp-sarah",
        name: "Sarah Dev",
        designation: "Senior Backend Engineer",
        avatar: "SD",
        avatarBg: "bg-gradient-to-tr from-purple-500 to-pink-500 text-white",
        workMode: "Office",
        status: "Plan Approved",
        progress: 90,
      },
      {
        id: "emp-rohit",
        name: "Rohit Sharma",
        designation: "Frontend Engineer",
        avatar: "RS",
        avatarBg: "bg-gradient-to-tr from-cyan-500 to-blue-600 text-white",
        workMode: "Office",
        status: "Plan Approved",
        progress: 85,
      },
      {
        id: "emp-priya",
        name: "Priya Patel",
        designation: "QA & Test Lead",
        avatar: "PP",
        avatarBg: "bg-gradient-to-tr from-amber-500 to-orange-500 text-white",
        workMode: "Remote (WFH)",
        status: "Plan Pending",
        progress: 75,
      },
      {
        id: "emp-arjun",
        name: "Arjun Kumar",
        designation: "Fullstack Developer",
        avatar: "AK",
        avatarBg: "bg-gradient-to-tr from-emerald-500 to-teal-500 text-white",
        workMode: "Office",
        status: "Plan Pending",
        progress: 70,
      },
    ];
  }, []);

  const handleQuickApprove = (id: string, name: string) => {
    hrApproveLeave(id, "Approved from Dashboard");
    fireCelebrationConfetti();
    setToastMsg(`✓ Leave request for ${name} authorized and balance updated.`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleQuickReject = (id: string, name: string) => {
    hrRejectLeave(id, "Rejected from Dashboard");
    setToastMsg(`Leave request for ${name} declined.`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Toast Feedback */}
        {toastMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="font-semibold">{toastMsg}</span>
          </div>
        )}

        {/* 1. Header Banner */}
        <Interactive3DCard className="p-6 border border-border/80 bg-gradient-to-r from-card/90 via-card/70 to-card/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant={isHR ? "brand" : isLead ? "secondary" : "brand"}
                  className={`text-[10px] uppercase font-bold ${
                    isHR ? "bg-pink-500/15 border-pink-500/30 text-pink-300" : ""
                  }`}
                >
                  {isHR
                    ? "HR & People Operations"
                    : isLead
                    ? "Team Lead Workspace"
                    : "Member Workspace"}
                </Badge>
                {isHR ? (
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {departments.length || 6} Departments · {allEmployees.length || 19} Employees
                  </span>
                ) : isLead ? (
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Development Pod · 4 Direct Reports
                  </span>
                ) : null}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Welcome back, {user.userName}
              </h2>

              <p className="text-xs sm:text-sm text-muted-foreground">
                {isHR
                  ? "Here is your organization summary, today's attendance, and pending employee requests."
                  : isLead
                  ? "Here is your pod's attendance, daily updates, and pending leave requests."
                  : "Here is your workday summary and priorities for today."}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isHR ? (
                <>
                  <Link href="/leave">
                    <Button size="sm" variant="outline" className="text-xs font-semibold gap-1.5 h-9">
                      <Calendar className="h-4 w-4 text-pink-400" />
                      <span>Leave Oversight</span>
                    </Button>
                  </Link>
                  <Link href="/my-work">
                    <Button size="sm" variant="brand" className="text-xs font-bold gap-1.5 h-9 bg-pink-600 hover:bg-pink-700 text-white shadow-sm">
                      <Users className="h-4 w-4" />
                      <span>Employee Roster</span>
                    </Button>
                  </Link>
                </>
              ) : isLead ? (
                <Link href="/my-work">
                  <Button size="sm" variant="brand" className="text-xs font-bold gap-1.5 h-9 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                    <ListTodo className="h-4 w-4" />
                    <span>View Team Updates</span>
                  </Button>
                </Link>
              ) : (
                <Link href="/my-work">
                  <Button size="sm" variant="brand" className="text-xs font-bold gap-1.5 h-9">
                    <ListTodo className="h-4 w-4" />
                    <span>My Tasks</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Interactive3DCard>

        {/* 2. Top Summary Metric Cards */}
        {isHR ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricTile3D
              title="Total Headcount"
              value={`${allEmployees.length || 19} Staff`}
              subtitle={`Across ${departments.length || 6} departments`}
              icon={Users}
              badgeText="Active"
              accent="cyan"
            />
            <MetricTile3D
              title="Present Today"
              value="18 / 19"
              subtitle="95% Attendance rate"
              icon={UserCheck}
              badgeText="Normal"
              accent="emerald"
            />
            <MetricTile3D
              title="Pending Approvals"
              value={`${pendingLeaves.length} Requests`}
              subtitle="Leave & WFH applications"
              icon={Calendar}
              badgeText={pendingLeaves.length > 0 ? "Action Required" : "All Clear"}
              accent="rose"
            />
            <MetricTile3D
              title="Celebrations"
              value="1 Birthday"
              subtitle="Sara Dev today 🎉"
              icon={PartyPopper}
              badgeText="Celebrate"
              accent="gold"
            />
          </div>
        ) : isLead ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricTile3D
              title="Team Attendance"
              value="4 / 4 Present"
              subtitle="All direct reports on duty"
              icon={UserCheck}
              badgeText="100% Present"
              accent="emerald"
            />
            <MetricTile3D
              title="Morning Plans"
              value="4 / 4 Shared"
              subtitle="All morning plans sent"
              icon={Sun}
              badgeText="Up to date"
              accent="cyan"
            />
            <MetricTile3D
              title="Leave Requests"
              value={pendingLeaves.length > 0 ? `${pendingLeaves.length} Pending` : "0 Pending"}
              subtitle="Needs your approval"
              icon={Calendar}
              badgeText={pendingLeaves.length > 0 ? "Action Required" : "All Clear"}
              accent="rose"
            />
            <MetricTile3D
              title="Sprint Goals"
              value="85%"
              subtitle="Pod milestones on track"
              icon={Target}
              badgeText="On Track"
              accent="purple"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricTile3D
              title="Today's Attendance"
              value="Present"
              subtitle="Clocked in at 10:08 AM"
              icon={Clock}
              badgeText="Verified"
              accent="cyan"
            />
            <MetricTile3D
              title="My Tasks"
              value="2 Tasks"
              subtitle="1 in progress · 1 done"
              icon={ListTodo}
              badgeText="Active"
              accent="gold"
            />
            <MetricTile3D
              title="Sprint Goals"
              value="78%"
              subtitle="Milestones on track"
              icon={Target}
              badgeText="On Track"
              accent="emerald"
            />
            <MetricTile3D
              title="Leave Balance"
              value="11 Days"
              subtitle="Available time off"
              icon={Calendar}
              badgeText="Available"
              accent="rose"
            />
          </div>
        )}

        {/* 3. Differentiated Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isHR ? (
            <>
              {/* HR Left Section: Pending Leave Approvals (Clean, 1-Click Authorize) */}
              <div className="p-5 rounded-2xl border border-rose-500/30 bg-gradient-to-b from-rose-500/[0.04] to-card space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">
                      Pending Leave &amp; WFH Requests
                    </h3>
                  </div>
                  <Link href="/leave" className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 hover:underline">
                    <span>Leave Desk</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {pendingLeaves.length === 0 ? (
                  <div className="p-8 text-center bg-background/50 rounded-xl border border-border/50 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-1.5" />
                    <span>All clear! No employee leave requests waiting for HR.</span>
                  </div>
                ) : (
                  <div className="space-y-2.5 text-xs">
                    {pendingLeaves.slice(0, 4).map((req) => (
                      <div
                        key={req.id}
                        className="p-3.5 rounded-xl bg-background/80 border border-rose-500/20 flex items-center justify-between gap-3 shadow-sm hover:border-rose-500/40 transition-all"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <strong className="text-foreground text-xs block truncate">
                              {req.employeeName}
                            </strong>
                            <Badge variant="outline" className="text-[9px] text-pink-300 border-pink-500/30 bg-pink-500/10">
                              {req.leaveType}
                            </Badge>
                          </div>
                          <span className="text-[11px] text-muted-foreground block">
                            {req.daysCount} Day(s) · {req.startDate} {req.endDate && req.endDate !== req.startDate ? `to ${req.endDate}` : ""}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            size="sm"
                            variant="brand"
                            onClick={() => handleQuickApprove(req.id, req.employeeName)}
                            className="text-xs font-bold h-7 px-3 bg-pink-600 hover:bg-pink-700 text-white gap-1 shadow-sm"
                          >
                            <Check className="h-3 w-3" />
                            <span>Authorize</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuickReject(req.id, req.employeeName)}
                            className="text-xs font-semibold h-7 px-2 border-border text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* HR Right Section: Today's Presence & Quick Insights (Clean & Friendly) */}
              <div className="p-5 rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-500/[0.04] to-card space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400">
                      <UserCheck className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">
                      Today&apos;s Workplace Presence
                    </h3>
                  </div>
                  <Link href="/attendance" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline">
                    <span>Attendance Logs</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                  <div className="p-3 rounded-xl bg-background/80 border border-emerald-500/20 space-y-1">
                    <span className="text-[11px] text-muted-foreground block">In Office</span>
                    <strong className="text-lg font-bold text-emerald-400">16 Staff</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-background/80 border border-cyan-500/20 space-y-1">
                    <span className="text-[11px] text-muted-foreground block">Remote (WFH)</span>
                    <strong className="text-lg font-bold text-cyan-400">2 Staff</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-background/80 border border-amber-500/20 space-y-1">
                    <span className="text-[11px] text-muted-foreground block">On Leave</span>
                    <strong className="text-lg font-bold text-amber-400">1 Staff</strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-background/80 border border-border/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <PartyPopper className="h-4 w-4 text-amber-400 shrink-0" />
                    <span className="text-foreground">Today: <strong>Sara Dev&apos;s Birthday</strong></span>
                  </div>
                  <Link href="/announcements" className="text-xs font-semibold text-pink-400 hover:underline">
                    Send Wish 🎉
                  </Link>
                </div>
              </div>
            </>
          ) : isLead ? (
            <>
              {/* Left Section: Development Pod Members (Themed in Indigo/Cyan) */}
              <div className="p-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-500/[0.04] to-card space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400">
                      <Users className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">
                      Development Pod Members
                    </h3>
                  </div>
                  <Link href="/my-work" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline">
                    <span>Review Plans</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="space-y-2.5 text-xs">
                  {cleanPodMembers.map((member) => (
                    <div
                      key={member.id}
                      className="p-3 rounded-xl bg-background/80 border border-indigo-500/15 flex items-center justify-between gap-3 hover:border-indigo-500/40 transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`h-8 w-8 rounded-full ${member.avatarBg} flex items-center justify-center font-bold text-xs shrink-0 shadow-sm`}>
                          {member.avatar}
                        </div>
                        <div className="min-w-0">
                          <strong className="text-foreground text-xs block truncate">{member.name}</strong>
                          <span className="text-[11px] text-muted-foreground">{member.designation}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-[10px]">
                          {member.workMode}
                        </Badge>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            member.status === "Plan Approved"
                              ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                              : "text-amber-300 border-amber-500/30 bg-amber-500/10"
                          }`}
                        >
                          {member.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Section: Pending Leave & WFH Requests (Themed in Rose/Amber) */}
              <div className="p-5 rounded-2xl border border-rose-500/30 bg-gradient-to-b from-rose-500/[0.04] to-card space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">
                      Pending Leave &amp; WFH Requests
                    </h3>
                  </div>
                  <Link href="/leave" className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 hover:underline">
                    <span>All Requests</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {pendingLeaves.length === 0 ? (
                  <div className="p-8 text-center bg-background/50 rounded-xl border border-border/50 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-1.5" />
                    <span>All caught up! No pending leave requests.</span>
                  </div>
                ) : (
                  <div className="space-y-2.5 text-xs">
                    {pendingLeaves.slice(0, 4).map((req) => (
                      <div
                        key={req.id}
                        className="p-3 rounded-xl bg-background/80 border border-rose-500/15 flex items-center justify-between gap-3 shadow-sm"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <strong className="text-foreground text-xs block truncate">
                            {req.employeeName}
                          </strong>
                          <span className="text-[11px] text-muted-foreground">
                            {req.leaveType} · {req.daysCount} day(s) · {req.startDate}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            size="sm"
                            variant="brand"
                            onClick={() => handleQuickApprove(req.id, req.employeeName)}
                            className="text-xs font-bold h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white gap-1 shadow-sm"
                          >
                            <Check className="h-3 w-3" />
                            <span>Approve</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuickReject(req.id, req.employeeName)}
                            className="text-xs font-semibold h-7 px-2 border-border text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Employee Left Section: Today's Tasks (Themed in Cyan/Blue) */}
              <div className="p-5 rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-500/[0.04] to-card space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400">
                      <ListTodo className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">Today&apos;s Work &amp; Tasks</h3>
                  </div>
                  <Link href="/my-work" className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1">
                    <span>Manage</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-background/80 border border-cyan-500/15 flex items-center justify-between gap-2 shadow-sm">
                    <span className="text-foreground font-medium">Implement Task Carryover Workflow</span>
                    <Badge variant="brand" className="text-[10px]">In Progress (80%)</Badge>
                  </div>
                  <div className="p-3 rounded-xl bg-background/80 border border-cyan-500/15 flex items-center justify-between gap-2 shadow-sm">
                    <span className="text-foreground font-medium">Review Weekly Deliverables &amp; Goals</span>
                    <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">Completed</Badge>
                  </div>
                </div>
              </div>

              {/* Employee Right Section: Leave & Attendance Summary (Themed in Teal/Emerald) */}
              <div className="p-5 rounded-2xl border border-teal-500/30 bg-gradient-to-b from-teal-500/[0.04] to-card space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-teal-500/15 text-teal-400">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">Leave &amp; Time Off</h3>
                  </div>
                  <Link href="/leave" className="text-xs font-semibold text-teal-400 hover:underline flex items-center gap-1">
                    <span>Request Leave</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="p-4 rounded-xl bg-background/80 border border-teal-500/15 space-y-2 text-xs shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Available Balance:</span>
                    <strong className="text-teal-300 font-mono font-bold text-sm">11 Days</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Manager / Lead Approver:</span>
                    <span className="text-foreground font-medium">Alex Lead</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 4. Differentiated Goals & OKRs Section */}
        {isHR && (
          <div className="p-5 rounded-2xl border border-pink-500/30 bg-gradient-to-b from-pink-500/[0.04] to-card space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-pink-500/15 text-pink-400">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Organization Strategic OKRs &amp; Department Alignment
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Company-wide strategic performance targets and departmental alignment health.
                  </p>
                </div>
              </div>
              <Link
                href="/goals"
                className="text-xs font-semibold text-pink-400 hover:text-pink-300 flex items-center gap-1 hover:underline shrink-0"
              >
                <span>Full Strategic OKRs</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-background/80 border border-emerald-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground truncate">
                    Talent Acquisition Turnaround
                  </span>
                  <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30">
                    Exceeded
                  </Badge>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-muted-foreground">Time-to-Hire: 18.5 Days</span>
                  <strong className="text-emerald-400 font-bold">92%</strong>
                </div>
                <div className="progress-track-line">
                  <div className="progress-track-fill-emerald" style={{ width: "92%" }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-background/80 border border-cyan-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground truncate">
                    Shift Punctuality Adherence
                  </span>
                  <Badge variant="outline" className="text-[9px] text-cyan-300 border-cyan-500/30">
                    On Track
                  </Badge>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-muted-foreground">Within Grace: 98.2%</span>
                  <strong className="text-cyan-400 font-bold">98%</strong>
                </div>
                <div className="progress-track-line">
                  <div className="progress-track-fill-cyan" style={{ width: "98%" }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-background/80 border border-purple-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground truncate">
                    Culture &amp; eNPS Retention
                  </span>
                  <Badge variant="outline" className="text-[9px] text-purple-300 border-purple-500/30">
                    88 Score
                  </Badge>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-muted-foreground">High Satisfaction</span>
                  <strong className="text-purple-400 font-bold">94%</strong>
                </div>
                <div className="progress-track-line">
                  <div className="progress-track-fill-purple" style={{ width: "94%" }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {isLead && (
          <div className="p-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-500/[0.04] to-card space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Pod Sprint 34 Goals &amp; Member OKRs
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Active deliverables and key result progress for Development Pod direct reports.
                  </p>
                </div>
              </div>
              <Link
                href="/goals"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline shrink-0"
              >
                <span>Manage Pod OKRs</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-background/80 border border-indigo-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground truncate">
                    Core Platform &amp; Role Isolation
                  </span>
                  <Badge variant="outline" className="text-[9px] text-indigo-300 border-indigo-500/30">
                    80% Done
                  </Badge>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-muted-foreground">Lead: Alex Lead</span>
                  <strong className="text-indigo-400 font-bold">Sprint 34</strong>
                </div>
                <div className="progress-track-line">
                  <div className="progress-track-fill-indigo" style={{ width: "80%" }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-background/80 border border-cyan-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground truncate">
                    Sarah Dev: Task Carryover State
                  </span>
                  <Badge variant="outline" className="text-[9px] text-cyan-300 border-cyan-500/30">
                    On Track
                  </Badge>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-muted-foreground">Backend Lead Goal</span>
                  <strong className="text-cyan-400 font-bold">80%</strong>
                </div>
                <div className="progress-track-line">
                  <div className="progress-track-fill-cyan" style={{ width: "80%" }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-background/80 border border-emerald-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground truncate">
                    Priya Patel: Auth Permission Matrix
                  </span>
                  <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30">
                    Completed
                  </Badge>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-muted-foreground">QA Matrix Signed Off</span>
                  <strong className="text-emerald-400 font-bold">100%</strong>
                </div>
                <div className="progress-track-line">
                  <div className="progress-track-fill-emerald" style={{ width: "100%" }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {!isHR && !isLead && (
          <div className="p-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/[0.04] to-card space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    My Goals &amp; Quarterly Key Results
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Personal performance targets, skill milestones, and quarterly objectives.
                  </p>
                </div>
              </div>
              <Link
                href="/goals"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline shrink-0"
              >
                <span>View &amp; Update Goals</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-background/80 border border-emerald-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground truncate">
                    Customer Inquiry Response Speed
                  </span>
                  <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30">
                    75% Done
                  </Badge>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-muted-foreground">Target: Under 2 Hours</span>
                  <strong className="text-emerald-400 font-bold">75%</strong>
                </div>
                <div className="progress-track-line">
                  <div className="progress-track-fill-emerald" style={{ width: "75%" }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-background/80 border border-cyan-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground truncate">
                    Quarterly Training Program
                  </span>
                  <Badge variant="outline" className="text-[9px] text-cyan-300 border-cyan-500/30">
                    In Progress
                  </Badge>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-muted-foreground">Modules: 3 of 4 Done</span>
                  <strong className="text-cyan-400 font-bold">60%</strong>
                </div>
                <div className="progress-track-line">
                  <div className="progress-track-fill-cyan" style={{ width: "60%" }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-background/80 border border-teal-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground truncate">
                    Monthly Invoice Processing
                  </span>
                  <Badge variant="outline" className="text-[9px] text-teal-300 border-teal-500/30">
                    Completed
                  </Badge>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-muted-foreground">Turnaround: 1 Day</span>
                  <strong className="text-teal-300 font-bold">100%</strong>
                </div>
                <div className="progress-track-line">
                  <div className="progress-track-fill-teal" style={{ width: "100%" }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
