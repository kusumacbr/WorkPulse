"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { WorkdayViewSwitcher } from "@/features/workdays/components/WorkdayViewSwitcher";
import { useCurrentUser } from "@/components/layout/UserContext";
import {
  CheckSquare,
  ArrowRight,
  ShieldCheck,
  Building2,
  LayoutDashboard,
  Settings,
} from "lucide-react";

export default function MyWorkPage() {
  const user = useCurrentUser();

  const isIndividualContributor =
    user.roles.includes("EMPLOYEE") || user.roles.includes("MANAGER");

  // Pure Admin or pure HR who only oversee governance
  if (!isIndividualContributor) {
    const isAdmin = user.roles.includes("ADMIN");
    const isHr = user.roles.includes("HR");

    return (
      <PageTransition>
        <Interactive3DCard className="p-8 md:p-12 border border-border/80 bg-gradient-to-br from-card/80 via-card/50 to-muted/20 text-center max-w-3xl mx-auto my-8 space-y-6">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center">
            <ShieldCheck className="h-8 w-8 text-cyan-400" />
          </div>

          <div className="space-y-2">
            <Badge variant="outline" className="text-xs font-mono text-cyan-300 border-cyan-500/30">
              Oversight & Governance Role
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">
              Exempt from Daily SOD / EOD Submissions
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              As an {isAdmin ? "Organization SuperAdmin" : "HR & People Operations Partner"}, your role is focused on high-level system governance, policy compliance, and organizational oversight. You do not report daily sprint tasks to a line manager and are exempt from morning SOD plans and evening EOD reflections.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {isAdmin && (
              <Link href="/admin">
                <Button variant="brand" className="text-xs font-bold gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white h-9 px-4">
                  <Settings className="h-4 w-4" />
                  <span>Open System & Compliance Console</span>
                </Button>
              </Link>
            )}

            {isHr && (
              <Link href="/hr">
                <Button variant="brand" className="text-xs font-bold gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white h-9 px-4">
                  <Building2 className="h-4 w-4" />
                  <span>Open HR Command Center</span>
                </Button>
              </Link>
            )}

            <Link href="/dashboard">
              <Button variant="outline" className="text-xs h-9 px-4 gap-2">
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                <span>Executive Dashboard</span>
              </Button>
            </Link>
          </div>
        </Interactive3DCard>
      </PageTransition>
    );
  }

  // Standard operational Employee / Manager view
  return (
    <PageTransition>
      {/* 3D Header Hero */}
      <Interactive3DCard className="p-6 md:p-8 border border-cyan-500/30 bg-gradient-to-r from-card/80 via-card/60 to-cyan-500/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="font-bold text-[10px] uppercase bg-cyan-500/15 border-cyan-500/30 text-cyan-300">
                <CheckSquare className="h-3 w-3 mr-1 text-cyan-400" />
                Daily Lifecycle
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">SOD / EOD State Machine</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              My Daily Work & Execution
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Plan your morning SOD goals, track real-time task completion percentages, record EOD reflections, and carry forward unfinished work.
            </p>
          </div>

          {/* 3D State Machine Progress Indicator */}
          <div className="p-4 rounded-xl bg-background/50 border border-cyan-500/30 backdrop-blur-md space-y-2 shrink-0 text-xs shadow-sm">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Today&apos;s Stage Progression
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <span className="text-emerald-400">SOD Logged</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-cyan-400 animate-pulse">Execution</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">EOD Wrap-up</span>
            </div>
          </div>
        </div>
      </Interactive3DCard>

      {/* Main Interactive Workday View Switcher (Day, Week, Month, Heatmap) */}
      <WorkdayViewSwitcher />
    </PageTransition>
  );
}
