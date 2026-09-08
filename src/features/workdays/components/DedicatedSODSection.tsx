"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import {
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Target,
  Zap,
  Building2,
  Check,
  Layers,
} from "lucide-react";
import { WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export interface RolledOverTask {
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

export interface TodayPlannedTask {
  id: string;
  title: string;
  project: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  estimatedMinutes: number;
  expectedOutput: string;
  isCarriedOverFromYesterday: boolean;
  weeklyGoalId?: string;
}

const INITIAL_ROLLED_OVER_TASKS: RolledOverTask[] = [];

const INITIAL_TODAY_TASKS: TodayPlannedTask[] = [];

import { useCurrentUser } from "@/components/layout/UserContext";

const ENGINEERING_TEMPLATES = [
  { label: "🚀 Feature Implementation", project: "Core Platform", priority: "HIGH" as const, minutes: 180 },
  { label: "🔍 Pull Request Code Reviews", project: "Engineering", priority: "MEDIUM" as const, minutes: 60 },
  { label: "🐛 Bug Triage & Fixes", project: "Core Platform", priority: "HIGH" as const, minutes: 90 },
  { label: "📐 Architecture Design Spec", project: "Architecture", priority: "MEDIUM" as const, minutes: 120 },
  { label: "🧪 Unit & Regression Testing", project: "Quality Assurance", priority: "MEDIUM" as const, minutes: 60 },
];

const HR_TEMPLATES = [
  { label: "📋 Execute Stage-2 Leave Approvals", project: "People Operations", priority: "HIGH" as const, minutes: 60 },
  { label: "⏰ Audit Biometric Punch Anomalies", project: "HR Compliance", priority: "MEDIUM" as const, minutes: 45 },
  { label: "👥 Review 30-Day Probation Checkpoint", project: "Talent Ops", priority: "HIGH" as const, minutes: 60 },
  { label: "🎯 Conduct Candidate Technical Screening", project: "Talent Acquisition", priority: "HIGH" as const, minutes: 60 },
  { label: "💵 Prepare Biometric Muster for Payroll", project: "HR & Payroll", priority: "MEDIUM" as const, minutes: 90 },
  { label: "📢 Broadcast Company Policy Notice", project: "Culture & Comms", priority: "LOW" as const, minutes: 30 },
];

export function DedicatedSODSection() {
  const user = useCurrentUser();
  const isHR = user.roles.includes("HR") || user.primaryRole === "HR";
  const activeTemplates = isHR ? HR_TEMPLATES : ENGINEERING_TEMPLATES;
  const [rolledOverTasks, setRolledOverTasks] = useState<RolledOverTask[]>(INITIAL_ROLLED_OVER_TASKS);
  const [todayTasks, setTodayTasks] = useState<TodayPlannedTask[]>(INITIAL_TODAY_TASKS);

  const [workMode, setWorkMode] = useState<"OFFICE" | "WFH" | "HYBRID">("OFFICE");
  const [shiftHours, setShiftHours] = useState("10:00 - 19:00");
  const [plannedHours, setPlannedHours] = useState(8.0);

  // Form inputs for adding new task today
  const [newTitle, setNewTitle] = useState("");
  const [newProject, setNewProject] = useState("Core Platform");
  const [newPriority, setNewPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("MEDIUM");
  const [newMinutes, setNewMinutes] = useState(60);
  const [newOutput, setNewOutput] = useState("");

  const [isLockedSubmitted, setIsLockedSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Carry forward a rolled over task to today's plan
  const handleCarryForwardToToday = (task: RolledOverTask) => {
    setRolledOverTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, isAddedToToday: true } : t))
    );

    const newTask: TodayPlannedTask = {
      id: `today-carryover-${task.id}`,
      title: `[Carryover ${task.previousProgress}%] ${task.title}`,
      project: task.project,
      priority: task.priority,
      estimatedMinutes: 120,
      expectedOutput: `Complete remaining ${100 - task.previousProgress}% of work carried from ${task.yesterdayDate}`,
      isCarriedOverFromYesterday: true,
    };

    setTodayTasks((prev) => [newTask, ...prev]);
    showToast(`Rolled-over task added to today's plan! 🚀`);
  };

  // Mark task completed yesterday
  const handleMarkDoneYesterday = (taskId: string) => {
    setRolledOverTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: "COMPLETED_YESTERDAY" } : t))
    );
    showToast(`Marked as completed yesterday! ✅`);
  };

  // Defer task
  const handleDeferTask = (taskId: string) => {
    setRolledOverTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: "DEFERRED" } : t))
    );
    showToast(`Task deferred to sprint backlog. 🗓️`);
  };

  // Add new task to today
  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: TodayPlannedTask = {
      id: `today-${Date.now()}`,
      title: newTitle.trim(),
      project: newProject,
      priority: newPriority,
      estimatedMinutes: Number(newMinutes) || 60,
      expectedOutput: newOutput.trim() || "Deliverable completed per sprint guidelines",
      isCarriedOverFromYesterday: false,
    };

    setTodayTasks((prev) => [...prev, newTask]);
    setNewTitle("");
    setNewOutput("");
    showToast(`New deliverable added to today's plan! ✨`);
  };

  // Quick template insertion
  const handleAddTemplate = (tpl: typeof ENGINEERING_TEMPLATES[0]) => {
    const newTask: TodayPlannedTask = {
      id: `today-tpl-${Date.now()}`,
      title: tpl.label.replace(/^[^\s]+\s/, ""),
      project: tpl.project,
      priority: tpl.priority,
      estimatedMinutes: tpl.minutes,
      expectedOutput: `Target completion for ${tpl.label}`,
      isCarriedOverFromYesterday: false,
    };
    setTodayTasks((prev) => [...prev, newTask]);
    showToast(`Added "${tpl.label}" to today's plan! ⚡`);
  };

  // Remove task from today
  const handleRemoveTodayTask = (id: string) => {
    setTodayTasks((prev) => prev.filter((t) => t.id !== id));
    WorkpulseSharedStore.deleteAssignedTask(id);
    showToast("Task permanently removed.");
  };

  // Submit and lock SOD
  const handleSubmitAndLockSOD = () => {
    if (todayTasks.length === 0) {
      showToast("Please add at least one planned task before submitting SOD.");
      return;
    }
    setIsLockedSubmitted(true);
    showToast("Morning Start-of-Day (SOD) plan submitted and locked! 🌅");
  };

  const totalAllocatedMinutes = todayTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0);
  const totalAllocatedHours = (totalAllocatedMinutes / 60).toFixed(1);
  const unhandledRolloverCount = rolledOverTasks.filter(
    (t) => !t.isAddedToToday && t.status === "ROLLED_OVER"
  ).length;

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-xs text-cyan-300 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* 3D Header Hero Banner */}
      <Interactive3DCard className="p-6 md:p-8 border border-cyan-500/30 bg-gradient-to-r from-card/80 via-card/60 to-cyan-500/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="font-bold text-[10px] uppercase bg-cyan-500/15 border-cyan-500/30 text-cyan-300">
                <Clock className="h-3 w-3 mr-1 text-cyan-400" />
                Morning Start-of-Day Workspace
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                Yesterday Rollover · Present Day Planning · Lock SOD
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Daily SOD Workplan & Task Rollover
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Incomplete deliverables from yesterday are automatically piled up below. Review and carry forward pending tasks, add what you will accomplish today, and lock your morning plan.
            </p>
          </div>

          {/* Morning Status Pill */}
          <div className="p-4 rounded-xl bg-background/50 border border-cyan-500/30 backdrop-blur-md space-y-1.5 shrink-0 text-xs text-right shadow-sm">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Workday Status
            </span>
            <div className="flex items-center gap-1.5 justify-end">
              <span className={`h-2 w-2 rounded-full ${isLockedSubmitted ? "bg-emerald-400" : "bg-cyan-400 animate-pulse"}`} />
              <strong className={`text-sm font-extrabold ${isLockedSubmitted ? "text-emerald-400" : "text-cyan-300"}`}>
                {isLockedSubmitted ? "SOD Submitted & Active" : "SOD Planning Open"}
              </strong>
            </div>
          </div>
        </div>
      </Interactive3DCard>

      {/* ============================================================== */}
      {/* 1. PREVIOUS DAY WORK PILE-UP / ROLLOVER SECTION                  */}
      {/* ============================================================== */}
      <Interactive3DCard className="p-6 md:p-7 border border-amber-500/30 bg-gradient-to-r from-card/80 via-card/60 to-amber-500/5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <RotateCcw className="h-4 w-4" />
              </div>
              <h3 className="text-base font-extrabold text-foreground">
                Previous Day Uncompleted Work Pile-Up
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              These tasks were left incomplete in yesterday&apos;s EOD wrap-up. Carry them forward into today&apos;s SOD plan or update their resolution.
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

        {/* Rolled-Over Tasks List */}
        <div className="space-y-3 pt-1">
          {rolledOverTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-xl border transition-all space-y-3 ${
                task.isAddedToToday
                  ? "border-cyan-500/40 bg-cyan-500/5 opacity-80"
                  : task.status === "COMPLETED_YESTERDAY"
                  ? "border-emerald-500/30 bg-emerald-500/5 opacity-70"
                  : task.status === "DEFERRED"
                  ? "border-border/60 bg-muted/20 opacity-60"
                  : "border-amber-500/30 bg-card/70 hover:border-amber-500/50 shadow-sm"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-foreground">{task.title}</span>
                    <Badge variant="outline" className="text-[9px] uppercase font-bold text-cyan-400 border-cyan-500/30">
                      {task.project}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[9px] uppercase font-bold ${
                        task.priority === "HIGH"
                          ? "border-red-500/40 text-red-400"
                          : "border-amber-500/40 text-amber-400"
                      }`}
                    >
                      {task.priority}
                    </Badge>
                  </div>

                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <span>{task.yesterdayDate} note:</span>
                    <em className="text-foreground/80">&quot;{task.reasonIncomplete}&quot;</em>
                  </p>
                </div>

                {/* Progress Visualizer */}
                <div className="flex items-center gap-3 shrink-0 text-xs">
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground block font-bold">Yesterday&apos;s Progress</span>
                    <span className="font-bold text-amber-400 font-mono">{task.previousProgress}%</span>
                  </div>
                  <div className="progress-track-line w-24">
                    <div
                      className="progress-track-fill-emerald"
                      style={{ width: `${task.previousProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Action Buttons for Rollover */}
              <div className="pt-2 border-t border-border/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-[11px] text-muted-foreground">
                  {task.isAddedToToday
                    ? "✓ Added to Today's Planned Deliverables below"
                    : task.status === "COMPLETED_YESTERDAY"
                    ? "✓ Marked completed after hours"
                    : task.status === "DEFERRED"
                    ? "Deferred to Backlog"
                    : "Action required before morning lock:"}
                </span>

                <div className="flex items-center gap-2">
                  {!task.isAddedToToday && task.status === "ROLLED_OVER" && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkDoneYesterday(task.id)}
                        className="text-xs h-7 px-2.5 text-emerald-400 hover:bg-emerald-500/10 border-border"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        <span>Completed Yesterday</span>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeferTask(task.id)}
                        className="text-xs h-7 px-2.5 text-muted-foreground hover:bg-muted border-border"
                      >
                        <span>Defer</span>
                      </Button>

                      <Button
                        type="button"
                        variant="brand"
                        size="sm"
                        onClick={() => handleCarryForwardToToday(task)}
                        className="text-xs h-7 px-3 font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-sm gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Carry Forward to Today&apos;s Plan</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Interactive3DCard>

      {/* ============================================================== */}
      {/* 2. TODAY'S SHIFT & WORK MODE CONFIGURATION                      */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Interactive3DCard className="p-4 space-y-1.5 border-border/80">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5 text-cyan-400" />
            Today&apos;s Work Mode
          </span>
          <select
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value as any)}
            disabled={isLockedSubmitted}
            className="w-full h-9 px-3 rounded-lg border border-input bg-card/80 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-400"
          >
            <option value="OFFICE">Office (Bangalore HQ Floor 3)</option>
            <option value="WFH">Work From Home (Approved WFH)</option>
            <option value="HYBRID">Hybrid Client Site</option>
          </select>
        </Interactive3DCard>

        <Interactive3DCard className="p-4 space-y-1.5 border-border/80">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-purple-400" />
            Shift Schedule
          </span>
          <Input
            value={shiftHours}
            onChange={(e) => setShiftHours(e.target.value)}
            disabled={isLockedSubmitted}
            className="h-9 text-xs font-mono"
            placeholder="10:00 - 19:00"
          />
        </Interactive3DCard>

        <Interactive3DCard className="p-4 space-y-1.5 border-border/80">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Target className="h-3.5 w-3.5 text-emerald-400" />
            Planned Working Hours
          </span>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="0.5"
              value={plannedHours}
              onChange={(e) => setPlannedHours(Number(e.target.value))}
              disabled={isLockedSubmitted}
              className="h-9 text-xs font-mono"
            />
            <span className="text-xs text-muted-foreground shrink-0">Hours</span>
          </div>
        </Interactive3DCard>
      </div>

      {/* ============================================================== */}
      {/* 3. PRESENT DAY DELIVERABLES BUILDER                             */}
      {/* ============================================================== */}
      <Interactive3DCard className="p-6 md:p-7 border border-cyan-500/30 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              What I Will Do Today ({todayTasks.length} Planned Tasks)
            </h3>
            <p className="text-xs text-muted-foreground">
              Define your deliverables for today. Link them to sprint objectives and assign time budgets.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs bg-muted/40 px-3.5 py-1.5 rounded-xl border border-border/60 shrink-0">
            <span className="text-muted-foreground">Allocated Time:</span>
            <strong className="text-cyan-400 font-mono font-bold">
              {totalAllocatedHours} / {plannedHours} hrs
            </strong>
          </div>
        </div>

        {/* Quick Template Chips */}
        {!isLockedSubmitted && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-400" />
              {isHR ? "1-Click HR Daily Task Templates" : "1-Click Deliverable Templates"}
            </span>
            <div className="flex flex-wrap gap-2">
              {activeTemplates.map((tpl) => (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => handleAddTemplate(tpl as any)}
                  className="px-3 py-1.5 rounded-lg border border-border/80 bg-card/60 hover:bg-card hover:border-cyan-500/40 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5"
                >
                  <span>{tpl.label}</span>
                  <span className="text-[10px] text-cyan-400 font-mono">({tpl.minutes}m)</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* New Task Inline Input Form */}
        {!isLockedSubmitted && (
          <form
            onSubmit={handleAddNewTask}
            className="p-4 rounded-xl border border-border/80 bg-card/40 space-y-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                + Add New Deliverable
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Task title (e.g. Build authentication state transition service)"
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
                  <option value="240">4 hrs</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <Input
                value={newOutput}
                onChange={(e) => setNewOutput(e.target.value)}
                placeholder="Expected concrete output (e.g. PR open with 100% test pass)"
                className="h-8 text-xs flex-1"
              />

              <Button
                type="submit"
                variant="brand"
                size="sm"
                className="text-xs font-bold bg-cyan-500 hover:bg-cyan-600 text-black h-8 px-4 shrink-0 gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Deliverable</span>
              </Button>
            </div>
          </form>
        )}

        {/* Planned Tasks List */}
        <div className="space-y-3">
          {todayTasks.map((task, idx) => (
            <div
              key={task.id}
              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                task.isCarriedOverFromYesterday
                  ? "border-amber-500/40 bg-amber-500/5"
                  : "border-border/70 bg-card/60 hover:border-cyan-500/40"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-lg bg-muted/60 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  #{idx + 1}
                </span>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-foreground">{task.title}</span>
                    <Badge variant="outline" className="text-[9px] uppercase font-bold text-cyan-400 border-cyan-500/30">
                      {task.project}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[9px] uppercase font-bold ${
                        task.priority === "HIGH"
                          ? "border-red-500/40 text-red-400"
                          : "border-amber-500/40 text-amber-400"
                      }`}
                    >
                      {task.priority}
                    </Badge>
                    {task.isCarriedOverFromYesterday && (
                      <Badge variant="brand" className="text-[9px] bg-amber-500/15 text-amber-400 border-amber-500/30 font-bold uppercase">
                        Rolled Over
                      </Badge>
                    )}
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    Target Output: <span className="text-foreground/90 font-medium">{task.expectedOutput}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-xs">
                <span className="font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                  {task.estimatedMinutes} mins
                </span>

                {!isLockedSubmitted && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveTodayTask(task.id)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-border"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Submission Action Bar */}
        <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground">
            {isLockedSubmitted ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Morning plan locked. Workday is in active execution mode.</span>
              </span>
            ) : (
              <span>
                Ready to submit? Once locked, your team lead will be notified and today&apos;s deliverables will be active.
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isLockedSubmitted ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLockedSubmitted(false)}
                className="text-xs font-semibold h-9 border-border"
              >
                <span>Edit Morning Plan</span>
              </Button>
            ) : (
              <Button
                variant="brand"
                size="lg"
                onClick={handleSubmitAndLockSOD}
                className="text-xs font-extrabold bg-gradient-to-r from-cyan-400 via-teal-500 to-emerald-500 text-black shadow-[0_4px_20px_rgba(6,182,212,0.25)] h-10 px-6 gap-2"
              >
                <CheckCircle2 className="h-4 w-4 fill-current" />
                <span>Submit & Lock Today&apos;s SOD Plan</span>
              </Button>
            )}
          </div>
        </div>
      </Interactive3DCard>
    </div>
  );
}
