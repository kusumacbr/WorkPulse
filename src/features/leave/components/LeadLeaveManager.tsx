"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { LeaveRequestModal } from "@/features/leave/components/LeaveRequestModal";
import { WfhRequestModal } from "@/features/leave/components/WfhRequestModal";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { useCurrentUser } from "@/components/layout/UserContext";
import { fireCelebrationConfetti, fireSuccessBurst } from "@/lib/ui/confetti";
import {
  CheckCircle2,
  XCircle,
  Users,
  Clock,
  ShieldCheck,
} from "lucide-react";

type LeadLeaveTab = "TEAM_APPROVALS" | "HR_STAGE_2" | "TEAM_BALANCES";

export function LeadLeaveManager() {
  const user = useCurrentUser();
  const isHR =
    user.roles.includes("HR") ||
    user.primaryRole === "HR" ||
    user.userEmail.toLowerCase().includes("hr");

  const [activeTab, setActiveTab] = useState<LeadLeaveTab>(isHR ? "HR_STAGE_2" : "TEAM_APPROVALS");
  const [approvalFilter, setApprovalFilter] = useState<"ALL" | "LEAVE" | "WFH">("ALL");
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showWfhModal, setShowWfhModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const {
    allEmployees,
    leaveRequests,
    wfhRequests,
    tlApproveLeave,
    tlRejectLeave,
    tlApproveWfh,
    tlRejectWfh,
    hrApproveLeave,
    hrRejectLeave,
    hrApproveWfh,
    hrRejectWfh,
    syncWithSupabase,
  } = useWorkpulseSharedStore();

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Direct reports pending leave requests (Stage 1 - Team Lead queue)
  const pendingLeaveRequests = leaveRequests.filter(
    (r) =>
      (r.status as string) === "PENDING_TL_STAGE_1" ||
      (r.status as string) === "PENDING_MANAGER" ||
      (r.status as string) === "PENDING"
  );

  // Direct reports pending WFH requests (Stage 1 - Team Lead queue)
  const pendingWfhRequests = wfhRequests.filter(
    (r) =>
      (r.status as string) === "PENDING_TL_STAGE_1" ||
      (r.status as string) === "PENDING_MANAGER" ||
      (r.status as string) === "PENDING"
  );

  // Organization-wide Stage 2 HR Queue (Awaiting Stage 2 HR Authorization)
  const stage2LeaveRequests = leaveRequests.filter(
    (r) =>
      r.status === "FORWARDED_TO_HR" ||
      (r.status as string) === "PENDING_HR" ||
      (r.status as string) === "STAGE_2"
  );
  const stage2WfhRequests = wfhRequests.filter(
    (r) =>
      r.status === "FORWARDED_TO_HR" ||
      (r.status as string) === "PENDING_HR" ||
      (r.status as string) === "STAGE_2"
  );

  const totalPending = pendingLeaveRequests.length + pendingWfhRequests.length;
  const totalStage2 = stage2LeaveRequests.length + stage2WfhRequests.length;

  React.useEffect(() => {
    // Sync live state with Supabase & API
    syncWithSupabase();
  }, [syncWithSupabase]);

  // Real-time dynamic calculation of Direct Reports Time-Off Balances
  const teamBalances = React.useMemo(() => {
    const defaultDevRoster = [
      { id: "emp-sarah", name: "Sarah Dev", role: "Senior Backend Engineer", avatar: "SD", casualBase: 6.0, sickBase: 5.0 },
      { id: "emp-rohit", name: "Rohit Sharma", role: "Frontend Engineer", avatar: "RS", casualBase: 7.0, sickBase: 5.0 },
      { id: "emp-priya", name: "Priya Patel", role: "QA Engineer", avatar: "PP", casualBase: 8.0, sickBase: 6.0 },
      { id: "emp-arjun", name: "Arjun Kumar", role: "Junior Developer", avatar: "AK", casualBase: 6.0, sickBase: 6.0 },
    ];

    const reports = (allEmployees && allEmployees.length > 0 ? allEmployees : [])
      .filter((emp) => emp.teamLeadId === "lead-alex" || emp.departmentName === "Development" || emp.id.startsWith("emp-"));

    const roster = reports.length > 0 ? reports : defaultDevRoster;

    return roster.map((emp) => {
      // Find all approved leave requests for this employee (strictly APPROVED by HR)
      const empApprovedLeaves = leaveRequests.filter(
        (r) => (r.employeeId === emp.id || r.employeeName === emp.name) && r.status === "APPROVED"
      );

      const casualDeducted = empApprovedLeaves
        .filter((r) => r.leaveType === "CASUAL")
        .reduce((sum, r) => sum + (r.daysCount || 1), 0);

      const sickDeducted = empApprovedLeaves
        .filter((r) => r.leaveType === "SICK")
        .reduce((sum, r) => sum + (r.daysCount || 1), 0);

      const casualBase = (emp as any).casualBase ?? 8.0;
      const sickBase = (emp as any).sickBase ?? 6.0;

      const casual = Math.max(0, casualBase - casualDeducted);
      const sick = Math.max(0, sickBase - sickDeducted);
      const total = casual + sick;

      return {
        id: emp.id,
        name: emp.name,
        role: (emp as any).role || (emp as any).designation || "Engineer",
        avatar: emp.avatar || emp.name.slice(0, 2).toUpperCase(),
        casual,
        sick,
        total,
      };
    });
  }, [allEmployees, leaveRequests]);

  const avgTeamBalance = React.useMemo(() => {
    if (teamBalances.length === 0) return "12.0 Days";
    const totalDays = teamBalances.reduce((acc, m) => acc + m.total, 0);
    return `${(totalDays / teamBalances.length).toFixed(1)} Days`;
  }, [teamBalances]);

  const handleApproveLeave = async (id: string, name: string) => {
    const comment = "Approved by Team Lead (Alex Lead). Forwarded to HR.";
    tlApproveLeave(id, comment);
    fireSuccessBurst();
    showToast(`✓ Leave request for ${name} approved & forwarded to HR for final sign-off!`);

    try {
      await fetch(`/api/v1/leave/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment }),
      });
    } catch (e) {
      console.warn("Failed to persist leave approval to API:", e);
    }
  };

  const handleRejectLeave = async (id: string, name: string) => {
    const reason = "Declined due to sprint release deadlines.";
    tlRejectLeave(id, reason);
    showToast(`Leave request for ${name} declined.`);

    try {
      await fetch(`/api/v1/leave/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
    } catch (e) {
      console.warn("Failed to persist leave rejection to API:", e);
    }
  };

  const handleApproveWfh = async (id: string, name: string) => {
    const comment = "Approved by Team Lead (Alex Lead). Forwarded to HR.";
    tlApproveWfh(id, comment);
    fireSuccessBurst();
    showToast(`✓ WFH request for ${name} approved & forwarded to HR!`);

    try {
      await fetch(`/api/v1/leave/wfh/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment }),
      });
    } catch (e) {
      console.warn("Failed to persist WFH approval to API:", e);
    }
  };

  const handleRejectWfh = async (id: string, name: string) => {
    const reason = "Declined due to in-person sprint requirements.";
    tlRejectWfh(id, reason);
    showToast(`WFH request for ${name} declined.`);

    try {
      await fetch(`/api/v1/leave/wfh/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
    } catch (e) {
      console.warn("Failed to persist WFH rejection to API:", e);
    }
  };

  const handleHRApproveLeave = async (id: string, name: string) => {
    const comment = "Authorized by HR People Operations. Balance deducted.";
    hrApproveLeave(id, comment);
    fireCelebrationConfetti();
    showToast(`🎉 Final Stage-2 Leave approval granted for ${name}! Balance deducted.`);

    try {
      await fetch(`/api/v1/leave/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment }),
      });
    } catch (e) {
      console.warn("Failed to persist HR leave approval to API:", e);
    }
  };

  const handleHRRejectLeave = async (id: string, name: string) => {
    const reason = "Declined by HR People Operations.";
    hrRejectLeave(id, reason);
    showToast(`Stage-2 Leave request for ${name} declined.`);

    try {
      await fetch(`/api/v1/leave/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
    } catch (e) {
      console.warn("Failed to persist HR leave rejection to API:", e);
    }
  };

  const handleHRApproveWfh = async (id: string, name: string) => {
    const comment = "Authorized by HR People Operations.";
    hrApproveWfh(id, comment);
    fireCelebrationConfetti();
    showToast(`✓ Final Stage-2 WFH approval granted for ${name}!`);

    try {
      await fetch(`/api/v1/leave/wfh/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment }),
      });
    } catch (e) {
      console.warn("Failed to persist HR WFH approval to API:", e);
    }
  };

  const handleHRRejectWfh = async (id: string, name: string) => {
    const reason = "Declined by HR People Operations.";
    hrRejectWfh(id, reason);
    showToast(`Stage-2 WFH request for ${name} declined.`);

    try {
      await fetch(`/api/v1/leave/wfh/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
    } catch (e) {
      console.warn("Failed to persist HR WFH rejection to API:", e);
    }
  };

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{isHR ? "Stage-2 Approvals" : "Pending Team Approvals"}</span>
            <ShieldCheck className="h-4 w-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-400" suppressHydrationWarning>
            {isHR ? totalStage2 : totalPending} Pending
          </p>
          <span className="text-[11px] text-muted-foreground" suppressHydrationWarning>
            {isHR
              ? `${stage2LeaveRequests.length} Leave · ${stage2WfhRequests.length} WFH`
              : `${pendingLeaveRequests.length} Leave · ${pendingWfhRequests.length} WFH`}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{isHR ? "Organization Staff" : "Team Members"}</span>
            <Users className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-cyan-400" suppressHydrationWarning>
            {isHR ? "19 Staff" : "4 Reports"}
          </p>
          <span className="text-[11px] text-muted-foreground" suppressHydrationWarning>
            {isHR ? "Across 6 Departments" : "Development Team"}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Avg Team Balance</span>
            <Clock className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400" suppressHydrationWarning>{avgTeamBalance}</p>
          <span className="text-[11px] text-muted-foreground" suppressHydrationWarning>Across {teamBalances.length} Direct Reports</span>
        </div>
      </div>

      {/* 2. Segregation Tabs & Action Buttons */}
      <Interactive3DCard className="p-3 border border-border/80 bg-card/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center p-1 rounded-xl bg-background/50 border border-border/60 overflow-x-auto gap-1 text-xs font-semibold">
            {/* Team Approvals (For Team Lead) */}
            {!isHR && (
              <button
                type="button"
                onClick={() => setActiveTab("TEAM_APPROVALS")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === "TEAM_APPROVALS"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Team Approvals ({totalPending})</span>
              </button>
            )}

            {/* HR Stage 2 Approvals (For HR Only) */}
            {isHR && (
              <button
                type="button"
                onClick={() => setActiveTab("HR_STAGE_2")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === "HR_STAGE_2"
                    ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold shadow-sm"
                    : "text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Leave &amp; WFH Oversight</span>
                <Badge variant="outline" className="text-[9px] ml-1 bg-white/20 text-white border-transparent">
                  {totalStage2}
                </Badge>
              </button>
            )}

            {/* Team Balances */}
            <button
              type="button"
              onClick={() => setActiveTab("TEAM_BALANCES")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeTab === "TEAM_BALANCES"
                  ? "bg-indigo-600 text-white font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Team Balances</span>
            </button>
          </div>
        </div>

        {/* Sub-filter inside approvals */}
        {activeTab === "TEAM_APPROVALS" && totalPending > 0 && (
          <div className="flex items-center gap-1.5 pt-1 text-xs border-t border-border/50">
            <span className="text-[11px] text-muted-foreground mr-1">Filter Requests:</span>
            <button
              type="button"
              onClick={() => setApprovalFilter("ALL")}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                approvalFilter === "ALL"
                  ? "bg-primary text-primary-foreground font-bold"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({totalPending})
            </button>
            <button
              type="button"
              onClick={() => setApprovalFilter("LEAVE")}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                approvalFilter === "LEAVE"
                  ? "bg-primary text-primary-foreground font-bold"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              Leave Requests ({pendingLeaveRequests.length})
            </button>
            <button
              type="button"
              onClick={() => setApprovalFilter("WFH")}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                approvalFilter === "WFH"
                  ? "bg-primary text-primary-foreground font-bold"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              WFH Requests ({pendingWfhRequests.length})
            </button>
          </div>
        )}
      </Interactive3DCard>

      {/* 3. Tab Contents */}

      {/* TAB 1: TEAM APPROVALS QUEUE (Leave + WFH) */}
      {activeTab === "TEAM_APPROVALS" && (
        <div className="space-y-3">
          {totalPending === 0 ? (
            <div className="p-12 text-center bg-card/40 rounded-2xl border border-border/60 text-xs text-muted-foreground space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
              <p className="font-semibold text-sm text-foreground">All Requests Reviewed</p>
              <p>There are no pending team leave or WFH requests requiring your sign-off.</p>
            </div>
          ) : (
            <>
              {/* Leave Requests */}
              {(approvalFilter === "ALL" || approvalFilter === "LEAVE") &&
                pendingLeaveRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-primary/40 transition-all"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-sm font-bold text-foreground">{req.employeeName}</strong>
                        <Badge variant="brand" className="text-[9px]">
                          {req.leaveType} LEAVE
                        </Badge>
                        <Badge variant="outline" className="text-[9px] text-amber-400 border-amber-500/30">
                          Pending Lead Review
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Dates: <strong className="text-foreground">{req.startDate}</strong> to <strong className="text-foreground">{req.endDate}</strong> · {req.daysCount} Day(s)
                      </p>

                      <p className="text-xs text-foreground/80 leading-relaxed bg-muted/30 p-2.5 rounded-lg border border-border/50">
                        Reason: &quot;{req.reason}&quot;
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectLeave(req.id, req.employeeName)}
                        className="text-xs font-semibold h-8 text-muted-foreground hover:text-destructive border-border"
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        <span>Decline</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="brand"
                        onClick={() => handleApproveLeave(req.id, req.employeeName)}
                        className="text-xs font-bold h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        <span>Approve & Forward</span>
                      </Button>
                    </div>
                  </div>
                ))}

              {/* WFH Requests */}
              {(approvalFilter === "ALL" || approvalFilter === "WFH") &&
                pendingWfhRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 rounded-xl border border-indigo-500/30 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-primary/40 transition-all"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-sm font-bold text-foreground">{req.employeeName}</strong>
                        <Badge variant="outline" className="text-[9px] text-cyan-400 border-cyan-500/30">
                          WORK FROM HOME (WFH)
                        </Badge>
                        <Badge variant="outline" className="text-[9px] text-amber-400 border-amber-500/30">
                          Pending Lead Review
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Date: <strong className="text-foreground">{req.startDate}</strong>
                      </p>

                      <p className="text-xs text-foreground/80 leading-relaxed bg-muted/30 p-2.5 rounded-lg border border-border/50">
                        Reason: &quot;{req.reason}&quot;
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectWfh(req.id, req.employeeName)}
                        className="text-xs font-semibold h-8 text-muted-foreground hover:text-destructive border-border"
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        <span>Decline</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="brand"
                        onClick={() => handleApproveWfh(req.id, req.employeeName)}
                        className="text-xs font-bold h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        <span>Approve &amp; Forward</span>
                      </Button>
                    </div>
                  </div>
                ))}
            </>
          )}
        </div>
      )}

      {/* TAB: HR FINAL STAGE-2 AUTHORIZATION QUEUE */}
      {activeTab === "HR_STAGE_2" && (
        <div className="space-y-3">
          {totalStage2 === 0 ? (
            <div className="p-12 text-center bg-card/40 rounded-2xl border border-border/60 text-xs text-muted-foreground space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
              <p className="font-semibold text-sm text-foreground">HR Stage-2 Queue Clear</p>
              <p>There are no forwarded leave or WFH requests pending final HR authorization.</p>
            </div>
          ) : (
            <>
              {/* Stage-2 Leave Requests */}
              {stage2LeaveRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 rounded-xl border border-pink-500/30 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-sm font-bold text-foreground">{req.employeeName}</strong>
                      <Badge variant="brand" className="text-[9px] bg-pink-500/15 text-pink-300 border-pink-500/30">
                        {req.leaveType} LEAVE
                      </Badge>
                      <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30">
                        ✓ Stage-1 Lead Approved
                      </Badge>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {req.daysCount} Day(s)
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Period: <strong className="text-foreground">{req.startDate} to {req.endDate}</strong> · Approver: <span className="text-foreground font-medium">{req.tlApproverName || "Alex Lead"}</span>
                    </p>

                    <p className="text-xs text-foreground/80 leading-relaxed bg-muted/30 p-2.5 rounded-lg border border-border/50">
                      Reason: &quot;{req.reason}&quot;
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleHRRejectLeave(req.id, req.employeeName)}
                      className="text-xs font-semibold h-8 text-muted-foreground hover:text-destructive border-border"
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      <span>Decline</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="brand"
                      onClick={() => handleHRApproveLeave(req.id, req.employeeName)}
                      className="text-xs font-bold h-8 bg-pink-600 hover:bg-pink-700 text-white shadow-sm"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      <span>Authorize &amp; Deduct</span>
                    </Button>
                  </div>
                </div>
              ))}

              {/* Stage-2 WFH Requests */}
              {stage2WfhRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 rounded-xl border border-cyan-500/30 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-sm font-bold text-foreground">{req.employeeName}</strong>
                      <Badge variant="outline" className="text-[9px] text-cyan-400 border-cyan-500/30">
                        Remote (WFH)
                      </Badge>
                      <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30">
                        ✓ Stage-1 Lead Approved
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Date: <strong className="text-foreground">{req.startDate}</strong>
                    </p>

                    <p className="text-xs text-foreground/80 leading-relaxed bg-muted/30 p-2.5 rounded-lg border border-border/50">
                      Reason: &quot;{req.reason}&quot;
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleHRRejectWfh(req.id, req.employeeName)}
                      className="text-xs font-semibold h-8 text-muted-foreground hover:text-destructive border-border"
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      <span>Decline</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="brand"
                      onClick={() => handleHRApproveWfh(req.id, req.employeeName)}
                      className="text-xs font-bold h-8 bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      <span>Authorize WFH</span>
                    </Button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* TAB: TEAM BALANCES */}
      {activeTab === "TEAM_BALANCES" && (
        <div className="p-5 rounded-xl border border-border bg-card space-y-4 shadow-sm">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-foreground">Direct Reports Time-Off Balances</h4>
            <p className="text-xs text-muted-foreground">
              Overview of remaining annual leave allowances across your direct reports.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="pb-3 font-semibold">Team Member</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold text-center">Casual Available</th>
                  <th className="pb-3 font-semibold text-center">Sick Available</th>
                  <th className="pb-3 font-semibold text-right">Total Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {teamBalances.map((m) => (
                  <tr key={m.name} className="hover:bg-muted/20">
                    <td className="py-3 font-bold text-foreground flex items-center gap-2">
                      <span className="h-7 w-7 rounded-full bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                        {m.avatar}
                      </span>
                      <span>{m.name}</span>
                    </td>
                    <td className="py-3 text-muted-foreground">{m.role}</td>
                    <td className="py-3 text-center font-mono">{m.casual.toFixed(1)} Days</td>
                    <td className="py-3 text-center font-mono">{m.sick.toFixed(1)} Days</td>
                    <td className="py-3 text-right font-mono font-bold text-emerald-400">
                      {m.total.toFixed(1)} Days
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leave Application Modal */}
      {showLeaveModal && (
        <LeaveRequestModal
          onClose={() => setShowLeaveModal(false)}
          onSuccess={() => {
            setShowLeaveModal(false);
            showToast("✓ Personal leave request submitted successfully!");
          }}
        />
      )}

      {/* WFH Request Modal */}
      {showWfhModal && (
        <WfhRequestModal
          onClose={() => setShowWfhModal(false)}
          onSuccess={() => {
            setShowWfhModal(false);
            showToast("✓ Personal WFH request submitted successfully!");
          }}
        />
      )}
    </div>
  );
}
