"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { AnimatedTabContent } from "@/components/animations/AnimatedTabContent";
import { WeeklyGoalsList } from "@/features/goals/components/WeeklyGoalsList";
import { OKRBudgetingDeck } from "@/features/goals/components/OKRBudgetingDeck";
import { HREnterpriseGoalsDeck } from "@/features/goals/components/HREnterpriseGoalsDeck";
import { useCurrentUser } from "@/components/layout/UserContext";
import { Target, Scale, Sliders, ShieldCheck } from "lucide-react";

export default function GoalsPage() {
  const user = useCurrentUser();
  const isHR = user.roles.includes("HR") || user.primaryRole === "HR" || user.roles.includes("ADMIN");

  const [activeTab, setActiveTab] = useState<"hr_strategy" | "goals" | "budgeting">(
    isHR ? "hr_strategy" : "goals"
  );

  return (
    <PageTransition>
      {/* 3D Hero Banner */}
      <Interactive3DCard className="p-6 md:p-8 border border-emerald-500/30 bg-gradient-to-r from-card/80 via-card/60 to-emerald-500/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="font-bold text-[10px] uppercase bg-emerald-500/15 border-emerald-500/30 text-emerald-300">
                <Scale className="h-3 w-3 mr-1 text-emerald-400" />
                {isHR ? "People Strategy & Strategic OKR Governance" : "100% OKR Weight Budgeting"}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                {isHR ? "Q3 2026 Strategic Objectives" : "Sprint 34 · Weekly Alignment"}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {isHR ? "Enterprise People OKRs & Strategic Alignment Engine" : "Weekly Goals & OKR Budgeting Engine"}
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {isHR
                ? "Track institutional talent acquisition velocity, attendance compliance, eNPS satisfaction metrics, and monitor cascaded sprint OKR health across all 6 departments."
                : "Every weekly sprint must total exactly 100% in weights across active deliverables. Add your weekly sprint goals, track measurable outcomes, and fine-tune OKR weights."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {isHR && (
              <Button
                variant="brand"
                onClick={() => setActiveTab("hr_strategy")}
                className={`text-xs font-bold h-9 px-4 gap-1.5 transition-all ${
                  activeTab === "hr_strategy"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>HR Strategic OKRs</span>
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => setActiveTab("goals")}
              className={`text-xs font-bold h-9 px-4 gap-1.5 transition-all ${
                activeTab === "goals"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Target className="h-3.5 w-3.5" />
              <span>Sprint Deliverables</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => setActiveTab("budgeting")}
              className={`text-xs font-bold h-9 px-4 gap-1.5 transition-all ${
                activeTab === "budgeting"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sliders className="h-3.5 w-3.5 text-emerald-400" />
              <span>Weight Budgeting</span>
            </Button>
          </div>
        </div>
      </Interactive3DCard>

      {/* Animated Tab Content */}
      <AnimatedTabContent tabKey={activeTab}>
        {activeTab === "hr_strategy" && isHR ? (
          <HREnterpriseGoalsDeck />
        ) : activeTab === "budgeting" ? (
          <OKRBudgetingDeck />
        ) : (
          <WeeklyGoalsList />
        )}
      </AnimatedTabContent>
    </PageTransition>
  );
}
