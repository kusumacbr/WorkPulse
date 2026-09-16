"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fireCelebrationConfetti, fireSuccessBurst } from "@/lib/ui/confetti";
import {
  Target,
  Plus,
  Trash2,
  Sparkles,
  Check,
  UserPlus,
  UserCheck,
  HeartHandshake,
  Layers,
  Search,
} from "lucide-react";

export interface SimpleHRGoal {
  id: string;
  title: string;
  category: "Talent Acquisition" | "Attendance & Compliance" | "Culture & Retention" | "Operations" | string;
  target: string;
  progress: number;
  status: "IN_PROGRESS" | "COMPLETED";
}

const DEFAULT_GOALS: SimpleHRGoal[] = [];

const DEFAULT_CATEGORY_STYLE = {
  bg: "bg-purple-500/15",
  text: "text-purple-400",
  border: "border-purple-500/30",
  icon: Layers,
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; icon: any }> = {
  "Talent Acquisition": {
    bg: "bg-cyan-500/15",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
    icon: UserPlus,
  },
  "Attendance & Compliance": {
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    icon: UserCheck,
  },
  "Culture & Retention": {
    bg: "bg-pink-500/15",
    text: "text-pink-400",
    border: "border-pink-500/30",
    icon: HeartHandshake,
  },
  Operations: {
    bg: "bg-purple-500/15",
    text: "text-purple-400",
    border: "border-purple-500/30",
    icon: Layers,
  },
};

