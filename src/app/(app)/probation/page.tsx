"use client";

import React from "react";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Star } from "lucide-react";

export default function ProbationStatusPage() {
  const criteria = [
    { name: "Work Quality", score: "5.0 / 5" },
    { name: "Task Completion", score: "5.0 / 5" },
    { name: "Attendance & Punctuality", score: "5.0 / 5" },
    { name: "Communication & Reporting", score: "4.8 / 5" },
    { name: "Team Collaboration", score: "5.0 / 5" },
    { name: "Initiative & Learning", score: "5.0 / 5" },
    { name: "Technical Competence", score: "5.0 / 5" },
    { name: "Conduct & Core Values", score: "5.0 / 5" },
  ];

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        <Interactive3DCard className="p-6 md:p-8 border border-emerald-500/30 bg-gradient-to-r from-card/90 via-card/70 to-emerald-500/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="brand" className="bg-emerald-500/15 border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase">
                  <ShieldCheck className="h-3 w-3 mr-1 text-emerald-400" />
                  Probation Evaluation (Section 6.5 Specification)
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">Day 90 Milestone</span>
              </div>
              <h2 className="text-2xl font-black text-foreground">Probation Confirmation Status</h2>
              <p className="text-xs text-muted-foreground">
                Formal 8-criterion review across 30, 60, and 90-day checkpoints leading to permanent employment confirmation.
              </p>
            </div>

            <Badge variant="brand" className="text-xs bg-emerald-500/20 text-emerald-300 border-emerald-500/40 p-2 font-bold shrink-0">
              ✓ CONFIRMED PERMANENT
            </Badge>
          </div>
        </Interactive3DCard>

        {/* 8-Criterion Breakdown */}
        <Interactive3DCard className="p-6 border border-border/80 bg-card/60 space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-400" />
            <span>8-Criterion Final Evaluation Scores</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {criteria.map((c, i) => (
              <div key={i} className="p-3 rounded-xl bg-card border border-border/60 flex items-center justify-between">
                <span className="text-foreground font-medium">{c.name}</span>
                <strong className="text-emerald-400 font-mono">{c.score}</strong>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1 text-xs">
            <strong className="text-foreground">Manager Recommendation & HR Decision</strong>
            <p className="text-muted-foreground leading-relaxed">
              "Sarah has shown stellar architecture ownership, 100% on-time SOD submissions, and exceptional team unblocking. Recommended for immediate confirmation without extension."
            </p>
            <span className="text-[11px] text-muted-foreground font-mono block pt-1">
              Signed by: Alex Lead (Manager) · Approved by: Rachel HR · Confirmed by: David Director (SuperAdmin)
            </span>
          </div>
        </Interactive3DCard>
      </div>
    </PageTransition>
  );
}
