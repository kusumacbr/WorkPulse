import React, { useState } from "react";
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
  Building2,
  TrendingUp,
  Users,
  Award,
  Sparkles,
  Calendar,
  Check,
  RotateCcw,
} from "lucide-react";

export interface PodSprintGoal {
  id: string;
  title: string;
  leadOwner: string;
  category: string;
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

const DEFAULT_POD_SPRINT_GOALS: PodSprintGoal[] = [
  {
    id: "psg-1",
    title: "Deliver Core Platform Engine & Role Isolation",
    leadOwner: "Alex Lead",
    category: "Architecture",
    progress: 80,
    status: "IN_PROGRESS",
    targetDate: "Sprint 34 (Aug 23)",
    description: "Ensure clean role segregation and instant persona transitions across all application layers.",
  },
  {
    id: "psg-2",
    title: "Automated Regression & Visual Component Suite",
    leadOwner: "Alex Lead",
    category: "Quality & Testing",
    progress: 65,
    status: "IN_PROGRESS",
    targetDate: "Sprint 34 (Aug 23)",
    description: "Achieve 100% automated test pass rate with zero visual regression defects.",
  },
  {
    id: "psg-3",
    title: "Central Authorization Library & Audit Trails",
    leadOwner: "Alex Lead",
    category: "Security",
    progress: 100,
    status: "COMPLETED",
    targetDate: "Sprint 33",
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
    memberName: "Priya Patel",
    memberRole: "QA Engineer",
    memberAvatar: "PP",
    avatarBg: "bg-gradient-to-tr from-amber-500 to-orange-500 text-white",
    goalTitle: "API Authorization & Permission Test Matrix",
    progress: 100,
    status: "COMPLETED",
  },
  {
    id: "mg-4",
    memberName: "Arjun Kumar",
    memberRole: "Junior Developer",
    memberAvatar: "AK",
    avatarBg: "bg-gradient-to-tr from-emerald-500 to-teal-500 text-white",
    goalTitle: "Prisma Schema & Database Migrations",
    progress: 40,
    status: "IN_PROGRESS",
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
    department: "Operations & Engineering",
  },
  {
    id: "okr-3",
    objective: "Empower People & Team Growth",
    keyResult: "100% of staff participate in quarterly skill-building workshops.",
    progress: 70,
    department: "All Teams",
  },
];

type LeadGoalTab = "POD_SPRINT" | "DIRECT_REPORTS" | "COMPANY_OKRS";

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Architecture: { bg: "bg-cyan-500/15", text: "text-cyan-400", border: "border-cyan-500/30" },
  "Quality & Testing": { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30" },
  Security: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30" },
  Database: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" },
};

export function LeadGoalsManager() {
  const [activeTab, setActiveTab] = useState<LeadGoalTab>("POD_SPRINT");
  const [goals, setGoals] = useState<PodSprintGoal[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("workpulse_lead_pod_goals");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_POD_SPRINT_GOALS;
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

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Architecture");
  const [newTargetDate, setNewTargetDate] = useState("Sprint 34");
  const [newDescription, setNewDescription] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const saveGoals = (updated: PodSprintGoal[]) => {
    setGoals(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("workpulse_lead_pod_goals", JSON.stringify(updated));
      } catch {}
    }
  };

  // Set progress (adjustable to any percentage 0-100%)
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
      showToast("🎉 Congratulations! Milestone reached 100% and marked as achieved.");
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
        progress: isDone ? 100 : 60,
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

    const newGoal: PodSprintGoal = {
      id: `psg-${Date.now()}`,
      title: newTitle.trim(),
      leadOwner: "Alex Lead",
      category: newCategory,
      progress: 0,
      status: "IN_PROGRESS",
      targetDate: newTargetDate,
      description: newDescription.trim() || "Sprint deliverable milestone for the development pod.",
    };

    const updated = [newGoal, ...goals];
    saveGoals(updated);
    setNewTitle("");
    setNewDescription("");
    setShowAddForm(false);
    fireSuccessBurst();
    showToast("✓ New pod sprint milestone added!");
  };

