"use client";

import React from "react";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Plus, CheckCircle2 } from "lucide-react";

export default function TeamPipsPage() {
  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        <Interactive3DCard className="p-6 md:p-8 border border-purple-500/30 bg-gradient-to-r from-card/90 via-card/70 to-purple-500/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="brand" className="bg-purple-500/15 border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase">
                  <ShieldCheck className="h-3 w-3 mr-1 text-purple-400" />
                  Performance Improvement Desk (Section 6.6 Specification)
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">Confidential Role Scoped</span>
              </div>
              <h2 className="text-2xl font-black text-foreground">Team Performance Improvement Plans</h2>
              <p className="text-xs text-muted-foreground">
                Manage structured improvement milestones, record weekly coaching checkpoints, and collaborate with HR on outcome finalization.
              </p>
            </div>

            <Button size="sm" variant="brand" className="text-xs h-9 px-4 bg-purple-500 hover:bg-purple-600 text-white gap-1.5 shrink-0 shadow-lg">
              <Plus className="h-4 w-4" />
              <span>Initiate PIP</span>
            </Button>
          </div>
        </Interactive3DCard>

        <Interactive3DCard className="p-8 border border-border/80 bg-card/60 text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">No Direct Reports Enrolled in PIP</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              All team members are currently meeting or exceeding performance benchmarks.
            </p>
          </div>
        </Interactive3DCard>
      </div>
    </PageTransition>
  );
}
