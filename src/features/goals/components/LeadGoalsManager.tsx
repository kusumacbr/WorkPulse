"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { fireCelebrationConfetti, fireSuccessBurst } from "@/lib/ui/confetti";
import {
  Target,
  CheckCircle2,
  Plus,
  Trash2,
  Users,
  Calendar,
  Sparkles,
  Check,
  Cpu,
  ShieldCheck,
  CheckSquare2,
  Zap,
  Clock,
  Trophy,
} from "lucide-react";

export interface TeamSprintGoal {
  id: string;
  title: string;
  leadOwner: string;
  category: "Architecture" | "Quality & Testing" | "Security" | "Operations" | string;
  progress: number;
  status: "IN_PROGRESS" | "COMPLETED";
  targetDate: string;
  description: string;
}

export interface MemberGoalSummary {
  id: string;
  memberName: string;
  memberRole: string;
  memberAvatar: string;
  avatarBg: string;
  goalTitle: string;
  progress: number;
  status: "ON_TRACK" | "IN_PROGRESS" | "COMPLETED";
}

const DEFAULT_TEAM_SPRINT_GOALS: TeamSprintGoal[] = [
  {
    id: "tsg-1",
    title: "Deliver Core Platform Engine & Role Isolation",
    leadOwner: "Alex Lead",
    category: "Architecture",
    progress: 80,
    status: "IN_PROGRESS",
    targetDate: "This Week",
    description: "Ensure clean role segregation and instant persona transitions across all application layers.",
  },
  {
    id: "tsg-2",
    title: "Automated Regression & Visual Component Suite",
    leadOwner: "Alex Lead",
    category: "Quality & Testing",
    progress: 65,
    status: "IN_PROGRESS",
    targetDate: "This Week",
    description: "Achieve 100% automated test pass rate with zero visual regression defects.",
  },
  {
    id: "tsg-3",
    title: "Central Authorization Library & Audit Trails",
    leadOwner: "Alex Lead",
    category: "Security",
    progress: 100,
    status: "COMPLETED",
    targetDate: "Last Week",
    description: "Successfully merged central authorization layer with zero security vulnerabilities.",
  },
];

const MEMBER_GOALS: MemberGoalSummary[] = [
  {
    id: "mg-1",
    memberName: "Sarah Dev",
    memberRole: "Senior Backend Engineer",
    memberAvatar: "SD",
    avatarBg: "bg-gradient-to-tr from-purple-500 to-pink-500 text-white",
    goalTitle: "Task Carryover State Machine & Local Cache",
    progress: 80,
    status: "ON_TRACK",
  },
  {
    id: "mg-2",
    memberName: "Rohit Sharma",
    memberRole: "Frontend Engineer",
    memberAvatar: "RS",
    avatarBg: "bg-gradient-to-tr from-cyan-500 to-blue-600 text-white",
    goalTitle: "Mobile Responsiveness & Component UI Polish",
    progress: 50,
    status: "IN_PROGRESS",
  },
  {
    id: "mg-3",
    memberName: "API Test User",
    memberRole: "Platform Engineer",
    memberAvatar: "AT",
    avatarBg: "bg-gradient-to-tr from-amber-500 to-orange-500 text-white",
    goalTitle: "REST Endpoints & Performance Tuning",
    progress: 90,
    status: "ON_TRACK",
  },
  {
    id: "mg-4",
    memberName: "Test Engineer User",
    memberRole: "Software Engineer II",
    memberAvatar: "TE",
    avatarBg: "bg-gradient-to-tr from-emerald-500 to-teal-500 text-white",
    goalTitle: "Daily SOD Verification & Feedback Flow",
    progress: 70,
    status: "IN_PROGRESS",
  },
];

interface TeamCategoryStyle {
  icon: React.ComponentType<{ className?: string }>;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  cardBorderLeft: string;
  cardGlow: string;
  progressGradient: string;
  activeText: string;
}

