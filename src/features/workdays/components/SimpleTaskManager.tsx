"use client";

import React, { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { useCurrentUser } from "@/components/layout/UserContext";
import { WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { fireCelebrationConfetti, fireSuccessBurst } from "@/lib/ui/confetti";
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Calendar,
  Search,
  Sun,
  Moon,
  Star,
} from "lucide-react";

export interface SimpleTaskItem {
  id: string;
  title: string;
  category: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  progress: number;
  dueDate?: string;
}

const VALID_CATEGORIES = ["Operations", "Planning", "Documentation", "General"] as const;

const normalizeCategory = (cat: string) => {
  if (VALID_CATEGORIES.includes(cat as any)) return cat;
  if (cat.includes("HR") || cat.includes("Compliance") || cat.includes("Operations")) return "Operations";
  if (cat.includes("Planning") || cat.includes("Milestone")) return "Planning";
  if (cat.includes("Doc") || cat.includes("Probation")) return "Documentation";
  return "General";
};

const DEFAULT_FRIENDLY_TASKS: SimpleTaskItem[] = [
  {
    id: "task-1",
    title: "Prepare and finalize weekly team report",
    category: "Operations",
    priority: "HIGH",
    status: "IN_PROGRESS",
    progress: 75,
    dueDate: "Today",
  },
  {
    id: "task-2",
    title: "Execute Stage-2 Leave & WFH Final Approvals",
    category: "Operations",
    priority: "HIGH",
    status: "IN_PROGRESS",
    progress: 80,
    dueDate: "Today",
  },
  {
    id: "task-3",
    title: "Review 30/90-Day Probation Feedback for New Joiners",
    category: "Documentation",
    priority: "MEDIUM",
    status: "NOT_STARTED",
    progress: 0,
    dueDate: "Tomorrow",
  },
  {
    id: "task-4",
    title: "Audit Shift Biometric Punctuality & Punch Regularizations",
    category: "Operations",
    priority: "HIGH",
    status: "COMPLETED",
    progress: 100,
    dueDate: "Today",
  },
  {
    id: "task-5",
    title: "Coordinate Work Anniversary & Birthday Celebrations",
    category: "General",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    progress: 60,
    dueDate: "This Week",
  },
  {
    id: "task-6",
    title: "Review monthly goals and team milestones",
    category: "Planning",
    priority: "MEDIUM",
    status: "COMPLETED",
    progress: 100,
    dueDate: "Today",
  },
];

type SegregationTab = "ALL" | "TODO" | "IN_PROGRESS" | "COMPLETED" | "WEEK";

export function SimpleTaskManager() {
  const currentUser = useCurrentUser();
  const [tasks, setTasks] = useState<SimpleTaskItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("workpulse_simple_tasks");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((t: SimpleTaskItem) => ({
              ...t,
              category: normalizeCategory(t.category || "General"),
            }));
          }
        }
      } catch {
        // safe fallback
      }
    }
    return DEFAULT_FRIENDLY_TASKS;
  });

  const [activeTab, setActiveTab] = useState<SegregationTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // New task form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Operations");
  const [newPriority, setNewPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("MEDIUM");

  // Daily Check-in state
  const [morningSubmitted, setMorningSubmitted] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("workpulse_morning_plan_submitted");
        if (saved !== null) return JSON.parse(saved);
      } catch {}
    }
    return false;
  });
  const [eveningSubmitted, setEveningSubmitted] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const leadFeedback = useMemo(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("workpulse_lead_daily_feedback");
        if (saved) {
          const parsed = JSON.parse(saved);
          return (
            parsed["emp-sarah"] || {
              sodAcknowledged: true,
              sodNote: "Morning plan looks solid. Prioritize PR reviews first.",
              eodReviewed: true,
              rating: 5,
              eodComment: "Great progress on CI cache layer and test verification!",
              actionItem: "Present results in tomorrow's team sync.",
            }
          );
        }
      } catch {}
    }
    return {
      sodAcknowledged: true,
      sodNote: "Morning plan looks solid. Prioritize PR reviews first.",
      eodReviewed: true,
      rating: 5,
      eodComment: "Great progress on CI cache layer and test verification!",
      actionItem: "Present results in tomorrow's team sync.",
    };
  }, [morningSubmitted, eveningSubmitted]);

  // Sync to localStorage
  const saveTasks = (updated: SimpleTaskItem[]) => {
    setTasks(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("workpulse_simple_tasks", JSON.stringify(updated));
      } catch {
        // safe fallback
      }
    }
    // Also sync to shared store
    const targetEmp = WorkpulseSharedStore.getAllEmployees().find(
      (e) => e.email.toLowerCase() === (currentUser?.userEmail || "").toLowerCase()
    );
    if (targetEmp) {
      WorkpulseSharedStore.updateEmployee(targetEmp.id, {
        plannedTasks: updated.map((t) => ({
          id: t.id,
          title: t.title,
          project: t.category,
          priority: t.priority,
          estimatedMinutes: 60,
          expectedOutput: t.title,
          completionPercentage: t.progress,
          status: t.status === "COMPLETED" ? "COMPLETED" : t.status === "IN_PROGRESS" ? "IN_PROGRESS" : "NOT_STARTED",
        })),
      });
    }
  };

  // 1-Click Toggle Complete
  const handleToggleComplete = (id: string) => {
    const updated = tasks.map((t) => {
      if (t.id !== id) return t;
      const isNowDone = t.status !== "COMPLETED";
      return {
        ...t,
        status: isNowDone ? ("COMPLETED" as const) : ("NOT_STARTED" as const),
        progress: isNowDone ? 100 : 0,
      };
    });
    saveTasks(updated);
    const toggled = updated.find((t) => t.id === id);
    if (toggled?.status === "COMPLETED") {
      fireSuccessBurst();
      showToast("✓ Great job! Task marked as completed.");
    }
  };

  // Set progress (adjustable to any percentage 0-100%)
  const handleSetTaskProgress = (id: string, newProgress: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(newProgress)));
    const newStatus =
      clamped === 100
        ? ("COMPLETED" as const)
        : clamped > 0
        ? ("IN_PROGRESS" as const)
        : ("NOT_STARTED" as const);

    const updated = tasks.map((t) => {
      if (t.id !== id) return t;
      return { ...t, progress: clamped, status: newStatus };
    });
    saveTasks(updated);
    if (clamped === 100) {
      fireSuccessBurst();
      showToast("✓ Great job! Task reached 100% and marked completed.");
    }
  };

  // Add Task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: SimpleTaskItem = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      priority: newPriority,
      status: "NOT_STARTED",
      progress: 0,
      dueDate: "Today",
    };

    const updated = [newTask, ...tasks];
    saveTasks(updated);
    setNewTitle("");
    setShowAddForm(false);
    fireSuccessBurst();
    showToast("✓ New task added.");
  };

  // Delete Task
  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    saveTasks(updated);
    showToast("Task removed.");
  };

  // Morning Plan submit
  const handleMorningPlanSubmit = () => {
    setMorningSubmitted(true);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("workpulse_morning_plan_submitted", JSON.stringify(true));
      } catch {}
    }
    fireSuccessBurst();
    showToast("☀️ Morning Plan submitted & shared with Team Lead Alex Lead!");
  };

  // Evening Wrap-up submit
  const handleEveningWrapupSubmit = () => {
    setEveningSubmitted(true);
    fireCelebrationConfetti();
    showToast("🌙 Evening EOD summary submitted to Team Lead Alex Lead for review!");
  };

  // Counts
  const todoCount = tasks.filter((t) => t.status === "NOT_STARTED").length;
  const inProgressCount = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;

  // Filtered List
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Tab filter
      if (activeTab === "TODO" && t.status !== "NOT_STARTED") return false;
      if (activeTab === "IN_PROGRESS" && t.status !== "IN_PROGRESS") return false;
      if (activeTab === "COMPLETED" && t.status !== "COMPLETED") return false;

      // Category filter
      if (selectedCategory !== "ALL" && t.category !== selectedCategory) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
      }

      return true;
    });
  }, [tasks, activeTab, selectedCategory, searchQuery]);

  const categories = [
    "ALL",
    "Operations",
    "Planning",
    "Documentation",
    "General",
  ];

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Team Lead Connection Info Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-500/5 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold text-[10px] shrink-0">
            AL
          </div>
          <div>
            <span className="font-bold text-foreground">Team Lead: Alex Lead</span>
            <span className="text-muted-foreground ml-1.5 text-[11px]">· Daily plans &amp; deliverables sync to your lead</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="text-[10px] text-indigo-300 border-indigo-500/30">
            Development Pod
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={() => showToast("✓ Help request notified to Alex Lead.")}
            className="text-[11px] h-7 px-2.5 text-muted-foreground hover:text-foreground"
          >
            Need Help from Lead?
          </Button>
        </div>
      </div>

      {/* 1. Daily Morning Plan & Evening Wrap-Up (Plain English) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Morning Plan */}
        <Interactive3DCard className="p-4 border border-cyan-500/30 bg-cyan-500/5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                <Sun className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span>Today&apos;s Morning Plan</span>
                  <Badge
                    variant="outline"
                    className={`text-[9px] ${
                      morningSubmitted
                        ? "text-cyan-400 border-cyan-500/30"
                        : "text-amber-300 border-amber-500/30 bg-amber-500/10"
                    }`}
                  >
                    {morningSubmitted ? "Plan Shared" : "Ready to Submit"}
                  </Badge>
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  {morningSubmitted
                    ? "Plan sent to Alex Lead (10:08 AM)"
                    : `${tasks.length} tasks planned for today`}
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant={morningSubmitted ? "outline" : "brand"}
              onClick={handleMorningPlanSubmit}
              className={`text-xs font-semibold h-8 shrink-0 ${
                morningSubmitted
                  ? "text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/10"
                  : "bg-cyan-600 hover:bg-cyan-700 text-white font-bold shadow-sm"
              }`}
            >
              {morningSubmitted ? "✓ Plan Submitted" : "Submit Morning Plan"}
            </Button>
          </div>

          {/* Lead Feedback on Morning Plan */}
          {morningSubmitted && leadFeedback?.sodAcknowledged && (
            <div className="p-2.5 rounded-lg bg-background/80 border border-cyan-500/20 text-xs flex items-center justify-between gap-2 animate-in fade-in">
              <span className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span><strong>Alex Lead:</strong> &quot;{leadFeedback.sodNote || "Morning plan looks solid. Prioritize PR reviews first."}&quot;</span>
              </span>
              <span className="text-[10px] font-mono text-muted-foreground shrink-0">Approved</span>
            </div>
          )}
        </Interactive3DCard>

        {/* Evening Wrap-Up */}
        <Interactive3DCard className="p-4 border border-purple-500/30 bg-purple-500/5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
                <Moon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span>Evening Wrap-Up</span>
                  <Badge variant="outline" className="text-[9px] text-purple-300 border-purple-500/30">
                    {eveningSubmitted ? "Wrap-Up Sent" : "Ready to Submit"}
                  </Badge>
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  {eveningSubmitted ? "Submitted to Alex Lead (06:55 PM)" : `${completedCount} of ${tasks.length} tasks completed today`}
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant={eveningSubmitted ? "outline" : "brand"}
              onClick={handleEveningWrapupSubmit}
              className="text-xs font-semibold h-8 shrink-0 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {eveningSubmitted ? "✓ Submitted" : "Submit Wrap-Up"}
            </Button>
          </div>

          {/* Lead Feedback on Evening Wrap-Up */}
          {leadFeedback?.eodReviewed && (
            <div className="p-2.5 rounded-lg bg-background/80 border border-purple-500/20 text-xs space-y-1 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-purple-300 font-bold flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span>Rated {leadFeedback.rating || 5}.0★ by Alex Lead</span>
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">Reviewed</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                &quot;{leadFeedback.eodComment || "Great work today!"}&quot;
              </p>
            </div>
          )}
        </Interactive3DCard>
      </div>

      {/* 2. Task Segregation Navigation & Controls */}
      <Interactive3DCard className="p-4 md:p-5 border border-border/80 bg-card/60 space-y-4">
        {/* Top bar: Tabs + Add Task button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Segregation Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-background/50 border border-border/70 overflow-x-auto gap-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeTab === "ALL"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Tasks ({tasks.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("TODO")}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeTab === "TODO"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              To Do ({todoCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("IN_PROGRESS")}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeTab === "IN_PROGRESS"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              In Progress ({inProgressCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("COMPLETED")}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeTab === "COMPLETED"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Completed ({completedCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("WEEK")}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeTab === "WEEK"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Weekly Schedule
            </button>
          </div>

          {/* New Task Button */}
          <Button
            size="sm"
            variant="brand"
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs font-bold gap-1.5 h-9 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{showAddForm ? "Close Form" : "Add Task"}</span>
          </Button>
        </div>

        {/* 3. Simple Add Task Form (Collapsible) */}
        {showAddForm && (
          <form onSubmit={handleAddTask} className="p-4 rounded-xl bg-card border border-primary/40 space-y-3 animate-in fade-in slide-in-from-top-2">
            <h4 className="text-xs font-bold text-foreground">Create New Task</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] text-muted-foreground">What needs to be done?</label>
                <Input
                  type="text"
                  placeholder="e.g., Draft customer feedback summary"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none"
                >
                  <option value="Operations">Operations</option>
                  <option value="Planning">Planning</option>
                  <option value="Documentation">Documentation</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">Priority:</span>
                <button
                  type="button"
                  onClick={() => setNewPriority("MEDIUM")}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                    newPriority === "MEDIUM"
                      ? "bg-secondary text-foreground border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => setNewPriority("HIGH")}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                    newPriority === "HIGH"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Important
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs h-8"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant="brand" className="text-xs font-bold h-8">
                  Add Task
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* 4. Search and Category Filter Bar */}
        {activeTab !== "WEEK" && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 text-xs">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-background/50"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              <span className="text-[11px] text-muted-foreground shrink-0">Filter:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-muted text-foreground font-bold border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </Interactive3DCard>

      {/* 5. Main Content: Task List or Weekly View */}
      {activeTab === "WEEK" ? (
        /* Simple Weekly View */
        <Interactive3DCard className="p-5 border border-border/80 bg-card/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-foreground">Weekly Overview</h3>
            </div>
            <span className="text-xs text-muted-foreground font-mono">Monday – Friday</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { day: "Monday", count: 3, label: "3 Tasks Done", status: "Done" },
              { day: "Tuesday", count: 4, label: "4 Tasks Done", status: "Done" },
              { day: "Wednesday", count: 3, label: "3 Tasks Done", status: "Done" },
              { day: "Thursday", count: tasks.length, label: `${completedCount} of ${tasks.length} Done`, status: "Today", isToday: true },
              { day: "Friday", count: 2, label: "2 Tasks Scheduled", status: "Upcoming" },
            ].map((d) => (
              <div
                key={d.day}
                className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                  d.isToday
                    ? "bg-primary/10 border-primary/50 shadow-sm"
                    : "bg-card border-border/70"
                }`}
              >
                <div className="flex items-center justify-between">
                  <strong className="text-foreground font-bold">{d.day}</strong>
                  {d.isToday && (
                    <Badge variant="brand" className="text-[9px]">
                      Today
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">{d.label}</p>
              </div>
            ))}
          </div>
        </Interactive3DCard>
      ) : (
        /* Task Cards List */
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center bg-card/40 rounded-2xl border border-border/60 text-xs text-muted-foreground space-y-2">
              <CheckCircle2 className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="font-semibold text-sm text-foreground">No tasks found</p>
              <p>You have no tasks in this view. Click &quot;Add Task&quot; above to create one.</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isDone = task.status === "COMPLETED";

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isDone
                      ? "bg-card/40 border-border/50 opacity-75"
                      : "bg-card/70 border-border hover:border-primary/40 shadow-sm"
                  }`}
                >
                  {/* Left: 1-Click Complete Checkbox + Title */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => handleToggleComplete(task.id)}
                      className="mt-0.5 shrink-0 text-muted-foreground hover:text-emerald-400 transition-colors"
                      title={isDone ? "Mark incomplete" : "Mark completed"}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-bold leading-snug ${
                            isDone ? "line-through text-muted-foreground" : "text-foreground"
                          }`}
                        >
                          {task.title}
                        </span>

                        <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                          {task.category}
                        </Badge>

                        {task.priority === "HIGH" && (
                          <Badge variant="destructive" className="text-[9px] px-1.5 py-0">
                            Important
                          </Badge>
                        )}
                      </div>

                      {/* Adjustable Progress Slider */}
                      <div className="flex items-center gap-3 pt-1 max-w-xs sm:max-w-sm">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={task.progress}
                          onChange={(e) => handleSetTaskProgress(task.id, Number(e.target.value))}
                          disabled={isDone}
                          className="flex-1 h-2.5 cursor-pointer accent-cyan-400 disabled:opacity-50"
                          title="Drag to adjust task progress"
                        />
                        <span className="text-[11px] font-mono font-bold text-cyan-400 w-10 text-right shrink-0">
                          {task.progress}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Action Controls */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleToggleComplete(task.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        isDone
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {isDone ? "✓ Done" : "Mark Done"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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
