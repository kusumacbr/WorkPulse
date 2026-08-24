"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import {
  Target,
  Sliders,
  Scale,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Wand2,
  Lock,
} from "lucide-react";

interface BudgetGoalItem {
  id: string;
  title: string;
  category: string;
  project: string;
  weight: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "IN_PROGRESS" | "COMPLETED" | "NOT_STARTED";
  progressPercentage: number;
}

const INITIAL_BUDGET_GOALS: BudgetGoalItem[] = [
  {
    id: "bg-1",
    title: "Deliver Core Employee Workflow & Lifecycle State Machine",
    category: "Engineering Architecture",
    project: "Core Platform",
    weight: 40,
    priority: "HIGH",
    status: "IN_PROGRESS",
    progressPercentage: 80,
  },
  {
    id: "bg-2",
    title: "Build GitHub-style Month Heatmap & Contribution View",
    category: "Frontend Excellence",
    project: "Frontend & UI",
    weight: 35,
    priority: "MEDIUM",
    status: "COMPLETED",
    progressPercentage: 100,
  },
  {
    id: "bg-3",
    title: "Unit Testing, RBAC Authorization & Resilience Verification",
    category: "Quality Assurance",
    project: "Core Platform",
    weight: 25,
    priority: "HIGH",
    status: "IN_PROGRESS",
    progressPercentage: 60,
  },
];

