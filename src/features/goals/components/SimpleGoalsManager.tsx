"use client";

import React, { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { MetricTile3D } from "@/components/3d/MetricTile3D";
import { fireCelebrationConfetti, fireSuccessBurst } from "@/lib/ui/confetti";
import {
  Target,
  CheckCircle2,
  Plus,
  Trash2,
  Search,
  Building2,
  TrendingUp,
  Award,
  Calendar,
  Sparkles,
  Check,
  RotateCcw,
} from "lucide-react";

export interface SimpleGoalItem {
  id: string;
  title: string;
  category: string;
  progress: number;
  status: "IN_PROGRESS" | "COMPLETED";
  targetDate: string;
  description?: string;
}

const DEFAULT_FRIENDLY_GOALS: SimpleGoalItem[] = [
  {
    id: "goal-1",
    title: "Improve customer inquiry response time",
    category: "Customer Service",
    progress: 75,
    status: "IN_PROGRESS",
    targetDate: "End of Quarter",
    description: "Aim to respond to all client questions within 2 hours.",
  },
  {
    id: "goal-2",
    title: "Complete quarterly team training program",
    category: "Professional Growth",
    progress: 60,
    status: "IN_PROGRESS",
    targetDate: "This Month",
    description: "Finish all 4 modules of the leadership and communication workshop.",
  },
  {
    id: "goal-3",
    title: "Streamline monthly invoice approvals",
    category: "Operations",
    progress: 100,
    status: "COMPLETED",
    targetDate: "Sprint 34",
    description: "Reduced average vendor invoice processing time from 5 days to 1 day.",
  },
  {
    id: "goal-4",
    title: "Update team documentation & knowledge base",
    category: "Organization",
    progress: 40,
    status: "IN_PROGRESS",
    targetDate: "Next Month",
    description: "Organize shared templates, FAQs, and onboarding checklists.",
  },
];

export interface CompanyOKRItem {
  id: string;
  objective: string;
  keyResult: string;
  progress: number;
  department: string;
}

const COMPANY_OKRS: CompanyOKRItem[] = [
  {
    id: "okr-1",
    objective: "Deliver Outstanding Customer Service",
    keyResult: "Achieve 98%+ client satisfaction score across all service touchpoints.",
    progress: 85,
    department: "Organization Wide",
  },
  {
    id: "okr-2",
    objective: "Operational Excellence & Speed",
    keyResult: "Reduce approval turnaround time to under 24 hours.",
    progress: 90,
    department: "Operations & HR",
  },
  {
    id: "okr-3",
    objective: "Empower People & Team Growth",
    keyResult: "100% of staff participate in quarterly skill-building workshops.",
    progress: 70,
    department: "All Teams",
  },
];

type GoalTab = "ALL" | "IN_PROGRESS" | "COMPLETED" | "COMPANY_OKRS";

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Operations: { bg: "bg-teal-500/15", text: "text-teal-400", border: "border-teal-500/30" },
  "Customer Service": { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" },
  "Professional Growth": { bg: "bg-cyan-500/15", text: "text-cyan-400", border: "border-cyan-500/30" },
  Organization: { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30" },
};

export function SimpleGoalsManager() {
  const [goals, setGoals] = useState<SimpleGoalItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("workpulse_simple_goals");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_FRIENDLY_GOALS;
  });

  const [companyOkrs] = useState<CompanyOKRItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("workpulse_company_okrs");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return COMPANY_OKRS;
  });

  const [activeTab, setActiveTab] = useState<GoalTab>("ALL");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Operations");
  const [newTargetDate, setNewTargetDate] = useState("This Month");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const saveGoals = (updated: SimpleGoalItem[]) => {
    setGoals(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("workpulse_simple_goals", JSON.stringify(updated));
      } catch {}
    }
  };

  const handleToggleComplete = (id: string) => {
    const updated = goals.map((g) => {
      if (g.id !== id) return g;
      const isNowDone = g.status !== "COMPLETED";
      if (isNowDone) {
        fireCelebrationConfetti();
      } else {
        fireSuccessBurst();
      }
      return {
        ...g,
        status: isNowDone ? ("COMPLETED" as const) : ("IN_PROGRESS" as const),
        progress: isNowDone ? 100 : 50,
      };
    });
    saveGoals(updated);
    const toggled = updated.find((g) => g.id === id);
    if (toggled?.status === "COMPLETED") {
      showToast("🎉 Great work! Goal marked as completed.");
    }
  };

  const handleSetProgress = (id: string, newProgress: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(newProgress)));
    const newStatus = clamped === 100 ? ("COMPLETED" as const) : ("IN_PROGRESS" as const);

    const updated = goals.map((g) => {
      if (g.id !== id) return g;
      return { ...g, progress: clamped, status: newStatus };
    });
    saveGoals(updated);
    if (clamped === 100) {
      fireCelebrationConfetti();
      showToast("🎉 Goal reached 100% and marked completed!");
    }
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newGoal: SimpleGoalItem = {
      id: `goal-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      progress: 0,
      status: "IN_PROGRESS",
      targetDate: newTargetDate,
      description: "Personal milestone target.",
    };

    const updated = [newGoal, ...goals];
    saveGoals(updated);
    setNewTitle("");
    setShowAddForm(false);
    fireSuccessBurst();
    showToast("✓ New goal created!");
  };

  const handleDeleteGoal = (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    saveGoals(updated);
    showToast("Goal removed.");
  };

  const totalGoals = goals.length;
  const inProgressGoals = goals.filter((g) => g.status === "IN_PROGRESS");
  const completedGoals = goals.filter((g) => g.status === "COMPLETED");
  const averageProgress = totalGoals > 0 ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / totalGoals) : 0;

  const filteredGoals = useMemo(() => {
    return goals.filter((g) => {
      if (activeTab === "IN_PROGRESS" && g.status !== "IN_PROGRESS") return false;
      if (activeTab === "COMPLETED" && g.status !== "COMPLETED") return false;
      if (selectedCategory !== "ALL" && g.category !== selectedCategory) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return g.title.toLowerCase().includes(q) || g.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [goals, activeTab, selectedCategory, searchQuery]);

  const categories = ["ALL", "Operations", "Customer Service", "Professional Growth", "Organization"];

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Team Lead Pod Alignment Banner */}
      <div className="p-4 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-card/80 to-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-extrabold text-xs shrink-0 shadow-sm">
            AL
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <strong className="text-foreground text-xs">Pod Lead: Alex Lead</strong>
              <Badge variant="outline" className="text-[9px] text-emerald-300 border-emerald-500/30 bg-emerald-500/10">
                Development Pod
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Your milestone targets and OKRs are aligned with the Development Pod sprint objectives.
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <span className="text-emerald-300 font-bold block text-[11px]">Sprint 34 Alignment</span>
          <span className="text-muted-foreground text-[10px]">Reviewed by Alex Lead</span>
        </div>
      </div>

      {/* 1. 3D Key Metrics Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile3D
          title="Total Goals"
          value={totalGoals}
          subtitle="Active milestone targets"
          icon={Target}
          accent="cyan"
          badgeText="Active"
        />
        <MetricTile3D
          title="Average Progress"
          value={`${averageProgress}%`}
          subtitle="Overall completion"
          icon={TrendingUp}
          accent="emerald"
          badgeText="On Track"
        />
        <MetricTile3D
          title="In Progress"
          value={inProgressGoals.length}
          subtitle="Currently underway"
          icon={Sparkles}
          accent="purple"
          badgeText="Underway"
        />
        <MetricTile3D
          title="Completed"
          value={completedGoals.length}
          subtitle="Achieved milestones"
          icon={Award}
          accent="gold"
          badgeText="Achieved"
        />
      </div>

      {/* 2. Segregation Tabs & Add Form Button */}
      <Interactive3DCard className="p-3 border border-border/80 bg-card/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Segregation Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-background/60 border border-border/60 overflow-x-auto gap-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                activeTab === "ALL"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <span>All Goals</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "ALL" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              }`}>
                {totalGoals}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("IN_PROGRESS")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                activeTab === "IN_PROGRESS"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <span>In Progress</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "IN_PROGRESS" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              }`}>
                {inProgressGoals.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("COMPLETED")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                activeTab === "COMPLETED"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <span>Completed</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "COMPLETED" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              }`}>
                {completedGoals.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("COMPANY_OKRS")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                activeTab === "COMPANY_OKRS"
                  ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Company Strategic OKRs</span>
            </button>
          </div>

          {/* Add Goal Button */}
          {activeTab !== "COMPANY_OKRS" && (
            <Button
              size="sm"
              variant="brand"
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs font-bold gap-1.5 h-9 px-4 shrink-0 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-500/20"
            >
              <Plus className="h-4 w-4" />
              <span>{showAddForm ? "Close Form" : "Add Goal"}</span>
            </Button>
          )}
        </div>

        {/* 3. Add Goal Form */}
        {showAddForm && (
          <form onSubmit={handleAddGoal} className="mt-4 p-5 rounded-2xl bg-background/90 border border-emerald-500/40 space-y-4 animate-in fade-in slide-in-from-top-2 shadow-lg">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>Create New Personal Goal</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">What is your goal?</label>
                <Input
                  type="text"
                  placeholder="e.g., Deliver new client onboarding package"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="h-10 text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:outline-none"
                >
                  <option value="Operations">Operations</option>
                  <option value="Customer Service">Customer Service</option>
                  <option value="Professional Growth">Professional Growth</option>
                  <option value="Organization">Organization</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-muted-foreground">Target Timeline:</span>
                <select
                  value={newTargetDate}
                  onChange={(e) => setNewTargetDate(e.target.value)}
                  className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground"
                >
                  <option value="This Month">This Month</option>
                  <option value="End of Quarter">End of Quarter</option>
                  <option value="Sprint 34">Sprint 34</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs h-9 rounded-xl"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant="brand" className="text-xs font-bold h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                  Create Goal
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* 4. Search & Filter Bar */}
        {activeTab !== "COMPANY_OKRS" && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 text-xs border-t border-border/60 mt-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search goals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs rounded-xl bg-background/50"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg font-semibold text-xs whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground font-bold shadow-sm"
                      : "bg-muted/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </Interactive3DCard>

      {/* 5. Main Content: Goals List or Company OKRs */}
      {activeTab === "COMPANY_OKRS" ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-card/60 border border-border/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-400" />
              <strong className="text-foreground">Company Strategic Objectives (Q3 2026)</strong>
            </div>
            <span className="text-muted-foreground">Organizational Alignment</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {companyOkrs.map((okr) => (
              <Interactive3DCard
                key={okr.id}
                className="p-5 border border-border/80 bg-card/70 space-y-3 hover:border-purple-500/40 transition-all shadow-sm"
              >
                <div className="space-y-1">
                  <Badge variant="outline" className="text-[10px] text-purple-400 border-purple-500/30 bg-purple-500/10">
                    {okr.department}
                  </Badge>
                  <h4 className="text-sm font-bold text-foreground pt-1">{okr.objective}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {okr.keyResult}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress:</span>
                    <strong className="text-purple-400 font-mono font-bold">{okr.progress}%</strong>
                  </div>
                  <div className="progress-track-line">
                    <div
                      className="progress-track-fill-purple"
                      style={{ width: `${okr.progress}%` }}
                    />
                  </div>
                </div>
              </Interactive3DCard>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGoals.length === 0 ? (
            <div className="p-12 text-center bg-card/40 rounded-2xl border border-border/60 text-xs text-muted-foreground space-y-2">
              <Target className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="font-semibold text-sm text-foreground">No goals in this view</p>
              <p>Click &quot;Add Goal&quot; to set a new milestone target.</p>
            </div>
          ) : (
            filteredGoals.map((goal) => {
              const isDone = goal.status === "COMPLETED";
              const catStyle = CATEGORY_COLORS[goal.category] || {
                bg: "bg-emerald-500/15",
                text: "text-emerald-400",
                border: "border-emerald-500/30",
              };

              return (
                <Interactive3DCard
                  key={goal.id}
                  className={`p-6 border transition-all duration-300 ${
                    isDone
                      ? "border-emerald-500/30 bg-gradient-to-r from-emerald-500/[0.04] via-card/90 to-card/80 shadow-sm"
                      : "border-border/80 bg-gradient-to-r from-card/95 via-card/80 to-card/60 hover:border-primary/50 shadow-md"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base font-extrabold text-foreground tracking-tight">
                          {goal.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                        >
                          {goal.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/30 px-2.5 py-0.5 rounded-full border border-border/60">
                          <Calendar className="h-3 w-3 text-emerald-400" />
                          <span>{goal.targetDate}</span>
                        </div>
                        {isDone && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Completed</span>
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {goal.description}
                      </p>

                      <div className="space-y-2 pt-1 max-w-xl">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-muted-foreground">My Progress:</span>
                          <div className="flex items-center gap-2">
                            <span className={`font-mono text-sm font-extrabold ${isDone ? "text-emerald-400" : "text-cyan-400"}`}>
                              {goal.progress}%
                            </span>
                            {isDone && <span className="text-emerald-400 text-[11px] font-bold">✓ Target Reached</span>}
                          </div>
                        </div>

                        <div className="progress-track-line">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isDone
                                ? "progress-track-fill-emerald"
                                : "progress-track-fill-cyan"
                            }`}
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold mr-1">Quick Set:</span>
                            {[25, 50, 75, 100].map((pct) => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => handleSetProgress(goal.id, pct)}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono transition-all border ${
                                  goal.progress === pct
                                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                    : "bg-muted/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                                }`}
                              >
                                {pct}%
                              </button>
                            ))}
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={goal.progress}
                              onChange={(e) => handleSetProgress(goal.id, Number(e.target.value))}
                              className="w-28 sm:w-36 h-2.5 cursor-pointer accent-cyan-400"
                              title="Fine-tune progress"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border/60">
                      <Button
                        size="sm"
                        onClick={() => handleToggleComplete(goal.id)}
                        className={`text-xs font-bold h-9 px-4 gap-1.5 shadow-sm transition-all rounded-xl ${
                          isDone
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                            : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20"
                        }`}
                      >
                        {isDone ? (
                          <>
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Reopen</span>
                          </>
                        ) : (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Mark Complete</span>
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="h-8 px-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                        title="Remove goal"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        <span className="text-[11px]">Delete</span>
                      </Button>
                    </div>
                  </div>
                </Interactive3DCard>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
