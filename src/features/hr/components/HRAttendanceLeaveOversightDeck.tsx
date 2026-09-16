"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import {
  Calendar,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Users,
  ShieldCheck,
  Check,
  X,
  Search,
  ArrowUpDown,
} from "lucide-react";

interface AttendanceAnomalyPattern {
  id: string;
  employeeName: string;
  department: string;
  designation: string;
  lateArrivalsCount: number; // Post 10:15 AM grace window
  missingPunchesCount: number;
  unresolvedRegularizationsCount: number;
  patternSeverity: "ATTENTION" | "MODERATE" | "CLEAN";
  lastAnomalyDate: string;
}

interface WfhPatternRecord {
  id: string;
  employeeName: string;
  department: string;
  designation: string;
  wfhDaysThisMonth: number;
  fridayWfhFrequency: string; // e.g. "4 of last 4 Fridays"
  patternNotes: string;
  leadRecommendation: string;
}

const INITIAL_ANOMALIES: AttendanceAnomalyPattern[] = [
  {
    id: "anom-1",
    employeeName: "Rohit Sharma",
    department: "Development",
    designation: "Frontend Engineer (UI/UX)",
    lateArrivalsCount: 4,
    missingPunchesCount: 2,
    unresolvedRegularizationsCount: 1,
    patternSeverity: "ATTENTION",
    lastAnomalyDate: "Yesterday (10:32 AM)",
  },
  {
    id: "anom-2",
    employeeName: "Ananya Sen",
    department: "Service Providers (ConfigTap)",
    designation: "Automation & Embedded QA Engineer",
    lateArrivalsCount: 3,
    missingPunchesCount: 1,
    unresolvedRegularizationsCount: 0,
    patternSeverity: "MODERATE",
    lastAnomalyDate: "Aug 18 (10:24 AM)",
  },
  {
    id: "anom-3",
    employeeName: "Sneha Kapoor",
    department: "Data processing",
    designation: "Data Analytics Engineer",
    lateArrivalsCount: 2,
    missingPunchesCount: 0,
    unresolvedRegularizationsCount: 0,
    patternSeverity: "CLEAN",
    lastAnomalyDate: "Aug 14 (10:18 AM)",
  },
];

const INITIAL_WFH_PATTERNS: WfhPatternRecord[] = [
  {
    id: "wfh-pat-1",
    employeeName: "Priya QA",
    department: "R & D",
    designation: "QA & Automation Lead",
    wfhDaysThisMonth: 6,
    fridayWfhFrequency: "Every Friday (4 of 4)",
    patternNotes: "Recurring remote pattern on Fridays for regression release sprints.",
    leadRecommendation: "Supportive dialogue: confirm home workspace setup meets zero-trust VPN SLAs.",
  },
  {
    id: "wfh-pat-2",
    employeeName: "Karthik Raja",
    department: "Devops",
    designation: "DevOps & Cloud Engineer",
    wfhDaysThisMonth: 5,
    fridayWfhFrequency: "Mondays & Fridays",
    patternNotes: "Extended weekend boundary pattern for cloud deployments.",
    leadRecommendation: "Check in during 1-on-1 to align team core hours with on-site cloud deployments.",
  },
];