export function OKRBudgetingDeck() {
  const [goals, setGoals] = useState<BudgetGoalItem[]>(INITIAL_BUDGET_GOALS);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const totalBudget = goals.reduce((sum, g) => sum + g.weight, 0);
  const isPerfect = totalBudget === 100;
  const isOver = totalBudget > 100;

  const handleUpdateWeight = (id: string, newWeight: number) => {
    if (isLocked) return;
    const clamped = Math.max(0, Math.min(100, newWeight));
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, weight: clamped } : g))
    );
  };

  // Smart Auto-Balance tool: proportionally balances goals to equal exactly 100%
  const handleAutoBalance = () => {
    if (goals.length === 0) return;
    const currentSum = goals.reduce((s, g) => s + g.weight, 0);
    if (currentSum === 0) {
      const equalShare = Math.floor(100 / goals.length);
      const remainder = 100 - equalShare * goals.length;
      setGoals((prev) =>
        prev.map((g, idx) => ({
          ...g,
          weight: equalShare + (idx === 0 ? remainder : 0),
        }))
      );
    } else {
      let accumulated = 0;
      const newGoals = goals.map((g, idx) => {
        if (idx === goals.length - 1) {
          return { ...g, weight: Math.max(0, 100 - accumulated) };
        }
        const proportional = Math.round((g.weight / currentSum) * 100);
        accumulated += proportional;
        return { ...g, weight: proportional };
      });
      setGoals(newGoals);
    }
    showToast("Smart balanced weights to exactly 100%! ⚖️");
  };

  const handleSaveBudget = () => {
    if (!isPerfect) {
      showToast(`⚠️ Cannot lock budget: Current total is ${totalBudget}%. It must equal exactly 100%.`);
      return;
    }
    setIsLocked(true);
    showToast("Sprint OKR Weight Budget locked and saved for scoring! 🎯");
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Main OKR Budgeting Workspace Card */}
      <Interactive3DCard className="p-6 md:p-8 border border-emerald-500/30 bg-gradient-to-r from-card/90 via-card/70 to-emerald-500/10 space-y-6">
        {/* Header & Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-border/60">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="font-bold text-[10px] uppercase bg-emerald-500/15 border-emerald-500/30 text-emerald-300">
                <Scale className="h-3 w-3 mr-1 text-emerald-400" />
                OKR Weight Balancing Engine
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">Sprint 34 · Active Cycle</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-foreground">
              Weekly OKR Weight Budgeting
            </h3>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Allocate weights across your active sprint deliverables. Every sprint budget must total <strong>exactly 100%</strong> to ensure fair performance evaluation.
            </p>
          </div>

          {/* Live Total Budget Indicator Pill */}
          <div className={`p-4 rounded-2xl border backdrop-blur-md space-y-1.5 shrink-0 text-right shadow-sm ${
            isPerfect
              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
              : isOver
              ? "bg-red-500/10 border-red-500/40 text-red-400"
              : "bg-amber-500/10 border-amber-500/40 text-amber-400"
          }`}>
            <span className="text-[10px] font-extrabold uppercase tracking-wider block">
              Budget Status
            </span>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-2xl font-black font-mono">{totalBudget}%</span>
              <span className="text-xs text-muted-foreground">/ 100%</span>
            </div>
            <span className="text-[11px] font-bold block">
              {isPerfect ? "✓ Balanced & Valid" : isOver ? `⚠️ Over by ${totalBudget - 100}%` : `⚠️ ${100 - totalBudget}% Remaining`}
            </span>
          </div>
        </div>

        {/* Visual Dual-Tone Budget Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-emerald-400" />
              100% Budget Distribution Track
            </span>
            <span className="font-mono text-xs font-bold text-muted-foreground">
              {goals.length} Goals Budgeted
            </span>
          </div>

          <div className="h-3.5 w-full bg-slate-950 rounded-full border border-border/80 overflow-hidden flex shadow-inner">
            {goals.map((g, idx) => {
              const colors = [
                "bg-cyan-500",
                "bg-emerald-400",
                "bg-purple-500",
                "bg-amber-400",
                "bg-rose-500",
              ];
              const color = colors[idx % colors.length];

              return (
                <div
                  key={g.id}
                  style={{ width: `${Math.min(100, g.weight)}%` }}
                  className={`h-full ${color} transition-all duration-300 hover:opacity-90 relative group`}
                  title={`${g.title}: ${g.weight}% weight`}
                />
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground pt-1">
            {goals.map((g, idx) => {
              const dotColors = [
                "bg-cyan-400",
                "bg-emerald-400",
                "bg-purple-400",
                "bg-amber-400",
                "bg-rose-400",
              ];
              const dotColor = dotColors[idx % dotColors.length];

              return (
                <div key={g.id} className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${dotColor}`} />
                  <span className="truncate max-w-[140px] text-foreground font-semibold">{g.title}:</span>
                  <strong className="text-cyan-300 font-mono font-bold">{g.weight}%</strong>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Goal Sliders Deck */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-cyan-400" />
              Adjust Goal Weights (0% - 100%)
            </h4>

            {!isLocked && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAutoBalance}
                className="h-7 text-xs font-bold text-cyan-400 border-cyan-500/40 hover:bg-cyan-500/10 gap-1.5"
              >
                <Wand2 className="h-3 w-3" />
                <span>Auto-Balance to 100%</span>
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {goals.map((goal, idx) => (
              <div
                key={goal.id}
                className="p-4 rounded-xl border border-border/80 bg-card/60 hover:border-emerald-500/40 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="h-6 w-6 rounded-md bg-muted text-emerald-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      #{idx + 1}
                    </span>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-foreground">{goal.title}</span>
                        <Badge variant="outline" className="text-[9px] uppercase font-bold text-cyan-400 border-cyan-500/30">
                          {goal.category}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[9px] uppercase font-bold ${
                            goal.priority === "HIGH" ? "border-red-500/40 text-red-400" : "border-amber-500/40 text-amber-400"
                          }`}
                        >
                          {goal.priority}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-muted-foreground block">
                        Project: {goal.project} · Execution Progress: <strong className="text-foreground">{goal.progressPercentage}%</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Assigned Weight</span>
                      <strong className="text-base font-black text-emerald-400 font-mono">{goal.weight}%</strong>
                    </div>

                    {!isLocked && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateWeight(goal.id, goal.weight - 5)}
                          className="h-7 w-7 p-0 text-xs font-bold"
                        >
                          -
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateWeight(goal.id, goal.weight + 5)}
                          className="h-7 w-7 p-0 text-xs font-bold"
                        >
                          +
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Range Slider */}
                <div className="space-y-1 pt-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    disabled={isLocked}
                    value={goal.weight}
                    onChange={(e) => handleUpdateWeight(goal.id, Number(e.target.value))}
                    className="progress-range-slider"
                    title={`Adjust weight for ${goal.title}: ${goal.weight}%`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isPerfect ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-300 font-bold">100% Budget constraint satisfied. Ready to lock.</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-amber-300 font-bold">
                  {isOver ? `Total weight is ${totalBudget}%. Please reduce by ${totalBudget - 100}%.` : `Total weight is ${totalBudget}%. Please allocate remaining ${100 - totalBudget}%.`}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isLocked ? (
              <Badge variant="brand" className="px-4 py-2 text-xs font-bold bg-emerald-500/15 text-emerald-300 border-emerald-500/30 gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                <span>Sprint Budget Locked (100%)</span>
              </Badge>
            ) : (
              <Button
                variant="brand"
                size="lg"
                disabled={!isPerfect}
                onClick={handleSaveBudget}
                className="text-xs font-extrabold bg-gradient-to-r from-emerald-500 to-teal-600 text-black shadow-md h-10 px-6 gap-2 hover:opacity-95"
              >
                <CheckCircle2 className="h-4 w-4 fill-current" />
                <span>Lock 100% OKR Budget</span>
              </Button>
            )}
          </div>
        </div>
      </Interactive3DCard>
    </div>
  );
}
