"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { MetricTile3D } from "@/components/3d/MetricTile3D";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import {
  Calendar,
  Laptop,
  CheckCircle2,
  ShieldCheck,
  Check,
  X,
  Users,
  UserCheck,
  Layers,
} from "lucide-react";

export function HREnterpriseLeaveDesk() {
  const {
    leaveRequests,
    wfhRequests,
    departments,
    hrApproveLeave,
    hrRejectLeave,
    hrApproveWfh,
    hrRejectWfh,
    setLeaveRequestsFromSupabase,
    setWfhRequestsFromSupabase,
    syncWithSupabase,
  } = useWorkpulseSharedStore();

  const [activeSubTab, setActiveSubTab] = useState<"queue" | "ledger" | "wfh" | "forecaster">("queue");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("ALL");
  const [hrRemarks, setHrRemarks] = useState<{ [id: string]: string }>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  React.useEffect(() => {
    syncWithSupabase(true);
    fetch("/api/v1/leave")
      .then((res) => res.json())
      .then((json) => {
        const reqs = json?.data?.requests || json?.requests;
        if (Array.isArray(reqs)) {
          setLeaveRequestsFromSupabase(reqs);
        }
      })
      .catch(() => {});
    fetch("/api/v1/leave/wfh")
      .then((res) => res.json())
      .then((json) => {
        const reqs = json?.data?.requests || json?.requests;
        if (Array.isArray(reqs)) {
          setWfhRequestsFromSupabase(reqs);
        }
      })
      .catch(() => {});
  }, [syncWithSupabase, setLeaveRequestsFromSupabase, setWfhRequestsFromSupabase]);

  // Filter pending stage-2 requests
  const pendingLeaves = leaveRequests.filter(
    (r) =>
      r.status === "FORWARDED_TO_HR" ||
      (r.status as string) === "PENDING_HR" ||
      (r.status as string) === "STAGE_2"
  );
  const pendingWfhs = wfhRequests.filter(
    (r) =>
      r.status === "FORWARDED_TO_HR" ||
      (r.status as string) === "PENDING_HR" ||
      (r.status as string) === "STAGE_2"
  );
  const totalPendingStage2 = pendingLeaves.length + pendingWfhs.length;

  const getHrAuthHeaders = () => ({
    "Content-Type": "application/json",
    "x-user-email": typeof window !== "undefined"
      ? sessionStorage.getItem("workpulse_session_email") || sessionStorage.getItem("workpulse_user_email") || "hr.test@xorstack.com"
      : "hr.test@xorstack.com",
  });

  const handleApproveLeave = async (id: string, name: string) => {
    const comment = hrRemarks[id] || "Authorized by HR People Operations with standard balance deduction.";
    hrApproveLeave(id, comment);
    setToastMsg(`Stage-2 Leave for ${name} approved and finalized! ✓`);
    setTimeout(() => setToastMsg(null), 3000);

    try {
      await fetch(`/api/v1/leave/${id}/approve`, {
        method: "POST",
        headers: getHrAuthHeaders(),
        body: JSON.stringify({ comment, stage: "STAGE_2" }),
      });
    } catch (e) {
      console.warn("Failed to persist HR leave approval to API:", e);
    }
  };

  const handleRejectLeave = async (id: string, name: string) => {
    const comment = hrRemarks[id] || "Rejected by HR due to sprint team capacity overlap.";
    hrRejectLeave(id, comment);
    setToastMsg(`Leave application for ${name} rejected.`);
    setTimeout(() => setToastMsg(null), 3000);

    try {
      await fetch(`/api/v1/leave/${id}/reject`, {
        method: "POST",
        headers: getHrAuthHeaders(),
        body: JSON.stringify({ reason: comment, stage: "STAGE_2" }),
      });
    } catch (e) {
      console.warn("Failed to persist HR leave rejection to API:", e);
    }
  };

  const handleApproveWfh = async (id: string, name: string) => {
    const comment = hrRemarks[id] || "Authorized WFH session. Shift 10:00 AM - 07:00 PM.";
    hrApproveWfh(id, comment);
    setToastMsg(`Stage-2 WFH for ${name} authorized! ✓`);
    setTimeout(() => setToastMsg(null), 3000);

    try {
      await fetch(`/api/v1/leave/wfh/${id}/approve`, {
        method: "POST",
        headers: getHrAuthHeaders(),
        body: JSON.stringify({ comment, stage: "STAGE_2" }),
      });
    } catch (e) {
      console.warn("Failed to persist HR WFH approval to API:", e);
    }
  };

  const handleRejectWfh = async (id: string, name: string) => {
    const comment = hrRemarks[id] || "Rejected by HR.";
    hrRejectWfh(id, comment);
    setToastMsg(`WFH application for ${name} rejected.`);
    setTimeout(() => setToastMsg(null), 3000);

    try {
      await fetch(`/api/v1/leave/wfh/${id}/reject`, {
        method: "POST",
        headers: getHrAuthHeaders(),
        body: JSON.stringify({ reason: comment, stage: "STAGE_2" }),
      });
    } catch (e) {
      console.warn("Failed to persist HR WFH rejection to API:", e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-bold">{toastMsg}</span>
        </div>
      )}

      {/* 3D Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile3D
          title="Stage-2 Sign-off Queue"
          value={`${totalPendingStage2} Applications`}
          subtitle="Team Lead approved; awaiting HR sign-off"
          icon={ShieldCheck}
          change={totalPendingStage2 > 0 ? "Action Required" : "Queue Empty"}
          changePositive={totalPendingStage2 === 0}
          badgeText={`Queue: ${totalPendingStage2}`}
          accent="rose"
          onClick={() => setActiveSubTab("queue")}
        />

        <MetricTile3D
          title="Org Leave Consumption"
          value="7.4% Avg Used"
          subtitle="Healthy balance across 6 departments"
          icon={Calendar}
          change="Policy Healthy"
          changePositive={true}
          badgeText="Allotted: 20 Days"
          accent="emerald"
          onClick={() => setActiveSubTab("ledger")}
        />

        <MetricTile3D
          title="Active Remote (WFH)"
          value={`${wfhRequests.filter((w) => w.status === "APPROVED").length} Approved`}
          subtitle="Mon–Fri 10:00 AM – 07:00 PM quota"
          icon={Laptop}
          change="Within Quota"
          changePositive={true}
          badgeText="Active"
          accent="cyan"
          onClick={() => setActiveSubTab("wfh")}
        />

        <MetricTile3D
          title="Sprint Team Staffing"
          value="94.6% Available"
          subtitle="Zero critical staffing bottlenecks"
          icon={Users}
          change="Optimal"
          changePositive={true}
          badgeText="Safe Buffer"
          accent="purple"
          onClick={() => setActiveSubTab("forecaster")}
        />
      </div>

      {/* Sub-navigation Pills */}
      <div className="flex items-center p-1.5 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-xl overflow-x-auto gap-1 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveSubTab("queue")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === "queue"
              ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Stage-2 HR Approval Desk</span>
          {totalPendingStage2 > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-extrabold">
              {totalPendingStage2}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("ledger")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === "ledger"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Department Leave Balance Ledger</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("wfh")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === "wfh"
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Laptop className="h-3.5 w-3.5" />
          <span>Remote Work (WFH) Compliance Radar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("forecaster")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === "forecaster"
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Department Capacity & Absence Forecaster</span>
        </button>
      </div>

      {/* VIEW 1: STAGE-2 APPROVAL QUEUE */}
      {activeSubTab === "queue" && (
        <div className="space-y-6">
          {/* Leaves Section */}
          <Interactive3DCard className="p-6 space-y-4 border-border/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-pink-400" />
                  Leave Applications Pending HR Stage-2 Authorization ({pendingLeaves.length})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Each application has passed Stage 1 Team Lead sprint review and requires final HR compliance sign-off.
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] text-pink-300 border-pink-500/30">
                Two-Stage RBAC Active
              </Badge>
            </div>

            {pendingLeaves.length === 0 ? (
              <div className="p-8 text-center bg-card/40 rounded-xl border border-border/50 text-xs text-muted-foreground space-y-1">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                <p className="font-bold text-foreground">All Leave Applications Reviewed</p>
                <p>No leave requests pending in HR Stage-2 queue.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingLeaves.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 rounded-2xl bg-card/60 border border-pink-500/30 space-y-3.5 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">{req.employeeName}</span>
                          <span className="text-xs text-muted-foreground">({req.designation})</span>
                          <Badge variant="brand" className="text-[10px] bg-purple-500/15 text-purple-300 border-purple-500/30">
                            {req.departmentName}
                          </Badge>
                        </div>

                        <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-3">
                          <span className="font-bold text-pink-300 font-mono">
                            {req.leaveType} LEAVE ({req.daysCount} {req.daysCount === 1 ? "Day" : "Days"})
                          </span>
                          <span>·</span>
                          <span className="font-mono text-foreground">
                            {req.startDate} {req.startDate !== req.endDate ? `→ ${req.endDate}` : ""}
                          </span>
                          <span>·</span>
                          <span>
                            Remaining Balance: <strong className="text-emerald-400">{req.remainingBalance} Days</strong>
                          </span>
                        </div>
                      </div>

                      <Badge variant="outline" className="text-[10px] bg-amber-500/15 text-amber-300 border-amber-500/30 uppercase font-bold shrink-0">
                        Stage 2: Pending HR Sign-off
                      </Badge>
                    </div>

                    <div className="p-3 rounded-xl bg-background/50 border border-border/70 text-xs space-y-1">
                      <span className="text-muted-foreground font-bold block">Employee Stated Reason:</span>
                      <p className="text-foreground">{req.reason}</p>
                      {req.handoverNotes && (
                        <p className="text-muted-foreground text-[11px]">
                          <strong className="text-foreground">Handover:</strong> {req.handoverNotes} (Backup: {req.backupPersonName})
                        </p>
                      )}
                    </div>

                    {/* Stage 1 Lead Approver Box */}
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs flex items-start gap-2.5">
                      <UserCheck className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <strong className="text-purple-300 font-bold">Stage-1 Approval by Designated Lead:</strong>
                          <span className="text-muted-foreground font-mono text-[10px]">{req.tlApproverName}</span>
                        </div>
                        <p className="text-foreground/90 italic">&quot;{req.tlComment}&quot;</p>
                      </div>
                    </div>

                    {/* HR Action & Remarks Box */}
                    <div className="pt-2 border-t border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <input
                        type="text"
                        placeholder="Add HR compliance notes or payroll instructions..."
                        value={hrRemarks[req.id] || ""}
                        onChange={(e) => setHrRemarks({ ...hrRemarks, [req.id]: e.target.value })}
                        className="flex-1 px-3.5 py-1.5 rounded-xl bg-background/80 border border-border/80 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-pink-500/50"
                      />

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="brand"
                          size="sm"
                          onClick={() => handleApproveLeave(req.id, req.employeeName)}
                          className="text-xs font-bold h-8 bg-gradient-to-r from-pink-500 to-rose-600 text-white gap-1.5 shadow-md"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>1-Click Final Sign-off</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectLeave(req.id, req.employeeName)}
                          className="text-xs font-bold h-8 border-red-500/40 text-red-400 hover:bg-red-500/10 gap-1.5"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Interactive3DCard>

          {/* WFH Section */}
          <Interactive3DCard className="p-6 space-y-4 border-border/80">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Laptop className="h-4 w-4 text-cyan-400" />
                  Remote Work (WFH) Requests Pending HR Authorization ({pendingWfhs.length})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Verify availability hours (10:00 AM – 07:00 PM) and lead sprint alignment.
                </p>
              </div>
            </div>

            {pendingWfhs.length === 0 ? (
              <div className="p-6 text-center bg-card/40 rounded-xl border border-border/50 text-xs text-muted-foreground">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-1" />
                <span>No remote work applications pending HR authorization.</span>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingWfhs.map((wfh) => (
                  <div
                    key={wfh.id}
                    className="p-4 rounded-xl bg-card/60 border border-cyan-500/30 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-foreground">
                          {wfh.employeeName} · {wfh.departmentName}
                        </span>
                        <span className="text-[11px] text-muted-foreground block font-mono">
                          Date: {wfh.startDate} · Hours: {wfh.availabilityHours}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[9px] uppercase bg-cyan-500/15 text-cyan-300 border-cyan-500/30 font-bold">
                        Stage 2 HR
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground">{wfh.reason}</p>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                      <Button
                        variant="brand"
                        size="sm"
                        onClick={() => handleApproveWfh(wfh.id, wfh.employeeName)}
                        className="text-xs font-bold h-7 bg-gradient-to-r from-cyan-500 to-blue-600 text-white gap-1"
                      >
                        <Check className="h-3 w-3" />
                        <span>Authorize WFH</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectWfh(wfh.id, wfh.employeeName)}
                        className="text-xs font-bold h-7 border-red-500/40 text-red-400 hover:bg-red-500/10 gap-1"
                      >
                        <X className="h-3 w-3" />
                        <span>Reject</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Interactive3DCard>
        </div>
      )}

      {/* VIEW 2: DEPARTMENT LEAVE BALANCE LEDGER */}
      {activeSubTab === "ledger" && (
        <Interactive3DCard className="p-6 space-y-4 border-border/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-400" />
                Cross-Department Leave Entitlement & Consumption Ledger
              </h3>
              <p className="text-xs text-muted-foreground">
                Policy Allotment: 12 Casual Leaves (CL) + 8 Sick Leaves (SL) = 20 Days Total Annual Entitlement.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none"
              >
                <option value="ALL">All 6 Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {departments
              .filter((d) => selectedDeptFilter === "ALL" || d.id === selectedDeptFilter)
              .map((dept) => {
                const totalDeptEmps = dept.employees.length;
                const totalAllotted = totalDeptEmps * 20;
                const totalRemaining = dept.employees.reduce((acc, e) => acc + e.remainingLeaveBalance, 0);
                const totalUsed = totalAllotted - totalRemaining;
                const usagePercent = Math.round((totalUsed / totalAllotted) * 100);

                return (
                  <div
                    key={dept.id}
                    className="p-4 rounded-xl bg-card/60 border border-border/80 space-y-3 hover:border-purple-500/40 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground">{dept.name}</span>
                      <Badge variant="outline" className={`text-[9px] ${dept.badgeColor}`}>
                        {totalDeptEmps} Staff
                      </Badge>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Balance Remaining:</span>
                        <strong className="text-emerald-400 font-mono">{totalRemaining.toFixed(1)} / {totalAllotted} Days</strong>
                      </div>
                      <div className="progress-track-line">
                        <div
                          className="progress-track-fill-purple"
                          style={{ width: `${100 - usagePercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground block text-right font-mono">
                        {usagePercent}% Utilized
                      </span>
                    </div>

                    <div className="pt-2 border-t border-border/60 space-y-1.5 text-xs">
                      {dept.employees.map((emp) => (
                        <div key={emp.id} className="flex items-center justify-between text-[11px]">
                          <span className="text-foreground truncate max-w-[140px]">{emp.name}</span>
                          <span className="font-mono text-cyan-400 font-bold">{emp.remainingLeaveBalance}d left</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </Interactive3DCard>
      )}

      {/* VIEW 3: REMOTE WORK COMPLIANCE RADAR */}
      {activeSubTab === "wfh" && (
        <Interactive3DCard className="p-6 space-y-4 border-border/80">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Laptop className="h-4 w-4 text-cyan-400" />
                Remote Work (WFH) Quota & Shift Adherence Matrix
              </h3>
              <p className="text-xs text-muted-foreground">
                Company Policy: Mon–Fri work span (10:00 AM – 07:00 PM) with active Slack/Teams presence.
              </p>
            </div>

            <Badge variant="outline" className="text-[10px] text-cyan-300 border-cyan-500/30">
              Mon–Fri 10AM–7PM Active
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {wfhRequests.map((wfh) => (
              <div
                key={wfh.id}
                className="p-4 rounded-xl bg-card/60 border border-border/80 space-y-2.5 text-xs hover:border-cyan-500/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{wfh.employeeName}</span>
                  <Badge
                    variant="outline"
                    className={`text-[9px] uppercase font-bold ${
                      wfh.status === "APPROVED"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                    }`}
                  >
                    {wfh.status}
                  </Badge>
                </div>

                <div className="text-[11px] text-muted-foreground space-y-1">
                  <div>Department: <strong className="text-foreground">{wfh.departmentName}</strong></div>
                  <div>Session Date: <span className="font-mono text-cyan-400">{wfh.startDate}</span></div>
                  <div>Availability Hours: <span className="text-foreground">{wfh.availabilityHours}</span></div>
                  <div>Contact Method: <span className="font-mono text-foreground">{wfh.contactMethod}</span></div>
                </div>

                <div className="p-2 rounded-lg bg-muted/30 text-[10px] text-muted-foreground border border-border/50">
                  <strong className="text-foreground">Planned Deliverables:</strong> {wfh.plannedDeliverables}
                </div>
              </div>
            ))}
          </div>
        </Interactive3DCard>
      )}

      {/* VIEW 4: CAPACITY & ABSENCE FORECASTER */}
      {activeSubTab === "forecaster" && (
        <Interactive3DCard className="p-6 space-y-4 border-border/80">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              Department Sprint Staffing & Capacity Forecaster
            </h3>
            <p className="text-xs text-muted-foreground">
              Predictive simulation ensuring that critical sprint teams maintain &ge; 80% physical or remote staffing coverage.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="p-4 rounded-xl bg-card/60 border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{dept.name}</span>
                    <span className="text-muted-foreground font-mono text-[10px]">(Lead: {dept.teamLead.name})</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Active Roster: {dept.employees.length + 1} Total Staff · 0 Critical Staffing Conflicts
                  </span>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-400 text-sm">100% Available</span>
                    <span className="text-[10px] text-muted-foreground block">This &amp; Next Week Green</span>
                  </div>

                  <Badge variant="brand" className="text-[9px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30 uppercase font-bold">
                    Safe
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Interactive3DCard>
      )}
    </div>
  );
}