const DEFAULT_TEAM_CATEGORY_STYLE: TeamCategoryStyle = {
  icon: Cpu,
  badgeBg: "bg-indigo-500/15",
  badgeText: "text-indigo-400",
  badgeBorder: "border-indigo-500/30",
  cardBorderLeft: "border-l-4 border-l-indigo-500",
  cardGlow: "hover:border-indigo-500/30 hover:bg-indigo-500/[0.02]",
  progressGradient: "bg-gradient-to-r from-indigo-500 to-blue-500",
  activeText: "text-indigo-400",
};

const TEAM_CATEGORY_CONFIG: Record<string, TeamCategoryStyle> = {
  Architecture: {
    icon: Cpu,
    badgeBg: "bg-indigo-500/15",
    badgeText: "text-indigo-400",
    badgeBorder: "border-indigo-500/30",
    cardBorderLeft: "border-l-4 border-l-indigo-500",
    cardGlow: "hover:border-indigo-500/30 hover:bg-indigo-500/[0.02]",
    progressGradient: "bg-gradient-to-r from-indigo-500 to-blue-500",
    activeText: "text-indigo-400",
  },
  "Quality & Testing": {
    icon: CheckSquare2,
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-400",
    badgeBorder: "border-emerald-500/30",
    cardBorderLeft: "border-l-4 border-l-emerald-500",
    cardGlow: "hover:border-emerald-500/30 hover:bg-emerald-500/[0.02]",
    progressGradient: "bg-gradient-to-r from-emerald-500 to-teal-400",
    activeText: "text-emerald-400",
  },
  Security: {
    icon: ShieldCheck,
    badgeBg: "bg-rose-500/15",
    badgeText: "text-rose-400",
    badgeBorder: "border-rose-500/30",
    cardBorderLeft: "border-l-4 border-l-rose-500",
    cardGlow: "hover:border-rose-500/30 hover:bg-rose-500/[0.02]",
    progressGradient: "bg-gradient-to-r from-rose-500 to-pink-500",
    activeText: "text-rose-400",
  },
  Operations: {
    icon: Zap,
    badgeBg: "bg-cyan-500/15",
    badgeText: "text-cyan-400",
    badgeBorder: "border-cyan-500/30",
    cardBorderLeft: "border-l-4 border-l-cyan-500",
    cardGlow: "hover:border-cyan-500/30 hover:bg-cyan-500/[0.02]",
    progressGradient: "bg-gradient-to-r from-cyan-500 to-teal-400",
    activeText: "text-cyan-400",
  },
};

