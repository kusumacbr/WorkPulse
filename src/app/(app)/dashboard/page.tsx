"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useCurrentUser } from "@/components/layout/UserContext";
import {
  useWorkpulseSharedStore,
  WorkpulseSharedStore,
  SharedLeaveRequest,
  SharedWfhRequest,
} from "@/lib/stores/workpulse-shared-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { MetricTile3D } from "@/components/3d/MetricTile3D";
import { PageTransition } from "@/components/animations/PageTransition";
import { DEFAULT_FRIENDLY_GOALS } from "@/features/goals/components/SimpleGoalsManager";
import {
  Clock,
  Calendar,
  Users,
  Target,
  CheckCircle2,
  ListTodo,
  UserCheck,
  Sun,
  Sparkles,
  ChevronRight,
  Building2,
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
    wfhRequests,
    allEmployees,
    departments,
  } = useWorkpulseSharedStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    WorkpulseSharedStore.hydrateFromStorage();
  }, []);

  // 1. Current Logged-in Employee Resolution
  const currentEmp = useMemo(() => {
    const emailLower = (user.userEmail || "").toLowerCase();
    const nameLower = (user.userName || "").toLowerCase();
    return (
      allEmployees.find(
        (e) =>
          e.email.toLowerCase() === emailLower ||
          e.id === user.userEmail ||
          (emailLower === "employee.test@xorstack.com" && e.id === "emp-sarah") ||
          e.name.toLowerCase() === nameLower
      ) ||
      allEmployees.find((e) => !e.email.toLowerCase().includes("lead") && !e.email.toLowerCase().includes("hr")) ||
      allEmployees[0]
    );
  }, [allEmployees, user]);

  // 2. Team Lead Direct Reports Resolution
  const cleanTeamMembers = useMemo(() => {
    const devEmployees = allEmployees.filter(
      (e) =>
        e.id !== "lead-alex" &&
        !e.email?.toLowerCase().includes("lead") &&
        !e.email?.toLowerCase().includes("hr") &&
        (e.teamLeadId === "lead-alex" ||
          e.departmentId === "dept-development" ||
          e.departmentName?.toLowerCase().includes("development") ||
          e.teamLeadName?.toLowerCase().includes("alex"))
    );

    let savedFeedback: Record<string, any> = {};
    if (mounted && typeof window !== "undefined") {
      try {
        savedFeedback = JSON.parse(localStorage.getItem("workpulse_lead_daily_feedback") || "{}");
      } catch {}
    }

    const bgList = [
      "bg-gradient-to-tr from-purple-500 to-pink-500 text-white",
      "bg-gradient-to-tr from-cyan-500 to-blue-600 text-white",
      "bg-gradient-to-tr from-amber-500 to-orange-500 text-white",
      "bg-gradient-to-tr from-emerald-500 to-teal-500 text-white",
      "bg-gradient-to-tr from-indigo-500 to-violet-500 text-white",
    ];

    return devEmployees.map((e, index) => {
      const fb =
        savedFeedback[e.id] ||
        (e.email ? savedFeedback[e.email.toLowerCase()] : null) ||
        (e.id === "emp-sarah" ? savedFeedback["employee.test@xorstack.com"] || savedFeedback["emp-sarah"] : null);

      let localSodSubmitted = false;
      if (typeof window !== "undefined") {
        try {
          localSodSubmitted = Boolean(
            localStorage.getItem(`workpulse_morning_plan_submitted_${e.id}`) ||
              (e.email && localStorage.getItem(`workpulse_morning_plan_submitted_${e.email.toLowerCase()}`))
          );
        } catch {}
      }

      const isSodVerified = Boolean(e.sodStatus === "VERIFIED" || (fb && fb.sodAcknowledged === true));
      const isSodSubmitted = Boolean(e.sodStatus === "SUBMITTED" || isSodVerified || localSodSubmitted);
      const isEodVerified = Boolean(e.eodStatus === "VERIFIED" || (fb && fb.eodAcknowledged === true));
      const isEodSubmitted = Boolean(e.eodStatus === "SUBMITTED" || isEodVerified);

      return {
        id: e.id,
        name: e.name,
        email: e.email,
        designation: e.designation,
        avatar: e.avatar || e.name.slice(0, 2).toUpperCase(),
        avatarBg: bgList[index % bgList.length],
        workMode: e.workMode === "WFH" ? "Remote (WFH)" : "Office",
        sodStatus: isSodVerified ? "VERIFIED" : isSodSubmitted ? "SUBMITTED" : "PENDING",
        eodStatus: isEodVerified ? "VERIFIED" : isEodSubmitted ? "SUBMITTED" : "PENDING",
        status: isSodVerified ? "Plan Verified" : isSodSubmitted ? "Verify Plan" : "Plan Pending",
        progress: e.overallProgress || 0,
      };
    });
  }, [allEmployees, mounted]);

  // 3. Real-time Tasks for Logged-In Employee
  const liveEmployeeTasks = useMemo(() => {
    if (mounted && typeof window !== "undefined") {
      try {
        const key = currentEmp?.id ? `workpulse_simple_tasks_${currentEmp.id}` : "workpulse_simple_tasks";
        const saved =
          localStorage.getItem(key) ||
          (currentEmp?.email ? localStorage.getItem(`workpulse_simple_tasks_${currentEmp.email.toLowerCase()}`) : null) ||
          localStorage.getItem("workpulse_simple_tasks");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return currentEmp?.plannedTasks || [];
  }, [mounted, currentEmp]);

  const myTasksCount = liveEmployeeTasks.length;
  const myCompletedTasksCount = liveEmployeeTasks.filter(
    (t: any) => t.status === "COMPLETED" || (t.progress || t.completionPercentage) === 100
  ).length;
  const myTaskProgressPercent = myTasksCount > 0 ? Math.round((myCompletedTasksCount / myTasksCount) * 100) : 0;

  // 4. Real-time Leave & WFH Balances for Logged-In Employee
  const myLeaveRequests = useMemo(() => {
    return leaveRequests.filter(
      (r: SharedLeaveRequest) =>
        (currentEmp && (r.employeeId === currentEmp.id || r.employeeId === currentEmp.email)) ||
        r.employeeName?.toLowerCase() === user.userName?.toLowerCase() ||
        (user.userEmail?.toLowerCase().includes("employee.test") &&
          (r.employeeId === "emp-sarah" || r.employeeName === "Sarah Dev"))
    );
  }, [leaveRequests, currentEmp, user]);

  const myWfhRequests = useMemo(() => {
    return wfhRequests.filter(
      (r: SharedWfhRequest) =>
        (currentEmp && (r.employeeId === currentEmp.id || r.employeeId === currentEmp.email)) ||
        r.employeeName?.toLowerCase() === user.userName?.toLowerCase() ||
        (user.userEmail?.toLowerCase().includes("employee.test") &&
          (r.employeeId === "emp-sarah" || r.employeeName === "Sarah Dev"))
    );
  }, [wfhRequests, currentEmp, user]);

  const approvedCasualDays = useMemo(() => {
    return myLeaveRequests
      .filter((r) => r.status === "APPROVED" && (r.leaveType === "CASUAL" || !r.leaveType))
      .reduce((acc, r) => acc + (r.daysCount ?? 1.0), 0);
  }, [myLeaveRequests]);

  const casualLeaveBalance = useMemo(() => {
    const base = currentEmp?.remainingLeaveBalance ?? 12.0;
    return Math.max(0, Math.min(base, 12.0 - approvedCasualDays));
  }, [currentEmp, approvedCasualDays]);

  const approvedSickDays = useMemo(() => {
    return myLeaveRequests
      .filter((r) => r.status === "APPROVED" && r.leaveType === "SICK")
      .reduce((acc, r) => acc + (r.daysCount ?? 1.0), 0);
  }, [myLeaveRequests]);

  const sickLeaveBalance = useMemo(() => {
    return Math.max(0, 8.0 - approvedSickDays);
  }, [approvedSickDays]);

  const myWfhCount = myWfhRequests.reduce((acc, r) => acc + (r.daysCount ?? 1.0), 0);

  // 5. Team Lead Metrics & Approvals Queue (Stage-1 Pending Only)
  const pendingTeamLeaves = useMemo(() => {
    return leaveRequests.filter((r) => {
      const isPending =
        (r.status as string) === "PENDING_TL_STAGE_1" ||
        ((r.status as string).includes("PENDING") && r.status !== "FORWARDED_TO_HR");
      return isPending;
    });
  }, [leaveRequests]);

  const pendingTeamWfhs = useMemo(() => {
    return wfhRequests.filter((r) => {
      const isPending =
        (r.status as string) === "PENDING_TL_STAGE_1" ||
        ((r.status as string).includes("PENDING") && r.status !== "FORWARDED_TO_HR");
      return isPending;
    });
  }, [wfhRequests]);

  const totalTeamPending = pendingTeamLeaves.length + pendingTeamWfhs.length;

  const allPendingTeamRequests = useMemo(() => {
    const leaves = pendingTeamLeaves.map((r) => ({
      id: r.id,
      name: r.employeeName,
      type: `${r.leaveType} Leave`,
      badgeVariant: "rose" as const,
      detail: `${r.daysCount} Day(s) · ${r.startDate}`,
    }));
    const wfhs = pendingTeamWfhs.map((r) => ({
      id: r.id,
      name: r.employeeName,
      type: "WFH",
      badgeVariant: "purple" as const,
      detail: `Remote · ${r.startDate}`,
    }));
    return [...leaves, ...wfhs];
  }, [pendingTeamLeaves, pendingTeamWfhs]);

  const teamPresentCount = cleanTeamMembers.filter((m) => m.workMode !== "On Leave").length;

  const teamMorningPlansCount = cleanTeamMembers.filter(
    (m) =>
      m.sodStatus === "SUBMITTED" ||
      m.sodStatus === "VERIFIED" ||
      m.status === "Plan Verified" ||
      m.status === "Verify Plan"
  ).length;

  // 5b. Real-time Personal & Team Goals / OKRs
  const liveEmployeeGoals = useMemo(() => {
    if (mounted && typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("workpulse_simple_goals");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return DEFAULT_FRIENDLY_GOALS;
  }, [mounted]);

  const totalGoalsCount = liveEmployeeGoals.length;
  const completedGoalsCount = liveEmployeeGoals.filter(
    (g: any) => g.status === "COMPLETED" || (g.progress || 0) === 100
  ).length;
  const inProgressGoalsCount = totalGoalsCount - completedGoalsCount;
  const overallGoalsProgress =
    totalGoalsCount > 0
      ? Math.round(
          liveEmployeeGoals.reduce((sum: number, g: any) => sum + (Number(g.progress) || 0), 0) /
            totalGoalsCount
        )
      : 0;

  // 5c. Organization-wide Stage-2 HR Queue (Live & Filtered)
  const stage2LeaveRequests = useMemo(
    () => leaveRequests.filter((r) => r.status === "FORWARDED_TO_HR"),
    [leaveRequests]
  );
  const stage2WfhRequests = useMemo(
    () => wfhRequests.filter((r) => r.status === "FORWARDED_TO_HR"),
    [wfhRequests]
  );
  const totalHRPending = stage2LeaveRequests.length + stage2WfhRequests.length;

  const hrPendingRequests = useMemo(() => {
    const leaves = stage2LeaveRequests.map((r) => ({
      id: r.id,
      name: r.employeeName,
      type: `${r.leaveType || "Casual"} Leave`,
      badgeVariant: "rose" as const,
      detail: `${r.daysCount || 1} Day(s) · ${r.startDate}`,
      statusText: "Stage-2 HR",
    }));
    const wfhs = stage2WfhRequests.map((r) => ({
      id: r.id,
      name: r.employeeName,
      type: "WFH",
      badgeVariant: "purple" as const,
      detail: `Remote · ${r.startDate}`,
      statusText: "Stage-2 HR",
    }));
    return [...leaves, ...wfhs];
  }, [stage2LeaveRequests, stage2WfhRequests]);

  // 5d. Real-time HR Headcount & Attendance/Presence Breakdown
  const orgTotalStaff = allEmployees.length || 19;
  const todayDateStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const onLeaveEmpIds = useMemo(() => {
    const ids = new Set<string>();
    leaveRequests.forEach((req) => {
      if (req.status === "APPROVED") {
        if (!req.startDate || req.startDate <= todayDateStr) {
          if (!req.endDate || req.endDate >= todayDateStr) {
            ids.add(req.employeeId);
            if (req.employeeName) ids.add(req.employeeName.toLowerCase());
          }
        }
      }
    });
    return ids;
  }, [leaveRequests, todayDateStr]);

  const onLeaveStaff = allEmployees.filter(
    (e) => onLeaveEmpIds.has(e.id) || (e.email && onLeaveEmpIds.has(e.email.toLowerCase()))
  ).length;
  const inOfficeStaff = allEmployees.filter(
    (e) =>
      !onLeaveEmpIds.has(e.id) &&
      (!e.email || !onLeaveEmpIds.has(e.email.toLowerCase())) &&
      (e.workMode === "OFFICE" || e.workMode === "HYBRID" || !e.workMode)
  ).length;
  const remoteStaff = allEmployees.filter(
    (e) =>
      !onLeaveEmpIds.has(e.id) &&
      (!e.email || !onLeaveEmpIds.has(e.email.toLowerCase())) &&
      e.workMode === "WFH"
  ).length;

  const presentStaff = inOfficeStaff + remoteStaff;
  const orgAttendanceRate =
    orgTotalStaff > 0 ? Math.round((presentStaff / orgTotalStaff) * 100) : 100;

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-32 rounded-3xl bg-card/40 border border-border/40" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-28 rounded-2xl bg-card/40 border border-border/40" />
          <div className="h-28 rounded-2xl bg-card/40 border border-border/40" />
          <div className="h-28 rounded-2xl bg-card/40 border border-border/40" />
          <div className="h-28 rounded-2xl bg-card/40 border border-border/40" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 rounded-3xl bg-card/40 border border-border/40" />
          <div className="h-80 rounded-3xl bg-card/40 border border-border/40" />
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6 sm:space-y-8">
        {/* 1. Header Banner */}
        <Interactive3DCard className="p-6 sm:p-8 border border-border/80 bg-gradient-to-br from-card/95 via-card/75 to-card/50 shadow-sm relative overflow-hidden rounded-3xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge
                  variant={isHR ? "purple" : isLead ? "cyan" : "brand"}
                  className="text-[11px] font-bold px-3 py-1 rounded-full shadow-sm"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {isHR
                    ? "HR & People Operations"
                    : isLead
                    ? "Team Lead Workspace"
                    : "Member Workspace"}
                </Badge>
                {isHR ? (
                  <span className="text-xs text-muted-foreground font-medium bg-muted/40 px-3 py-1 rounded-full border border-border/60">
                    {departments.length || 6} Departments · {orgTotalStaff} Employees
                  </span>
                ) : isLead ? (
                  <span className="text-xs text-muted-foreground font-medium bg-muted/40 px-3 py-1 rounded-full border border-border/60">
                    Development Team · {cleanTeamMembers.length} Direct Reports
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground font-medium bg-muted/40 px-3 py-1 rounded-full border border-border/60">
                    This Week
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text">
                  {user.userName}
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {isHR
                  ? "Monitor real-time company attendance, employee leave authorizations, department velocity, and strategic OKRs."
                  : isLead
                  ? "Track your team's daily start-of-day plans, live attendance, deliverables, and pending approvals."
                  : "Here is your workday execution dashboard, daily task priorities, weekly goals progress, and time-off summary."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {isHR ? (
                <>
                  <Link href="/leave">
                    <Button size="default" variant="outline" className="text-xs font-bold gap-2 h-10 rounded-2xl">
                      <Calendar className="h-4 w-4 text-pink-500" />
                      <span>Leave Oversight</span>
                    </Button>
                  </Link>
                  <Link href="/my-work">
                    <Button size="default" variant="brand" className="text-xs font-extrabold gap-2 h-10 rounded-2xl shadow-md">
                      <Users className="h-4 w-4" />
                      <span>Employee Roster</span>
                    </Button>
                  </Link>
                </>
              ) : isLead ? (
                <Link href="/my-work">
                  <Button size="default" variant="cyan" className="text-xs font-extrabold gap-2 h-10 rounded-2xl shadow-md">
                    <ListTodo className="h-4 w-4" />
                    <span>Review Team Plans</span>
                  </Button>
                </Link>
              ) : (
                <Link href="/my-work">
                  <Button size="default" variant="brand" className="text-xs font-extrabold gap-2 h-10 rounded-2xl shadow-md">
                    <ListTodo className="h-4 w-4" />
                    <span>Execute Daily Tasks</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Interactive3DCard>

        {/* 2. Top Glanceable Metrics (Live & Real-time) */}
        {isHR ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Link href="/my-work" className="block transition-transform duration-200 hover:-translate-y-0.5">
              <MetricTile3D
                title="Total Headcount"
                value={`${orgTotalStaff} Staff`}
                subtitle={`Across ${departments.length || 6} departments`}
                icon={Users}
                badgeText="Active Roster"
                accent="cyan"
                change={`${orgTotalStaff} Active`}
                changePositive={true}
                progress={100}
              />
            </Link>
            <Link href="/attendance" className="block transition-transform duration-200 hover:-translate-y-0.5">
              <MetricTile3D
                title="Present Today"
                value={`${presentStaff} / ${orgTotalStaff}`}
                subtitle={`${orgAttendanceRate}% Attendance rate`}
                icon={UserCheck}
                badgeText={presentStaff === orgTotalStaff ? "100% Present" : "Active Shift"}
                accent="emerald"
                change={`${presentStaff} on duty`}
                changePositive={true}
                progress={orgAttendanceRate}
              />
            </Link>
            <Link href="/leave" className="block transition-transform duration-200 hover:-translate-y-0.5">
              <MetricTile3D
                title="Pending Approvals"
                value={`${totalHRPending} Requests`}
                subtitle={
                  totalHRPending > 0
                    ? `${stage2LeaveRequests.length} Leave · ${stage2WfhRequests.length} WFH`
                    : "Stage-2 Leave & WFH"
                }
                icon={Calendar}
                badgeText={totalHRPending > 0 ? "Action Needed" : "All Clear"}
                accent="rose"
                change={totalHRPending > 0 ? `${totalHRPending} pending` : "0 pending"}
                changePositive={totalHRPending === 0}
                progress={totalHRPending > 0 ? 40 : 100}
              />
            </Link>
            <Link href="/attendance" className="block transition-transform duration-200 hover:-translate-y-0.5">
              <MetricTile3D
                title="On Leave Today"
                value={`${onLeaveStaff} Staff`}
                subtitle={`${inOfficeStaff} In Office · ${remoteStaff} Remote`}
                icon={Building2}
                badgeText={onLeaveStaff === 0 ? "Full Staff" : `${onLeaveStaff} Away`}
                accent="purple"
                change={`${presentStaff} active`}
                changePositive={true}
                progress={Math.round((presentStaff / Math.max(1, orgTotalStaff)) * 100)}
              />
            </Link>
          </div>
        ) : isLead ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Link href="/attendance" className="block transition-transform duration-200 hover:-translate-y-0.5">
              <MetricTile3D
                title="Team Attendance"
                value={`${teamPresentCount} / ${cleanTeamMembers.length} Present`}
                subtitle="Direct reports on duty"
                icon={UserCheck}
                badgeText={`${Math.round((teamPresentCount / Math.max(1, cleanTeamMembers.length)) * 100)}% Present`}
                accent="emerald"
                change="On-time duty"
                changePositive={true}
                progress={Math.round((teamPresentCount / Math.max(1, cleanTeamMembers.length)) * 100)}
              />
            </Link>
            <Link href="/my-work" className="block transition-transform duration-200 hover:-translate-y-0.5">
              <MetricTile3D
                title="Morning Plans"
                value={`${teamMorningPlansCount} / ${cleanTeamMembers.length} Shared`}
                subtitle="Morning SOD plans sent"
                icon={Sun}
                badgeText={teamMorningPlansCount === cleanTeamMembers.length ? "All Submitted" : "In Progress"}
                accent="cyan"
                change={`${teamMorningPlansCount} Submitted`}
                changePositive={true}
                progress={Math.round((teamMorningPlansCount / Math.max(1, cleanTeamMembers.length)) * 100)}
              />
            </Link>
            <Link href="/leave" className="block transition-transform duration-200 hover:-translate-y-0.5">
              <MetricTile3D
                title="Leave Requests"
                value={totalTeamPending > 0 ? `${totalTeamPending} Pending` : "0 Pending"}
                subtitle={totalTeamPending > 0 ? `${pendingTeamLeaves.length} Leave · ${pendingTeamWfhs.length} WFH` : "Needs your approval"}
                icon={Calendar}
                badgeText={totalTeamPending > 0 ? "Action Needed" : "All Clear"}
                accent="rose"
                change={totalTeamPending > 0 ? `${totalTeamPending} requests` : "Up to date"}
                changePositive={totalTeamPending === 0}
                progress={totalTeamPending > 0 ? 50 : 100}
              />
            </Link>
            <Link href="/goals" className="block transition-transform duration-200 hover:-translate-y-0.5">
              <MetricTile3D
                title="Overall Goal Progress"
                value={`${overallGoalsProgress}%`}
                subtitle={`${completedGoalsCount} of ${totalGoalsCount} OKRs achieved`}
                icon={Target}
                badgeText="This Week"
                accent="purple"
                change={`${inProgressGoalsCount} in progress`}
                changePositive={true}
                progress={overallGoalsProgress}
              />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Link href="/attendance" className="block transition-transform duration-200 hover:-translate-y-0.5">
              <MetricTile3D
                title="Today's Attendance"
                value="Present"
                subtitle="Clocked in at 10:08 AM"
                icon={Clock}
                badgeText="Biometric Verified"
                accent="cyan"
                change="On Time"
                changePositive={true}
                progress={100}
              />
            </Link>
            <Link href="/my-work" className="block transition-transform duration-200 hover:-translate-y-0.5">
              <MetricTile3D
                title="My Tasks"
                value={`${myTasksCount} Tasks`}
                subtitle={`${myCompletedTasksCount} completed`}
                icon={ListTodo}
                badgeText={myCompletedTasksCount === myTasksCount && myTasksCount > 0 ? "All Done" : `${myTaskProgressPercent}% Done`}
                accent="gold"
                change="In progress"
                changePositive={true}
                progress={myTaskProgressPercent}
              />
            </Link>
            <Link href="/goals" className="block transition-transform duration-200 hover:-translate-y-0.5">
              <MetricTile3D
                title="Overall Goal Progress"
                value={`${overallGoalsProgress}%`}
                subtitle={`${completedGoalsCount} of ${totalGoalsCount} OKRs achieved`}
                icon={Target}
                badgeText={completedGoalsCount === totalGoalsCount && totalGoalsCount > 0 ? "All Complete" : "This Week"}
                accent="emerald"
                change={`${inProgressGoalsCount} in progress`}
                changePositive={true}
                progress={overallGoalsProgress}
              />
            </Link>
            <Link href="/leave" className="block transition-transform duration-200 hover:-translate-y-0.5">
              <MetricTile3D
                title="Leave Balance"
                value={`${casualLeaveBalance} Days`}
                subtitle="Available paid time off"
                icon={Calendar}
                badgeText="Available"
                accent="rose"
                change="Refreshed"
                changePositive={true}
                progress={Math.round((casualLeaveBalance / 12) * 100)}
              />
            </Link>
          </div>
        )}

        {/* 3. Essential Two-Card Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isHR ? (
            <>
              {/* HR Left: Pending Authorizations */}
              <div className="p-6 rounded-3xl border border-rose-500/25 bg-gradient-to-b from-rose-500/[0.04] to-card/80 space-y-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        Pending Leave &amp; WFH Authorizations
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Requires HR validation for payroll sync.
                      </p>
                    </div>
                  </div>
                  <Link href="/leave" className="text-xs font-bold text-rose-500 hover:text-rose-400 flex items-center gap-1 hover:underline">
                    <span>Leave Desk</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {hrPendingRequests.length === 0 ? (
                  <div className="p-8 text-center bg-card/50 rounded-2xl border border-border/60 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-7 w-7 text-emerald-400 mx-auto mb-2" />
                    <span className="font-semibold text-foreground block">All clear!</span>
                    <span>No employee leave or WFH requests waiting for HR Stage-2 authorization.</span>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    {hrPendingRequests.slice(0, 4).map((req) => (
                      <Link
                        key={req.id}
                        href="/leave"
                        className="p-3.5 rounded-2xl bg-card/80 border border-rose-500/20 flex items-center justify-between gap-3 shadow-sm hover:border-rose-500/40 transition-all"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <strong className="text-foreground text-xs font-bold block truncate">
                              {req.name}
                            </strong>
                            <Badge variant={req.badgeVariant} className="text-[10px] font-bold">
                              {req.type}
                            </Badge>
                          </div>
                          <span className="text-[11px] text-muted-foreground block">
                            {req.detail}
                          </span>
                        </div>

                        <Badge variant="outline" className="text-[10px] font-semibold text-amber-500 border-amber-500/30 shrink-0">
                          {req.statusText}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* HR Right: Presence */}
              <div className="p-6 rounded-3xl border border-cyan-500/25 bg-gradient-to-b from-cyan-500/[0.04] to-card/80 space-y-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-500">
                      <UserCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        Today&apos;s Workplace Presence
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Real-time biometric shift status breakdown.
                      </p>
                    </div>
                  </div>
                  <Link href="/attendance" className="text-xs font-bold text-cyan-500 hover:text-cyan-400 flex items-center gap-1 hover:underline">
                    <span>Logs</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-3.5 rounded-2xl bg-card/80 border border-emerald-500/25 space-y-1 shadow-sm">
                    <span className="text-[11px] text-muted-foreground font-semibold block">In Office</span>
                    <strong className="text-xl font-black text-emerald-500 dark:text-emerald-400">{inOfficeStaff} Staff</strong>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-card/80 border border-cyan-500/25 space-y-1 shadow-sm">
                    <span className="text-[11px] text-muted-foreground font-semibold block">Remote (WFH)</span>
                    <strong className="text-xl font-black text-cyan-500 dark:text-cyan-400">{remoteStaff} Staff</strong>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-card/80 border border-amber-500/25 space-y-1 shadow-sm">
                    <span className="text-[11px] text-muted-foreground font-semibold block">On Leave</span>
                    <strong className="text-xl font-black text-amber-500 dark:text-amber-400">{onLeaveStaff} Staff</strong>
                  </div>
                </div>

                {/* Department Distribution */}
                <div className="space-y-2.5 pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-bold text-foreground">Department Rosters</span>
                    <span className="text-[10px] text-muted-foreground">{departments.length} Active Teams</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {departments.map((dept) => (
                      <div
                        key={dept.id}
                        className="p-2.5 rounded-xl bg-card/60 border border-border/60 flex items-center justify-between gap-1.5"
                      >
                        <span className="text-[11px] font-medium text-foreground truncate">{dept.name}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted/70 text-muted-foreground shrink-0 font-mono">
                          {dept.employees.length}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : isLead ? (
            <>
              {/* Team Lead Left: Development Team Direct Reports */}
              <div className="p-6 rounded-3xl border border-indigo-500/25 bg-gradient-to-b from-indigo-500/[0.04] to-card/80 space-y-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-500">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        Development Team Direct Reports
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Real-time morning plans &amp; work mode status.
                      </p>
                    </div>
                  </div>
                  <Link href="/my-work" className="text-xs font-bold text-indigo-500 hover:text-indigo-400 flex items-center gap-1 hover:underline">
                    <span>Review Plans</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="space-y-3 text-xs">
                  {cleanTeamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="p-3.5 rounded-2xl bg-card/80 border border-border/70 flex items-center justify-between gap-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`h-9 w-9 rounded-2xl ${member.avatarBg} flex items-center justify-center font-black text-xs shrink-0 shadow-md`}
                        >
                          {member.avatar}
                        </div>
                        <div className="min-w-0">
                          <strong className="text-foreground text-xs font-bold block truncate">
                            {member.name}
                          </strong>
                          <span className="text-[11px] text-muted-foreground">{member.designation}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <Badge variant="outline" className="text-[10px] font-semibold">
                          {member.workMode}
                        </Badge>
                        <Badge
                          variant={member.status === "Plan Verified" ? "success" : member.status === "Verify Plan" ? "cyan" : "amber"}
                          className="text-[10px] font-bold"
                        >
                          {member.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team Lead Right: Pending Leave & WFH Requests */}
              <div className="p-6 rounded-3xl border border-rose-500/25 bg-gradient-to-b from-rose-500/[0.04] to-card/80 space-y-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        Pending Leave &amp; WFH Requests
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Direct report applications requiring team lead sign-off.
                      </p>
                    </div>
                  </div>
                  <Link href="/leave" className="text-xs font-bold text-rose-500 hover:text-rose-400 flex items-center gap-1 hover:underline">
                    <span>View in Leave Desk</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {allPendingTeamRequests.length === 0 ? (
                  <div className="p-8 text-center bg-card/50 rounded-2xl border border-border/60 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-7 w-7 text-emerald-400 mx-auto mb-2" />
                    <span className="font-semibold text-foreground block">All caught up!</span>
                    <span>No pending leave or WFH requests from team members.</span>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    {allPendingTeamRequests.slice(0, 4).map((req) => (
                      <Link
                        key={req.id}
                        href="/leave"
                        className="p-3.5 rounded-2xl bg-card/80 border border-rose-500/20 flex items-center justify-between gap-3 shadow-sm hover:border-rose-500/40 transition-all"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <strong className="text-foreground text-xs font-bold block truncate">
                              {req.name}
                            </strong>
                            <Badge variant={req.badgeVariant} className="text-[10px] font-bold">
                              {req.type}
                            </Badge>
                          </div>
                          <span className="text-[11px] text-muted-foreground block">
                            {req.detail}
                          </span>
                        </div>

                        <Badge variant="outline" className="text-[10px] font-semibold text-rose-400 border-rose-500/30 shrink-0">
                          Pending Sign-Off
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Employee Left: Today's Work & Priorities */}
              <div className="p-6 rounded-3xl border border-cyan-500/25 bg-gradient-to-b from-cyan-500/[0.04] to-card/80 space-y-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-500">
                      <ListTodo className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Today&apos;s Work &amp; Priorities</h3>
                      <p className="text-[11px] text-muted-foreground">Start of Day execution items.</p>
                    </div>
                  </div>
                  <Link href="/my-work" className="text-xs font-bold text-cyan-500 hover:underline flex items-center gap-1">
                    <span>Manage</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {liveEmployeeTasks.length === 0 ? (
                  <div className="p-8 text-center bg-card/50 rounded-2xl border border-border/60 text-xs text-muted-foreground space-y-2">
                    <ListTodo className="h-7 w-7 text-cyan-400 mx-auto" />
                    <span className="font-semibold text-foreground block">No tasks planned yet</span>
                    <span>Click &quot;Manage&quot; to plan your workday and submit your morning SOD.</span>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    {liveEmployeeTasks.slice(0, 5).map((task: any) => (
                      <Link
                        key={task.id}
                        href="/my-work"
                        className="p-3.5 rounded-2xl bg-card/80 border border-border/70 flex items-center justify-between gap-2 shadow-sm hover:border-cyan-500/40 transition-all"
                      >
                        <div className="min-w-0">
                          <span className="text-foreground font-semibold block truncate">{task.title}</span>
                          <span className="text-[10px] text-muted-foreground">{task.category || task.project || "Operations"}</span>
                        </div>
                        <Badge
                          variant={
                            task.status === "COMPLETED" || (task.progress || task.completionPercentage) === 100
                              ? "success"
                              : (task.progress || task.completionPercentage) > 0
                              ? "cyan"
                              : "outline"
                          }
                          className="text-[10px] font-bold shrink-0"
                        >
                          {task.status === "COMPLETED" || (task.progress || task.completionPercentage) === 100
                            ? "Completed"
                            : `${task.progress || task.completionPercentage || 0}%`}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Employee Right: Leave & Time Off Summary */}
              <div className="p-6 rounded-3xl border border-teal-500/25 bg-gradient-to-b from-teal-500/[0.04] to-card/80 space-y-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-500">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Leave &amp; Time Off</h3>
                      <p className="text-[11px] text-muted-foreground">Annual quota and approver details.</p>
                    </div>
                  </div>
                  <Link href="/leave" className="text-xs font-bold text-teal-500 hover:underline flex items-center gap-1">
                    <span>Request Leave</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="p-4 rounded-2xl bg-card/80 border border-border/70 space-y-3 text-xs shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Available Paid Balance:</span>
                    <strong className="text-teal-500 dark:text-teal-400 font-mono font-bold text-sm">
                      {casualLeaveBalance} Days
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Sick Leave Available:</span>
                    <strong className="text-cyan-500 dark:text-cyan-400 font-mono font-bold text-sm">
                      {sickLeaveBalance} Days
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Manager / Lead Approver:</span>
                    <span className="text-foreground font-bold">{currentEmp?.teamLeadName || "Alex Lead"}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/60">
                    <span className="text-muted-foreground font-medium">WFH This Month:</span>
                    <span className="text-purple-400 font-semibold">{myWfhCount} Days ({myWfhRequests.length} sessions)</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

