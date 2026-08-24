"use client";

import React, { useState } from "react";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Laptop,
  CheckCircle2,
  Clock,
  Home,
  Send,
} from "lucide-react";

export default function WorkModePage() {
  const [startDate, setStartDate] = useState("2026-08-25");
  const [endDate, setEndDate] = useState("2026-08-25");
  const [workMode, setWorkMode] = useState<"WFH" | "HYBRID" | "CLIENT_SITE">("WFH");
  const [reason, setReason] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [requests, setRequests] = useState([
    {
      id: "wfh-sample",
      startDate: "2026-08-20",
      endDate: "2026-08-20",
      workMode: "WFH",
      reason: "Home electrical inspection and broadband maintenance",
      status: "APPROVED",
      leadApprover: "Alex Lead",
      hrApprover: "Rachel HR",
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      const newReq = {
        id: `wfh-${Date.now()}`,
        startDate,
        endDate,
        workMode,
        reason,
        status: "PENDING_TL_STAGE_1",
        leadApprover: "Pending",
        hrApprover: "Pending",
      };
      setRequests([newReq, ...requests]);
      setSubmitted(true);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        <Interactive3DCard className="p-6 md:p-8 border border-teal-500/30 bg-gradient-to-r from-card/90 via-card/70 to-teal-500/10 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="bg-teal-500/15 border-teal-500/30 text-teal-300 text-[10px] font-bold uppercase">
                <Laptop className="h-3 w-3 mr-1 text-teal-400" />
                Work Mode & Remote Policy
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">2-Stage Lead & HR Approval</span>
            </div>
            <h2 className="text-2xl font-black text-foreground">Work-From-Home & Remote Mode Portal</h2>
            <p className="text-xs text-muted-foreground">
              Request WFH, Hybrid schedule, or client-site remote days. Upon final approval, your workday status automatically updates without attendance penalties.
            </p>
          </div>
        </Interactive3DCard>

        {/* Application Form */}
        <Interactive3DCard className="p-6 border border-border/80 bg-card/60 space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Home className="h-4 w-4 text-teal-400" />
            <span>Submit Work Mode Application</span>
          </h3>

          {submitted ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Remote Work Request Submitted</span>
              </div>
              <p className="text-muted-foreground">
                Forwarded to Team Lead for Stage-1 sign-off. You can track approval progress in the history below.
              </p>
              <Button size="sm" variant="outline" onClick={() => setSubmitted(false)} className="h-7 text-xs">
                Submit Another Request
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">Mode</label>
                  <select
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value as any)}
                    className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none"
                  >
                    <option value="WFH">Work From Home (WFH)</option>
                    <option value="HYBRID">Hybrid Split</option>
                    <option value="CLIENT_SITE">Client Site / On-Site Remote</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">Start Date</label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9 text-xs" required />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">End Date</label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9 text-xs" required />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Reason for Remote Work</label>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Deep focus day for biometric API stress testing and benchmark analysis"
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Planned Deliverables & Availability</label>
                <textarea
                  value={deliverables}
                  onChange={(e) => setDeliverables(e.target.value)}
                  placeholder="e.g. Available on Slack / Google Meet from 10:00 AM to 07:00 PM. Will submit SOD plan on time."
                  className="w-full h-20 p-3 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none"
                  required
                />
              </div>

              <Button type="submit" variant="brand" className="w-full h-9 text-xs font-bold bg-gradient-to-r from-teal-500 to-emerald-600 text-white gap-1.5">
                <Send className="h-3.5 w-3.5" />
                <span>Submit WFH Request</span>
              </Button>
            </form>
          )}
        </Interactive3DCard>

        {/* Requests History */}
        <Interactive3DCard className="p-6 border border-border/80 bg-card/60 space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-400" />
            <span>Remote Work Mode History</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            {requests.map((req) => (
              <div key={req.id} className="p-3.5 rounded-xl bg-card border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <strong className="text-foreground font-mono">{req.startDate} {req.startDate !== req.endDate ? `to ${req.endDate}` : ""}</strong>
                    <Badge variant="outline" className="text-[10px] text-teal-300 border-teal-500/30 font-bold">{req.workMode}</Badge>
                  </div>
                  <span className="text-muted-foreground block">{req.reason}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={req.status === "APPROVED" ? "brand" : "outline"} className={`text-[10px] ${req.status === "APPROVED" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "text-amber-300 border-amber-500/30"}`}>
                    {req.status === "APPROVED" ? "Approved by HR" : "Stage-1 Pending"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Interactive3DCard>
      </div>
    </PageTransition>
  );
}
