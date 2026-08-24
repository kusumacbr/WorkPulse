"use client";

import React, { useState } from "react";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Check, Clock } from "lucide-react";

export default function TeamBlockersPage() {
  const [blockers, setBlockers] = useState([
    {
      id: "blk-1",
      title: "Cross-department OAuth token refresh sync latency",
      employeeName: "Sarah Dev",
      department: "Development Pod",
      severity: "CRITICAL",
      impact: "Affects edge biometric token validation during office rush hour",
      status: "OPEN",
      ageHours: 2.5,
      createdAt: "Today at 09:30 AM",
    },
    {
      id: "blk-2",
      title: "DevOps Redis Cluster failover replica provisioning",
      employeeName: "Rohit Sharma",
      department: "DevOps & Cloud Pod",
      severity: "HIGH",
      impact: "Blocks staging benchmark load testing",
      status: "ACKNOWLEDGED",
      ageHours: 4.0,
      createdAt: "Today at 08:00 AM",
    },
  ]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleAcknowledge = (id: string) => {
    setBlockers((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "ACKNOWLEDGED" } : b))
    );
    setToastMsg("Blocker marked as Acknowledged. Resolution SLA clock started.");
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleResolve = (id: string) => {
    setBlockers((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "RESOLVED" } : b))
    );
    setToastMsg("Blocker resolved! Employee notified.");
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        {toastMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="font-bold">{toastMsg}</span>
          </div>
        )}

        <Interactive3DCard className="p-6 md:p-8 border border-rose-500/30 bg-gradient-to-r from-card/90 via-card/70 to-rose-500/10 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="bg-rose-500/15 border-rose-500/30 text-rose-300 text-[10px] font-bold uppercase">
                <AlertTriangle className="h-3 w-3 mr-1 text-rose-400" />
                Task Blockers & Escalation Desk (Section 5.5 Specification)
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">SLA Monitored</span>
            </div>
            <h2 className="text-2xl font-black text-foreground">Active Team Blockers & Impediments</h2>
            <p className="text-xs text-muted-foreground">
              Acknowledge reported roadblocks, resolve dependency halts, and protect employee sprint fairness ratings.
            </p>
          </div>
        </Interactive3DCard>

        <div className="space-y-3">
          {blockers.map((blk) => (
            <Interactive3DCard
              key={blk.id}
              className={`p-5 border transition-all space-y-3 ${
                blk.status === "RESOLVED"
                  ? "border-emerald-500/30 bg-card/40 opacity-80"
                  : blk.severity === "CRITICAL"
                  ? "border-rose-500/50 bg-card/80 shadow-[0_0_20px_rgba(244,63,94,0.15)]"
                  : "border-border/80 bg-card/60"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-bold text-foreground">{blk.title}</strong>
                    <Badge variant={blk.severity === "CRITICAL" ? "destructive" : "outline"} className="text-[9px] font-bold">
                      {blk.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{blk.impact}</p>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground pt-1">
                    <span>Reported by: <strong className="text-foreground">{blk.employeeName}</strong> ({blk.department})</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-rose-400" /> Age: {blk.ageHours}h</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {blk.status === "OPEN" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAcknowledge(blk.id)}
                      className="text-xs h-8 px-3 border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
                    >
                      Acknowledge
                    </Button>
                  )}
                  {blk.status !== "RESOLVED" && (
                    <Button
                      size="sm"
                      variant="brand"
                      onClick={() => handleResolve(blk.id)}
                      className="text-xs h-8 px-3 bg-emerald-500 hover:bg-emerald-600 text-white gap-1"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Mark Resolved</span>
                    </Button>
                  )}
                  {blk.status === "RESOLVED" && (
                    <Badge variant="brand" className="text-[10px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                      ✓ Resolved
                    </Badge>
                  )}
                </div>
              </div>
            </Interactive3DCard>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