export function HREnterpriseGoalsDeck() {
  const [goals, setGoals] = useState<SimpleHRGoal[]>(DEFAULT_GOALS);
  const [filter, setFilter] = useState<"ALL" | "IN_PROGRESS" | "COMPLETED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // New goal form state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Talent Acquisition");
  const [newTarget, setNewTarget] = useState("");

  // Load Company OKRs from Supabase API
  useEffect(() => {
    const loadCompanyOkrs = async () => {
      try {
        const res = await fetch("/api/v1/goals?employeeId=COMPANY_OKRS");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.data?.goals) && data.data.goals.length > 0) {
            setGoals(data.data.goals);
            return;
          }
        }
      } catch {}

      // Fallback to default HR goals
      setGoals(DEFAULT_GOALS);
    };
    loadCompanyOkrs();
  }, []);

  // Listen to cross-component sync events
  useEffect(() => {
    const handleSync = async () => {
      try {
        const res = await fetch("/api/v1/goals?employeeId=COMPANY_OKRS");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.data?.goals) && data.data.goals.length > 0) {
            setGoals(data.data.goals);
          }
        }
      } catch {}
    };
    window.addEventListener("workpulse_sync", handleSync);
    return () => window.removeEventListener("workpulse_sync", handleSync);
  }, []);

  // Save Company OKRs and sync across Employee, TL, and HR
  const saveGoals = async (updated: SimpleHRGoal[]) => {
    setGoals(updated);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("workpulse_sync"));
    }
    // Sync Company OKRs to Supabase
    try {
      await fetch(`/api/v1/goals/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: "COMPANY_OKRS", goals: updated }),
      });
    } catch {}
  };

  // Toggle complete
  const handleToggleGoal = (id: string) => {
    const updated = goals.map((g) => {
      if (g.id === id) {
        const isDone = g.status === "COMPLETED";
        if (!isDone) {
          fireCelebrationConfetti();
        }
        return {
          ...g,
          status: (isDone ? "IN_PROGRESS" : "COMPLETED") as "IN_PROGRESS" | "COMPLETED",
          progress: isDone ? 75 : 100,
        };
      }
      return g;
    });
    saveGoals(updated);
  };

  // Update progress
  const handleSetProgress = (id: string, progress: number) => {
    const updated = goals.map((g) => {
      if (g.id === id) {
        if (progress === 100) {
          fireSuccessBurst();
        }
        return {
          ...g,
          progress,
          status: (progress === 100 ? "COMPLETED" : "IN_PROGRESS") as "IN_PROGRESS" | "COMPLETED",
        };
      }
      return g;
    });
    saveGoals(updated);
  };

  // Delete goal
  const handleDeleteGoal = (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    saveGoals(updated);
  };

  // Add goal
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newGoal: SimpleHRGoal = {
      id: `goal-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      target: newTarget.trim() || "Target Q3",
      progress: 0,
      status: "IN_PROGRESS",
    };

    const updated = [newGoal, ...goals];
    saveGoals(updated);
    setNewTitle("");
    setNewTarget("");
    setShowAddForm(false);
    fireSuccessBurst();
  };

  // Computed metrics
  const totalCount = goals.length;
  const completedCount = goals.filter((g) => g.status === "COMPLETED" || g.progress === 100).length;
  const inProgressCount = totalCount - completedCount;
  const avgProgress = totalCount > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / totalCount) : 0;

  // Filtered list
  const filteredGoals = useMemo(() => {
    return goals.filter((g) => {
      if (filter === "IN_PROGRESS" && (g.status === "COMPLETED" || g.progress === 100)) return false;
      if (filter === "COMPLETED" && g.status !== "COMPLETED" && g.progress < 100) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          g.title.toLowerCase().includes(query) ||
          g.category.toLowerCase().includes(query) ||
          g.target.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [goals, filter, searchQuery]);

  return (
    <div className="space-y-4">
      {/* 1. Simple Summary Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Overall Progress */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">Overall Company Progress</h3>
              <Badge variant="outline" className="text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                {avgProgress}%
              </Badge>
            </div>
            <div className="w-48 sm:w-64 h-2 rounded-full bg-muted/60 mt-1.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${avgProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Stat Counters & Action */}
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-muted/40 border border-border/60 text-xs font-semibold text-muted-foreground">
              Total: <strong className="text-foreground">{totalCount}</strong>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-400">
              Active: <strong className="text-cyan-300">{inProgressCount}</strong>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
              Done: <strong className="text-emerald-300">{completedCount}</strong>
            </span>
          </div>

          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="h-9 px-3.5 text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl gap-1.5 shadow-sm cursor-pointer shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{showAddForm ? "Cancel" : "Add Goal"}</span>
          </Button>
        </div>
      </div>

      {/* 2. Add Goal Form (Simple Inline) */}
      {showAddForm && (
        <form onSubmit={handleAddGoal} className="p-4 rounded-2xl bg-card border border-cyan-500/30 space-y-3 shadow-md animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Add New Company Goal</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 text-xs">
            <div className="sm:col-span-6 space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Goal Title</label>
              <Input
                type="text"
                placeholder="e.g. Implement automated candidate screening..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="h-9 text-xs rounded-xl"
                required
                autoFocus
              />
            </div>

            <div className="sm:col-span-3 space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full h-9 rounded-xl border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none"
              >
                <option value="Talent Acquisition">Talent Acquisition</option>
                <option value="Attendance & Compliance">Attendance & Compliance</option>
                <option value="Culture & Retention">Culture & Retention</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div className="sm:col-span-3 space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Target / Metric</label>
              <Input
                type="text"
                placeholder="e.g. < 15 Days or 100%"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(false)}
              className="h-8 text-xs rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-8 text-xs font-bold px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer"
            >
              Save Goal
            </Button>
          </div>
        </form>
      )}

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/60 text-xs w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              filter === "ALL"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("IN_PROGRESS")}
            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              filter === "IN_PROGRESS"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            In Progress ({inProgressCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("COMPLETED")}
            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              filter === "COMPLETED"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search goals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs rounded-xl bg-background/80"
          />
        </div>
      </div>

      {/* 4. Goals List */}
      <div className="space-y-2.5">
        {filteredGoals.length > 0 ? (
          filteredGoals.map((goal) => {
            const isDone = goal.status === "COMPLETED" || goal.progress === 100;
            const categoryConfig = CATEGORY_COLORS[goal.category] || DEFAULT_CATEGORY_STYLE;
            const CategoryIcon = categoryConfig.icon;

            return (
              <div
                key={goal.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all shadow-sm ${
                  isDone
                    ? "bg-emerald-500/[0.03] border-emerald-500/30"
                    : "bg-card border-border/80 hover:border-cyan-500/30"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Checkmark & Title */}
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => handleToggleGoal(goal.id)}
                      className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${
                        isDone
                          ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                          : "border-muted-foreground/40 hover:border-cyan-400 bg-background"
                      }`}
                      title={isDone ? "Mark as in progress" : "Mark as completed"}
                    >
                      {isDone && <Check className="h-3 w-3 stroke-[3]" />}
                    </button>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong
                          className={`text-xs sm:text-sm font-semibold text-foreground ${
                            isDone ? "line-through text-muted-foreground font-normal" : ""
                          }`}
                        >
                          {goal.title}
                        </strong>

                        <Badge
                          variant="outline"
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold border flex items-center gap-1 ${categoryConfig.bg} ${categoryConfig.text} ${categoryConfig.border}`}
                        >
                          <CategoryIcon className="h-2.5 w-2.5" />
                          <span>{goal.category}</span>
                        </Badge>

                        {goal.target && (
                          <span className="text-[10px] text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-md border border-border/50">
                            {goal.target}
                          </span>
                        )}

                        {isDone && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            ✓ Achieved
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Delete Action */}
                  <button
                    type="button"
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-1 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
                    title="Delete Goal"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Progress Slider / Quick Buttons */}
                <div className="flex items-center justify-between gap-3 pt-2 mt-2 border-t border-border/40 text-xs">
                  <div className="flex items-center gap-2.5 flex-1 max-w-sm">
                    <span className="text-[10px] text-muted-foreground font-medium shrink-0">Progress:</span>
                    <div className="flex-1 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isDone
                            ? "bg-emerald-500"
                            : "bg-gradient-to-r from-cyan-500 to-blue-500"
                        }`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <span className={`font-mono font-bold text-[11px] w-8 text-right shrink-0 ${isDone ? "text-emerald-400" : "text-cyan-400"}`}>
                      {goal.progress}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {[25, 50, 75, 100].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => handleSetProgress(goal.id, pct)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono transition-all cursor-pointer ${
                          goal.progress === pct
                            ? "bg-primary text-primary-foreground font-bold shadow-sm"
                            : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center rounded-2xl bg-card border border-border/70 text-muted-foreground text-xs space-y-2">
            <Target className="h-8 w-8 text-muted-foreground/40 mx-auto" />
            <p>No goals found matching your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
