"use client";

import React from "react";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Scale, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminReviewSettingsPage() {
  return (
    <PageTransition>
      <div className="space-y-6 max-w-5xl mx-auto">
        <Link href="/admin" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Root Admin Console</span>
        </Link>

        <Interactive3DCard className="p-6 md:p-8 border border-red-500/30 bg-gradient-to-r from-card/90 via-card/70 to-red-500/10 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="bg-red-500/15 border-red-500/30 text-red-300 text-[10px] font-bold uppercase">
              <Scale className="h-3 w-3 mr-1 text-red-400" />
              Appraisal Governance (Section 5 Specification)
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">6-Criterion Scoring Weights</span>
          </div>
          <h2 className="text-2xl font-black text-foreground">Performance Review Configuration</h2>
          <p className="text-xs text-muted-foreground">
            Configure default weekly sprint weights, 6 monthly appraisal criteria (40/20/15/10/10/5), fairness exclusion rules, and mandatory written override reason mandates.
          </p>
        </Interactive3DCard>

        <Interactive3DCard className="p-6 border border-border/80 bg-card/60 space-y-4">
          <h3 className="text-sm font-bold text-foreground">Standard Scoring Criteria & Mandatory Reason Policy</h3>
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-card border border-border/60 flex items-center justify-between">
              <span className="text-foreground">Task & Goal Execution</span>
              <strong className="text-purple-300 font-mono">40%</strong>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border/60 flex items-center justify-between">
              <span className="text-foreground">Quality of Work</span>
              <strong className="text-purple-300 font-mono">20%</strong>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border/60 flex items-center justify-between">
              <span className="text-foreground">Timely Delivery</span>
              <strong className="text-purple-300 font-mono">15%</strong>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border/60 flex items-center justify-between">
              <span className="text-foreground">Communication & Reporting</span>
              <strong className="text-purple-300 font-mono">10%</strong>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border/60 flex items-center justify-between">
              <span className="text-foreground">Collaboration & Support</span>
              <strong className="text-purple-300 font-mono">10%</strong>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border/60 flex items-center justify-between">
              <span className="text-foreground">Initiative & Learning</span>
              <strong className="text-purple-300 font-mono">5%</strong>
            </div>
          </div>
        </Interactive3DCard>
      </div>
    </PageTransition>
  );
}
