"use client";

import React, { useState, useEffect } from "react";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { useCurrentUser } from "@/components/layout/UserContext";
import {
  Laptop,
  CheckCircle2,
  Clock,
  Home,
  Send,
} from "lucide-react";

export default function WorkModePage() {
  const user = useCurrentUser();
  const { wfhRequests, addWfhRequest, setWfhRequestsFromSupabase, syncWithSupabase } = useWorkpulseSharedStore();

  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]!);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]!);
  const [workMode, setWorkMode] = useState<"WFH" | "HYBRID" | "CLIENT_SITE">("WFH");
  const [reason, setReason] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    syncWithSupabase(true);
    fetch("/api/v1/leave/wfh")
      .then((res) => res.json())
      .then((json) => {
        const reqs = json?.data?.requests || json?.requests;
        if (Array.isArray(reqs)) {
          setWfhRequestsFromSupabase(reqs);
        }
      })
      .catch(() => {});
  }, [syncWithSupabase, setWfhRequestsFromSupabase]);

  const myWfhRequests = wfhRequests.filter(
    (w) =>
      w.employeeName?.toLowerCase() === user.userName.toLowerCase() ||
      w.employeeId === "emp-sarah"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setLoading(true);
    const reqId = `wfh-req-v2-${Date.now()}`;
    const wfhPayload = {
      id: reqId,
      startDate,
      endDate,
      reason,
      plannedDeliverables: deliverables || "Sprint deliverables",
      availabilityHours: "10:00 AM – 07:00 PM",
      contactMethod: "Slack & Google Meet",
    };

    // 1. Instant optimistic update to local shared store so UI renders without refresh
    addWfhRequest(wfhPayload);
    setSubmitted(true);

    try {
      const emailHeader = typeof window !== "undefined" ? sessionStorage.getItem("workpulse_session_email") || user.userEmail || "" : "";
      await fetch("/api/v1/leave/wfh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(emailHeader ? { "x-user-email": emailHeader } : {}),
        },
        body: JSON.stringify(wfhPayload),
      });

      setReason("");
      setDeliverables("");
    } catch (e) {
      console.warn("Failed to submit WFH via API:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        <Interactive3DCard className="p-4 sm:p-6 md:p-8 border border-teal-500/30 bg-gradient-to-r from-card/90 via-card/70 to-teal-500/10 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="brand" className="bg-teal-500/15 border-teal-500/30 text-teal-300 text-[10px] font-bold uppercase">
                <Laptop className="h-3 w-3 mr-1 text-teal-400" />
                Work Mode &amp; Remote Policy
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">2-Stage Lead &amp; HR Approval</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground">Work-From-Home &amp; Remote Mode Portal</h2>
            <p className="text-xs text-muted-foreground">
              Request WFH, Hybrid schedule, or client-site remote days. Upon final approval, your workday status automatically updates without attendance penalties.
            </p>
          </div>
        </Interactive3DCard>

        {/* Application Form */}
        <Interactive3DCard className="p-4 sm:p-6 border border-border/80 bg-card/60 space-y-4">
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
                <label className="font-semibold text-muted-foreground">Planned Deliverables &amp; Availability</label>
                <textarea
                  value={deliverables}
                  onChange={(e) => setDeliverables(e.target.value)}
                  placeholder="e.g. Available on Slack / Google Meet from 10:00 AM to 07:00 PM. Will submit SOD plan on time."
                  className="w-full h-20 p-3 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none"
                  required
                />
              </div>

              <Button type="submit" disabled={loading} variant="brand" className="w-full h-9 text-xs font-bold bg-gradient-to-r from-teal-500 to-emerald-600 text-white gap-1.5">
                <Send className="h-3.5 w-3.5" />
                <span>{loading ? "Submitting..." : "Submit WFH Request"}</span>
              </Button>
            </form>
          )}
        </Interactive3DCard>

        {/* Requests History */}
        <Interactive3DCard className="p-4 sm:p-6 border border-border/80 bg-card/60 space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-400" />
            <span>Remote Work Mode History</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            {myWfhRequests.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-xs">
                No remote work requests submitted yet.
              </div>
            ) : (
              myWfhRequests.map((req) => (
                <div key={req.id} className="p-3.5 rounded-xl bg-card border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-foreground font-mono">
                        {req.startDate} {req.startDate !== req.endDate ? `to ${req.endDate}` : ""}
                      </strong>
                      <Badge variant="outline" className="text-[10px] text-teal-300 border-teal-500/30 font-bold">
                        WFH ({req.daysCount || 1}d)
                      </Badge>
                    </div>
                    <span className="text-muted-foreground block">{req.reason}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold ${
                        req.status === "APPROVED"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : req.status === "FORWARDED_TO_HR" || (req.status as string) === "PENDING_HR" || (req.status as string) === "STAGE_2"
                          ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
                          : req.status === "REJECTED"
                          ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                          : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {req.status === "APPROVED"
                        ? "Approved by HR ✓"
                        : req.status === "FORWARDED_TO_HR" || (req.status as string) === "PENDING_HR" || (req.status as string) === "STAGE_2"
                        ? "Stage 2: Lead Approved · Awaiting HR"
                        : req.status === "REJECTED"
                        ? "Declined"
                        : "Stage 1: Pending Team Lead"}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Interactive3DCard>
      </div>
    </PageTransition>
  );
}
