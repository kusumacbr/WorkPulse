"use client";

import React from "react";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminAttendanceRulesPage() {
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
              <Clock className="h-3 w-3 mr-1 text-red-400" />
              Attendance Rules Engine (Section 3 Specification)
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">15-Min Grace Window</span>
          </div>
          <h2 className="text-2xl font-black text-foreground">Punctuality & Shift Rules</h2>
          <p className="text-xs text-muted-foreground">
            Configure shift window boundaries (10:00 AM - 07:00 PM), grace periods (15 minutes), half-day thresholds, and overtime calculations.
          </p>
        </Interactive3DCard>

        <Interactive3DCard className="p-6 border border-border/80 bg-card/60 space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-card border border-border/60 flex items-center justify-between">
            <span className="text-foreground font-medium">Daily Standard Shift</span>
            <strong className="text-cyan-300 font-mono">10:00 AM – 07:00 PM (9.0 Hours)</strong>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border/60 flex items-center justify-between">
            <span className="text-foreground font-medium">Morning Grace Period</span>
            <strong className="text-emerald-400 font-mono">15 Minutes (Up to 10:15 AM)</strong>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border/60 flex items-center justify-between">
            <span className="text-foreground font-medium">Full Day Minimum Span</span>
            <strong className="text-purple-300 font-mono">8.0 Hours (480 Minutes)</strong>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border/60 flex items-center justify-between">
            <span className="text-foreground font-medium">Half Day Minimum Span</span>
            <strong className="text-amber-300 font-mono">4.5 Hours (270 Minutes)</strong>
          </div>
        </Interactive3DCard>
      </div>
    </PageTransition>
  );
}
