"use client";

import React, { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { MetricTile3D } from "@/components/3d/MetricTile3D";
import { PageTransition } from "@/components/animations/PageTransition";
import { LeaveRequestModal } from "@/features/leave/components/LeaveRequestModal";
import { WfhRequestModal } from "@/features/leave/components/WfhRequestModal";
import { LeadLeaveManager } from "@/features/leave/components/LeadLeaveManager";
import { useWorkpulseSharedStore, SharedLeaveRequest, SharedWfhRequest } from "@/lib/stores/workpulse-shared-store";
import { useCurrentUser } from "@/components/layout/UserContext";
import {
  Calendar,
  Laptop,
  Clock,
  Sparkles,
  CheckCircle2,
  PieChart,
  ShieldCheck,
  Users,
  Plus,
  Trash2,
} from "lucide-react";

type LeaveTab = "LEAVES" | "WFH" | "BALANCES";

export default function LeavePage() {
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

  const [activeTab, setActiveTab] = useState<LeaveTab>("LEAVES");
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showWfhModal, setShowWfhModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const {
    allEmployees,
    leaveRequests,
    setLeaveRequestsFromSupabase,
    wfhRequests,
    setWfhRequestsFromSupabase,
    deleteLeaveRequest,
    deleteWfhRequest,
  } = useWorkpulseSharedStore();

  const handleDeleteLeave = (id: string) => {
    const targetReq = leaveRequests.find((r) => r.id === id);
    if (targetReq) {
      // Cascade delete all duplicate copies with same dates, reason, employeeId
      const duplicates = leaveRequests.filter(
        (r) =>
          r.employeeId === targetReq.employeeId &&
          r.startDate === targetReq.startDate &&
          (r.reason || "") === (targetReq.reason || "")
      );
      duplicates.forEach((dup) => deleteLeaveRequest(dup.id));
      showToast(`✓ Removed ${duplicates.length > 1 ? `${duplicates.length} duplicate ` : ""}leave request${duplicates.length > 1 ? "s" : ""}.`);
      return;
    }
    deleteLeaveRequest(id);
    showToast("✓ Leave request permanently removed.");
  };

  const handleDeleteWfh = (id: string) => {
    const targetWfh = wfhRequests.find((r) => r.id === id);
    if (targetWfh) {
      // Cascade delete all duplicate copies with same dates, reason, employeeId
      const duplicates = wfhRequests.filter(
        (r) =>
          r.employeeId === targetWfh.employeeId &&
          r.startDate === targetWfh.startDate &&
          (r.reason || "") === (targetWfh.reason || "")
      );
      duplicates.forEach((dup) => deleteWfhRequest(dup.id));
      showToast(`✓ Removed ${duplicates.length > 1 ? `${duplicates.length} duplicate ` : ""}WFH request${duplicates.length > 1 ? "s" : ""}.`);
      return;
    }
    deleteWfhRequest(id);
    showToast("✓ WFH request permanently removed.");
  };

  const handleClearAllLeaves = () => {
    myLeaveRequests.forEach((r) => {
      const duplicates = leaveRequests.filter(
        (lr) =>
          lr.employeeId === r.employeeId &&
          lr.startDate === r.startDate &&
          (lr.reason || "") === (r.reason || "")
      );
      duplicates.forEach((dup) => deleteLeaveRequest(dup.id));
      deleteLeaveRequest(r.id);
    });
    showToast(`✓ Cleared all leave applications.`);
  };

  const handleClearAllWfh = () => {
    myWfhRequests.forEach((r) => {
      const duplicates = wfhRequests.filter(
        (wr) =>
          wr.employeeId === r.employeeId &&
          wr.startDate === r.startDate &&
          (wr.reason || "") === (r.reason || "")
      );
      duplicates.forEach((dup) => deleteWfhRequest(dup.id));
      deleteWfhRequest(r.id);
    });
    showToast(`✓ Cleared all WFH applications.`);
  };

  React.useEffect(() => {
    setMounted(true);
    fetch("/api/v1/leave")
      .then((res) => res.json())
      .then((json) => {
        if (json?.data?.requests && Array.isArray(json.data.requests)) {
          setLeaveRequestsFromSupabase(json.data.requests);
        }
      })
      .catch(() => {});

    fetch("/api/v1/leave/wfh")
      .then((res) => res.json())
      .then((json) => {
        if (json?.data?.requests && Array.isArray(json.data.requests)) {
          setWfhRequestsFromSupabase(json.data.requests);
        }
      })
      .catch(() => {});

    fetch("/api/v1/employees")
      .then((res) => res.json())
      .catch(() => {});
  }, [setLeaveRequestsFromSupabase, setWfhRequestsFromSupabase]);

  const matchedEmp = useMemo(() => {
    return (
      allEmployees.find(
        (e) =>
          e.email.toLowerCase() === user.userEmail.toLowerCase() ||
          e.name.toLowerCase() === user.userName.toLowerCase()
      ) || allEmployees[0]
    );
  }, [allEmployees, user]);

  const myLeaveRequests = useMemo(() => {
    const raw = leaveRequests.filter(
      (r: SharedLeaveRequest) =>
        (matchedEmp && (r.employeeId === matchedEmp.id || r.employeeId === matchedEmp.email)) ||
        r.employeeName?.toLowerCase() === user.userName?.toLowerCase() ||
        (user.userEmail?.toLowerCase().includes("employee.test") &&
          (r.employeeId === "emp-sarah" || r.employeeName === "Sarah Dev"))
    );
    const seen = new Set<string>();
    const unique: SharedLeaveRequest[] = [];
    for (const item of raw) {
      const sig = `${item.startDate}_${item.endDate}_${(item.reason || "").trim().toLowerCase()}_${item.status}_${item.leaveType || ""}`;
      if (!seen.has(sig)) {
        seen.add(sig);
        unique.push(item);
      }
    }
    return unique;
  }, [leaveRequests, matchedEmp, user]);

  const myWfhRequests = useMemo(() => {
    const raw = wfhRequests.filter(
      (r: SharedWfhRequest) =>
        (matchedEmp && (r.employeeId === matchedEmp.id || r.employeeId === matchedEmp.email)) ||
        r.employeeName?.toLowerCase() === user.userName?.toLowerCase() ||
        (user.userEmail?.toLowerCase().includes("employee.test") &&
          (r.employeeId === "emp-sarah" || r.employeeName === "Sarah Dev"))
    );
    const seen = new Set<string>();
    const unique: SharedWfhRequest[] = [];
    for (const item of raw) {
      const sig = `${item.startDate}_${item.endDate}_${(item.reason || "").trim().toLowerCase()}_${item.status}`;
      if (!seen.has(sig)) {
        seen.add(sig);
        unique.push(item);
      }
    }
    return unique;
  }, [wfhRequests, matchedEmp, user]);

  // Real-time Casual Leave Balance (12 days annual allotment)
  const approvedCasualDays = useMemo(() => {
    return myLeaveRequests
      .filter((r: SharedLeaveRequest) => r.status === "APPROVED" && (r.leaveType === "CASUAL" || !r.leaveType))
      .reduce((acc: number, r: SharedLeaveRequest) => acc + (r.daysCount ?? 1.0), 0);
  }, [myLeaveRequests]);

  const casualLeaveBalance = useMemo(() => {
    const base = matchedEmp?.remainingLeaveBalance ?? 12.0;
    return Math.max(0, Math.min(base, 12.0 - approvedCasualDays));
  }, [matchedEmp, approvedCasualDays]);

  // Real-time Sick Leave Balance (8 days annual allotment)
  const approvedSickDays = useMemo(() => {
    return myLeaveRequests
      .filter((r: SharedLeaveRequest) => r.status === "APPROVED" && r.leaveType === "SICK")
      .reduce((acc: number, r: SharedLeaveRequest) => acc + (r.daysCount ?? 1.0), 0);
  }, [myLeaveRequests]);

  const sickLeaveBalance = useMemo(() => {
    return Math.max(0, 8.0 - approvedSickDays);
  }, [approvedSickDays]);

  // Real-time WFH Total Days
  const wfhTotalDays = useMemo(() => {
    return myWfhRequests.reduce((acc: number, r: SharedWfhRequest) => acc + (r.daysCount ?? 1.0), 0);
  }, [myWfhRequests]);

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-28 rounded-2xl bg-card/40 border border-border/40" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-24 rounded-2xl bg-card/40 border border-border/40" />
          <div className="h-24 rounded-2xl bg-card/40 border border-border/40" />
          <div className="h-24 rounded-2xl bg-card/40 border border-border/40" />
          <div className="h-24 rounded-2xl bg-card/40 border border-border/40" />
        </div>
        <div className="h-96 rounded-2xl bg-card/40 border border-border/40" />
      </div>
    );
  }

  if (isHR || isLead) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <Interactive3DCard className="p-6 border border-border/80 bg-gradient-to-r from-card/90 via-card/70 to-card/50">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="brand" className="font-bold text-[10px] uppercase">
                  {isHR ? (
                    <>
                      <ShieldCheck className="h-3 w-3 mr-1 text-pink-400" />
                      <span>HR Leave &amp; WFH Oversight</span>
                    </>
                  ) : (
                    <>
                      <Users className="h-3 w-3 mr-1 text-indigo-400" />
                      <span>Team Leave &amp; WFH Operations</span>
                    </>
                  )}
                </Badge>
                <span className="text-[11px] text-muted-foreground font-medium">
                  {isHR ? "Organization-Wide Stage 2 Authorizations & Balances" : "Development Team · 4 Direct Reports"}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {isHR ? "Leave & WFH Oversight & Approvals" : "Team Leave & WFH Management"}
              </h2>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {isHR
                  ? "Execute Stage-2 HR leave and WFH authorizations, track organization-wide time off, and verify remaining balances."
                  : "Review direct report time-off applications, manage sprint coverage, and submit your personal leave."}
              </p>
            </div>
          </Interactive3DCard>

          <LeadLeaveManager />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Toast Feedback */}
        {toastMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="font-semibold">{toastMsg}</span>
          </div>
        )}

        {/* 1. Header Banner */}
        <Interactive3DCard className="p-6 border border-border/80 bg-gradient-to-r from-card/90 via-card/70 to-card/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="brand" className="font-bold text-[10px] uppercase">
                  <Calendar className="h-3 w-3 mr-1 text-teal-400" />
                  Time Off &amp; Remote Work
                </Badge>
                <span className="text-[11px] text-muted-foreground font-medium">
                  Stage 1 Approver: <strong className="text-foreground">Alex Lead</strong> (Team Lead)
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                Leave & Work From Home
              </h2>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Apply for planned time off, submit work-from-home requests, and track your balances.
              </p>
            </div>
          </div>
        </Interactive3DCard>

        {/* 2. Glanceable Balance Summary Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricTile3D
            title="Casual Leave (CL)"
            value={`${casualLeaveBalance} Days`}
            subtitle="Available balance"
            icon={Calendar}
            badgeText="Available"
            accent="emerald"
          />

          <MetricTile3D
            title="Sick Leave (SL)"
            value={`${sickLeaveBalance} Days`}
            subtitle="Available balance"
            icon={Clock}
            badgeText="Available"
            accent="cyan"
          />

          <MetricTile3D
            title="WFH This Month"
            value={`${wfhTotalDays} Days`}
            subtitle="Remote work sessions"
            icon={Laptop}
            badgeText="Flexible"
            accent="purple"
          />

          <MetricTile3D
            title="Next Holiday"
            value="Aug 29"
            subtitle="Ganesh Chaturthi"
            icon={Sparkles}
            badgeText="Company Holiday"
            accent="gold"
          />
        </div>

        {/* 3. Segregated Navigation Bar */}
        <Interactive3DCard className="p-4 md:p-5 border border-border/80 bg-card/60 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center p-1 rounded-xl bg-background/50 border border-border/70 overflow-x-auto gap-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("LEAVES")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === "LEAVES"
                    ? "bg-primary text-primary-foreground font-bold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Leave Requests ({myLeaveRequests.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("WFH")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === "WFH"
                    ? "bg-primary text-primary-foreground font-bold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Laptop className="h-3.5 w-3.5" />
                <span>Work From Home ({myWfhRequests.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("BALANCES")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === "BALANCES"
                    ? "bg-primary text-primary-foreground font-bold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <PieChart className="h-3.5 w-3.5" />
                <span>Leave Allowances</span>
              </button>
            </div>

            {/* Action Buttons: Visible ONLY for Core Employees */}
            {!isHR && !isLead && (
              <div className="flex items-center gap-2 shrink-0">
                {activeTab === "LEAVES" && myLeaveRequests.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClearAllLeaves}
                    className="text-xs font-semibold gap-1.5 h-8 sm:h-9 rounded-xl border-rose-500/30 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 transition-all"
                    title="Clear all leave applications"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Clear All</span>
                  </Button>
                )}

                {activeTab === "LEAVES" && (
                  <Button
                    size="sm"
                    variant="brand"
                    onClick={() => setShowLeaveModal(true)}
                    className="text-xs font-extrabold gap-1.5 h-8 sm:h-9 rounded-xl shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Request Leave</span>
                  </Button>
                )}

                {activeTab === "WFH" && myWfhRequests.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClearAllWfh}
                    className="text-xs font-semibold gap-1.5 h-8 sm:h-9 rounded-xl border-rose-500/30 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 transition-all"
                    title="Clear all WFH applications"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Clear All</span>
                  </Button>
                )}

                {activeTab === "WFH" && (
                  <Button
                    size="sm"
                    variant="brand"
                    onClick={() => setShowWfhModal(true)}
                    className="text-xs font-extrabold gap-1.5 h-8 sm:h-9 rounded-xl shadow-md bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Request WFH</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </Interactive3DCard>

        {/* 4. Tab Contents */}

        {/* TAB 1: LEAVE REQUESTS */}
        {activeTab === "LEAVES" && (
          <div className="space-y-3">
            {myLeaveRequests.length === 0 ? (
              <div className="p-12 text-center bg-card/40 rounded-2xl border border-border/60 text-xs text-muted-foreground space-y-2">
                <Calendar className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="font-semibold text-sm text-foreground">No leave applications</p>
                <p>You have not submitted any leave requests yet. Click &quot;Apply for Leave&quot; above to request time off.</p>
              </div>
            ) : (
              myLeaveRequests.map((req) => {
                const isApproved = req.status === "APPROVED";
                const isRejected = req.status === "REJECTED";
                const isStage2 =
                  req.status === "FORWARDED_TO_HR" ||
                  (req.status as string) === "PENDING_HR" ||
                  (req.status as string) === "STAGE_2";

                return (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-border/70 bg-card/70 hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-xs font-bold text-foreground">
                          {req.leaveType} Leave ({req.daysCount} {req.daysCount === 1 ? "Day" : "Days"})
                        </strong>

                        <Badge
                          variant="outline"
                          className={`text-[9px] uppercase font-bold ${
                            isApproved
                              ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                              : isRejected
                              ? "border-rose-500/30 text-rose-400 bg-rose-500/10"
                              : isStage2
                              ? "border-cyan-500/30 text-cyan-300 bg-cyan-500/10"
                              : "border-amber-500/30 text-amber-300 bg-amber-500/10"
                          }`}
                        >
                          {isApproved
                            ? "✓ Fully Approved"
                            : isRejected
                            ? "Declined"
                            : isStage2
                            ? "Stage 2: Lead Approved · Awaiting HR"
                            : "Stage 1: Pending Team Lead"}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {req.startDate} {req.startDate !== req.endDate ? `→ ${req.endDate}` : ""}
                        {req.reason && ` · "${req.reason}"`}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-[11px] text-muted-foreground font-mono">
                        Balance: {req.remainingBalance}d
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteLeave(req.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                        title="Delete leave request"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: WORK FROM HOME (WFH) REQUESTS */}
        {activeTab === "WFH" && (
          <div className="space-y-3">
            {myWfhRequests.length === 0 ? (
              <div className="p-12 text-center bg-card/40 rounded-2xl border border-border/60 text-xs text-muted-foreground space-y-2">
                <Laptop className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="font-semibold text-sm text-foreground">No WFH requests</p>
                <p>You have not logged any remote workdays. Click &quot;Request WFH&quot; above to log a remote day.</p>
              </div>
            ) : (
              myWfhRequests.map((wfh) => {
                const isApproved = wfh.status === "APPROVED";
                const isRejected = wfh.status === "REJECTED";
                const isStage2 =
                  wfh.status === "FORWARDED_TO_HR" ||
                  (wfh.status as string) === "PENDING_HR" ||
                  (wfh.status as string) === "STAGE_2";

                return (
                  <div
                    key={wfh.id}
                    className="p-4 rounded-xl border border-border/70 bg-card/70 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-xs font-bold text-foreground">
                          Remote Work ({wfh.startDate})
                        </strong>

                        <Badge
                          variant="outline"
                          className={`text-[9px] uppercase font-bold ${
                            isApproved
                              ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                              : isRejected
                              ? "border-rose-500/30 text-rose-400 bg-rose-500/10"
                              : isStage2
                              ? "border-cyan-500/30 text-cyan-300 bg-cyan-500/10"
                              : "border-amber-500/30 text-amber-300 bg-amber-500/10"
                          }`}
                        >
                          {isApproved
                            ? "✓ Fully Approved"
                            : isRejected
                            ? "Declined"
                            : isStage2
                            ? "Stage 2: Lead Approved · Awaiting HR"
                            : "Stage 1: Pending Team Lead"}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {wfh.reason || "Remote workday"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-[11px] text-muted-foreground">
                        Contact: <span className="font-mono text-cyan-400">{wfh.contactMethod}</span>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteWfh(wfh.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                        title="Delete WFH request"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 3: LEAVE ALLOWANCES BREAKDOWN */}
        {activeTab === "BALANCES" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-border bg-card space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground">Casual Leave (CL)</h4>
                <Badge variant="brand" className="text-[9px]">12 Days / Year</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                For personal errands, family events, and planned breaks. Available balance: <strong className="text-emerald-400">{casualLeaveBalance} days</strong>.
              </p>
              <div className="pt-1">
                <Button size="sm" variant="outline" onClick={() => setShowLeaveModal(true)} className="w-full text-xs h-8">
                  Apply for Casual Leave
                </Button>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground">Sick Leave (SL)</h4>
                <Badge variant="secondary" className="text-[9px]">8 Days / Year</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                For medical appointments, unexpected illness, and recovery. Available balance: <strong className="text-cyan-400">{sickLeaveBalance} days</strong>.
              </p>
              <div className="pt-1">
                <Button size="sm" variant="outline" onClick={() => setShowLeaveModal(true)} className="w-full text-xs h-8">
                  Apply for Sick Leave
                </Button>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground">Work From Home (WFH)</h4>
                <Badge variant="outline" className="text-[9px]">Flexible</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Work remotely when needed with prior notification. Monthly utilization: <strong className="text-purple-400">{wfhTotalDays} days ({myWfhRequests.length} sessions)</strong>.
              </p>
              <div className="pt-1">
                <Button size="sm" variant="outline" onClick={() => setShowWfhModal(true)} className="w-full text-xs h-8">
                  Submit WFH Request
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showLeaveModal && (
        <LeaveRequestModal
          remainingBalance={casualLeaveBalance}
          onClose={() => setShowLeaveModal(false)}
          onSuccess={() => {
            showToast("✓ Leave request applied successfully!");
          }}
        />
      )}
      {showWfhModal && (
        <WfhRequestModal
          onClose={() => setShowWfhModal(false)}
          onSuccess={() => {
            showToast("✓ WFH request applied successfully!");
          }}
        />
      )}
    </PageTransition>
  );
}
