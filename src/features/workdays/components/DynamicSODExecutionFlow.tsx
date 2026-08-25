"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { useCurrentUser } from "@/components/layout/UserContext";
import { WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import {
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Check,
  Layers,
  ArrowRight,
  Play,
  FileCheck2,
  Sliders,
  Send,
  Edit3,
} from "lucide-react";

export interface ExecutionTask {
  id: string;
  title: string;
  project: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  estimatedMinutes: number;
  expectedOutput: string;
  completionPercentage: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";
  actualMinutes: number;
  isCarriedOver: boolean;
}

interface RolledOverTask {
  id: string;
  title: string;
  project: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  previousProgress: number;
  yesterdayDate: string;
  reasonIncomplete: string;
  isAddedToToday: boolean;
  status: "ROLLED_OVER" | "COMPLETED_YESTERDAY" | "DEFERRED";
}

const INITIAL_ROLLOVER_TASKS: RolledOverTask[] = [
  {
    id: "ro-1",
    title: "Optimize PostgreSQL connection resilience & fallback handling in dev auth",
    project: "Core Platform",
    priority: "HIGH",
    previousProgress: 45,
    yesterdayDate: "Yesterday (Aug 19)",
    reasonIncomplete: "Ran out of shift time during database migration verification.",
    isAddedToToday: false,
    status: "ROLLED_OVER",
  },
  {
    id: "ro-2",
    title: "Build automated Playwright end-to-end regression test scripts",
    project: "Quality Assurance",
    priority: "MEDIUM",
    previousProgress: 20,
    yesterdayDate: "Yesterday (Aug 19)",
    reasonIncomplete: "Blocked temporarily waiting on staging environment deployment.",
    isAddedToToday: false,
    status: "ROLLED_OVER",
  },
];

const INITIAL_TODAY_TASKS: ExecutionTask[] = [
  {
    id: "task-1",
    title: "Implement dedicated SOD Carryover section with rolled-over task pile-up",
    project: "Frontend & UI",
    priority: "HIGH",
    estimatedMinutes: 180,
    expectedOutput: "Complete SOD section with carryover deck and morning lock action",
    completionPercentage: 80,
    status: "IN_PROGRESS",
    actualMinutes: 140,
    isCarriedOver: false,
  },
  {
    id: "task-2",
    title: "Conduct technical code review on Stage-2 Leave & HR approval PRs",
    project: "Core Platform",
    priority: "MEDIUM",
    estimatedMinutes: 90,
    expectedOutput: "Provide sign-off and merge authorization layer changes",
    completionPercentage: 100,
    status: "COMPLETED",
    actualMinutes: 75,
    isCarriedOver: false,
  },
];

const QUICK_TEMPLATES = [
  { label: "🚀 Feature Implementation", project: "Core Platform", priority: "HIGH" as const, minutes: 180 },
  { label: "🔍 Pull Request Code Reviews", project: "Engineering", priority: "MEDIUM" as const, minutes: 60 },
  { label: "🐛 Bug Triage & Fixes", project: "Core Platform", priority: "HIGH" as const, minutes: 90 },
  { label: "📐 Architecture Design Spec", project: "Architecture", priority: "MEDIUM" as const, minutes: 120 },
  { label: "🧪 Unit & Regression Testing", project: "Quality Assurance", priority: "MEDIUM" as const, minutes: 60 },
];

export interface DynamicSODExecutionFlowProps {
  initialPhase?: "SOD_PLANNING" | "WORK_EXECUTION" | "EOD_WRAPUP";
}

export function DynamicSODExecutionFlow({ initialPhase = "WORK_EXECUTION" }: DynamicSODExecutionFlowProps) {
  // Phase state: SOD_PLANNING -> WORK_EXECUTION -> EOD_WRAPUP
  const [phase, setPhase] = useState<"SOD_PLANNING" | "WORK_EXECUTION" | "EOD_WRAPUP">(initialPhase);

  React.useEffect(() => {
    if (initialPhase) {
      setPhase(initialPhase);
    }
  }, [initialPhase]);

  const [sodSubmittedAt, setSodSubmittedAt] = useState<string>("Today at 10:15 AM");

  const [rolledOverTasks, setRolledOverTasks] = useState<RolledOverTask[]>(INITIAL_ROLLOVER_TASKS);
  const [tasks, setTasks] = useState<ExecutionTask[]>(INITIAL_TODAY_TASKS);

  // SOD Form Inputs
  const [workMode] = useState<"OFFICE" | "WFH" | "HYBRID">("OFFICE");
  const [newTitle, setNewTitle] = useState("");
  const [newProject, setNewProject] = useState("Core Platform");
  const [newPriority, setNewPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("MEDIUM");
  const [newMinutes, setNewMinutes] = useState(60);
  const [newOutput, setNewOutput] = useState("");

  // EOD Form Inputs
  const [achievements, setAchievements] = useState("Successfully shipped SOD workflow and code reviews.");
  const [blockers, setBlockers] = useState("None. All PRs merged cleanly.");
  const [tomorrowFocus, setTomorrowFocus] = useState("Complete EOD wrap-up automation tests.");
  const [isEodSubmitted, setIsEodSubmitted] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Carry forward rollover task to today
  const handleCarryForwardToToday = (ro: RolledOverTask) => {
    setRolledOverTasks((prev) =>
      prev.map((t) => (t.id === ro.id ? { ...t, isAddedToToday: true } : t))
    );

    const newTask: ExecutionTask = {
      id: `task-carryover-${ro.id}`,
      title: `[Carryover ${ro.previousProgress}%] ${ro.title}`,
      project: ro.project,
      priority: ro.priority,
      estimatedMinutes: 120,
      expectedOutput: `Complete remaining work carried from ${ro.yesterdayDate}`,
      completionPercentage: ro.previousProgress,
      status: "IN_PROGRESS",
      actualMinutes: 0,
      isCarriedOver: true,
    };

    setTasks((prev) => [newTask, ...prev]);
    showToast(`Rolled-over task added to today's deliverables! 🚀`);
  };

  const handleMarkDoneYesterday = (id: string) => {
    setRolledOverTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "COMPLETED_YESTERDAY" } : t))
    );
    showToast(`Marked as completed yesterday! ✅`);
  };

  const handleDeferTask = (id: string) => {
    setRolledOverTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "DEFERRED" } : t))
    );
    showToast(`Task deferred to sprint backlog. 🗓️`);
  };

  // Add new task in SOD
  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: ExecutionTask = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      project: newProject,
      priority: newPriority,
      estimatedMinutes: Number(newMinutes) || 60,
      expectedOutput: newOutput.trim() || "Deliverable completed per sprint criteria",
      completionPercentage: 0,
      status: "NOT_STARTED",
      actualMinutes: 0,
      isCarriedOver: false,
    };

    setTasks((prev) => [...prev, newTask]);
    setNewTitle("");
    setNewOutput("");
    showToast(`New task added to plan! ✨`);
  };

  const handleAddTemplate = (tpl: typeof QUICK_TEMPLATES[0]) => {
    const newTask: ExecutionTask = {
      id: `task-tpl-${Date.now()}`,
      title: tpl.label.replace(/^[^\s]+\s/, ""),
      project: tpl.project,
      priority: tpl.priority,
      estimatedMinutes: tpl.minutes,
      expectedOutput: `Deliverable for ${tpl.label}`,
      completionPercentage: 0,
      status: "NOT_STARTED",
      actualMinutes: 0,
      isCarriedOver: false,
    };
    setTasks((prev) => [...prev, newTask]);
    showToast(`Added "${tpl.label}" to plan! ⚡`);
  };

  const handleRemoveTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const currentUser = useCurrentUser();

  // Submit and lock SOD -> Transitions strictly into Work Execution!
  const handleSubmitSOD = () => {
    if (tasks.length === 0) {
      showToast("Please add at least one planned task before submitting SOD.");
      return;
    }
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSodSubmittedAt(`Today at ${timeStr}`);
    setPhase("WORK_EXECUTION");

    // Persist SOD to WorkpulseSharedStore & Supabase
    const targetEmp = WorkpulseSharedStore.getAllEmployees().find(
      (e) => e.email.toLowerCase() === (currentUser?.userEmail || "").toLowerCase()
    );
    const targetEmpId = targetEmp ? targetEmp.id : "emp-sarah";

    WorkpulseSharedStore.updateEmployee(targetEmpId, {
      sodStatus: "SUBMITTED",
      sodTime: timeStr,
      plannedTasks: tasks.map((t) => ({
        id: t.id,
        title: t.title,
        project: t.project,
        priority: t.priority,
        estimatedMinutes: t.estimatedMinutes,
        completionPercentage: t.completionPercentage,
        status: t.status,
        expectedOutput: t.expectedOutput,
      })),
      overallProgress: 80,
    });

    if (typeof window !== "undefined") {
      fetch("/api/v1/workdays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: targetEmpId,
          date: new Date().toISOString().split("T")[0],
          sodStatus: "SUBMITTED",
          plannedTasks: tasks,
          overallProgress: 80,
        }),
      }).catch((err) => console.warn("Supabase workday SOD sync:", err));
    }

    showToast("Morning SOD Submitted & Locked! Switched to Work Execution Mode. 🚀");
  };

  // Update live task in Work Execution
  const handleUpdateTaskProgress = (id: string, newPercentage: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const newStatus =
          newPercentage === 100
            ? "COMPLETED"
            : newPercentage > 0
            ? "IN_PROGRESS"
            : "NOT_STARTED";
        return {
          ...t,
          completionPercentage: newPercentage,
          status: newStatus,
        };
      })
    );
  };

  const handleUpdateTaskStatus = (id: string, status: ExecutionTask["status"]) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const newPercentage =
          status === "COMPLETED" ? 100 : status === "NOT_STARTED" ? 0 : t.completionPercentage || 50;
        return {
          ...t,
          status,
          completionPercentage: newPercentage,
        };
      })
    );
  };

  const handleUpdateTaskActualMinutes = (id: string, mins: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, actualMinutes: mins } : t))
    );
  };

  // Submit EOD
  const handleSubmitEOD = () => {
    setIsEodSubmitted(true);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const targetEmp = WorkpulseSharedStore.getAllEmployees().find(
      (e) => e.email.toLowerCase() === (currentUser?.userEmail || "").toLowerCase()
    );
    const targetEmpId = targetEmp ? targetEmp.id : "emp-sarah";

    WorkpulseSharedStore.updateEmployee(targetEmpId, {
      eodStatus: "SUBMITTED",
      eodTime: timeStr,
      eodAchievements: achievements,
      eodBlockers: blockers,
      eodTomorrowFocus: tomorrowFocus,
      overallProgress: 100,
    });

    if (typeof window !== "undefined") {
      fetch("/api/v1/workdays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: targetEmpId,
          date: new Date().toISOString().split("T")[0],
          eodStatus: "SUBMITTED",
          eodAchievements: achievements,
          eodBlockers: blockers,
          eodTomorrowFocus: tomorrowFocus,
          overallProgress: 100,
        }),
      }).catch((err) => console.warn("Supabase workday EOD sync:", err));
    }

    showToast("End-of-Day (EOD) Wrap-up submitted successfully! Great work today! 🌟");
  };

  // Calculate live statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
  const overallCompletion = totalTasks > 0
    ? Math.round(tasks.reduce((acc, t) => acc + t.completionPercentage, 0) / totalTasks)
    : 0;
  const totalActualMinutes = tasks.reduce((acc, t) => acc + (t.actualMinutes || 0), 0);
  const totalActualHours = (totalActualMinutes / 60).toFixed(1);

  const unhandledRolloverCount = rolledOverTasks.filter(
    (t) => !t.isAddedToToday && t.status === "ROLLED_OVER"
  ).length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-xs text-cyan-300 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Lifecycle Flow Header & Stepper */}
      <Interactive3DCard className="p-5 md:p-6 border border-cyan-500/30 bg-gradient-to-r from-card/80 via-card/60 to-cyan-500/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="font-bold text-[10px] uppercase bg-cyan-500/15 border-cyan-500/30 text-cyan-300">
                <Clock className="h-3 w-3 mr-1 text-cyan-400" />
                Daily Execution Pipeline
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                {phase === "SOD_PLANNING"
                  ? "Phase 1: Morning SOD Planning"
                  : phase === "WORK_EXECUTION"
                  ? "Phase 2: Live Work Execution"
                  : "Phase 3: Evening EOD Wrap-up"}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-foreground">
              {phase === "SOD_PLANNING" && "Morning Start-of-Day Plan & Rollover"}
              {phase === "WORK_EXECUTION" && "Active Work Execution & Task Tracking"}
              {phase === "EOD_WRAPUP" && "End-of-Day Wrap-up & Achievements"}
            </h3>
          </div>

          {/* Stepper Buttons */}
          <div className="flex items-center p-1 rounded-xl bg-background/60 border border-border/80 shrink-0 gap-1 text-xs">
            <button
              type="button"
              onClick={() => setPhase("SOD_PLANNING")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                phase === "SOD_PLANNING"
                  ? "bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>1. Morning SOD</span>
            </button>

            <button
              type="button"
              onClick={() => setPhase("WORK_EXECUTION")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                phase === "WORK_EXECUTION"
                  ? "bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Play className="h-3.5 w-3.5" />
              <span>2. Live Execution</span>
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-400/20 text-cyan-300 font-mono text-[10px]">
                {overallCompletion}%
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPhase("EOD_WRAPUP")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                phase === "EOD_WRAPUP"
                  ? "bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileCheck2 className="h-3.5 w-3.5" />
              <span>3. Evening EOD</span>
            </button>
          </div>
        </div>
      </Interactive3DCard>

      {/* ============================================================== */}
      {/* PHASE 1: MORNING SOD PLANNING & ROLLOVER PILE-UP               */}
      {/* ============================================================== */}
      {phase === "SOD_PLANNING" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Previous Day Uncompleted Work Pile-Up */}
          <Interactive3DCard className="p-6 border border-amber-500/30 bg-gradient-to-r from-card/80 via-card/60 to-amber-500/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <RotateCcw className="h-4 w-4" />
                  </div>
                  <h4 className="text-base font-extrabold text-foreground">
                    Previous Day Incomplete Work Pile-Up
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tasks incomplete from yesterday&apos;s shift. Carry them into today&apos;s plan or mark their resolution.
                </p>
              </div>

              <Badge
                variant="outline"
                className={`text-xs font-bold px-3 py-1 ${
                  unhandledRolloverCount > 0
                    ? "border-amber-500/40 text-amber-400 bg-amber-500/10 animate-pulse"
                    : "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                }`}
              >
                {unhandledRolloverCount > 0
                  ? `⚠️ ${unhandledRolloverCount} Incomplete from Yesterday`
                  : `✓ All Carryovers Resolved`}
              </Badge>
            </div>

            <div className="space-y-3 pt-1">
              {rolledOverTasks.map((ro) => (
                <div
                  key={ro.id}
                  className={`p-4 rounded-xl border transition-all space-y-3 ${
                    ro.isAddedToToday
                      ? "border-cyan-500/40 bg-cyan-500/5 opacity-80"
                      : ro.status === "COMPLETED_YESTERDAY"
                      ? "border-emerald-500/30 bg-emerald-500/5 opacity-70"
                      : ro.status === "DEFERRED"
                      ? "border-border/60 bg-muted/20 opacity-60"
                      : "border-amber-500/30 bg-card/70 hover:border-amber-500/50 shadow-sm"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-foreground">{ro.title}</span>
                        <Badge variant="outline" className="text-[9px] uppercase font-bold text-cyan-400 border-cyan-500/30">
                          {ro.project}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[9px] uppercase font-bold ${
                            ro.priority === "HIGH"
                              ? "border-red-500/40 text-red-400"
                              : "border-amber-500/40 text-amber-400"
                          }`}
                        >
                          {ro.priority}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Yesterday note: <em className="text-foreground/80">&quot;{ro.reasonIncomplete}&quot;</em>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-xs">
                      <div className="text-right">
                        <span className="text-[10px] text-muted-foreground block font-bold">Yesterday&apos;s Progress</span>
                        <span className="font-bold text-amber-400 font-mono">{ro.previousProgress}%</span>
                      </div>
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-yellow-500"
                          style={{ width: `${ro.previousProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2 text-xs">
                    <span className="text-[11px] text-muted-foreground">
                      {ro.isAddedToToday
                        ? "✓ Added to Today's Deliverables"
                        : ro.status === "COMPLETED_YESTERDAY"
                        ? "✓ Completed After-Hours"
                        : ro.status === "DEFERRED"
                        ? "Deferred to Backlog"
                        : "Action required before morning lock:"}
                    </span>

                    {!ro.isAddedToToday && ro.status === "ROLLED_OVER" && (
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkDoneYesterday(ro.id)}
                          className="text-xs h-7 px-2.5 text-emerald-400 hover:bg-emerald-500/10 border-border"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          <span>Done Yesterday</span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeferTask(ro.id)}
                          className="text-xs h-7 px-2.5 text-muted-foreground hover:bg-muted border-border"
                        >
                          <span>Defer</span>
                        </Button>
                        <Button
                          type="button"
                          variant="brand"
                          size="sm"
                          onClick={() => handleCarryForwardToToday(ro)}
                          className="text-xs h-7 px-3 font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-sm gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Carry Forward to Today</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Interactive3DCard>

          {/* Today's Shift & Deliverables Builder */}
          <Interactive3DCard className="p-6 border border-cyan-500/30 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-extrabold text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4 text-cyan-400" />
                  What I Will Do Today ({tasks.length} Planned Tasks)
                </h4>
                <p className="text-xs text-muted-foreground">
                  Build your morning deliverable list before submitting SOD.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs bg-muted/40 px-3.5 py-1.5 rounded-xl border border-border/60 shrink-0">
                <span className="text-muted-foreground">Work Mode:</span>
                <strong className="text-cyan-400 font-bold">{workMode}</strong>
              </div>
            </div>

            {/* Quick Templates */}
            <div className="flex flex-wrap gap-2">
              {QUICK_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => handleAddTemplate(tpl)}
                  className="px-3 py-1.5 rounded-lg border border-border/80 bg-card/60 hover:bg-card hover:border-cyan-500/40 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5"
                >
                  <span>{tpl.label}</span>
                  <span className="text-[10px] text-cyan-400 font-mono">({tpl.minutes}m)</span>
                </button>
              ))}
            </div>

            {/* Task Add Form */}
            <form onSubmit={handleAddNewTask} className="p-4 rounded-xl border border-border/80 bg-card/40 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Task title (e.g. Implement authentication middleware engine)"
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <select
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-input bg-card text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  >
                    <option value="Core Platform">Core Platform</option>
                    <option value="Frontend & UI">Frontend & UI</option>
                    <option value="API Security">API Security</option>
                    <option value="DevOps & CI/CD">DevOps & CI/CD</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-1/2 h-9 px-2 rounded-lg border border-input bg-card text-xs font-semibold text-foreground"
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                  <select
                    value={newMinutes}
                    onChange={(e) => setNewMinutes(Number(e.target.value))}
                    className="w-1/2 h-9 px-2 rounded-lg border border-input bg-card text-xs font-semibold text-foreground"
                  >
                    <option value="30">30 min</option>
                    <option value="60">1 hr</option>
                    <option value="90">1.5 hrs</option>
                    <option value="120">2 hrs</option>
                    <option value="180">3 hrs</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <Input
                  value={newOutput}
                  onChange={(e) => setNewOutput(e.target.value)}
                  placeholder="Expected output / deliverable description"
                  className="h-8 text-xs flex-1"
                />
                <Button
                  type="submit"
                  variant="brand"
                  size="sm"
                  className="text-xs font-bold bg-cyan-500 hover:bg-cyan-600 text-black h-8 px-4 shrink-0 gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Task</span>
                </Button>
              </div>
            </form>

            {/* Tasks List */}
            <div className="space-y-3">
              {tasks.map((task, idx) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl border border-border/70 bg-card/60 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-6 rounded-lg bg-muted/60 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-foreground">{task.title}</span>
                        <Badge variant="outline" className="text-[9px] uppercase font-bold text-cyan-400 border-cyan-500/30">
                          {task.project}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[9px] uppercase font-bold ${
                            task.priority === "HIGH" ? "border-red-500/40 text-red-400" : "border-amber-500/40 text-amber-400"
                          }`}
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-muted-foreground block">{task.expectedOutput}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-xs text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      {task.estimatedMinutes}m
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveTask(task.id)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive border-border"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Lock SOD Action Button */}
            <div className="pt-4 border-t border-border/60 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Clicking Submit will lock morning planning and switch directly to <strong>Work Execution</strong>.
              </span>
              <Button
                variant="brand"
                size="lg"
                onClick={handleSubmitSOD}
                className="text-xs font-extrabold bg-gradient-to-r from-cyan-400 via-teal-500 to-emerald-500 text-black shadow-[0_4px_20px_rgba(6,182,212,0.25)] h-10 px-6 gap-2"
              >
                <CheckCircle2 className="h-4 w-4 fill-current" />
                <span>Submit & Lock Morning SOD</span>
              </Button>
            </div>
          </Interactive3DCard>
        </div>
      )}

      {/* ============================================================== */}
      {/* PHASE 2: ONLY WORK EXECUTION VISIBLE AFTER SOD SUBMISSION      */}
      {/* ============================================================== */}
      {phase === "WORK_EXECUTION" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Present Day Working Update Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-cyan-500/10 to-transparent border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 sm:mt-0 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                <Play className="h-5 w-5 fill-current" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-black text-foreground">
                    Present Day Working Update — Thursday, Aug 20, 2026
                  </h4>
                  <Badge variant="brand" className="text-[9px] bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold uppercase">
                    SOD Active · Locked {sodSubmittedAt}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Real-time execution of morning deliverables. Biometric punch verified at <strong>10:08 AM (HQ Office Floor 3)</strong> · Shift: <strong>10:00 AM – 07:00 PM</strong> · Total logged: <strong>{totalActualHours} hrs</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs shrink-0 bg-background/60 p-2.5 rounded-xl border border-border/80">
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground uppercase block font-bold">Shift Progress</span>
                <strong className="text-base font-black text-cyan-400 font-mono">{overallCompletion}%</strong>
              </div>
              <div className="border-l border-border/70 pl-3 text-right">
                <span className="text-[10px] text-muted-foreground uppercase block font-bold">Tasks Finished</span>
                <strong className="text-base font-black text-emerald-400 font-mono">
                  {completedTasks} / {totalTasks}
                </strong>
              </div>
            </div>
          </div>

          {/* Execution Progress Bar */}
          <div className="space-y-1.5 p-4 rounded-xl bg-card/60 border border-border/70">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">Total Day Deliverable Completion</span>
              <span className="font-mono font-bold text-cyan-400">{overallCompletion}%</span>
            </div>
            <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 transition-all duration-300"
                style={{ width: `${overallCompletion}%` }}
              />
            </div>
          </div>

          {/* Interactive Live Execution Task Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sliders className="h-4 w-4 text-cyan-400" />
                Live Task Deliverables ({tasks.length})
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPhase("SOD_PLANNING")}
                className="text-xs h-7 text-muted-foreground hover:text-foreground border-border gap-1"
              >
                <Edit3 className="h-3 w-3" />
                <span>Edit SOD Deliverables</span>
              </Button>
            </div>

            {tasks.map((task, idx) => (
              <Interactive3DCard
                key={task.id}
                className={`p-5 border space-y-4 transition-all ${
                  task.status === "COMPLETED"
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : task.status === "BLOCKED"
                    ? "border-red-500/40 bg-red-500/5"
                    : "border-border/80 hover:border-cyan-500/40"
                }`}
              >
                {/* Task Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="h-7 w-7 rounded-lg bg-muted text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      #{idx + 1}
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{task.title}</span>
                        <Badge variant="outline" className="text-[9px] uppercase font-bold text-cyan-400 border-cyan-500/30">
                          {task.project}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[9px] uppercase font-bold ${
                            task.priority === "HIGH" ? "border-red-500/40 text-red-400" : "border-amber-500/40 text-amber-400"
                          }`}
                        >
                          {task.priority}
                        </Badge>
                        {task.isCarriedOver && (
                          <Badge variant="brand" className="text-[9px] bg-amber-500/15 text-amber-400 border-amber-500/30 font-bold uppercase">
                            Rolled Over
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{task.expectedOutput}</p>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as any)}
                      className={`h-8 px-2.5 rounded-lg border text-xs font-bold focus:outline-none transition-all ${
                        task.status === "COMPLETED"
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                          : task.status === "IN_PROGRESS"
                          ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-400"
                          : task.status === "BLOCKED"
                          ? "bg-red-500/15 border-red-500/40 text-red-400"
                          : "bg-muted border-border text-muted-foreground"
                      }`}
                    >
                      <option value="NOT_STARTED">Not Started</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed (100%)</option>
                      <option value="BLOCKED">Blocked</option>
                    </select>
                  </div>
                </div>

                {/* Highly Visible Completion Progress Slider & Steppers Deck */}
                <div className="pt-3 border-t border-border/60 space-y-3 text-xs bg-card/40 p-3.5 rounded-xl border border-border/70">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Sliders className="h-4 w-4 text-cyan-400" />
                        Completion Progress Slider:
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs font-mono font-extrabold px-3 py-1 border transition-all ${
                          task.completionPercentage === 100
                            ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                            : task.completionPercentage > 0
                            ? "border-cyan-500/60 bg-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.35)]"
                            : "border-border text-muted-foreground bg-muted/60"
                        }`}
                      >
                        {task.completionPercentage}% {task.completionPercentage === 100 ? "Completed ✓" : "In Progress"}
                      </Badge>
                    </div>

                    {/* Quick 1-Click Stepper Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] font-semibold text-muted-foreground mr-1">Quick Set:</span>
                      {[0, 25, 50, 75, 100].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => handleUpdateTaskProgress(task.id, pct)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                            task.completionPercentage === pct
                              ? pct === 100
                                ? "bg-emerald-500 text-black border-emerald-400 shadow-md scale-105"
                                : "bg-cyan-500 text-black border-cyan-400 shadow-md scale-105"
                              : "bg-card/80 border-border text-muted-foreground hover:text-foreground hover:border-cyan-500/50"
                          }`}
                        >
                          {pct === 100 ? "100% ✓" : `${pct}%`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Range Input Slider with custom high-visibility CSS class */}
                  <div className="relative pt-1 pb-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={task.completionPercentage}
                      onChange={(e) => handleUpdateTaskProgress(task.id, Number(e.target.value))}
                      className="progress-range-slider"
                      title={`Drag to set completion percentage: ${task.completionPercentage}%`}
                    />
                  </div>

                  {/* Time Spent & Guidance Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-muted-foreground pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">Actual Time Spent:</span>
                      <Input
                        type="number"
                        value={task.actualMinutes || ""}
                        onChange={(e) => handleUpdateTaskActualMinutes(task.id, Number(e.target.value))}
                        placeholder="Mins"
                        className="h-8 w-24 text-xs font-mono text-center font-bold bg-background/80 border-cyan-500/30 text-cyan-300 focus:border-cyan-400"
                      />
                      <span>minutes</span>
                    </div>

                    <span className="font-mono text-[10px] text-muted-foreground">
                      Planned Target: {task.estimatedMinutes}m · Drag glowing thumb or click buttons
                    </span>
                  </div>
                </div>
              </Interactive3DCard>
            ))}
          </div>

          {/* Proceed to EOD Call to Action */}
          <div className="pt-4 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Finished for the day? Total logged time: <strong className="text-foreground font-mono">{totalActualHours} hrs</strong>.
            </span>

            <Button
              variant="brand"
              size="lg"
              onClick={() => setPhase("EOD_WRAPUP")}
              className="text-xs font-extrabold bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md h-10 px-6 gap-2"
            >
              <span>Proceed to EOD Wrap-up</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PHASE 3: EVENING EOD WRAP-UP                                    */}
      {/* ============================================================== */}
      {phase === "EOD_WRAPUP" && (
        <Interactive3DCard className="p-6 md:p-7 border border-purple-500/30 space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-purple-400" />
                End-of-Day (EOD) Summary Submission
              </h4>
              <p className="text-xs text-muted-foreground">
                Summarize achievements, log any impediments, and state tomorrow&apos;s focus before checking out.
              </p>
            </div>

            <Badge variant="outline" className="text-xs font-mono font-bold text-purple-300 border-purple-500/30">
              {completedTasks} of {totalTasks} Tasks Done
            </Badge>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground block">Key Achievements Today</label>
              <Input
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                placeholder="What concrete deliverables did you complete?"
                className="h-10 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground block">Blockers or Support Required (if any)</label>
              <Input
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                placeholder="Any external blockers or team assistance needed?"
                className="h-10 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground block">Tomorrow&apos;s Planned Focus</label>
              <Input
                value={tomorrowFocus}
                onChange={(e) => setTomorrowFocus(e.target.value)}
                placeholder="What will you tackle first thing tomorrow?"
                className="h-10 text-xs"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border/60 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPhase("WORK_EXECUTION")}
              className="text-xs h-9 border-border"
            >
              <span>Back to Work Execution</span>
            </Button>

            <Button
              variant="brand"
              size="lg"
              disabled={isEodSubmitted}
              onClick={handleSubmitEOD}
              className="text-xs font-extrabold bg-gradient-to-r from-purple-500 via-indigo-600 to-teal-500 text-white shadow-md h-10 px-6 gap-2"
            >
              {isEodSubmitted ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>EOD Wrap-up Submitted!</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit Final EOD Wrap-up</span>
                </>
              )}
            </Button>
          </div>
        </Interactive3DCard>
      )}
    </div>
  );
}
