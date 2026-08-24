"use client";

import React from "react";
import Link from "next/link";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import {
  FileCheck2,
  ArrowLeft,
  Star,
  Scale,
} from "lucide-react";

export default function MonthlyReviewsPage() {
  const criteria = [
    { name: "Task & Goal Execution", weight: "40%", score: 4.8, calculated: "38.4 / 40", desc: "Weighted SOD/EOD completion and sprint OKR deliveries" },
    { name: "Quality of Work", weight: "20%", score: 4.9, calculated: "19.6 / 20", desc: "Zero high-priority regressions and robust test coverage" },
    { name: "Timely Delivery", weight: "15%", score: 4.6, calculated: "13.8 / 15", desc: "On-time PR submission and sprint SLA adherence" },
    { name: "Communication & Reporting", weight: "10%", score: 4.5, calculated: "9.0 / 10", desc: "Timely SOD/EOD logging and proactive blocker escalation" },
    { name: "Collaboration & Support", weight: "10%", score: 4.7, calculated: "9.4 / 10", desc: "Peer reviews, unblocking teammates, and cross-pod syncs" },
    { name: "Initiative & Learning", weight: "5%", score: 4.8, calculated: "4.8 / 5", desc: "Skill development goals and architectural innovations" },
  ];

  return (
    <PageTransition>
      <div className="space-y-6 max-w-5xl mx-auto">
        <Link
          href="/reviews"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Performance Reviews</span>
        </Link>

        {/* Hero Header */}
        <Interactive3DCard className="p-6 md:p-8 border border-purple-500/30 bg-gradient-to-r from-card/90 via-card/70 to-purple-500/10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <Badge variant="brand" className="bg-purple-500/15 border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase">
                  <Scale className="h-3 w-3 mr-1 text-purple-400" />
                  Monthly Performance Review (Section 5 Specification)
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">August 2026 Appraisal</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                6-Criterion Weighted Performance Evaluation
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Aggregated from approved weekly sprint reviews. Approved leave days are strictly excluded from expected workday counts (Fairness Rule 5.4).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-background/50 border border-purple-500/30 text-right shrink-0 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Overall Monthly Score</span>
              <div className="text-3xl font-black text-purple-400 font-mono">95.0%</div>
              <Badge variant="brand" className="text-[10px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                Grade: EXCELLENT (5★)
              </Badge>
            </div>
          </div>
        </Interactive3DCard>

        {/* 6 Criteria Breakdown Table */}
        <Interactive3DCard className="p-6 border border-border/80 bg-card/60 space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <FileCheck2 className="h-4 w-4 text-purple-400" />
            <span>Monthly Performance Criteria & Normalization Matrix</span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border/60">
                <tr>
                  <th className="p-3">Criterion</th>
                  <th className="p-3">Weight</th>
                  <th className="p-3">Rating (1-5★)</th>
                  <th className="p-3 text-right">Normalized Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {criteria.map((c, i) => (
                  <tr key={i} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3">
                      <strong className="text-foreground text-xs block">{c.name}</strong>
                      <span className="text-[10px] text-muted-foreground">{c.desc}</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-purple-300">{c.weight}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-amber-400 font-mono font-bold">
                        <Star className="h-3 w-3 fill-amber-400" />
                        <span>{c.score.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400">
                      {c.calculated}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Interactive3DCard>
      </div>
    </PageTransition>
  );
}
