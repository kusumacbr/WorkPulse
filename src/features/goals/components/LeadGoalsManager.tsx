"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { fireCelebrationConfetti, fireSuccessBurst } from "@/lib/ui/confetti";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
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
  ChevronDown,
  ChevronUp,
  UserPlus,
  Search,
  Headphones,
  GraduationCap,
  Layers,
} from "lucide-react";
import { SimpleGoalItem } from "./SimpleGoalsManager";

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

export interface DirectReportMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  avatarBg: string;
}

const DEFAULT_DIRECT_REPORTS: DirectReportMember[] = [
  {
    id: "emp-sarah",
    name: "Sarah Dev",
    email: "employee.test@xorstack.com",
    role: "Senior Backend Engineer",
    avatar: "SD",
    avatarBg: "bg-gradient-to-tr from-purple-500 to-pink-500 text-white",
  },
  {
    id: "emp-rohit",
    name: "Rohit Sharma",
    email: "rohit.test@xorstack.com",
    role: "Frontend Engineer",
    avatar: "RS",
    avatarBg: "bg-gradient-to-tr from-cyan-500 to-blue-600 text-white",
  },
  {
    id: "emp-api",
    name: "API Test User",
    email: "api.test@xorstack.com",
    role: "Platform Engineer",
    avatar: "AT",
    avatarBg: "bg-gradient-to-tr from-amber-500 to-orange-500 text-white",
  },
  {
    id: "emp-test",
    name: "Test Engineer User",
    email: "test.test@xorstack.com",
    role: "Software Engineer II",
    avatar: "TE",
    avatarBg: "bg-gradient-to-tr from-emerald-500 to-teal-500 text-white",
  },
];

const DEFAULT_MEMBER_GOALS: Record<string, SimpleGoalItem[]> = {
  "emp-sarah": [
    {
      id: "mg-1",
      title: "Task Carryover State Machine & Local Cache",
      category: "Architecture",
      progress: 80,
      status: "IN_PROGRESS",
      targetDate: "This Week",
      description: "Implement robust carryover state transition and optimistic cache invalidation.",
    },
    {
      id: "mg-5",
      title: "Database Query Optimization & Indexing",
      category: "Operations",
      progress: 60,
      status: "IN_PROGRESS",
      targetDate: "Next Week",
      description: "Optimize execution plans for employee workload and attendance history queries.",
    },
  ],
  "emp-rohit": [
    {
      id: "mg-2",
      title: "Mobile Responsiveness & Component UI Polish",
      category: "Customer Service",
      progress: 50,
      status: "IN_PROGRESS",
      targetDate: "This Week",
      description: "Ensure pixel-perfect mobile drawer layouts and smooth responsive animations.",
    },
    {
      id: "mg-6",
      title: "Design System & Dark Mode Consistency",
      category: "Professional Growth",
      progress: 100,
      status: "COMPLETED",
      targetDate: "Last Week",
      description: "Standardized tokenized color variables across all dashboard widgets.",
    },
  ],
  "emp-api": [
    {
      id: "mg-3",
      title: "REST Endpoints & Performance Tuning",
      category: "Architecture",
      progress: 90,
      status: "IN_PROGRESS",
      targetDate: "This Week",
      description: "Tune JSON response payloads and add gzip compression headers.",
    },
    {
      id: "mg-7",
      title: "Auth Middleware & Token Revocation Queue",
      category: "Security",
      progress: 75,
      status: "IN_PROGRESS",
      targetDate: "This Month",
      description: "Integrate stateless JWT verification with Redis token blacklist queue.",
    },
  ],
  "emp-test": [
    {
      id: "mg-4",
      title: "Daily SOD Verification & Feedback Flow",
      category: "Organization",
      progress: 70,
      status: "IN_PROGRESS",
      targetDate: "This Week",
      description: "Enhance manager review dialogs and real-time SOD approval notifications.",
    },
    {
      id: "mg-8",
      title: "Automated Cypress E2E Integration Suite",
      category: "Quality & Testing",
      progress: 85,
      status: "IN_PROGRESS",
      targetDate: "Next Week",
      description: "Cover core employee & lead workflows with automated headless browser tests.",
    },
  ],
};

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

