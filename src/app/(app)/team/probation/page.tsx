"use client";

import React from "react";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { UserCheck } from "lucide-react";

export default function TeamProbationPage() {
  const probationMembers = [
    {
      id: "emp-john",
      name: "John UI",
      designation: "Frontend Engineer",
      checkpoint: "Day 30",
      workQualityScore: 5.0,
      attendanceScore: 5.0,
      recommendation: "CONFIRM_EMPLOYMENT",
      status: "PENDING_HR_DECISION",
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        <Interactive3DCard className="p-6 md:p-8 border border-emerald-500/30 bg-gradient-to-r from-card/90 via-card/70 to-emerald-500/10 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="bg-emerald-500/15 border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase">
                <UserCheck className="h-3 w-3 mr-1 text-emerald-400" />
                Probation Management (Section 6.5 Specification)
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">Team Lead Evaluations</span>
            </div>
            <h2 className="text-2xl font-black text-foreground">Team Member Probation Checkpoints</h2>
            <p className="text-xs text-muted-foreground">
              Evaluate 30, 60, and 90-day checkpoints for direct reports across 8 standardized criteria and forward recommendations to HR.
            </p>
          </div>
        </Interactive3DCard>

        <div className="space-y-3">
          {probationMembers.map((m) => (
            <Interactive3DCard key={m.id} className="p-5 border border-border/80 bg-card/60 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-bold text-foreground">{m.name}</strong>
                    <Badge variant="outline" className="text-[10px] text-emerald-300 border-emerald-500/30 font-mono">
                      {m.checkpoint} Checkpoint
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{m.designation}</p>
                </div>

                <Badge variant="outline" className="text-[10px] text-amber-300 border-amber-500/30 shrink-0 font-mono">
                  {m.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                <span className="text-muted-foreground">Recommendation: <strong className="text-emerald-400">{m.recommendation}</strong></span>
                <span className="font-mono text-cyan-300 font-bold">Avg Score: {m.workQualityScore.toFixed(1)} / 5★</span>
              </div>
            </Interactive3DCard>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