export function LeadGoalsManager() {
  const [goals, setGoals] = useState<TeamSprintGoal[]>(DEFAULT_TEAM_SPRINT_GOALS);
  const [activeTab, setActiveTab] = useState<"TEAM_SPRINT" | "DIRECT_REPORTS">("TEAM_SPRINT");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Architecture");
  const [newTargetDate, setNewTargetDate] = useState("This Week");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Load saved team goals on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("workpulse_lead_team_goals");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setGoals(parsed);
        }
      }
    } catch {}
  }, []);

  // Cross-component sync
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem("workpulse_lead_team_goals");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setGoals(parsed);
          }
        }
      } catch {}
    };
    window.addEventListener("workpulse_sync", handleSync);
    return () => window.removeEventListener("workpulse_sync", handleSync);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const saveGoals = (updated: TeamSprintGoal[]) => {
    setGoals(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("workpulse_lead_team_goals", JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("workpulse_sync"));
      } catch {}
    }
  };

  const handleSetProgress = (id: string, newProgress: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(newProgress)));
    const updated = goals.map((g) => {
      if (g.id !== id) return g;
      const newStatus = clamped === 100 ? ("COMPLETED" as const) : ("IN_PROGRESS" as const);
      return { ...g, progress: clamped, status: newStatus };
    });
    saveGoals(updated);
    if (clamped === 100) {
      fireCelebrationConfetti();
      showToast("🎉 Team milestone reached 100%!");
    }
  };

  const handleToggleComplete = (id: string) => {
    const updated = goals.map((g) => {
      if (g.id !== id) return g;
      const isDone = g.status !== "COMPLETED";
      if (isDone) {
        fireCelebrationConfetti();
      } else {
        fireSuccessBurst();
      }
      return {
        ...g,
        status: isDone ? ("COMPLETED" as const) : ("IN_PROGRESS" as const),
        progress: isDone ? 100 : 50,
      };
    });
    saveGoals(updated);
    showToast("✓ Goal status updated.");
  };

  const handleDeleteGoal = (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    saveGoals(updated);
    showToast("Goal removed.");
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newGoal: TeamSprintGoal = {
      id: `tsg-${Date.now()}`,
      title: newTitle.trim(),
      leadOwner: "Alex Lead",
      category: newCategory,
      progress: 0,
      status: "IN_PROGRESS",
      targetDate: newTargetDate,
      description: "Sprint deliverable milestone for the development team.",
    };

    const updated = [newGoal, ...goals];
    saveGoals(updated);
    setNewTitle("");
    setShowAddForm(false);
    fireSuccessBurst();
    showToast("✓ New sprint milestone added!");
  };

  const averageTeamProgress = goals.length > 0 ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length) : 0;
  const completedCount = goals.filter((g) => g.status === "COMPLETED").length;
  const inProgressCount = goals.filter((g) => g.status === "IN_PROGRESS").length;

  // SVG Radial Gauge Calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (averageTeamProgress / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* 1. Distinct Radial Gauge & Team Milestone Progress Hub */}
      <Interactive3DCard className="p-6 border border-border/80 bg-gradient-to-r from-card via-card/90 to-card/60 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left: Circular Radial Progress Dial */}
          <div className="flex items-center gap-5 shrink-0">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-muted/40"
                  strokeWidth="8"
                  fill="transparent"
                />
                <defs>
                  <linearGradient id="leadProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="url(#leadProgressGrad)"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                  suppressHydrationWarning
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="font-mono font-black text-xl text-foreground tracking-tight" suppressHydrationWarning>
                  {averageTeamProgress}%
                </span>
                <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">
                  Week
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-foreground tracking-tight">
                  Team Weekly Goals Progress
                </h3>
                <Badge variant="outline" className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border-indigo-500/30">
                  This Week
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Aggregated milestone velocity across development team deliverables.
              </p>
            </div>
          </div>

          {/* Middle: 3 Quick Metric Pills */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 flex-1 max-w-md">
            <div className="p-3 rounded-2xl bg-card border border-border/70 text-center space-y-0.5 shadow-sm">
              <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground font-semibold">
                <Target className="h-3.5 w-3.5 text-primary" />
                <span>Milestones</span>
              </div>
              <strong className="text-base font-black text-foreground block">{goals.length}</strong>
            </div>

            <div className="p-3 rounded-2xl bg-card border border-indigo-500/20 text-center space-y-0.5 shadow-sm">
              <div className="flex items-center justify-center gap-1 text-[11px] text-indigo-400 font-semibold">
                <Clock className="h-3.5 w-3.5" />
                <span>Active</span>
              </div>
              <strong className="text-base font-black text-indigo-400 block">{inProgressCount}</strong>
            </div>

            <div className="p-3 rounded-2xl bg-card border border-emerald-500/20 text-center space-y-0.5 shadow-sm">
              <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-400 font-semibold">
                <Trophy className="h-3.5 w-3.5" />
                <span>Completed</span>
              </div>
              <strong className="text-base font-black text-emerald-400 block">{completedCount}</strong>
            </div>
          </div>

          {/* Right: Add Milestone Action */}
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="h-11 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs gap-2 shrink-0 shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            <span>{showAddForm ? "Close Form" : "Add Milestone"}</span>
          </Button>
        </div>
      </Interactive3DCard>

      {/* 2. Add Form */}
      {showAddForm && (
        <form onSubmit={handleAddGoal} className="p-5 rounded-3xl bg-card border border-indigo-500/30 space-y-4 shadow-lg animate-in fade-in slide-in-from-top-2">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>Add Team Milestone</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground">Milestone Title</label>
              <Input
                type="text"
                placeholder="e.g. Automated Regression Suite 100% Pass"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="h-10 text-xs rounded-xl"
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:outline-none"
              >
                <option value="Architecture">Architecture</option>
                <option value="Quality & Testing">Quality &amp; Testing</option>
                <option value="Security">Security</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-muted-foreground">Target:</span>
              <select
                value={newTargetDate}
                onChange={(e) => setNewTargetDate(e.target.value)}
                className="h-8 rounded-lg border border-input bg-background px-2 text-xs text-foreground"
              >
                <option value="This Week">This Week</option>
                <option value="Next Week">Next Week</option>
                <option value="This Quarter (Q3)">This Quarter (Q3)</option>
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
              <Button type="submit" size="sm" className="text-xs font-bold h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white">
                Save Milestone
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* 3. Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/40 border border-border/60 text-xs w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("TEAM_SPRINT")}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-bold transition-all ${
            activeTab === "TEAM_SPRINT"
              ? "bg-card text-foreground shadow-sm border border-border/60"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Target className="h-3.5 w-3.5" />
          <span>Team Milestones ({goals.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("DIRECT_REPORTS")}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-bold transition-all ${
            activeTab === "DIRECT_REPORTS"
              ? "bg-card text-foreground shadow-sm border border-border/60"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Direct Reports ({MEMBER_GOALS.length})</span>
        </button>
      </div>

      {/* 4. Differentiated Goal Cards List */}
      {activeTab === "TEAM_SPRINT" ? (
        <div className="space-y-3.5">
          {goals.map((goal) => {
            const isDone = goal.status === "COMPLETED";
            const config = TEAM_CATEGORY_CONFIG[goal.category] || DEFAULT_TEAM_CATEGORY_STYLE;
            const CategoryIcon = config.icon;

            return (
              <div
                key={goal.id}
                className={`p-4 sm:p-5 rounded-3xl border transition-all ${
                  isDone
                    ? "border-emerald-500/30 bg-emerald-500/[0.03] border-l-4 border-l-emerald-500"
                    : `border-border/80 bg-card ${config.cardBorderLeft} ${config.cardGlow}`
                } space-y-3.5 shadow-sm`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => handleToggleComplete(goal.id)}
                      className={`h-6 w-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        isDone
                          ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                          : "border-muted-foreground/40 hover:border-emerald-400"
                      }`}
                    >
                      {isDone && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </button>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`text-sm font-bold text-foreground ${isDone ? "line-through text-muted-foreground font-medium" : ""}`}>
                          {goal.title}
                        </h4>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border flex items-center gap-1 ${config.badgeBg} ${config.badgeText} ${config.badgeBorder}`}
                        >
                          <CategoryIcon className="h-3 w-3" />
                          <span>{goal.category}</span>
                        </Badge>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 bg-muted/30 px-2 py-0.5 rounded-full border border-border/50">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{goal.targetDate}</span>
                        </span>
                        {isDone && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5">
                            ✓ Completed
                          </Badge>
                        )}
                      </div>
                      {goal.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed">{goal.description}</p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-1.5 rounded-xl text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-border/40 text-xs">
                  <div className="flex items-center gap-3 flex-1 max-w-md">
                    <span className="text-muted-foreground font-semibold text-[11px] shrink-0">Progress:</span>
                    <div className="flex-1 h-2 rounded-full bg-muted/60 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isDone ? "bg-emerald-500" : config.progressGradient
                        }`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <span className={`font-mono font-bold text-xs w-9 text-right shrink-0 ${isDone ? "text-emerald-400" : config.activeText}`}>
                      {goal.progress}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {[25, 50, 75, 100].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => handleSetProgress(goal.id, pct)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold font-mono transition-all border ${
                          goal.progress === pct
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-muted/30 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MEMBER_GOALS.map((member) => (
            <div key={member.id} className="p-4.5 rounded-3xl bg-card border border-border/70 space-y-3.5 shadow-sm hover:border-indigo-500/30 transition-all">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-2xl ${member.avatarBg} flex items-center justify-center font-black text-xs shrink-0 shadow-sm`}>
                  {member.memberAvatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-foreground text-xs font-bold block truncate">{member.memberName}</strong>
                    <Badge variant="outline" className="text-[10px] font-semibold">
                      {member.status === "ON_TRACK" ? "On Track" : "Underway"}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{member.memberRole}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-semibold text-foreground block truncate">{member.goalTitle}</span>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground text-[11px]">Sprint Progress:</span>
                  <span className="font-mono font-bold text-indigo-400">{member.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full" style={{ width: `${member.progress}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