export function LeadGoalsManager() {
  const { allEmployees } = useWorkpulseSharedStore();
  const [goals, setGoals] = useState<TeamSprintGoal[]>(DEFAULT_TEAM_SPRINT_GOALS);
  const [activeTab, setActiveTab] = useState<"TEAM_SPRINT" | "DIRECT_REPORTS">("TEAM_SPRINT");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Architecture");
  const [newTargetDate, setNewTargetDate] = useState("This Week");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Direct Reports state
  const [memberGoalsMap, setMemberGoalsMap] = useState<Record<string, SimpleGoalItem[]>>({});
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>("emp-sarah");
  const [searchQuery, setSearchQuery] = useState("");
  const [assignModalMemberId, setAssignModalMemberId] = useState<string | null>(null);
  const [assignTitle, setAssignTitle] = useState("");
  const [assignCategory, setAssignCategory] = useState("Architecture");
  const [assignTargetDate, setAssignTargetDate] = useState("This Week");

  // Dynamic Direct Reports resolution
  const directReports = useMemo<DirectReportMember[]>(() => {
    if (allEmployees && allEmployees.length > 0) {
      const devLeadReports = allEmployees.filter(
        (e) => e.teamLeadId === "lead-alex" || e.departmentId === "dept-development"
      );
      if (devLeadReports.length > 0) {
        return devLeadReports.map((emp) => {
          const matchedDefault = DEFAULT_DIRECT_REPORTS.find(
            (d) => d.id === emp.id || d.email === emp.email
          );
          return {
            id: emp.id,
            name: emp.name,
            email: emp.email,
            role: emp.designation,
            avatar: emp.avatar || emp.name.slice(0, 2).toUpperCase(),
            avatarBg: matchedDefault?.avatarBg || "bg-gradient-to-tr from-indigo-500 to-blue-600 text-white",
          };
        });
      }
    }
    return DEFAULT_DIRECT_REPORTS;
  }, [allEmployees?.length]);

  // Function to refresh all direct reports goals from storage and Supabase
  const refreshMemberGoals = React.useCallback(async () => {
    const updatedMap: Record<string, SimpleGoalItem[]> = {};

    for (const emp of directReports) {
      let loaded: SimpleGoalItem[] = [];

      // 1. Try Supabase API
      try {
        const res = await fetch(`/api/v1/goals?employeeId=${encodeURIComponent(emp.id)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.data?.goals) && data.data.goals.length > 0) {
            loaded = data.data.goals;
          }
        }
      } catch {}

      // 2. Fallback to localStorage
      if (loaded.length === 0) {
        try {
          const savedEmp = localStorage.getItem(`workpulse_simple_goals_${emp.id}`);
          const savedEmail = localStorage.getItem(`workpulse_simple_goals_${emp.email}`);
          const savedDefault = emp.id === "emp-sarah" ? localStorage.getItem("workpulse_simple_goals") : null;
          const raw = savedEmp || savedEmail || savedDefault;
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              loaded = parsed;
            }
          }
        } catch {}
      }

      // 3. Fallback to default seed goals
      if (loaded.length === 0) {
        loaded = DEFAULT_MEMBER_GOALS[emp.id] ?? DEFAULT_MEMBER_GOALS["emp-sarah"] ?? [];
        try {
          localStorage.setItem(`workpulse_simple_goals_${emp.id}`, JSON.stringify(loaded));
          localStorage.setItem(`workpulse_simple_goals_${emp.email}`, JSON.stringify(loaded));
        } catch {}
      }

      updatedMap[emp.id] = loaded;
    }

    setMemberGoalsMap((prevMap) => {
      if (JSON.stringify(prevMap) === JSON.stringify(updatedMap)) {
        return prevMap;
      }
      return updatedMap;
    });
  }, [directReports]);

  // Load saved team sprint goals and member goals on client mount
  useEffect(() => {
    const loadTeamGoals = async () => {
      try {
        const res = await fetch("/api/v1/goals?employeeId=TEAM_SPRINT");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.data?.goals) && data.data.goals.length > 0) {
            setGoals(data.data.goals);
            if (typeof window !== "undefined") {
              localStorage.setItem("workpulse_lead_team_goals", JSON.stringify(data.data.goals));
            }
            return;
          }
        }
      } catch {}

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

    loadTeamGoals();
    refreshMemberGoals();
  }, [refreshMemberGoals]);

  // Listen for real-time cross-component sync events
  useEffect(() => {
    const handleSync = async () => {
      try {
        const res = await fetch("/api/v1/goals?employeeId=TEAM_SPRINT");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.data?.goals) && data.data.goals.length > 0) {
            setGoals(data.data.goals);
          }
        }
      } catch {}

      refreshMemberGoals();
    };
    window.addEventListener("workpulse_sync", handleSync);
    return () => window.removeEventListener("workpulse_sync", handleSync);
  }, [refreshMemberGoals]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const saveGoals = async (updated: TeamSprintGoal[]) => {
    setGoals(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("workpulse_lead_team_goals", JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("workpulse_sync"));
      } catch {}
    }
    // Sync Team Sprint Goals to Supabase
    try {
      await fetch(`/api/v1/goals/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: "TEAM_SPRINT", goals: updated }),
      });
    } catch {}
  };

  const saveMemberGoals = async (empId: string, empEmail: string, updatedGoals: SimpleGoalItem[]) => {
    setMemberGoalsMap((prev) => ({ ...prev, [empId]: updatedGoals }));
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`workpulse_simple_goals_${empId}`, JSON.stringify(updatedGoals));
        localStorage.setItem(`workpulse_simple_goals_${empEmail}`, JSON.stringify(updatedGoals));
        if (empId === "emp-sarah" || empEmail === "employee.test@xorstack.com") {
          localStorage.setItem("workpulse_simple_goals", JSON.stringify(updatedGoals));
        }
        window.dispatchEvent(new CustomEvent("workpulse_sync"));
      } catch {}
    }
    // Sync Direct Report member goals to Supabase
    try {
      await fetch(`/api/v1/goals/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: empId, goals: updatedGoals }),
      });
      if (empId !== empEmail) {
        await fetch(`/api/v1/goals/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employeeId: empEmail, goals: updatedGoals }),
        });
      }
    } catch {}
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

  // Direct Report Goal Actions
  const handleAssignGoalToMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalMemberId || !assignTitle.trim()) return;

    const member = directReports.find((m) => m.id === assignModalMemberId);
    if (!member) return;

    const currentGoals = memberGoalsMap[member.id] || [];
    const newGoal: SimpleGoalItem = {
      id: `goal-lead-${Date.now()}`,
      title: assignTitle.trim(),
      category: assignCategory,
      progress: 0,
      status: "IN_PROGRESS",
      targetDate: assignTargetDate,
      description: `Assigned by Team Lead (Alex Lead) for ${member.name}.`,
    };

    const updatedGoals = [newGoal, ...currentGoals];
    saveMemberGoals(member.id, member.email, updatedGoals);
    setAssignModalMemberId(null);
    setAssignTitle("");
    setExpandedMemberId(member.id);
    fireSuccessBurst();
    showToast(`✓ New goal assigned to ${member.name}!`);
  };

  const handleUpdateMemberGoalProgress = (
    member: DirectReportMember,
    goalId: string,
    newProgress: number
  ) => {
    const currentGoals = memberGoalsMap[member.id] || [];
    const clamped = Math.max(0, Math.min(100, Math.round(newProgress)));
    const updated = currentGoals.map((g) => {
      if (g.id !== goalId) return g;
      const isDone = clamped === 100;
      return {
        ...g,
        progress: clamped,
        status: isDone ? ("COMPLETED" as const) : ("IN_PROGRESS" as const),
      };
    });
    saveMemberGoals(member.id, member.email, updated);
    if (clamped === 100) {
      fireCelebrationConfetti();
      showToast(`🎉 Goal for ${member.name} completed!`);
    } else {
      showToast(`Updated progress for ${member.name}`);
    }
  };

  const handleDeleteMemberGoal = (member: DirectReportMember, goalId: string) => {
    const currentGoals = memberGoalsMap[member.id] || [];
    const updated = currentGoals.filter((g) => g.id !== goalId);
    saveMemberGoals(member.id, member.email, updated);
    showToast(`Goal removed for ${member.name}.`);
  };

  const averageTeamProgress = goals.length > 0 ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length) : 0;
  const completedCount = goals.filter((g) => g.status === "COMPLETED").length;
  const inProgressCount = goals.filter((g) => g.status === "IN_PROGRESS").length;

  // SVG Radial Gauge Calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (averageTeamProgress / 100) * circumference;

  // Filtered direct reports
  const filteredReports = directReports.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* 2. Add Team Milestone Form */}
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

      {/* 3. Assign Goal Modal for Direct Reports */}
      {assignModalMemberId && (
        <form
          onSubmit={handleAssignGoalToMember}
          className="p-5 rounded-3xl bg-card border-2 border-indigo-500/40 space-y-4 shadow-xl animate-in fade-in zoom-in-95"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-indigo-400" />
              <span>
                Assign Goal to{" "}
                <span className="text-indigo-400">
                  {directReports.find((m) => m.id === assignModalMemberId)?.name}
                </span>
              </span>
            </h4>
            <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-400 border-indigo-500/30 font-bold">
              Direct Report Assignment
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground">Goal Title</label>
              <Input
                type="text"
                placeholder="e.g. Implement Optimistic Cache & Response Compression"
                value={assignTitle}
                onChange={(e) => setAssignTitle(e.target.value)}
                className="h-10 text-xs rounded-xl"
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground">Category</label>
              <select
                value={assignCategory}
                onChange={(e) => setAssignCategory(e.target.value)}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:outline-none"
              >
                <option value="Architecture">Architecture</option>
                <option value="Operations">Operations</option>
                <option value="Customer Service">Customer Service</option>
                <option value="Professional Growth">Professional Growth</option>
                <option value="Quality & Testing">Quality &amp; Testing</option>
                <option value="Security">Security</option>
                <option value="Organization">Organization</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-muted-foreground">Target Date:</span>
              <select
                value={assignTargetDate}
                onChange={(e) => setAssignTargetDate(e.target.value)}
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
                onClick={() => setAssignModalMemberId(null)}
                className="text-xs h-9 rounded-xl"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs font-bold h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5">
                <Check className="h-3.5 w-3.5" />
                <span>Assign Goal</span>
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* 4. Tabs & Direct Reports Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
            <Target className="h-3.5 w-3.5 text-indigo-400" />
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
            <Users className="h-3.5 w-3.5 text-cyan-400" />
            <span>Direct Reports ({directReports.length})</span>
          </button>
        </div>

        {activeTab === "DIRECT_REPORTS" && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search direct report by name or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-8 text-xs rounded-xl border-border/70 bg-card"
            />
          </div>
        )}
      </div>

      {/* 5. Goal Cards / Direct Reports List */}
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
        /* Direct Reports Connected UI */
        <div className="space-y-4">
          {filteredReports.map((member) => {
            const mGoals = memberGoalsMap[member.id] || [];
            const totalCount = mGoals.length;
            const mCompleted = mGoals.filter((g) => g.status === "COMPLETED").length;
            const mActive = mGoals.filter((g) => g.status === "IN_PROGRESS").length;
            const avgProgress =
              totalCount > 0
                ? Math.round(mGoals.reduce((acc, g) => acc + g.progress, 0) / totalCount)
                : 0;

            const isExpanded = expandedMemberId === member.id;
            const isAllCompleted = totalCount > 0 && mCompleted === totalCount;
            const isOnTrack = avgProgress >= 70;

            return (
              <div
                key={member.id}
                className="p-5 rounded-3xl bg-card border border-border/80 space-y-4 shadow-sm hover:border-indigo-500/40 transition-all"
              >
                {/* Member Summary Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`h-11 w-11 rounded-2xl ${member.avatarBg} flex items-center justify-center font-black text-sm shrink-0 shadow-md ring-2 ring-background`}
                    >
                      {member.avatar}
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-foreground text-sm font-extrabold truncate">
                          {member.name}
                        </strong>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold px-2 py-0.5 ${
                            isAllCompleted
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : isOnTrack
                              ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
                              : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {isAllCompleted ? "100% Completed" : isOnTrack ? "On Track" : "Underway"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>

                  {/* Actions & Metrics */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="flex items-center gap-2 text-xs bg-muted/30 px-3 py-1.5 rounded-2xl border border-border/50">
                      <span className="text-muted-foreground text-[11px]">Goals:</span>
                      <span className="font-bold text-foreground">{totalCount} Total</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="font-bold text-emerald-400">{mCompleted} Done</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="font-bold text-indigo-400">{mActive} Active</span>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => setAssignModalMemberId(member.id)}
                      className="h-9 px-3.5 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-400 border border-indigo-500/30 text-xs font-bold gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Assign Goal</span>
                    </Button>

                    <button
                      type="button"
                      onClick={() => setExpandedMemberId(isExpanded ? null : member.id)}
                      className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      title={isExpanded ? "Collapse goals" : "Expand goals"}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Overall Progress Bar */}
                <div className="space-y-1.5 pt-1 border-t border-border/40">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground text-[11px] font-semibold">
                      Overall Direct Report Goal Progress:
                    </span>
                    <span className="font-mono font-bold text-indigo-400">{avgProgress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${avgProgress}%` }}
                    />
                  </div>
                </div>

                {/* Expanded Goals List */}
                {isExpanded && (
                  <div className="pt-3 space-y-3 animate-in fade-in slide-in-from-top-1 border-t border-border/60">
                    <h5 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                      <span>Live OKRs &amp; Assigned Deliverables ({mGoals.length})</span>
                      <span className="text-[10px] font-normal text-muted-foreground">
                        Synced with {member.name}&apos;s employee page
                      </span>
                    </h5>

                    {mGoals.length === 0 ? (
                      <div className="p-4 rounded-2xl bg-muted/20 border border-dashed border-border text-center text-xs text-muted-foreground">
                        No active goals for {member.name}. Click &quot;Assign Goal&quot; above to set a new milestone.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {mGoals.map((g) => {
                          const isDone = g.status === "COMPLETED";
                          const config = TEAM_CATEGORY_CONFIG[g.category] || DEFAULT_TEAM_CATEGORY_STYLE;
                          const CategoryIcon = config.icon;

                          return (
                            <div
                              key={g.id}
                              className={`p-3.5 rounded-2xl border transition-all ${
                                isDone
                                  ? "bg-emerald-500/[0.03] border-emerald-500/30"
                                  : "bg-card/70 border-border/70 hover:border-border"
                              } space-y-2.5`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1 min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span
                                      className={`text-xs font-bold text-foreground ${
                                        isDone ? "line-through text-muted-foreground" : ""
                                      }`}
                                    >
                                      {g.title}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className={`text-[9px] px-2 py-0.2 rounded-full font-bold border flex items-center gap-1 ${config.badgeBg} ${config.badgeText} ${config.badgeBorder}`}
                                    >
                                      <CategoryIcon className="h-2.5 w-2.5" />
                                      <span>{g.category}</span>
                                    </Badge>
                                    {g.targetDate && (
                                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-2.5 w-2.5" />
                                        <span>{g.targetDate}</span>
                                      </span>
                                    )}
                                  </div>
                                  {g.description && (
                                    <p className="text-[11px] text-muted-foreground leading-snug">
                                      {g.description}
                                    </p>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteMemberGoal(member, g.id)}
                                  className="p-1 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                                  title="Delete goal"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              {/* Progress Adjustment */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-1 border-t border-border/30">
                                <div className="flex items-center gap-2 flex-1 max-w-xs">
                                  <div className="flex-1 h-1.5 rounded-full bg-muted/60 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        isDone ? "bg-emerald-500" : config.progressGradient
                                      }`}
                                      style={{ width: `${g.progress}%` }}
                                    />
                                  </div>
                                  <span
                                    className={`font-mono font-bold text-[11px] w-8 text-right ${
                                      isDone ? "text-emerald-400" : config.activeText
                                    }`}
                                  >
                                    {g.progress}%
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  {[25, 50, 75, 100].map((pct) => (
                                    <button
                                      key={pct}
                                      type="button"
                                      onClick={() => handleUpdateMemberGoalProgress(member, g.id, pct)}
                                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono border transition-all ${
                                        g.progress === pct
                                          ? "bg-indigo-600 text-white border-indigo-600"
                                          : "bg-muted/30 text-muted-foreground border-border/50 hover:text-foreground"
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
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