  // Calculations
  const averagePodProgress = Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length);
  const completedCount = goals.filter((g) => g.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* 1. 3D Key Metrics Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile3D
          title="Pod Sprint Progress"
          value={`${averagePodProgress}%`}
          subtitle="Sprint 34 overall delivery"
          icon={TrendingUp}
          accent="emerald"
          badgeText="Active Sprint"
        />
        <MetricTile3D
          title="Pod Milestones"
          value={`${goals.length} Goals`}
          subtitle="Development pod targets"
          icon={Target}
          accent="purple"
          badgeText="Sprint 34"
        />
        <MetricTile3D
          title="Direct Reports Aligned"
          value="4 / 4"
          subtitle="All members have OKRs"
          icon={Users}
          accent="cyan"
          badgeText="100% Aligned"
        />
        <MetricTile3D
          title="Completed Goals"
          value={`${completedCount} / ${goals.length}`}
          subtitle="Verified by Lead"
          icon={Award}
          accent="gold"
          badgeText="Verified"
        />
      </div>

      {/* 2. Segregation Tabs & Controls Bar */}
      <Interactive3DCard className="p-3 border border-border/80 bg-card/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center p-1 rounded-xl bg-background/60 border border-border/60 overflow-x-auto gap-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("POD_SPRINT")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                activeTab === "POD_SPRINT"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <Target className="h-3.5 w-3.5" />
              <span>Pod Sprint Milestones</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "POD_SPRINT" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              }`}>
                {goals.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("DIRECT_REPORTS")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                activeTab === "DIRECT_REPORTS"
                  ? "bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Direct Reports OKRs</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "DIRECT_REPORTS" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              }`}>
                {MEMBER_GOALS.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("COMPANY_OKRS")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                activeTab === "COMPANY_OKRS"
                  ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Company Strategic OKRs</span>
            </button>
          </div>

          {activeTab === "POD_SPRINT" && (
            <Button
              size="sm"
              variant="brand"
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs font-bold gap-1.5 h-9 px-4 shrink-0 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-500/20"
            >
              <Plus className="h-4 w-4" />
              <span>{showAddForm ? "Close Form" : "Add Pod Milestone"}</span>
            </Button>
          )}
        </div>

        {/* Add Form */}
        {showAddForm && (
          <form onSubmit={handleAddGoal} className="mt-4 p-5 rounded-2xl bg-background/90 border border-emerald-500/40 space-y-4 animate-in fade-in slide-in-from-top-2 shadow-lg">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span>Create New Pod Sprint Milestone</span>
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Milestone Title</label>
                <Input
                  type="text"
                  placeholder="e.g., Deliver payment gateway integration"
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
                  <option value="Architecture">Architecture</option>
                  <option value="Quality & Testing">Quality & Testing</option>
                  <option value="Security">Security</option>
                  <option value="Database">Database</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Description &amp; Deliverable Target</label>
                <Input
                  type="text"
                  placeholder="Brief description of the outcome"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Target Sprint</label>
                <Input
                  type="text"
                  placeholder="e.g., Sprint 34"
                  value={newTargetDate}
                  onChange={(e) => setNewTargetDate(e.target.value)}
                  className="h-10 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)} className="text-xs h-9 rounded-xl">
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="brand" className="text-xs font-bold h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                Add Milestone
              </Button>
            </div>
          </form>
        )}
      </Interactive3DCard>

      {/* 3. Tab Contents */}

      {/* TAB 1: POD SPRINT MILESTONES (High-End Glowing Cards) */}
      {activeTab === "POD_SPRINT" && (
        <div className="space-y-4">
          {goals.map((goal) => {
            const isDone = goal.status === "COMPLETED";
            const catStyle = CATEGORY_COLORS[goal.category] || {
              bg: "bg-indigo-500/15",
              text: "text-indigo-400",
              border: "border-indigo-500/30",
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
                  {/* Left info */}
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
                        <Calendar className="h-3 w-3 text-indigo-400" />
                        <span>{goal.targetDate}</span>
                      </div>
                      {isDone && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Achieved</span>
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {goal.description}
                    </p>

                    {/* Rich Interactive Progress Meter */}
                    <div className="space-y-2 pt-1 max-w-xl">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-muted-foreground">Milestone Progress:</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-sm font-extrabold ${isDone ? "text-emerald-400" : "text-cyan-400"}`}>
                            {goal.progress}%
                          </span>
                          {isDone && <span className="text-emerald-400 text-[11px] font-bold">✓ 100% Completed</span>}
                        </div>
                      </div>

                      {/* Glowing animated progress track */}
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

                      {/* Quick Adjust Buttons */}
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

                  {/* Right Actions */}
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
                          <span>Reopen Goal</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Mark Achieved</span>
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
          })}
        </div>
      )}

      {/* TAB 2: DIRECT REPORTS OKRS */}
      {activeTab === "DIRECT_REPORTS" && (
        <div className="space-y-3">
          {MEMBER_GOALS.map((mg) => (
            <Interactive3DCard
              key={mg.id}
              className="p-5 border border-border/80 bg-card/70 hover:border-indigo-500/40 transition-all shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className={`h-11 w-11 rounded-2xl ${mg.avatarBg} flex items-center justify-center font-extrabold text-sm shadow-md shrink-0`}>
                    {mg.memberAvatar}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-sm font-bold text-foreground">{mg.memberName}</strong>
                      <span className="text-xs text-muted-foreground">· {mg.memberRole}</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          mg.progress === 100
                            ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                            : "border-cyan-500/30 text-cyan-300 bg-cyan-500/10"
                        }`}
                      >
                        {mg.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <p className="text-xs text-foreground/90 font-medium">{mg.goalTitle}</p>

                    <div className="flex items-center gap-3 pt-1 max-w-sm">
                      <div className="progress-track-line flex-1">
                        <div
                          className="progress-track-fill-cyan"
                          style={{ width: `${mg.progress}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-bold text-foreground shrink-0">{mg.progress}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      fireSuccessBurst();
                      showToast(`✓ Goal progress verified for ${mg.memberName}`);
                    }}
                    className="text-xs font-bold h-8 px-3 rounded-xl border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    <span>Verify OKR</span>
                  </Button>
                </div>
              </div>
            </Interactive3DCard>
          ))}
        </div>
      )}

      {/* TAB 3: COMPANY STRATEGIC OKRS */}
      {activeTab === "COMPANY_OKRS" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-card/60 border border-border/80 space-y-1">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-400" />
              <span>Company-Wide Strategic Objectives (Q3 2026)</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Institutional priorities cascaded across Engineering, Product, HR, and Operations.
            </p>
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
                  <p className="text-xs text-muted-foreground leading-relaxed">{okr.keyResult}</p>
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
      )}
    </div>
  );
}
