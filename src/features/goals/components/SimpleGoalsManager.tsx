"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { fireCelebrationConfetti, fireSuccessBurst } from "@/lib/ui/confetti";
import { useCurrentUser } from "@/components/layout/UserContext";
import {
  Target,
  CheckCircle2,
  Plus,
  Trash2,
  Building2,
  Calendar,
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
  Headphones,
  GraduationCap,
  Zap,
  Layers,
  Trophy,
  Clock,
} from "lucide-react";

export interface SimpleGoalItem {
  id: string;
  title: string;
  category: "Customer Service" | "Professional Growth" | "Operations" | "Organization" | string;
  progress: number;
  status: "IN_PROGRESS" | "COMPLETED";
  targetDate: string;
  description?: string;
}

export const DEFAULT_FRIENDLY_GOALS: SimpleGoalItem[] = [
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
    targetDate: "This Week",
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

type GoalTab = "ALL" | "IN_PROGRESS" | "COMPLETED";

// Visual configurations for differentiating goal types
interface GoalCategoryStyle {
  icon: React.ComponentType<{ className?: string }>;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  cardBorderLeft: string;
  cardGlow: string;
  progressGradient: string;
  activeText: string;
}

const DEFAULT_CATEGORY_STYLE: GoalCategoryStyle = {
  icon: Zap,
  badgeBg: "bg-amber-500/15",
  badgeText: "text-amber-400",
  badgeBorder: "border-amber-500/30",
  cardBorderLeft: "border-l-4 border-l-amber-500",
  cardGlow: "hover:border-amber-500/30 hover:bg-amber-500/[0.02]",
  progressGradient: "bg-gradient-to-r from-amber-500 to-orange-400",
  activeText: "text-amber-400",
};

const GOAL_CATEGORY_CONFIG: Record<string, GoalCategoryStyle> = {
  "Customer Service": {
    icon: Headphones,
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-400",
    badgeBorder: "border-emerald-500/30",
    cardBorderLeft: "border-l-4 border-l-emerald-500",
    cardGlow: "hover:border-emerald-500/30 hover:bg-emerald-500/[0.02]",
    progressGradient: "bg-gradient-to-r from-emerald-500 to-teal-400",
    activeText: "text-emerald-400",
  },
  "Professional Growth": {
    icon: GraduationCap,
    badgeBg: "bg-cyan-500/15",
    badgeText: "text-cyan-400",
    badgeBorder: "border-cyan-500/30",
    cardBorderLeft: "border-l-4 border-l-cyan-500",
    cardGlow: "hover:border-cyan-500/30 hover:bg-cyan-500/[0.02]",
    progressGradient: "bg-gradient-to-r from-cyan-500 to-blue-500",
    activeText: "text-cyan-400",
  },
  Operations: {
    icon: Zap,
    badgeBg: "bg-amber-500/15",
    badgeText: "text-amber-400",
    badgeBorder: "border-amber-500/30",
    cardBorderLeft: "border-l-4 border-l-amber-500",
    cardGlow: "hover:border-amber-500/30 hover:bg-amber-500/[0.02]",
    progressGradient: "bg-gradient-to-r from-amber-500 to-orange-400",
    activeText: "text-amber-400",
  },
  Organization: {
    icon: Layers,
    badgeBg: "bg-purple-500/15",
    badgeText: "text-purple-400",
    badgeBorder: "border-purple-500/30",
    cardBorderLeft: "border-l-4 border-l-purple-500",
    cardGlow: "hover:border-purple-500/30 hover:bg-purple-500/[0.02]",
    progressGradient: "bg-gradient-to-r from-purple-500 to-indigo-500",
    activeText: "text-purple-400",
  },
};

export function SimpleGoalsManager() {
  const currentUser = useCurrentUser();
  const userEmail = currentUser?.userEmail || "employee.test@xorstack.com";
  
  const EMAIL_TO_EMP_ID: Record<string, string> = {
    "employee.test@xorstack.com": "emp-sarah",
    "rohit.test@xorstack.com": "emp-rohit",
    "api.test@xorstack.com": "emp-api",
    "test.test@xorstack.com": "emp-test",
    "lead.test@xorstack.com": "emp-sarah",
  };
  const empId = EMAIL_TO_EMP_ID[userEmail] || userEmail;

  const [goals, setGoals] = useState<SimpleGoalItem[]>([]);
  const [companyOkrs, setCompanyOkrs] = useState<any[]>(COMPANY_OKRS);
  const [activeTab, setActiveTab] = useState<GoalTab>("ALL");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCompanyOkrs, setShowCompanyOkrs] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Operations");
  const [newTargetDate, setNewTargetDate] = useState("This Month");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Load goals and live Company OKRs from API & localStorage on mount
  useEffect(() => {
    const loadGoals = async () => {
      // 1. Try Supabase API for employee personal goals
      try {
        const res = await fetch(`/api/v1/goals?employeeId=${encodeURIComponent(empId)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.data?.goals) && data.data.goals.length > 0) {
            setGoals(data.data.goals);
            if (typeof window !== "undefined") {
              localStorage.setItem("workpulse_simple_goals", JSON.stringify(data.data.goals));
              localStorage.setItem(`workpulse_simple_goals_${empId}`, JSON.stringify(data.data.goals));
              localStorage.setItem(`workpulse_simple_goals_${userEmail}`, JSON.stringify(data.data.goals));
            }
          }
        }
      } catch {}

      // 2. Try Supabase API & localStorage for live Company OKRs managed by HR
      try {
        const resOkrs = await fetch("/api/v1/goals?employeeId=COMPANY_OKRS");
        if (resOkrs.ok) {
          const okrsData = await resOkrs.json();
          if (Array.isArray(okrsData.data?.goals) && okrsData.data.goals.length > 0) {
            setCompanyOkrs(okrsData.data.goals);
            return;
          }
        }
      } catch {}

      try {
        const savedCompany = localStorage.getItem("workpulse_company_okrs");
        const savedHr = localStorage.getItem("workpulse_simple_hr_goals");
        const rawOkrs = savedCompany || savedHr;
        if (rawOkrs) {
          const parsed = JSON.parse(rawOkrs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCompanyOkrs(parsed);
          }
        }
      } catch {}
    };
    loadGoals();
  }, [empId, userEmail]);

  // Listen to cross-component sync events
  useEffect(() => {
    const handleSync = async () => {
      try {
        const savedEmp = localStorage.getItem(`workpulse_simple_goals_${empId}`);
        const savedEmail = localStorage.getItem(`workpulse_simple_goals_${userEmail}`);
        const savedDefault = localStorage.getItem("workpulse_simple_goals");
        const raw = savedEmp || savedEmail || savedDefault;
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setGoals(parsed);
          }
        }

        const savedCompany = localStorage.getItem("workpulse_company_okrs");
        const savedHr = localStorage.getItem("workpulse_simple_hr_goals");
        const rawOkrs = savedCompany || savedHr;
        if (rawOkrs) {
          const parsedOkrs = JSON.parse(rawOkrs);
          if (Array.isArray(parsedOkrs)) {
            setCompanyOkrs(parsedOkrs);
          }
        }
      } catch {}
    };
    window.addEventListener("workpulse_sync", handleSync);
    return () => window.removeEventListener("workpulse_sync", handleSync);
  }, [empId, userEmail]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const saveGoals = async (updated: SimpleGoalItem[]) => {
    setGoals(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("workpulse_simple_goals", JSON.stringify(updated));
        localStorage.setItem(`workpulse_simple_goals_${empId}`, JSON.stringify(updated));
        localStorage.setItem(`workpulse_simple_goals_${userEmail}`, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("workpulse_sync"));
      } catch {}
    }
    // Sync all goals to Supabase via API
    try {
      await fetch(`/api/v1/goals/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: empId, goals: updated }),
      });
      if (empId !== userEmail) {
        await fetch(`/api/v1/goals/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employeeId: userEmail, goals: updated }),
        });
      }
    } catch {}
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
      showToast("🎉 Goal marked as completed!");
    } else {
      showToast("Goal marked as in progress.");
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
      showToast("🎉 Goal reached 100% and completed!");
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

  // SVG Radial Gauge Calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (averageProgress / 100) * circumference;

  const filteredGoals = useMemo(() => {
    return goals.filter((g) => {
      if (activeTab === "IN_PROGRESS") return g.status === "IN_PROGRESS";
      if (activeTab === "COMPLETED") return g.status === "COMPLETED";
      return true;
    });
  }, [goals, activeTab]);

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* 1. Distinct Radial Gauge & Milestone Progress Hub */}
      <Interactive3DCard className="p-6 border border-border/80 bg-gradient-to-r from-card via-card/90 to-card/60 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left: Circular Radial Progress Dial */}
          <div className="flex items-center gap-5 shrink-0">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-muted/40"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Dynamic Gradient Stroke */}
                <defs>
                  <linearGradient id="goalProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="url(#goalProgressGrad)"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                  suppressHydrationWarning
                />
              </svg>
              {/* Inner Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="font-mono font-black text-xl text-foreground tracking-tight" suppressHydrationWarning>
                  {averageProgress}%
                </span>
                <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">
                  Pace
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-foreground tracking-tight">
                  Overall Goals Progress
                </h3>
                <Badge variant="outline" className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  This Week
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Average milestone completion across active personal OKRs.
              </p>
            </div>
          </div>

          {/* Middle: 3 Quick Metric Pills */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 flex-1 max-w-md">
            <div className="p-3 rounded-2xl bg-card border border-border/70 text-center space-y-0.5 shadow-sm">
              <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground font-semibold">
                <Target className="h-3.5 w-3.5 text-primary" />
                <span>Total</span>
              </div>
              <strong className="text-base font-black text-foreground block">{totalGoals}</strong>
            </div>

            <div className="p-3 rounded-2xl bg-card border border-cyan-500/20 text-center space-y-0.5 shadow-sm">
              <div className="flex items-center justify-center gap-1 text-[11px] text-cyan-400 font-semibold">
                <Clock className="h-3.5 w-3.5" />
                <span>In Progress</span>
              </div>
              <strong className="text-base font-black text-cyan-400 block">{inProgressGoals.length}</strong>
            </div>

            <div className="p-3 rounded-2xl bg-card border border-emerald-500/20 text-center space-y-0.5 shadow-sm">
              <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-400 font-semibold">
                <Trophy className="h-3.5 w-3.5" />
                <span>Done</span>
              </div>
              <strong className="text-base font-black text-emerald-400 block">{completedGoals.length}</strong>
            </div>
          </div>

          {/* Right: Add Goal Action */}
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="h-11 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs gap-2 shrink-0 shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            <span>{showAddForm ? "Close Form" : "Add Goal"}</span>
          </Button>
        </div>
      </Interactive3DCard>

      {/* 2. Add Goal Form */}
      {showAddForm && (
        <form onSubmit={handleAddGoal} className="p-5 rounded-3xl bg-card border border-emerald-500/30 space-y-4 shadow-lg animate-in fade-in slide-in-from-top-2">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>Create New Milestone Goal</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground">What is your goal?</label>
              <Input
                type="text"
                placeholder="e.g. Deliver new client onboarding package"
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
                <option value="Customer Service">Customer Service</option>
                <option value="Professional Growth">Professional Growth</option>
                <option value="Operations">Operations</option>
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
                className="h-8 rounded-lg border border-input bg-background px-2 text-xs text-foreground"
              >
                <option value="This Week">This Week</option>
                <option value="Next Week">Next Week</option>
                <option value="This Month">This Month</option>
                <option value="End of Quarter">End of Quarter</option>
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
              <Button type="submit" size="sm" className="text-xs font-bold h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white">
                Save Goal
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* 3. Simple Tab Pills */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/40 border border-border/60 text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab("ALL");
              setShowCompanyOkrs(false);
            }}
            className={`px-4 py-1.5 rounded-xl font-bold transition-all ${
              !showCompanyOkrs && activeTab === "ALL"
                ? "bg-card text-foreground shadow-sm border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Goals ({totalGoals})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("IN_PROGRESS");
              setShowCompanyOkrs(false);
            }}
            className={`px-4 py-1.5 rounded-xl font-bold transition-all ${
              !showCompanyOkrs && activeTab === "IN_PROGRESS"
                ? "bg-card text-foreground shadow-sm border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            In Progress ({inProgressGoals.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("COMPLETED");
              setShowCompanyOkrs(false);
            }}
            className={`px-4 py-1.5 rounded-xl font-bold transition-all ${
              !showCompanyOkrs && activeTab === "COMPLETED"
                ? "bg-card text-foreground shadow-sm border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Completed ({completedGoals.length})
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowCompanyOkrs(!showCompanyOkrs)}
          className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
            showCompanyOkrs
              ? "bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-sm"
              : "border-border/70 text-muted-foreground hover:text-foreground bg-card/60"
          }`}
        >
          <Building2 className="h-3.5 w-3.5 text-purple-400" />
          <span>Company OKRs</span>
          {showCompanyOkrs ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {/* When Company OKRs is selected: keep only Company OKRs view */}
      {showCompanyOkrs ? (
        <div className="p-5 sm:p-6 rounded-3xl border border-purple-500/30 bg-gradient-to-b from-purple-500/[0.08] via-card to-card space-y-4 shadow-lg animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Company Strategic Objectives</h4>
                <p className="text-[11px] text-muted-foreground">Q3 2026 Organization Targets</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-bold text-purple-400 border-purple-500/30 bg-purple-500/10">
                Organization Wide
              </Badge>
              <button
                type="button"
                onClick={() => setShowCompanyOkrs(false)}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-xl hover:bg-muted/50 transition-colors"
              >
                ✕ Close
              </button>
            </div>
          </div>

          {/* Clean OKR Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {companyOkrs.map((okr: any) => (
              <div
                key={okr.id}
                className="p-4 rounded-2xl bg-card border border-border/80 hover:border-purple-500/40 space-y-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="text-[10px] font-semibold text-purple-400 border-purple-500/30 bg-purple-500/10">
                      {okr.category || okr.department || "Organization Wide"}
                    </Badge>
                    <span className="font-mono font-bold text-xs text-purple-400 bg-purple-500/15 px-2.5 py-0.5 rounded-full border border-purple-500/30 shrink-0">
                      {okr.progress}%
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-foreground leading-snug">{okr.title || okr.objective}</h5>
                  {(okr.target || okr.keyResult || okr.description) && (
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {okr.target || okr.keyResult || okr.description}
                    </p>
                  )}
                </div>

                {/* Sleek Progress Bar */}
                <div className="pt-2 border-t border-border/40">
                  <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-500"
                      style={{ width: `${okr.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* 4. Differentiated Goal Cards List (Shown only when Company OKRs is not open) */
        <div className="space-y-3.5">
          {filteredGoals.length === 0 ? (
            <div className="p-12 text-center bg-card/40 rounded-3xl border border-border/60 text-xs text-muted-foreground space-y-2">
              <Target className="h-7 w-7 text-muted-foreground mx-auto" />
              <p className="font-semibold text-foreground">No goals in this view</p>
              <p>Click &quot;Add Goal&quot; above to create a new goal.</p>
            </div>
          ) : (
            filteredGoals.map((goal) => {
              const isDone = goal.status === "COMPLETED";
              const config = GOAL_CATEGORY_CONFIG[goal.category] || DEFAULT_CATEGORY_STYLE;
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
                  {/* Header: Checkbox + Differentiated Category Icon/Badge + Title + Target Timeline + Delete */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Completion Checkbox */}
                      <button
                        type="button"
                        onClick={() => handleToggleComplete(goal.id)}
                        className={`h-6 w-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          isDone
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                            : "border-muted-foreground/40 hover:border-emerald-400"
                        }`}
                        title={isDone ? "Mark as in progress" : "Mark as completed"}
                      >
                        {isDone && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </button>

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Goal Title */}
                          <h4
                            className={`text-sm font-bold text-foreground ${
                              isDone ? "line-through text-muted-foreground font-medium" : ""
                            }`}
                          >
                            {goal.title}
                          </h4>

                          {/* Distinct Category Badge with Icon */}
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border flex items-center gap-1 ${config.badgeBg} ${config.badgeText} ${config.badgeBorder}`}
                          >
                            <CategoryIcon className="h-3 w-3" />
                            <span>{goal.category}</span>
                          </Badge>

                          {/* Target Date Pill */}
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

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1.5 rounded-xl text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                      title="Delete Goal"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Progress Control Row with Differentiated Category Gradients */}
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

                    {/* 1-Click Quick Percentage Stepper Pills */}
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
            })
          )}
        </div>
      )}
    </div>
  );
}
