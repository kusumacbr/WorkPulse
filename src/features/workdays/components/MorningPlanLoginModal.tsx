"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrentUser } from "@/components/layout/UserContext";
import { WorkpulseSharedStore, useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { fireSuccessBurst } from "@/lib/ui/confetti";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sun,
  Send,
  Plus,
  CheckCircle2,
  ListTodo,
  X,
} from "lucide-react";

export const openMorningPlanModal = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("workpulse:open_morning_plan"));
  }
};

export function MorningPlanLoginModal() {
  const currentUser = useCurrentUser();
  const { allEmployees } = useWorkpulseSharedStore();

  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState<
    Array<{
      id: string;
      title: string;
      project: string;
      priority: "HIGH" | "MEDIUM" | "LOW";
      estimatedMinutes: number;
    }>
  >([]);
  const [morningNote, setMorningNote] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("MEDIUM");
  const [showAddInline, setShowAddInline] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Identify matching employee & their Team Lead
  const currentEmp = useMemo(() => {
    const emailLower = (currentUser.userEmail || "").toLowerCase();
    return allEmployees.find(
      (e) =>
        e.email.toLowerCase() === emailLower ||
        e.id === currentUser.userEmail ||
        (emailLower === "employee.test@xorstack.com" && e.id === "emp-sarah")
    );
  }, [allEmployees, currentUser.userEmail]);

  const isEmployee =
    !currentUser.roles.includes("HR") &&
    !currentUser.roles.includes("MANAGER") &&
    currentUser.primaryRole === "EMPLOYEE" &&
    !currentUser.userEmail.toLowerCase().includes("lead") &&
    !currentUser.userEmail.toLowerCase().includes("hr");

  const leadName = currentEmp?.teamLeadName || "Alex Lead";

  // Check login prompt trigger on mount / user change
  useEffect(() => {
    if (!isEmployee) {
      setIsOpen(false);
      return;
    }

    // Load initial tasks from store or localStorage
    let initialTasks: any[] = [];
    if (currentEmp?.plannedTasks && currentEmp.plannedTasks.length > 0) {
      initialTasks = currentEmp.plannedTasks;
    } else if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("workpulse_simple_tasks");
        if (saved) {
          initialTasks = JSON.parse(saved);
        }
      } catch {}
    }

    setTasks(
      initialTasks.map((t, idx) => ({
        id: t.id || `task-modal-${idx}`,
        title: t.title,
        project: t.project || t.category || "General",
        priority: (t.priority as any) || "MEDIUM",
        estimatedMinutes: Number(t.estimatedMinutes) || 60,
      }))
    );
  }, [isEmployee, currentUser.userEmail, currentEmp?.sodStatus]);

  // Listen for manual trigger button clicks
  useEffect(() => {
    const handleOpen = () => {
      let latestTasks: any[] = [];
      if (currentEmp?.plannedTasks && currentEmp.plannedTasks.length > 0) {
        latestTasks = currentEmp.plannedTasks;
      } else if (typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem("workpulse_simple_tasks");
          if (saved) latestTasks = JSON.parse(saved);
        } catch {}
      }
      setTasks(
        latestTasks.map((t, idx) => ({
          id: t.id || `task-modal-${idx}`,
          title: t.title,
          project: t.project || t.category || "General",
          priority: (t.priority as any) || "MEDIUM",
          estimatedMinutes: Number(t.estimatedMinutes) || 60,
        }))
      );
      setIsOpen(true);
    };

    window.addEventListener("workpulse:open_morning_plan", handleOpen);
    return () => window.removeEventListener("workpulse:open_morning_plan", handleOpen);
  }, [currentEmp]);

  // Add Task inline
  const handleAddInlineTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      project: "General",
      priority: newTaskPriority,
      estimatedMinutes: 60,
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTaskTitle("");
    setShowAddInline(false);
  };

  // Remove task from today's plan
  const handleRemoveTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // 1-Click Send to Team Lead
  const handleSendToLead = async () => {
    if (!currentEmp) return;
    setIsSubmitting(true);

    try {
      WorkpulseSharedStore.submitEmployeeMorningPlan(
        currentEmp.id,
        tasks.map((t) => ({
          id: t.id,
          title: t.title,
          project: t.project,
          priority: t.priority,
          estimatedMinutes: t.estimatedMinutes,
          completionPercentage: 0,
          status: "NOT_STARTED",
        })),
        morningNote
      );

      fireSuccessBurst();
      setSubmittedSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSubmittedSuccess(false);
      }, 2000);
    } catch (e) {
      console.warn("Failed to submit morning plan:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isEmployee) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/65 backdrop-blur-md transition-all"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-card/95 border border-cyan-500/30 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl overflow-hidden z-10 p-6 sm:p-8 space-y-6"
          >
            {/* Header Ambient Halo */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-cyan-500/20 via-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-muted/40 hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              title="Close and review in My Tasks"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Top Badge & Greeting */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant="cyan"
                  className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full shadow-sm"
                >
                  <Sun className="h-3.5 w-3.5 mr-1.5 text-amber-300 animate-pulse" />
                  <span>Start-of-Day · Morning Check-in</span>
                </Badge>
                <span className="text-xs text-muted-foreground font-medium">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Good morning,{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-primary bg-clip-text text-transparent">
                  {currentUser.userName}
                </span>
                !
              </h2>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Review your active tasks below from <strong className="text-foreground">My Tasks</strong>. With one click, send them to your Team Lead (
                <strong className="text-cyan-400">{leadName}</strong>) as your official Morning Plan.
              </p>
            </div>

            {/* Success View */}
            {submittedSuccess ? (
              <div className="p-8 text-center bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-3">
                <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto animate-bounce" />
                <h3 className="text-lg font-bold text-foreground">
                  Morning Plan Sent to {leadName}!
                </h3>
                <p className="text-xs text-muted-foreground">
                  Your tasks have been synced to Supabase and submitted to your Team Lead for verification.
                </p>
              </div>
            ) : (
              <>
                {/* Task List Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ListTodo className="h-4 w-4 text-cyan-400" />
                      <span className="text-xs font-bold text-foreground">
                        Today&apos;s Morning Tasks ({tasks.length})
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowAddInline(!showAddInline)}
                      className="text-xs font-bold text-cyan-400 hover:text-cyan-300 h-8 gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Task</span>
                    </Button>
                  </div>

                  {/* Add Inline Task Form */}
                  {showAddInline && (
                    <form
                      onSubmit={handleAddInlineTask}
                      className="p-3.5 rounded-2xl bg-muted/40 border border-cyan-500/25 space-y-3 animate-in fade-in slide-in-from-top-2"
                    >
                      <Input
                        placeholder="Task title (e.g. Implement authentication middleware)..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="text-xs h-9 bg-background/80"
                        autoFocus
                      />
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-muted-foreground">Priority:</span>
                          {(["HIGH", "MEDIUM", "LOW"] as const).map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setNewTaskPriority(p)}
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                                newTaskPriority === p
                                  ? p === "HIGH"
                                    ? "bg-rose-500 text-white border-rose-500"
                                    : p === "MEDIUM"
                                    ? "bg-amber-500 text-white border-amber-500"
                                    : "bg-emerald-500 text-white border-emerald-500"
                                  : "bg-card border-border/70 text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowAddInline(false)}
                            className="text-xs h-7"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            size="sm"
                            variant="cyan"
                            className="text-xs h-7 font-bold"
                          >
                            Add to Plan
                          </Button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* List of Tasks */}
                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 rounded-2xl bg-card/80 border border-border/70 flex items-center justify-between gap-3 shadow-sm hover:border-cyan-500/40 transition-all group"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-xs font-semibold text-foreground block truncate">
                            {task.title}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="bg-muted/50 px-2 py-0.5 rounded-md border border-border/60">
                              {task.project}
                            </span>
                            <span>Est: {task.estimatedMinutes}m</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant={
                              task.priority === "HIGH"
                                ? "rose"
                                : task.priority === "MEDIUM"
                                ? "amber"
                                : "emerald"
                            }
                            className="text-[9px] font-bold"
                          >
                            {task.priority}
                          </Badge>
                          <button
                            type="button"
                            onClick={() => handleRemoveTask(task.id)}
                            className="text-muted-foreground/50 hover:text-rose-400 p-1 transition-colors"
                            title="Remove from today's plan"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optional Note to Team Lead */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span>Morning Note to {leadName} (Optional)</span>
                  </label>
                  <Input
                    placeholder="e.g. Focus on finishing PR reviews before standup, then sprint deliverables..."
                    value={morningNote}
                    onChange={(e) => setMorningNote(e.target.value)}
                    className="text-xs h-9 bg-card/80 border-border/70 focus:border-cyan-500"
                  />
                </div>

                {/* Lead Recipient Info Card */}
                <div className="p-3.5 rounded-2xl bg-cyan-500/[0.06] border border-cyan-500/20 flex items-center justify-between gap-3 text-xs shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-cyan-500/20 text-cyan-400 font-black flex items-center justify-center text-xs">
                      {leadName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-foreground block">{leadName}</span>
                      <span className="text-[11px] text-muted-foreground">
                        Your Team Lead · Will verify your plan upon receipt
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-cyan-400 border-cyan-500/30">
                    Lead Verification
                  </Badge>
                </div>

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                  >
                    Review in My Tasks Later
                  </button>

                  <Button
                    onClick={handleSendToLead}
                    disabled={isSubmitting || tasks.length === 0}
                    variant="brand"
                    className="text-xs font-extrabold gap-2 px-6 h-10 rounded-2xl shadow-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    <span>Send Morning Plan to {leadName}</span>
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
