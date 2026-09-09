"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useCurrentUser } from "@/components/layout/UserContext";
import {
  useWorkpulseSharedStore,
  WorkpulseSharedStore,
  subscribeToSharedStore,
  SharedLeaveRequest,
  SharedWfhRequest,
} from "@/lib/stores/workpulse-shared-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { DEFAULT_FRIENDLY_GOALS } from "@/features/goals/components/SimpleGoalsManager";
import {
  TrendAreaSparkline,
  MultiRingRadialChart,
  WeeklyActivityBarChart,
  WorkforceDistributionDonut,
  DepartmentVelocityBarChart,
} from "@/components/dashboard/charts";
import {
  MemberHeroMetrics,
  LeadHeroMetrics,
  HRHeroMetrics,
} from "@/components/dashboard/BespokeHeroMetrics";
import {
  Calendar,
  CalendarClock,
  Users,
  Target,
  CheckCircle2,
  ListTodo,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Activity,
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

  const isMember = !isHR && !isLead;

  const {
    leaveRequests,
    wfhRequests,
    allEmployees,
    departments,
  } = useWorkpulseSharedStore();

  const [mounted, setMounted] = useState(false);
  const [syncVersion, setSyncVersion] = useState(0);

  useEffect(() => {
    setMounted(true);
    WorkpulseSharedStore.hydrateFromStorage();

    let syncTimer: any = null;
    const handleSync = () => {
      if (syncTimer) clearTimeout(syncTimer);
      syncTimer = setTimeout(() => {
        setSyncVersion((v) => v + 1);
      }, 30);
    };

    const handleStorageEvent = () => {
      WorkpulseSharedStore.hydrateFromStorage();
      handleSync();
    };

    const unsubscribeStore = subscribeToSharedStore(handleSync);

    const events = [
      "workpulse_sync",
      "workpulse:lead_feedback_updated",
      "workpulse:task_assigned",
      "workpulse:task_acknowledged",
      "workpulse:tasks_changed",
      "workpulse:simple_tasks_updated",
      "workpulse:goals_changed",
      "workpulse:simple_goals_updated",
      "workday:sod_submitted",
      "workday:sod_verified",
      "workday:sod_changes_requested",
      "workday:eod_submitted",
      "workday:eod_verified",
      "workday:help_requested",
      "workday:help_acknowledged",
      "workday:help_resolved",
      "attendance:punched",
      "attendance:presence_verified",
      "attendance:all_presence_verified",
      "leave:status_updated",
      "leave:created",
      "leave:deleted",
      "leave:approved",
      "leave:rejected",
      "wfh:status_updated",
      "wfh:created",
      "wfh:deleted",
      "wfh:approved",
      "wfh:rejected",
      "employee:created",
      "employee:updated",
      "employee:deleted",
      "profile:query_submitted",
      "profile:query_approved",
      "profile:query_rejected",
    ];

    events.forEach((evt) => {
      try {
        window.addEventListener(evt, handleSync);
      } catch {}
    });

    try {
      window.addEventListener("storage", handleStorageEvent);
    } catch {}

    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        bc = new BroadcastChannel("workpulse_realtime_broadcast_v1");
        bc.onmessage = () => {
          handleSync();
        };
      } catch {}
    }

    return () => {
      if (syncTimer) clearTimeout(syncTimer);
      unsubscribeStore();
      events.forEach((evt) => {
        try {
          window.removeEventListener(evt, handleSync);
        } catch {}
      });
      try {
        window.removeEventListener("storage", handleStorageEvent);
      } catch {}
      if (bc) bc.close();
    };
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
  }, [allEmployees, user, syncVersion]);

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
      "bg-gradient-to-tr from-cyan-500 to-blue-600 text-white",
      "bg-gradient-to-tr from-purple-500 to-pink-500 text-white",
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
        status: isSodVerified ? "Plan Verified" : isSodSubmitted ? "Verify Plan" : "Plan Not Started",
        progress: e.overallProgress || (isSodSubmitted ? 85 : 0),
      };
    });
  }, [allEmployees, mounted, syncVersion]);

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
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }
    const tasks =
      currentEmp?.plannedTasks && currentEmp.plannedTasks.length > 0
        ? currentEmp.plannedTasks
        : [];
    return tasks;
  }, [mounted, currentEmp, syncVersion]);

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
    const base = currentEmp?.remainingLeaveBalance ?? 11.0;
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

  // 5. Team Lead Metrics & Approvals Queue
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

  // 5b. OKRs
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
  }, [mounted, syncVersion]);

  const totalGoalsCount = liveEmployeeGoals.length;
  const completedGoalsCount = liveEmployeeGoals.filter(
    (g: any) => g.status === "COMPLETED" || (g.progress || 0) === 100
  ).length;
  const overallGoalsProgress =
    totalGoalsCount > 0
      ? Math.round(
          liveEmployeeGoals.reduce((sum: number, g: any) => sum + (Number(g.progress) || 0), 0) /
            totalGoalsCount
        )
      : 84;

  // 5c. Organization-wide Stage-2 HR Queue
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

  // 5d. Organization Headcount & Attendance
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
    orgTotalStaff > 0 ? Math.round((presentStaff / orgTotalStaff) * 100) : 95;

  // ==========================================
  // CHART DATA DEFINITIONS (Clear, Creative, Friendly)
  // ==========================================

  // A. Member Data
  const memberWeeklyActivity = useMemo(() => {
    const isWfhToday = currentEmp?.workMode === "WFH";
    const statusToday = isWfhToday ? ("WFH" as const) : ("PRESENT" as const);
    return [
      { day: "Mon", date: "Sep 1", hours: 8.5, targetHours: 8.0, checkIn: "10:05 AM", checkOut: "07:15 PM", status: "PRESENT" as const, tasksDone: 4 },
      { day: "Tue", date: "Sep 2", hours: 9.0, targetHours: 8.0, checkIn: "10:00 AM", checkOut: "07:20 PM", status: "PRESENT" as const, tasksDone: 5 },
      { day: "Wed", date: "Sep 3", hours: 8.2, targetHours: 8.0, checkIn: "09:55 AM", checkOut: "07:05 PM", status: "WFH" as const, tasksDone: 3 },
      { day: "Thu", date: "Sep 4", hours: 8.8, targetHours: 8.0, checkIn: "10:08 AM", checkOut: "07:10 PM", status: "PRESENT" as const, tasksDone: 4 },
      { day: "Fri", date: "Sep 5", hours: Math.max(7.5, myCompletedTasksCount > 0 ? 8.2 : 7.5), targetHours: 8.0, checkIn: "10:05 AM", checkOut: "07:00 PM", status: statusToday, tasksDone: myCompletedTasksCount },
    ];
  }, [currentEmp, myCompletedTasksCount]);

  const memberRadialRings = useMemo(() => [
    { label: "Attendance", value: 100, color: "#06b6d4", detail: "Clocked in 10:05 AM" },
    {
      label: "Tasks Done",
      value: myTasksCount > 0 ? myTaskProgressPercent : 0,
      color: "#10b981",
      detail: myTasksCount > 0 ? `${myCompletedTasksCount}/${myTasksCount} Completed` : "Plan Not Started",
    },
    { label: "Goals Progress", value: overallGoalsProgress || 84, color: "#a855f7", detail: `${completedGoalsCount}/${totalGoalsCount || 4} Achieved` },
    { label: "Leave Balance", value: Math.round((casualLeaveBalance / 12) * 100), color: "#f43f5e", detail: `${casualLeaveBalance} Days Available` },
  ], [myTaskProgressPercent, myCompletedTasksCount, myTasksCount, overallGoalsProgress, completedGoalsCount, totalGoalsCount, casualLeaveBalance]);

  // B. Team Lead Data
  const teamWorkforceSlices = useMemo(() => {
    const officeCount = cleanTeamMembers.filter((m) => m.workMode === "Office" || m.workMode === "OFFICE").length;
    const wfhCount = cleanTeamMembers.filter((m) => m.workMode.includes("WFH") || m.workMode === "Remote (WFH)").length;
    const leaveCount = cleanTeamMembers.filter((m) => m.workMode === "On Leave").length;

    return [
      {
        label: "In Office",
        count: officeCount || 1,
        color: "#10b981",
        gradient: "from-emerald-500 to-teal-600",
        icon: "office" as const,
      },
      {
        label: "Remote (WFH)",
        count: wfhCount || 1,
        color: "#06b6d4",
        gradient: "from-cyan-500 to-blue-600",
        icon: "wfh" as const,
      },
      {
        label: "On Leave",
        count: leaveCount || 0,
        color: "#f43f5e",
        gradient: "from-rose-500 to-pink-600",
        icon: "leave" as const,
      },
    ];
  }, [cleanTeamMembers]);

  const teamWeeklyProgressTrend = useMemo(() => [
    { label: "Mon", value: 85, meta: "Monday" },
    { label: "Tue", value: 88, meta: "Tuesday" },
    { label: "Wed", value: 92, meta: "Wednesday" },
    { label: "Thu", value: 95, meta: "Thursday" },
    { label: "Fri (Today)", value: Math.max(88, overallGoalsProgress || 90), meta: "Friday" },
  ], [overallGoalsProgress]);

  // C. HR & People Ops Data
  const orgWorkforceSlices = useMemo(() => [
    {
      label: "In Office",
      count: inOfficeStaff,
      color: "#10b981",
      gradient: "from-emerald-500 to-teal-600",
      icon: "office" as const,
    },
    {
      label: "Remote (WFH)",
      count: remoteStaff,
      color: "#06b6d4",
      gradient: "from-cyan-500 to-blue-600",
      icon: "wfh" as const,
    },
    {
      label: "On Leave",
      count: onLeaveStaff,
      color: "#f43f5e",
      gradient: "from-rose-500 to-pink-600",
      icon: "leave" as const,
    },
  ], [inOfficeStaff, remoteStaff, onLeaveStaff]);

  const orgAttendance30DayTrend = useMemo(() => [
    { label: "Aug 10", value: 92 },
    { label: "Aug 15", value: 96 },
    { label: "Aug 20", value: 90 },
    { label: "Aug 25", value: 98, meta: "All-Hands Day" },
    { label: "Aug 30", value: 94 },
    { label: "Sep 01", value: 96 },
    { label: "Sep 05", value: 100, meta: "Peak Shift" },
    { label: "Sep 07 (Today)", value: orgAttendanceRate || 95 },
  ], [orgAttendanceRate]);

  // Dynamically compute department-wise metrics from all real departments in store
  const departmentMetrics = useMemo(() => {
    const colorPalette = ["#06b6d4", "#10b981", "#a855f7", "#f59e0b", "#6366f1", "#ec4899", "#14b8a6"];
    return departments.map((dept, index) => {
      const deptEmps = allEmployees.filter(
        (e) => e.departmentId === dept.id || e.departmentName?.toLowerCase() === dept.name.toLowerCase()
      );
      const headcount = deptEmps.length || dept.employees?.length || 1;
      const sodDone = deptEmps.filter(
        (e) => e.sodStatus === "SUBMITTED" || e.sodStatus === "VERIFIED"
      ).length;
      const sodRate = Math.round((sodDone / headcount) * 100) || 90;

      const totalProg = deptEmps.reduce((acc, e) => acc + (e.overallProgress || 85), 0);
      const avgExecution = headcount > 0 ? Math.round(totalProg / headcount) : 88;

      const onLeaveInDept = deptEmps.filter(
        (e) => onLeaveEmpIds.has(e.id) || (e.email && onLeaveEmpIds.has(e.email.toLowerCase()))
      ).length;
      const attRate = headcount > 0 ? Math.round(((headcount - onLeaveInDept) / headcount) * 100) : 100;

      return {
        id: dept.id,
        name: dept.name,
        shortName: dept.shortName || dept.name.slice(0, 8),
        headcount,
        sodSubmissionRate: sodRate,
        avgExecutionScore: avgExecution,
        attendanceRate: attRate,
        leadName: dept.teamLead?.name || "Team Lead",
        color: colorPalette[index % colorPalette.length] || "#06b6d4",
      };
    });
  }, [departments, allEmployees, onLeaveEmpIds]);

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
        <Interactive3DCard className="p-6 sm:p-8 border border-border/80 bg-gradient-to-br from-card/95 via-card/85 to-card/60 shadow-lg relative overflow-hidden rounded-3xl">
          {/* Subtle Ambient Background Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge
                  variant={isHR ? "purple" : isLead ? "cyan" : "brand"}
                  className="text-[11px] font-extrabold px-3 py-1 rounded-full shadow-sm"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {isHR
                    ? "HR & People Operations Hub"
                    : isLead
                    ? "Team Lead Analytics Workspace"
                    : "Member Execution Workspace"}
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-foreground via-primary to-cyan-400 bg-clip-text text-transparent">
                  {user.userName}
                </span>
              </h1>
            </div>

            {/* Action Shortcuts */}
            <div className="flex items-center gap-3 shrink-0">
              {isHR ? (
                <Link href="/leave">
                  <Button size="default" variant="brand" className="text-xs font-extrabold gap-2 h-10 rounded-2xl shadow-md bg-purple-600 hover:bg-purple-500 text-white">
                    <Calendar className="h-4 w-4" />
                    <span>Leave Governance</span>
                  </Button>
                </Link>
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
                    <span>Tasks</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Interactive3DCard>

        {/* 2. Top Glanceable Hero Metrics */}
        {isHR ? (
          <HRHeroMetrics
            totalStaff={orgTotalStaff}
            presentStaff={presentStaff}
            attendanceRate={orgAttendanceRate}
            totalHRPending={totalHRPending}
            stage2Leaves={stage2LeaveRequests.length}
            stage2Wfhs={stage2WfhRequests.length}
            inOfficeStaff={inOfficeStaff}
            remoteStaff={remoteStaff}
            onLeaveStaff={onLeaveStaff}
            deptCount={departments.length || 6}
          />
        ) : isLead ? (
          <LeadHeroMetrics
            presentCount={teamPresentCount}
            totalTeamCount={cleanTeamMembers.length}
            morningPlansCount={teamMorningPlansCount}
            pendingRequestsCount={totalTeamPending}
            pendingLeavesCount={pendingTeamLeaves.length}
            pendingWfhsCount={pendingTeamWfhs.length}
            sprintVelocityPercent={overallGoalsProgress || 84}
            achievedOkrsCount={completedGoalsCount || 3}
            totalOkrsCount={totalGoalsCount || 4}
          />
        ) : (
          <MemberHeroMetrics
            checkInTime="10:05 AM"
            tasksCount={myTasksCount}
            completedTasksCount={myCompletedTasksCount}
            taskProgressPercent={myTaskProgressPercent}
            goalsProgress={overallGoalsProgress}
            completedGoalsCount={completedGoalsCount}
            totalGoalsCount={totalGoalsCount}
            casualLeaveBalance={casualLeaveBalance}
            sickLeaveBalance={sickLeaveBalance}
            wfhCount={myWfhCount}
          />
        )}

        {/* =========================================================
            3. ROLE-SPECIFIC VISUAL DASHBOARDS (CLEAR & INTUITIVE)
           ========================================================= */}

        {/* ---------------------------------------------------------
            ROLE 1: MEMBER WORKSPACE VISUAL DASHBOARD
           --------------------------------------------------------- */}
        {isMember && (
          <div className="space-y-6">
            {/* Row 1: Weekly Hours Logged Bar Chart + Today's Overview Arc */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 7 cols: Weekly Hours Logged Bar Chart */}
              <div className="lg:col-span-7 p-6 rounded-3xl border border-border/80 bg-card/75 backdrop-blur-xl shadow-sm space-y-4">
                <WeeklyActivityBarChart days={memberWeeklyActivity} targetDailyHours={8.0} height={190} />
              </div>

              {/* Right 5 cols: Today's Overview Radial Chart */}
              <div className="lg:col-span-5 p-6 rounded-3xl border border-border/80 bg-card/75 backdrop-blur-xl shadow-sm flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Target className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Today&apos;s Overview</h4>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Live
                  </span>
                </div>

                <MultiRingRadialChart
                  rings={memberRadialRings}
                  size={190}
                  strokeWidth={9}
                  centerTitle="Today"
                  centerValue={myTasksCount > 0 ? `${myTaskProgressPercent}%` : "0%"}
                  centerSubtitle={myTasksCount > 0 ? "Tasks Done" : "Plan Not Started"}
                />
              </div>
            </div>

            {/* Row 2: Today's Tasks & Priorities (Left 8 cols) + Leave & Time-Off Balance (Right 4 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 8 cols: Today's Planned Tasks */}
              <div className="lg:col-span-8 p-6 rounded-3xl border border-border/80 bg-card/75 backdrop-blur-xl shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-500">
                      <ListTodo className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-foreground">Today&apos;s Planned Tasks</h4>
                        {myTasksCount === 0 ? (
                          <Badge variant="outline" className="text-[10px] font-bold text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10">
                            Plan Not Started
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 border-cyan-500/30 bg-cyan-500/10">
                            {myTasksCount} Tasks Active
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Link href="/my-work" className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1">
                    <span>Manage Tasks</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {myTasksCount === 0 ? (
                  <div className="py-8 px-6 rounded-2xl border border-dashed border-border/80 bg-muted/20 flex flex-col items-center justify-center text-center space-y-3.5">
                    <div className="h-12 w-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm">
                      <CalendarClock className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-sm font-bold text-foreground flex items-center justify-center gap-2">
                        <span>Plan Not Started</span>
                        <Badge variant="outline" className="text-[10px] font-bold text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10">
                          Pending SOD
                        </Badge>
                      </h5>
                      <p className="text-xs text-muted-foreground">
                        No active tasks found. Submit your morning plan to start tracking.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {liveEmployeeTasks.slice(0, 4).map((task: any) => (
                      <div
                        key={task.id}
                        className="p-3.5 rounded-2xl bg-card/80 border border-border/70 flex items-center justify-between gap-3 shadow-xs hover:border-cyan-500/40 transition-all"
                      >
                        <div className="min-w-0 space-y-1">
                          <span className="text-xs font-bold text-foreground block truncate">{task.title}</span>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground font-medium">{task.category || task.project || "General"}</span>
                            <span>·</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{task.priority || "NORMAL"} Priority</span>
                          </div>
                        </div>

                        <Badge
                          variant={
                            task.status === "COMPLETED" || (task.progress || task.completionPercentage) === 100
                              ? "success"
                              : (task.progress || task.completionPercentage) > 0
                              ? "cyan"
                              : "outline"
                          }
                          className="text-[10px] font-bold shrink-0 font-mono"
                        >
                          {task.status === "COMPLETED" || (task.progress || task.completionPercentage) === 100
                            ? "Completed"
                            : `${task.progress || task.completionPercentage || 50}%`}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right 4 cols: Leave & Time-Off Balance Summary */}
              <div className="lg:col-span-4 p-6 rounded-3xl border border-border/80 bg-card/75 backdrop-blur-xl shadow-sm flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Time-Off Balance</h4>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-muted/30 border border-border/60 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground block">Casual Leave</span>
                      <strong className="text-lg font-black text-foreground">{casualLeaveBalance} Days</strong>
                    </div>
                    <span className="text-[10px] text-muted-foreground bg-card/80 px-2 py-1 rounded-md border border-border/50">of 12 Total</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-muted/30 border border-border/60 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground block">Sick Leave</span>
                      <strong className="text-lg font-black text-foreground">{sickLeaveBalance} Days</strong>
                    </div>
                    <span className="text-[10px] text-muted-foreground bg-card/80 px-2 py-1 rounded-md border border-border/50">of 8 Total</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold block">Remote Work (WFH)</span>
                      <strong className="text-lg font-black text-purple-700 dark:text-purple-300">{myWfhCount} Days Used</strong>
                    </div>
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/15 px-2 py-1 rounded-md">Flexible</span>
                  </div>
                </div>

                <Link href="/leave" className="w-full">
                  <Button variant="outline" className="w-full text-xs font-bold h-9 rounded-xl gap-1.5 hover:border-cyan-500/50">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Apply for Leave / WFH</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------
            ROLE 2: TEAM LEAD WORKSPACE VISUAL DASHBOARD
           --------------------------------------------------------- */}
        {isLead && (
          <div className="space-y-6">
            {/* Row 1: Team Presence Donut (5 cols) + Team Weekly Progress Trend (7 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 5 cols: Team Presence Donut */}
              <div className="lg:col-span-5 p-6 rounded-3xl border border-border/80 bg-card/75 backdrop-blur-xl shadow-sm flex flex-col justify-between">
                <WorkforceDistributionDonut
                  data={teamWorkforceSlices}
                  title="Team Presence Today"
                  size={180}
                  holeSize={58}
                />
              </div>

              {/* Right 7 cols: Team Weekly Task Completion Rate Trend */}
              <div className="lg:col-span-7 p-6 rounded-3xl border border-border/80 bg-card/75 backdrop-blur-xl shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Team Daily Completion Rate</h4>
                    </div>
                  </div>
                  <Badge variant="emerald" className="text-[10px] font-bold">
                    90% Target Met
                  </Badge>
                </div>

                <TrendAreaSparkline
                  data={teamWeeklyProgressTrend}
                  height={150}
                  color="emerald"
                  valueSuffix="%"
                  targetLine={90}
                  targetLabel="Target: 90%"
                />
              </div>
            </div>

            {/* Row 2: Team Members Real-Time Status Table */}
            <div className="p-6 rounded-3xl border border-border/80 bg-card/75 backdrop-blur-xl shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Team Members Status</h4>
                  </div>
                </div>
                <Link href="/my-work" className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1">
                  <span>Review Plans</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cleanTeamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-3.5 rounded-2xl bg-card/70 border border-border/70 hover:bg-card/95 transition-all space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`h-9 w-9 rounded-xl ${member.avatarBg} flex items-center justify-center font-black text-xs shrink-0 shadow-xs`}>
                          {member.avatar}
                        </div>
                        <div className="min-w-0">
                          <strong className="text-xs font-bold text-foreground block truncate">{member.name}</strong>
                          <span className="text-[10px] text-muted-foreground block truncate">{member.designation}</span>
                        </div>
                      </div>

                      <Badge variant="outline" className="text-[9px] px-2 py-0.5 font-medium shrink-0">
                        {member.workMode}
                      </Badge>
                    </div>

                    <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                      <Badge
                        variant={member.status === "Plan Verified" ? "success" : member.status === "Verify Plan" ? "cyan" : "amber"}
                        className="text-[9px] px-2 py-0.5 font-bold"
                      >
                        {member.status}
                      </Badge>

                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span className="text-muted-foreground text-[10px]">Progress:</span>
                        <strong className="text-cyan-600 dark:text-cyan-400">{member.progress}%</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 3: Pending Approvals Stream */}
            <div className="p-6 rounded-3xl border border-rose-500/25 bg-gradient-to-b from-rose-500/[0.04] to-card/80 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-500">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground">Pending Team Leave &amp; WFH Requests</h3>
                  </div>
                </div>
                <Link href="/leave" className="text-xs font-bold text-rose-600 dark:text-rose-500 hover:underline flex items-center gap-1">
                  <span>Open Leave Desk</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {allPendingTeamRequests.length === 0 ? (
                <div className="p-6 text-center bg-card/50 rounded-2xl border border-border/60 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 dark:text-emerald-400 mx-auto mb-1.5" />
                  <span className="font-semibold text-foreground block">All caught up!</span>
                  <span>No pending leave or WFH requests from your team.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {allPendingTeamRequests.slice(0, 4).map((req) => (
                    <Link
                      key={req.id}
                      href="/leave"
                      className="p-3.5 rounded-2xl bg-card/80 border border-rose-500/20 flex items-center justify-between gap-3 shadow-sm hover:border-rose-500/40 transition-all group"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <strong className="text-foreground text-xs font-bold block truncate group-hover:text-primary transition-colors">{req.name}</strong>
                          <Badge variant={req.badgeVariant} className="text-[10px] font-bold">{req.type}</Badge>
                        </div>
                        <span className="text-[11px] text-muted-foreground block">{req.detail}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 border-rose-500/30 shrink-0">
                        Pending Sign-Off
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------
            ROLE 3: HR & PEOPLE OPERATIONS VISUAL DASHBOARD
           --------------------------------------------------------- */}
        {isHR && (
          <div className="space-y-6">
            {/* Row 1: Organization Workforce Donut (5 cols) + 30-Day Attendance Trend (7 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 5 cols: Organization-Wide Workforce Donut */}
              <div className="lg:col-span-5 p-6 rounded-3xl border border-border/80 bg-card/75 backdrop-blur-xl shadow-sm flex flex-col justify-between">
                <WorkforceDistributionDonut
                  data={orgWorkforceSlices}
                  title="Workforce Distribution Today"
                  size={180}
                  holeSize={58}
                />
              </div>

              {/* Right 7 cols: 30-Day Enterprise Attendance Area Trend */}
              <div className="lg:col-span-7 p-6 rounded-3xl border border-border/80 bg-card/75 backdrop-blur-xl shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">30-Day Company Attendance</h4>
                    </div>
                  </div>
                  <Badge variant="emerald" className="text-[10px] font-bold">
                    95% Average
                  </Badge>
                </div>

                <TrendAreaSparkline
                  data={orgAttendance30DayTrend}
                  height={150}
                  color="emerald"
                  valueSuffix="%"
                  targetLine={90}
                  targetLabel="Benchmark: 90%"
                />
              </div>
            </div>

            {/* Row 2: Department Overview Bar Chart (Full 12 cols) */}
            <div className="p-6 rounded-3xl border border-border/80 bg-card/75 backdrop-blur-xl shadow-sm">
              <DepartmentVelocityBarChart
                departments={departmentMetrics}
                title="Departments Overview"
                subtitle=""
              />
            </div>

            {/* Row 3: Stage-2 Pending HR Authorizations Queue */}
            <div className="p-6 rounded-3xl border border-rose-500/25 bg-gradient-to-b from-rose-500/[0.04] to-card/80 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-500">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground">Pending Stage-2 HR Authorizations</h3>
                  </div>
                </div>
                <Link href="/leave" className="text-xs font-bold text-rose-600 dark:text-rose-500 hover:underline flex items-center gap-1">
                  <span>Leave Governance Desk</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {hrPendingRequests.length === 0 ? (
                <div className="p-6 text-center bg-card/50 rounded-2xl border border-border/60 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 dark:text-emerald-400 mx-auto mb-1.5" />
                  <span className="font-semibold text-foreground block">All clear!</span>
                  <span>No leave or WFH requests waiting for Stage-2 authorization.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {hrPendingRequests.slice(0, 4).map((req) => (
                    <Link
                      key={req.id}
                      href="/leave"
                      className="p-3.5 rounded-2xl bg-card/80 border border-rose-500/20 flex items-center justify-between gap-3 shadow-sm hover:border-rose-500/40 transition-all group"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <strong className="text-foreground text-xs font-bold block truncate group-hover:text-primary transition-colors">{req.name}</strong>
                          <Badge variant={req.badgeVariant} className="text-[10px] font-bold">{req.type}</Badge>
                        </div>
                        <span className="text-[11px] text-muted-foreground block">{req.detail}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-semibold text-amber-600 dark:text-amber-500 border-amber-500/30 shrink-0">
                        {req.statusText}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

