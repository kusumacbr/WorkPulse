"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowRight,
  User,
  Clock,
  ShieldCheck,
} from "lucide-react";

export function TeamLeadLeaveApprovals() {
  const { leaveRequests, tlApproveLeave, tlRejectLeave } = useWorkpulseSharedStore();
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const pendingRequests = leaveRequests.filter((r) => r.status === "PENDING_TL_STAGE_1");
  const processedRequests = leaveRequests.filter((r) => r.status !== "PENDING_TL_STAGE_1");

  const handleApprove = (id: string, name: string) => {
    const comment = commentInputs[id] || "Approved by Team Lead (Alex Lead). Forwarded to HR.";
    tlApproveLeave(id, comment);
    setToastMsg(`Leave request for ${name} approved & forwarded to HR for final sign-off! 🚀`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleReject = (id: string, name: string) => {
    const reason = commentInputs[id] || "Rejected by Team Lead due to sprint deadlines.";
    tlRejectLeave(id, reason);
    setToastMsg(`Leave request for ${name} rejected.`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Interactive3DCard className="p-6 border border-amber-500/30 bg-gradient-to-r from-card/80 via-card/60 to-amber-500/10 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="font-bold text-[10px] uppercase bg-amber-500/15 border-amber-500/30 text-amber-300">
                <Calendar className="h-3 w-3 mr-1 text-amber-400" />
                Stage 1 · Team Lead Review
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">Platform Pod</span>
            </div>
            <h3 className="text-xl font-bold text-foreground">
              Direct Report Leave Applications
            </h3>
            <p className="text-xs text-muted-foreground">
              Review sprint coverage, verify handover notes, and approve to forward requests to HR for Stage-2 final sign-off.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-background/60 p-3 rounded-xl border border-border shrink-0 text-xs">
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground uppercase block font-bold">Pending Review</span>
              <strong className="text-base font-black text-amber-400">{pendingRequests.length} Requests</strong>
            </div>
          </div>
        </div>

        {/* 2-Stage Progression Banner */}
        <div className="p-3 rounded-xl bg-background/50 border border-border/80 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <span className="h-5 w-5 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-[10px]">
              1
            </span>
            <span>Stage 1: Team Lead (Alex Lead) Approval</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-2 text-pink-300 font-bold">
            <span className="h-5 w-5 rounded-full bg-pink-500/20 border border-pink-400 flex items-center justify-center text-[10px]">
              2
            </span>
            <span>Stage 2: HR (Rachel HR) Final Sign-off</span>
          </div>
        </div>
      </Interactive3DCard>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Pending Requests List */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-400" />
          Awaiting Your Stage-1 Approval ({pendingRequests.length})
        </h4>

        {pendingRequests.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-border/70 text-center space-y-2 bg-card/20">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
            <h5 className="text-sm font-bold text-foreground">All Direct Report Leave Requests Reviewed!</h5>
            <p className="text-xs text-muted-foreground">
              No leave requests currently pending in your Stage-1 queue.
            </p>
          </div>
        ) : (
          pendingRequests.map((req) => (
            <div
              key={req.id}
              className="p-5 rounded-2xl bg-card/80 border border-amber-500/30 space-y-4 shadow-sm hover:border-amber-500/50 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-600 p-[1px]">
                    <div className="h-full w-full rounded-full bg-[#0b0f19] flex items-center justify-center text-amber-300 font-bold text-xs">
                      {req.employeeName.slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-bold text-foreground">{req.employeeName}</h5>
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        {req.designation}
                      </Badge>
                      <Badge variant="brand" className="text-[9px] bg-amber-500/15 text-amber-300 border-amber-500/30 uppercase">
                        {req.leaveType} LEAVE
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Applied on {new Date(req.createdAt).toLocaleDateString()} · Balance remaining:{" "}
                      <strong className="text-emerald-400">{req.remainingBalance} days</strong>
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-foreground block">
                    {req.startDate} {req.startDate !== req.endDate ? `→ ${req.endDate}` : ""}
                  </span>
                  <Badge variant="secondary" className="text-[10px] font-bold mt-1">
                    {req.daysCount} {req.daysCount === 1 ? "Day" : "Days"}
                  </Badge>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-background/50 p-3.5 rounded-xl border border-border/70">
                <div>
                  <span className="text-[10px] font-bold uppercase text-muted-foreground block">Reason</span>
                  <p className="text-foreground mt-0.5">{req.reason}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-muted-foreground block">Handover & Backup</span>
                  <p className="text-foreground mt-0.5">
                    <strong>Backup:</strong> {req.backupPersonName} · {req.handoverNotes}
                  </p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <input
                  type="text"
                  placeholder="Optional Team Lead note (e.g. Sprint coverage confirmed)..."
                  value={commentInputs[req.id] || ""}
                  onChange={(e) =>
                    setCommentInputs((prev) => ({ ...prev, [req.id]: e.target.value }))
                  }
                  className="flex-1 px-3 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-400"
                />

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleReject(req.id, req.employeeName)}
                    className="h-8 px-3 text-xs font-bold text-red-400 border-red-500/30 hover:bg-red-500/10"
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" />
                    Reject
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleApprove(req.id, req.employeeName)}
                    className="h-8 px-3.5 text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm hover:opacity-90"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Approve & Forward to HR
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Processed History */}
      {processedRequests.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border/70">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Recently Processed Direct Report Requests ({processedRequests.length})
          </h4>

          <div className="space-y-2">
            {processedRequests.map((req) => (
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
                  {req.status === "FORWARDED_TO_HR" && (
                    <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/10 text-[10px] font-bold">
                      ✓ Approved by You → In HR Queue
                    </Badge>
                  )}
                  {req.status === "APPROVED" && (
                    <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[10px] font-bold">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      Final HR Approved
                    </Badge>
                  )}
                  {req.status === "REJECTED" && (
                    <Badge variant="outline" className="text-red-400 border-red-500/30 bg-red-500/10 text-[10px] font-bold">
                      ✕ Rejected
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