export function HRAttendanceLeaveOversightDeck({ defaultSubTab = "queue" }: { defaultSubTab?: string }) {
  const {
    departments,
    allEmployees,
    leaveRequests,
    wfhRequests,
    hrApproveLeave,
    hrRejectLeave,
    hrApproveWfh,
    hrRejectWfh,
  } = useWorkpulseSharedStore();

  const [activeTab, setActiveTab] = useState<"queue" | "ledger" | "anomalies" | "wfh_patterns" | "forecaster">(
    defaultSubTab === "pending_queue" ? "queue" : (defaultSubTab as any) || "queue"
  );

  const [hrRemarks, setHrRemarks] = useState<Record<string, string>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Sorting state for Leave Ledger
  const [sortField, setSortField] = useState<"used" | "remaining" | "name">("remaining");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [ledgerSearch, setLedgerSearch] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

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
  const totalPending = pendingLeaves.length + pendingWfhs.length;

  const handleApproveLeave = async (id: string, name: string) => {
    const comment = hrRemarks[id] || "Authorized by HR People Operations with standard balance deduction.";
    hrApproveLeave(id, comment);
    showToast(`Stage-2 Leave for ${name} approved and finalized! ✓`);
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

  const handleRejectLeave = async (id: string, name: string) => {
    const comment = hrRemarks[id] || "Rejected during HR policy review.";
    hrRejectLeave(id, comment);
    showToast(`Leave application for ${name} rejected.`);
    try {
      await fetch(`/api/v1/leave/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: comment }),
      });
    } catch (e) {
      console.warn("Failed to persist HR leave rejection to API:", e);
    }
  };

  const handleApproveWfh = async (id: string, name: string) => {
    const comment = hrRemarks[id] || "Authorized WFH session. Shift 10:00 AM - 07:00 PM.";
    hrApproveWfh(id, comment);
    showToast(`Stage-2 WFH for ${name} authorized! ✓`);
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

  const handleRejectWfh = async (id: string, name: string) => {
    const comment = hrRemarks[id] || "Rejected during HR policy check.";
    hrRejectWfh(id, comment);
    showToast(`WFH application for ${name} rejected.`);
    try {
      await fetch(`/api/v1/leave/wfh/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: comment }),
      });
    } catch (e) {
      console.warn("Failed to persist HR WFH rejection to API:", e);
    }
  };

  // Build leave ledger
  const leaveLedger = allEmployees.map((emp) => {
    const allotted = 18.0;
    const remaining = emp.remainingLeaveBalance || 11.0;
    const used = Number((allotted - remaining).toFixed(1));
    const usageRatio = used / allotted;
    const isHighUsage = usageRatio > 0.65;
    const isLowUsage = usageRatio < 0.15;

    return {
      id: emp.id,
      name: emp.name,
      department: emp.departmentName,
      allotted,
      used,
      remaining,
      usageRatio,
      isHighUsage,
      isLowUsage,
    };
  });

  const sortedLedger = [...leaveLedger]
    .filter((emp) => emp.name.toLowerCase().includes(ledgerSearch.toLowerCase()) || emp.department.toLowerCase().includes(ledgerSearch.toLowerCase()))
    .sort((a, b) => {
      if (sortField === "remaining") return sortOrder === "asc" ? a.remaining - b.remaining : b.remaining - a.remaining;
      if (sortField === "used") return sortOrder === "asc" ? a.used - b.used : b.used - a.used;
      return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    });

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center p-1.5 rounded-xl bg-card/60 border border-border/80 overflow-x-auto gap-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("queue")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold transition-all ${
            activeTab === "queue"
              ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Stage-2 Final Approval Queue</span>
          {totalPending > 0 && (
            <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4 ml-1">
              {totalPending}
            </Badge>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ledger")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold transition-all ${
            activeTab === "ledger"
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Leave Balance Ledger</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("anomalies")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold transition-all ${
            activeTab === "anomalies"
              ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Attendance Anomaly Radar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("wfh_patterns")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold transition-all ${
            activeTab === "wfh_patterns"
              ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Laptop className="h-3.5 w-3.5" />
          <span>WFH Pattern Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("forecaster")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold transition-all ${
            activeTab === "forecaster"
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Team Staffing Forecaster</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 1. STAGE-2 HR FINAL APPROVAL QUEUE                              */}
      {/* ============================================================== */}
      {activeTab === "queue" && (
        <Interactive3DCard className="p-6 border border-pink-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-pink-400" />
                Stage-2 HR Final Sign-Off Desk ({totalPending} Pending)
              </h3>
              <p className="text-xs text-muted-foreground">
                Requests already approved by designated Team Leads awaiting final HR statutory compliance authorization.
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-bold text-pink-300 border-pink-500/30">
              Mandatory Dual Approval
            </Badge>
          </div>

          {totalPending === 0 ? (
            <div className="p-8 text-center bg-card/40 rounded-xl border border-border text-xs text-muted-foreground space-y-1">
              <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-1" />
              <div className="font-bold text-foreground">All Stage-2 Requests Cleared</div>
              <div>No pending leave or WFH applications currently require HR action.</div>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              {/* Pending Leaves */}
              {pendingLeaves.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl bg-card/60 border border-border/80 space-y-3 hover:border-pink-500/40 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">{req.employeeName}</span>
                        <span className="text-[11px] text-muted-foreground">({req.departmentName})</span>
                        <Badge variant="brand" className="text-[9px] bg-pink-500/15 text-pink-300 border-pink-500/30">
                          {req.leaveType} ({req.daysCount}d)
                        </Badge>
                        <Badge variant="outline" className="text-[9px] border-emerald-500/40 text-emerald-400">
                          ✓ Lead Approved
                        </Badge>
                      </div>

                      <div className="text-[11px] text-muted-foreground">
                        Duration: <strong className="text-foreground">{req.startDate} to {req.endDate}</strong> · Reason: &quot;{req.reason}&quot;
                      </div>

                      <div className="text-[10px] text-purple-300">
                        Lead ({req.tlApproverName}): &quot;{req.tlComment}&quot; · Handover: {req.backupPersonName}
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-muted-foreground shrink-0 font-mono">
                      <span>Balance after approval:</span>{" "}
                      <strong className="text-emerald-400 font-bold">
                        {Math.max(0, req.remainingBalance - req.daysCount).toFixed(1)} Days
                      </strong>
                    </div>
                  </div>

                  {/* HR Action & Remark Bar */}
                  <div className="pt-2 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <Input
                      value={hrRemarks[req.id] || ""}
                      onChange={(e) => setHrRemarks({ ...hrRemarks, [req.id]: e.target.value })}
                      placeholder="Add HR remarks / statutory justification (e.g. Authorized with standard CL deduction)"
                      className="h-8 text-xs flex-1"
                    />

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="brand"
                        size="sm"
                        onClick={() => handleApproveLeave(req.id, req.employeeName)}
                        className="text-xs font-bold h-8 bg-gradient-to-r from-pink-500 to-rose-600 text-white gap-1"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Authorize Leave</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectLeave(req.id, req.employeeName)}
                        className="text-xs font-bold h-8 border-red-500/40 text-red-400 hover:bg-red-500/10 gap-1"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pending WFHs */}
              {pendingWfhs.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl bg-card/60 border border-border/80 space-y-3 hover:border-cyan-500/40 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">{req.employeeName}</span>
                        <span className="text-[11px] text-muted-foreground">({req.departmentName})</span>
                        <Badge variant="brand" className="text-[9px] bg-cyan-500/15 text-cyan-300 border-cyan-500/30">
                          Remote WFH ({req.daysCount}d)
                        </Badge>
                        <Badge variant="outline" className="text-[9px] border-emerald-500/40 text-emerald-400">
                          ✓ Lead Approved
                        </Badge>
                      </div>

                      <div className="text-[11px] text-muted-foreground">
                        Date: <strong className="text-foreground">{req.startDate}</strong> · Deliverable: &quot;{req.plannedDeliverables}&quot;
                      </div>

                      <div className="text-[10px] text-cyan-300">
                        Shift: {req.availabilityHours} · Lead ({req.tlApproverName}): &quot;{req.tlComment}&quot;
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-muted-foreground shrink-0 font-mono">
                      <span>Shift Hours:</span> <strong className="text-foreground">10:00 AM – 07:00 PM</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <Input
                      value={hrRemarks[req.id] || ""}
                      onChange={(e) => setHrRemarks({ ...hrRemarks, [req.id]: e.target.value })}
                      placeholder="Add HR remarks for remote session..."
                      className="h-8 text-xs flex-1"
                    />

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="brand"
                        size="sm"
                        onClick={() => handleApproveWfh(req.id, req.employeeName)}
                        className="text-xs font-bold h-8 bg-gradient-to-r from-cyan-500 to-blue-600 text-white gap-1"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Authorize WFH</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectWfh(req.id, req.employeeName)}
                        className="text-xs font-bold h-8 border-red-500/40 text-red-400 hover:bg-red-500/10 gap-1"
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
      )}

      {/* ============================================================== */}
      {/* 2. LEAVE BALANCE OVERVIEW TABLE                                */}
      {/* ============================================================== */}
      {activeTab === "ledger" && (
        <Interactive3DCard className="p-6 border border-cyan-500/30 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-cyan-400" />
                Organization Leave Balance Ledger ({sortedLedger.length} Records)
              </h3>
              <p className="text-xs text-muted-foreground">
                Allotted, used, and remaining annual quota (18.0 days base) with high/low exhaustion flags.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-40">
                <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                <Input
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                  placeholder="Filter employee..."
                  className="h-8 text-xs pl-8"
                />
              </div>

              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                className="h-8 px-2 rounded-md border border-input bg-card text-xs font-semibold text-foreground focus:outline-none"
              >
                <option value="remaining">Sort: Remaining</option>
                <option value="used">Sort: Used YTD</option>
                <option value="name">Sort: Name</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                }}
                className="text-xs h-8 px-2.5 gap-1"
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span>{sortOrder.toUpperCase()}</span>
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border/80 bg-card/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border/60">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Department</th>
                  <th className="p-3 text-right">Allotted</th>
                  <th className="p-3 text-right">Used YTD</th>
                  <th className="p-3 text-right">Remaining Balance</th>
                  <th className="p-3 text-center">Usage Signal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-mono">
                {sortedLedger.map((rec) => (
                  <tr key={rec.id} className="hover:bg-muted/20 transition-colors font-sans">
                    <td className="p-3 font-bold text-foreground">{rec.name}</td>
                    <td className="p-3 text-cyan-400 font-medium">{rec.department}</td>
                    <td className="p-3 text-right font-mono">{rec.allotted.toFixed(1)}d</td>
                    <td className="p-3 text-right font-mono text-amber-300 font-bold">{rec.used.toFixed(1)}d</td>
                    <td className="p-3 text-right font-mono text-emerald-400 font-bold">{rec.remaining.toFixed(1)}d</td>
                    <td className="p-3 text-center font-sans">
                      {rec.isHighUsage ? (
                        <Badge variant="destructive" className="text-[9px]">
                          ⚠️ High Usage (&gt;65%)
                        </Badge>
                      ) : rec.isLowUsage ? (
                        <Badge variant="outline" className="text-[9px] text-purple-300 border-purple-500/30">
                          Low Usage (Rest Encouraged)
                        </Badge>
                      ) : (
                        <Badge variant="brand" className="text-[9px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                          Balanced
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Interactive3DCard>
      )}

      {/* ============================================================== */}
      {/* 3. ATTENDANCE ANOMALY RADAR                                    */}
      {/* ============================================================== */}
      {activeTab === "anomalies" && (
        <Interactive3DCard className="p-6 border border-amber-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Attendance Anomaly & Punctuality Pattern Radar
              </h3>
              <p className="text-xs text-muted-foreground">
                Surfaces pattern-level biometric anomalies (punches past 10:15 AM grace window, missing swipes) over the active billing cycle.
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-bold text-amber-300 border-amber-500/30">
              Grace Window: 10:15 AM
            </Badge>
          </div>

          <div className="space-y-3 text-xs">
            {INITIAL_ANOMALIES.map((anom) => (
              <div
                key={anom.id}
                className="p-4 rounded-xl bg-card/60 border border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground text-sm">{anom.employeeName}</span>
                    <Badge variant="outline" className="text-[9px] text-cyan-300 border-cyan-500/30">
                      {anom.department}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">{anom.designation}</span>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-mono">
                    <span>Late Arrivals (&gt;10:15 AM): <strong className="text-amber-400">{anom.lateArrivalsCount}x</strong></span>
                    <span>Missing Punches: <strong className="text-rose-400">{anom.missingPunchesCount}</strong></span>
                    <span>Last Anomaly: {anom.lastAnomalyDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge
                    variant="brand"
                    className={`text-[9px] font-bold ${
                      anom.patternSeverity === "ATTENTION"
                        ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                        : anom.patternSeverity === "MODERATE"
                        ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                        : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    }`}
                  >
                    {anom.patternSeverity === "ATTENTION" ? "Frequent Late Arrival Pattern" : "Moderate Pattern"}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => showToast(`Regularization follow-up initiated for ${anom.employeeName}.`)}
                    className="text-xs h-7 border-border"
                  >
                    <span>Regularization Desk</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Interactive3DCard>
      )}

      {/* ============================================================== */}
      {/* 4. WFH PATTERN OVERVIEW                                         */}
      {/* ============================================================== */}
      {activeTab === "wfh_patterns" && (
        <Interactive3DCard className="p-6 border border-purple-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Laptop className="h-4 w-4 text-purple-400" />
                Remote Work (WFH) Pattern Overview
              </h3>
              <p className="text-xs text-muted-foreground">
                Surfaces recurring remote habits (e.g. repeated Friday/Monday WFH) supportively to aid Team Lead alignment — non-punitive visibility signal.
              </p>
            </div>
            <Badge variant="outline" className="text-xs text-purple-300 border-purple-500/30">
              Dialogue Signal Only
            </Badge>
          </div>

          <div className="space-y-3 text-xs">
            {INITIAL_WFH_PATTERNS.map((pat) => (
              <div
                key={pat.id}
                className="p-4 rounded-xl bg-card/60 border border-border/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground text-sm">{pat.employeeName}</span>
                    <span className="text-[11px] text-muted-foreground">({pat.department} · {pat.designation})</span>
                  </div>
                  <Badge variant="brand" className="text-[9px] bg-purple-500/15 text-purple-300 border-purple-500/30 font-bold">
                    {pat.fridayWfhFrequency}
                  </Badge>
                </div>

                <p className="text-[11px] text-muted-foreground">
                  Observed Pattern: <span className="text-foreground/90 font-medium">{pat.patternNotes}</span>
                </p>

                <div className="p-2.5 rounded-lg bg-background/50 border border-border text-[11px] text-cyan-300">
                  <strong>Lead Check-in Guidance:</strong> {pat.leadRecommendation}
                </div>
              </div>
            ))}
          </div>
        </Interactive3DCard>
      )}

      {/* ============================================================== */}
      {/* 5. TEAM STAFFING & CAPACITY FORECASTER                          */}
      {/* ============================================================== */}
      {activeTab === "forecaster" && (
        <Interactive3DCard className="p-6 border border-emerald-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-400" />
                Cross-Department Staffing & Absence Forecaster
              </h3>
              <p className="text-xs text-muted-foreground">
                14-day rolling capacity forecaster flagging any department projected below the safe minimum staffing threshold (&lt;70%).
              </p>
            </div>
            <Badge variant="brand" className="text-xs bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
              Safe Staffing: &gt;70%
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs pt-1">
            {departments.map((dept) => {
              const totalStaff = dept.employees.length + 1;
              const projectedOnLeave = dept.id === "dept-development" ? 1 : 0;
              const capacityPct = Math.round(((totalStaff - projectedOnLeave) / totalStaff) * 100);

              return (
                <div
                  key={dept.id}
                  className="p-4 rounded-xl bg-card/60 border border-border/80 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{dept.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] font-bold ${
                        capacityPct >= 80
                          ? "border-emerald-500/40 text-emerald-400"
                          : "border-amber-500/40 text-amber-400"
                      }`}
                    >
                      {capacityPct}% Capacity
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>Available Staff</span>
                      <span className="font-mono font-bold text-foreground">{totalStaff - projectedOnLeave} / {totalStaff}</span>
                    </div>
                    <div className="progress-track-line">
                      <div
                        className={capacityPct >= 80 ? "progress-track-fill-emerald" : "progress-track-fill-cyan"}
                        style={{ width: `${capacityPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/50 text-[10px] text-muted-foreground flex items-center justify-between">
                    <span>Lead: {dept.teamLead.name}</span>
                    <span>Sprint SLA: Normal</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Interactive3DCard>
      )}
    </div>
  );
}
