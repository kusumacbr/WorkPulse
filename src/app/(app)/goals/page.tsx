"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { useCurrentUser } from "@/components/layout/UserContext";
import { Target, Users } from "lucide-react";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

const LoadingSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-40 rounded-2xl bg-card/40 border border-border/40" />
    <div className="h-40 rounded-2xl bg-card/40 border border-border/40" />
  </div>
);

const HREnterpriseGoalsDeck = dynamic(
  () => import("@/features/goals/components/HREnterpriseGoalsDeck").then((m) => ({ default: m.HREnterpriseGoalsDeck })),
  { ssr: false, loading: LoadingSkeleton }
);
const LeadGoalsManager = dynamic(
  () => import("@/features/goals/components/LeadGoalsManager").then((m) => ({ default: m.LeadGoalsManager })),
  { ssr: false, loading: LoadingSkeleton }
);
const SimpleGoalsManager = dynamic(
  () => import("@/features/goals/components/SimpleGoalsManager").then((m) => ({ default: m.SimpleGoalsManager })),
  { ssr: false, loading: LoadingSkeleton }
);

export default function GoalsPage() {
  const user = useCurrentUser();
  const { allEmployees } = useWorkpulseSharedStore();

  const isHR =
    user.roles.includes("HR") ||
    user.primaryRole === "HR" ||
    user.userEmail.toLowerCase().includes("hr");

  const isLead =
    !isHR &&
    (user.roles.includes("MANAGER") ||
      user.primaryRole === "MANAGER" ||
      user.userEmail.toLowerCase().includes("lead"));

  const directReportCount =
    allEmployees.filter(
      (e) =>
        e.id !== "lead-alex" &&
        !e.email?.toLowerCase().includes("lead") &&
        !e.email?.toLowerCase().includes("hr") &&
        (e.teamLeadId === "lead-alex" ||
          e.departmentId === "dept-development" ||
          e.departmentName?.toLowerCase().includes("development"))
    ).length || 2;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Simple & Clean Header */}
        <Interactive3DCard className="p-6 border border-slate-200/90 dark:border-border/80 bg-gradient-to-r from-white via-slate-50/50 to-white dark:from-card/90 dark:via-card/70 dark:to-card/50 shadow-sm rounded-3xl">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              {isHR ? (
                <Badge variant="brand" className="font-bold text-[10px] uppercase bg-cyan-500/15 border-cyan-500/30 text-cyan-300">
                  <Target className="h-3 w-3 mr-1 text-cyan-400" />
                  <span>Company Objectives</span>
                </Badge>
              ) : isLead ? (
                <Badge variant="secondary" className="font-bold text-[10px] uppercase bg-indigo-500/15 border-indigo-500/30 text-indigo-300">
                  <Users className="h-3 w-3 mr-1 text-indigo-400" />
                  <span>Team OKR &amp; Sprint Deliverables</span>
                </Badge>
              ) : (
                <Badge variant="brand" className="font-bold text-[10px] uppercase bg-emerald-500/15 border-emerald-500/30 text-emerald-300">
                  <Target className="h-3 w-3 mr-1 text-emerald-400" />
                  <span>Personal Milestones &amp; OKRs</span>
                </Badge>
              )}

              {isLead && (
                <span className="text-[11px] text-muted-foreground font-medium">
                  Development Team · {directReportCount} Direct Reports
                </span>
              )}

              {isHR && (
                <span className="text-[11px] text-muted-foreground font-medium">
                  Organization-Wide Goals
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {isHR
                ? "Company Goals & OKRs"
                : isLead
                ? "Team Goals & Deliverables"
                : "My Goals & Quarterly OKRs"}
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {isHR
                ? "Track company-wide objectives, target outcomes, and overall completion progress."
                : isLead
                ? "Set sprint delivery milestones, inspect direct reports' OKR alignment, and track team progress."
                : "Set your milestone targets, track progress easily, and stay aligned with company objectives."}
            </p>
          </div>
        </Interactive3DCard>

        {/* Distinct Role Decks */}
        {isHR ? (
          <HREnterpriseGoalsDeck />
        ) : isLead ? (
          <LeadGoalsManager />
        ) : (
          <SimpleGoalsManager />
        )}
      </div>
    </PageTransition>
  );
}
