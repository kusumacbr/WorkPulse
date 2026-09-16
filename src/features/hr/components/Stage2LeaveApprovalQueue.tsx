"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { createClient } from "@/lib/supabase/client";
import {
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  ShieldCheck,
  Home,
  CheckCheck,
} from "lucide-react";

export function Stage2LeaveApprovalQueue() {
  const [activeQueueTab, setActiveQueueTab] = useState<"leave" | "wfh">("leave");
  const {
    leaveRequests,
    hrApproveLeave,
    hrRejectLeave,
    wfhRequests,
    hrApproveWfh,
    hrRejectWfh,
  } = useWorkpulseSharedStore();

  const [hrCommentInputs, setHrCommentInputs] = useState<Record<string, string>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Filter requests that were approved by Team Lead (Stage 1) and now in HR Stage 2 queue
  const pendingLeaveQueue = leaveRequests.filter(
    (r) =>
      r.status === "FORWARDED_TO_HR" ||
      (r.status as string) === "PENDING_HR" ||
      (r.status as string) === "STAGE_2"
  );
  const completedLeaveQueue = leaveRequests.filter((r) => r.status === "APPROVED" || r.status === "REJECTED");

  const pendingWfhQueue = wfhRequests.filter(
    (r) =>
      r.status === "FORWARDED_TO_HR" ||
      (r.status as string) === "PENDING_HR" ||
      (r.status as string) === "STAGE_2"
  );
  const completedWfhQueue = wfhRequests.filter((r) => r.status === "APPROVED" || r.status === "REJECTED");

  const handleApproveLeave = async (id: string, name: string) => {
    const comment = hrCommentInputs[id] || "Final HR sign-off granted by Rachel HR.";
    hrApproveLeave(id, comment);
    setToastMsg(`Final Stage-2 HR approval granted for ${name}'s leave request! 🎉`);
    try {
      await fetch(`/api/v1/leave/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment }),
      });
      const supabase = createClient();
      supabase.channel("workpulse-supabase-live-channel").send({
        type: "broadcast",
        event: "leave:updated",
        payload: { id, status: "APPROVED" },
      });
    } catch {}
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleRejectLeave = async (id: string, name: string) => {
    const reason = hrCommentInputs[id] || "Rejected during final HR compliance check.";
    hrRejectLeave(id, reason);
    setToastMsg(`Leave request for ${name} rejected by HR.`);
    try {
      await fetch(`/api/v1/leave/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const supabase = createClient();
      supabase.channel("workpulse-supabase-live-channel").send({
        type: "broadcast",
        event: "leave:updated",
        payload: { id, status: "REJECTED" },
      });
    } catch {}
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleApproveWfh = async (id: string, name: string) => {
    const comment = hrCommentInputs[id] || "Final HR approval granted for remote workday.";
    hrApproveWfh(id, comment);
    setToastMsg(`Final Stage-2 HR approval granted for ${name}'s WFH request! 🏠`);
    try {
      await fetch(`/api/v1/leave/wfh/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment }),
      });
      const supabase = createClient();
      supabase.channel("workpulse-supabase-live-channel").send({
        type: "broadcast",
        event: "wfh:updated",
        payload: { id, status: "APPROVED" },
      });
    } catch {}
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleRejectWfh = async (id: string, name: string) => {
    const reason = hrCommentInputs[id] || "Rejected during HR policy check.";
    hrRejectWfh(id, reason);
    setToastMsg(`WFH request for ${name} rejected by HR.`);
    try {
      await fetch(`/api/v1/leave/wfh/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const supabase = createClient();
      supabase.channel("workpulse-supabase-live-channel").send({
        type: "broadcast",
        event: "wfh:updated",
        payload: { id, status: "REJECTED" },
      });
    } catch {}
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Interactive3DCard className="p-6 border border-pink-500/30 bg-gradient-to-r from-card/80 via-card/60 to-pink-500/10 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="font-bold text-[10px] uppercase bg-pink-500/15 border-pink-500/30 text-pink-300">
                <ShieldCheck className="h-3 w-3 mr-1 text-pink-400" />
                Stage 2 · HR Final Authority
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">Rachel HR · People Operations</span>
            </div>
            <h3 className="text-xl font-bold text-foreground">
              Final Leave & WFH Approval Queue
            </h3>
            <p className="text-xs text-muted-foreground">
              Enforces strict 2-stage sequencing. Displays applications already vetted and approved by Team Lead (Alex Lead) for official permanent HR authorization.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-background/60 p-3 rounded-xl border border-border shrink-0 text-xs">
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground uppercase block font-bold">HR Queue Total</span>
              <strong className="text-base font-black text-pink-400">
                {pendingLeaveQueue.length + pendingWfhQueue.length} Awaiting HR
              </strong>
            </div>
          </div>
        </div>

        {/* Sub-tabs: Leave vs WFH */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveQueueTab("leave")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeQueueTab === "leave"
                ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground bg-card/60 border border-border"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Leave Requests ({pendingLeaveQueue.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveQueueTab("wfh")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeQueueTab === "wfh"
                ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground bg-card/60 border border-border"
            }`}
          >
            <Home className="h-3.5 w-3.5" />
            <span>WFH Requests ({pendingWfhQueue.length})</span>
          </button>
        </div>
      </Interactive3DCard>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-bold">{toastMsg}</span>
        </div>
      )}

      {/* QUEUE 1: LEAVE REQUESTS */}
      {activeQueueTab === "leave" && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <CheckCheck className="h-4 w-4 text-emerald-400" />
            Team Lead Approved Leave Requests Awaiting Final HR Sign-off ({pendingLeaveQueue.length})
          </h4>

          {pendingLeaveQueue.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-border/70 text-center space-y-2 bg-card/20">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
              <h5 className="text-sm font-bold text-foreground">Stage-2 HR Leave Queue Clear!</h5>
              <p className="text-xs text-muted-foreground">
                All Team Lead approved leave requests have received final HR authorization.
              </p>
            </div>
          ) : (
            pendingLeaveQueue.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-card/80 border border-pink-500/30 space-y-4 shadow-sm hover:border-pink-500/50 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-pink-500 to-rose-600 p-[1px]">
                      <div className="h-full w-full rounded-full bg-[#0b0f19] flex items-center justify-center text-pink-300 font-bold text-xs">
                        {item.employeeName.slice(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-bold text-foreground">{item.employeeName}</h5>
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">
                          {item.designation}
                        </Badge>
                        <Badge variant="brand" className="text-[9px] bg-pink-500/15 text-pink-300 border-pink-500/30 uppercase">
                          {item.leaveType} LEAVE
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Department: <strong>{item.departmentName}</strong> · Current Remaining Balance:{" "}
                        <strong className="text-emerald-400">{item.remainingBalance} days</strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-foreground block">
                      {item.startDate} {item.startDate !== item.endDate ? `→ ${item.endDate}` : ""}
                    </span>
                    <Badge variant="secondary" className="text-[10px] font-bold mt-1">
                      {item.daysCount} {item.daysCount === 1 ? "Day" : "Days"}
                    </Badge>
                  </div>
                </div>

                {/* Team Lead Stage-1 Approval Verification Box */}
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold block text-emerald-400">
                      Stage 1 Verified: {item.tlApproverName || "Alex Lead (Engineering Manager)"} · {item.tlApprovedAt || "Verified"}
                    </span>
                    <p className="text-foreground/90 italic">
                      &quot;{item.tlComment || "Approved by Team Lead. All sprint deliverables are green. Forwarded to HR."}&quot;
                    </p>
                  </div>
                </div>

                {/* Reason & Handover Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-background/50 p-3.5 rounded-xl border border-border/70">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground block">Employee Reason</span>
                    <p className="text-foreground mt-0.5">{item.reason}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground block">Handover Plan</span>
                    <p className="text-foreground mt-0.5">
                      <strong>Backup:</strong> {item.backupPersonName} · {item.handoverNotes}
                    </p>
                  </div>
                </div>

                {/* HR Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <input
                    type="text"
                    placeholder="HR Compliance notes (e.g. Leave balance verified and authorized)..."
                    value={hrCommentInputs[item.id] || ""}
                    onChange={(e) =>
                      setHrCommentInputs((prev) => ({ ...prev, [item.id]: e.target.value }))
                    }
                    className="flex-1 px-3 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-pink-400"
                  />

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRejectLeave(item.id, item.employeeName)}
                      className="h-8 px-3 text-xs font-bold text-red-400 border-red-500/30 hover:bg-red-500/10"
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Reject
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleApproveLeave(item.id, item.employeeName)}
                      className="h-8 px-3.5 text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm hover:opacity-90"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      Grant Final HR Approval
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Processed Leave History */}
          {completedLeaveQueue.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border/70">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                HR Processed Leave Requests ({completedLeaveQueue.length})
              </h4>

              <div className="space-y-2">
                {completedLeaveQueue.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-xl bg-card/40 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="font-bold text-foreground">{req.employeeName}</span>
                        <span className="text-muted-foreground ml-2">
                          {req.leaveType} ({req.daysCount}d) · {req.startDate}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {req.status === "APPROVED" && (
                        <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[10px] font-bold">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Final HR Approved
                        </Badge>
                      )}
                      {req.status === "REJECTED" && (
                        <Badge variant="outline" className="text-red-400 border-red-500/30 bg-red-500/10 text-[10px] font-bold">
                          ✕ Rejected by HR
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* QUEUE 2: WFH REQUESTS */}
      {activeQueueTab === "wfh" && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Home className="h-4 w-4 text-purple-400" />
            Team Lead Approved WFH Requests Awaiting Final HR Sign-off ({pendingWfhQueue.length})
          </h4>

          {pendingWfhQueue.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-border/70 text-center space-y-2 bg-card/20">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
              <h5 className="text-sm font-bold text-foreground">Stage-2 HR WFH Queue Clear!</h5>
              <p className="text-xs text-muted-foreground">
                All Team Lead approved WFH requests have received final HR authorization.
              </p>
            </div>
          ) : (
            pendingWfhQueue.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-card/80 border border-purple-500/30 space-y-4 shadow-sm hover:border-purple-500/50 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 p-[1px]">
                      <div className="h-full w-full rounded-full bg-[#0b0f19] flex items-center justify-center text-purple-300 font-bold text-xs">
                        {item.employeeName.slice(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-bold text-foreground">{item.employeeName}</h5>
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">
                          {item.designation}
                        </Badge>
                        <Badge variant="brand" className="text-[9px] bg-purple-500/15 text-purple-300 border-purple-500/30 uppercase">
                          REMOTE WFH
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Department: <strong>{item.departmentName}</strong> · Contact: <strong>{item.contactMethod}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-foreground block">
                      {item.startDate} {item.startDate !== item.endDate ? `→ ${item.endDate}` : ""}
                    </span>
                    <Badge variant="secondary" className="text-[10px] font-bold mt-1">
                      {item.daysCount} {item.daysCount === 1 ? "Day" : "Days"}
                    </Badge>
                  </div>
                </div>

                {/* Team Lead Stage-1 Approval Verification Box */}
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold block text-emerald-400">
                      Stage 1 Verified: {item.tlApproverName || "Alex Lead (Engineering Manager)"} · {item.tlApprovedAt || "Verified"}
                    </span>
                    <p className="text-foreground/90 italic">
                      &quot;{item.tlComment || "Approved by Team Lead. Deliverables aligned. Forwarded to HR."}&quot;
                    </p>
                  </div>
                </div>

                {/* Deliverables & Schedule Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-background/50 p-3.5 rounded-xl border border-border/70">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground block">Reason</span>
                    <p className="text-foreground mt-0.5">{item.reason}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground block">Planned Deliverables</span>
                    <p className="text-foreground mt-0.5">
                      <strong>Shift:</strong> {item.availabilityHours} · {item.plannedDeliverables}
                    </p>
                  </div>
                </div>

                {/* HR Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <input
                    type="text"
                    placeholder="HR Compliance notes (e.g. Remote work policy verified)..."
                    value={hrCommentInputs[item.id] || ""}
                    onChange={(e) =>
                      setHrCommentInputs((prev) => ({ ...prev, [item.id]: e.target.value }))
                    }
                    className="flex-1 px-3 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-purple-400"
                  />

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRejectWfh(item.id, item.employeeName)}
                      className="h-8 px-3 text-xs font-bold text-red-400 border-red-500/30 hover:bg-red-500/10"
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Reject
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleApproveWfh(item.id, item.employeeName)}
                      className="h-8 px-3.5 text-xs font-bold bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-sm hover:opacity-90"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      Grant Final HR Approval
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Processed WFH History */}
          {completedWfhQueue.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border/70">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                HR Processed WFH Requests ({completedWfhQueue.length})
              </h4>

              <div className="space-y-2">
                {completedWfhQueue.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-xl bg-card/40 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="font-bold text-foreground">{req.employeeName}</span>
                        <span className="text-muted-foreground ml-2">
                          WFH ({req.daysCount}d) · {req.startDate}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {req.status === "APPROVED" && (
                        <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[10px] font-bold">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Final HR Approved
                        </Badge>
                      )}
                      {req.status === "REJECTED" && (
                        <Badge variant="outline" className="text-red-400 border-red-500/30 bg-red-500/10 text-[10px] font-bold">
                          ✕ Rejected by HR
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
