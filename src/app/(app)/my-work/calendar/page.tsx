"use client";

import React from "react";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { MonthContributionHeatmap } from "@/features/workdays/components/MonthContributionHeatmap";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function WorkCalendarPage() {
  return (
    <PageTransition>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/my-work" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Daily Work</span>
            </Link>
          </div>
          <Badge variant="outline" className="text-cyan-300 border-cyan-500/30 text-xs font-mono">
            Month Contribution Grid
          </Badge>
        </div>

        <Interactive3DCard className="p-6 md:p-8 border border-cyan-500/30 bg-gradient-to-r from-card/90 via-card/70 to-cyan-500/10 space-y-2">
          <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-cyan-400" />
            <span>Monthly Workday & Contribution Muster</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Complete historical timeline of your morning SOD plans, deliverables execution, verified biometric punches, and approved leave days.
          </p>
        </Interactive3DCard>

        <MonthContributionHeatmap />
      </div>
    </PageTransition>
  );
}
