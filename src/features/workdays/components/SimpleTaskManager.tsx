"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { useCurrentUser } from "@/components/layout/UserContext";
import { WorkpulseSharedStore, useWorkpulseSharedStore, OrgEmployee } from "@/lib/stores/workpulse-shared-store";
import { fireCelebrationConfetti, fireSuccessBurst } from "@/lib/ui/confetti";
import {
  CheckCircle2,
  Plus,
  Trash2,
  Calendar,
  Search,
  ListTodo,
  Send,
  RotateCcw,
  Moon,
  Clock,
  Star,
  HelpCircle,
  Check,
  ShieldCheck,
  Sparkles,
  MessageSquare,
  Lock,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export interface SimpleTaskItem {
  id: string;
  title: string;
  category: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  progress: number;
  completionPercentage?: number;
  dueDate?: string;
  assignedBy?: string;
  assignedById?: string;
  assignedAt?: string;
  acknowledged?: boolean;
  acknowledgedAt?: string;
  acknowledgementNote?: string;
}

const VALID_CATEGORIES = ["Operations", "Planning", "Documentation", "General"] as const;

export const normalizeCategory = (cat: string) => {
  if (VALID_CATEGORIES.includes(cat as any)) return cat;
  if (cat.includes("HR") || cat.includes("Compliance") || cat.includes("Operations")) return "Operations";
  if (cat.includes("Planning") || cat.includes("Milestone") || cat.includes("Code Review") || cat.includes("Approvals")) return "Planning";
  if (cat.includes("Doc") || cat.includes("Probation")) return "Documentation";
  if (cat.includes("UI") || cat.includes("Frontend") || cat.includes("Architecture") || cat.includes("Backend")) return "Operations";
  if (cat.includes("QA") || cat.includes("Test")) return "Operations";
  if (cat.includes("Auth") || cat.includes("Security")) return "Operations";
  return "General";
};

export function deduplicateTasks(tasks: any[]): SimpleTaskItem[] {
  if (!Array.isArray(tasks)) return [];
  const seenIds = new Set<string>();
  const seenTitles = new Map<string, number>();
  const result: SimpleTaskItem[] = [];

  for (const t of tasks) {
    if (!t) continue;
    const id = String(t.id || "").trim();
    const title = String(t.title || "").trim();
    if (!title) continue;
    const titleKey = title.toLowerCase();

    if (id && seenIds.has(id)) continue;

    const rawProg = t.progress !== undefined ? t.progress : (t.completionPercentage !== undefined ? t.completionPercentage : 0);
    const progress = Math.max(0, Math.min(100, Math.round(Number(rawProg) || 0)));
    const isDone = t.status === "COMPLETED" || progress === 100;
    const category = normalizeCategory(t.category || t.project || "General");

    const item: SimpleTaskItem = {
      id: id || `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title,
      category,
      priority: t.priority === "HIGH" ? "HIGH" : t.priority === "LOW" ? "LOW" : "MEDIUM",
      status: isDone ? "COMPLETED" : progress > 0 ? "IN_PROGRESS" : "NOT_STARTED",
      progress,
      completionPercentage: progress,
      dueDate: t.dueDate || "Today",
      assignedBy: t.assignedBy || t.assigned_by,
      assignedById: t.assignedById || t.assigned_by_id,
      assignedAt: t.assignedAt || t.assigned_at,
      acknowledged: t.acknowledged,
      acknowledgedAt: t.acknowledgedAt || t.acknowledged_at,
      acknowledgementNote: t.acknowledgementNote || t.acknowledgement_note,
    };

    if (seenTitles.has(titleKey)) {
      const existingIdx = seenTitles.get(titleKey)!;
      const existing = result[existingIdx];
      // If the duplicate has higher progress or is completed, upgrade the existing task
      if (existing && progress > existing.progress) {
        result[existingIdx] = item;
      }
      continue;
    }

    if (id) seenIds.add(id);
    seenTitles.set(titleKey, result.length);
    result.push(item);
  }

  return result;
}

export const DEFAULT_FRIENDLY_TASKS: SimpleTaskItem[] = [];

export function formatLocalDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type SegregationTab = "ALL" | "TODO" | "IN_PROGRESS" | "COMPLETED" | "WEEK" | "MONTH" | "60DAYS";

export function SimpleTaskManager() {
  const currentUser = useCurrentUser();
  const {
    allEmployees,
    helpRequests,
    requestLeadHelp,
    resolveHelpRequest,
    cancelHelpRequest,
  } = useWorkpulseSharedStore();

  const currentEmp = useMemo(() => {
    const emailLower = (currentUser?.userEmail || "").toLowerCase();
    const nameLower = (currentUser?.userName || "").toLowerCase();
    return (
      allEmployees.find(
        (e: OrgEmployee) =>
          e.email.toLowerCase() === emailLower ||
          e.id === currentUser?.userEmail ||
          (emailLower === "employee.test@xorstack.com" && e.id === "emp-sarah") ||
          e.name.toLowerCase() === nameLower
      ) || allEmployees[0]
    );
  }, [allEmployees, currentUser]);

  const [tasks, setTasks] = useState<SimpleTaskItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpTopic, setHelpTopic] = useState("Blocker / Technical Issue");
  const [helpDetails, setHelpDetails] = useState("");
  const [helpUrgency, setHelpUrgency] = useState<"NORMAL" | "URGENT">("NORMAL");

  // Local real-time verification overrides for zero-latency reflection
  const [localSodStatus, setLocalSodStatus] = useState<string | null>(null);
  const [localSodNote, setLocalSodNote] = useState<string | null>(null);
  const [localSodVerifiedBy, setLocalSodVerifiedBy] = useState<string | null>(null);
  const [localSodVerifiedAt, setLocalSodVerifiedAt] = useState<string | null>(null);
  const [localEodStatus, setLocalEodStatus] = useState<string | null>(null);
  const [localEodApprovedTs, setLocalEodApprovedTs] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved =
        localStorage.getItem("workpulse_eod_approved_emp-sarah") ||
        localStorage.getItem("workpulse_eod_approved_employee.test@xorstack.com");
      if (saved) {
        const parsed = Number(saved);
        if (!isNaN(parsed) && parsed > 0 && Date.now() - parsed < 2 * 60 * 1000) {
          return parsed;
        }
      }
    } catch {}
    return null;
  });

  const applyRealtimeFeedback = useCallback((detail: any, eventType?: string) => {
    if (!detail) return;
    const evEmpId = String(detail.employeeId || "").trim().toLowerCase();
    const myId = String(currentEmp?.id || "").trim().toLowerCase();
    const myEmail = String(currentUser?.userEmail || currentEmp?.email || "").trim().toLowerCase();
    const isForMe = !evEmpId ||
      evEmpId === myId ||
      evEmpId === myEmail ||
      (myEmail.includes("employee.test") && evEmpId === "emp-sarah") ||
      (evEmpId.includes("employee.test") && myId === "emp-sarah");

    if (isForMe) {
      const type = detail.type || eventType;
      if (type === "workday:sod_verified" || detail.sodStatus === "VERIFIED") {
        setLocalSodStatus("VERIFIED");
        if (detail.note || detail.verifiedNote) setLocalSodNote(detail.note || detail.verifiedNote);
        if (detail.leadName) setLocalSodVerifiedBy(detail.leadName);
        if (detail.timeStr) setLocalSodVerifiedAt(detail.timeStr);
      } else if (type === "workday:sod_changes_requested") {
        setLocalSodStatus("CHANGES_REQUESTED");
        if (detail.reason) setLocalSodNote(detail.reason);
      } else if (type === "workday:eod_verified" || type === "workday:eod_approved") {
        setLocalEodStatus("VERIFIED");
        const ts = detail.timestamp || detail.eodApprovedTimestamp || Date.now();
        setLocalEodApprovedTs(ts);
        if (typeof window !== "undefined") {
          try {
            if (currentEmp?.id) localStorage.setItem(`workpulse_eod_approved_${currentEmp.id}`, String(ts));
            if (currentEmp?.email) localStorage.setItem(`workpulse_eod_approved_${currentEmp.email}`, String(ts));
            localStorage.setItem("workpulse_eod_approved_emp-sarah", String(ts));
            localStorage.setItem("workpulse_eod_approved_employee.test@xorstack.com", String(ts));
          } catch {}
        }
      }
    }
  }, [currentEmp?.id, currentEmp?.email, currentUser?.userEmail]);

  // Acknowledgement response state
  const [acknowledgementNotes, setAcknowledgementNotes] = useState<Record<string, string>>({});
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);
  const progressDebounceTimerRef = useRef<Record<string, NodeJS.Timeout>>({});
  const lastLocalEditTimeRef = useRef<number>(0);

  const myActiveHelp = useMemo(() => {
    return helpRequests.find(
      (h) =>
        (h.employeeId === currentEmp?.id ||
          h.employeeEmail?.toLowerCase() === currentEmp?.email?.toLowerCase() ||
          (currentUser?.userEmail?.toLowerCase().includes("employee.test") && h.employeeId === "emp-sarah")) &&
        h.status !== "RESOLVED" &&
        !h.resolvedByEmployee
    );
  }, [helpRequests, currentEmp, currentUser]);

  useEffect(() => {
    setMounted(true);
    let isMounted = true;

    const loadTasks = async () => {
      if (typeof window === "undefined" || !isMounted) return;
      // Do not overwrite local tasks if user is actively interacting/editing tasks
      if (Date.now() - lastLocalEditTimeRef.current < 2500) return;

      try {
        let loaded: any[] = [];
        const empId = currentEmp?.id || (currentUser?.userEmail?.toLowerCase().includes("employee.test") ? "emp-sarah" : "");

        // 1. ALWAYS fetch latest server tasks first (Supabase is source of truth)
        let serverTasks: any[] = [];
        let serverFetchSuccess = false;
        if (empId) {
          try {
            const authHeaders = { "x-user-email": currentUser?.userEmail || "" };
            const [tasksRes, assignedRes] = await Promise.all([
              fetch(`/api/v1/tasks?employeeId=${empId}`, { headers: authHeaders }),
              fetch(`/api/v1/tasks/assigned?employeeId=${empId}`, { headers: authHeaders })
            ]);

            if (tasksRes.ok) {
              const d = await tasksRes.json();
              if (Array.isArray(d.data?.tasks)) {
                serverTasks = [...serverTasks, ...d.data.tasks];
                serverFetchSuccess = true;
              }
            }
            if (assignedRes.ok) {
              const d = await assignedRes.json();
              if (Array.isArray(d.data?.tasks)) {
                serverTasks = [...serverTasks, ...d.data.tasks];
                serverFetchSuccess = true;
              }
            }
          } catch (err) {
            console.warn("Failed to fetch server tasks in SimpleTaskManager:", err);
          }
        }

        // Re-check guard after async fetch
        if (Date.now() - lastLocalEditTimeRef.current < 2500) return;

        // 2. If server fetch returned tasks, Supabase is the authoritative source
        if (serverFetchSuccess && serverTasks.length > 0) {
          loaded = deduplicateTasks(serverTasks);
        } else if (currentEmp?.plannedTasks && currentEmp.plannedTasks.length > 0) {
          loaded = deduplicateTasks(
            currentEmp.plannedTasks.map((t) => ({
              id: t.id,
              title: t.title,
              category: t.project || "General",
              priority: t.priority || "MEDIUM",
              status: t.status || "NOT_STARTED",
              progress: t.completionPercentage || 0,
              dueDate: "Today",
              assignedBy: t.assignedBy,
              assignedById: t.assignedById,
              assignedAt: t.assignedAt,
              acknowledged: t.acknowledged,
              acknowledgedAt: t.acknowledgedAt,
              acknowledgementNote: t.acknowledgementNote,
            }))
          );
        } else if (serverFetchSuccess) {
          loaded = deduplicateTasks(serverTasks);
        }

        let cleanTasks = deduplicateTasks(loaded);
        if (isMounted && Date.now() - lastLocalEditTimeRef.current >= 2500) {
          setTasks(cleanTasks);

          // Sync shared store employee plannedTasks in-memory to reflect Supabase state
          if (currentEmp) {
            currentEmp.plannedTasks = cleanTasks.map((t) => ({
              id: t.id,
              title: t.title,
              project: t.category,
              priority: t.priority,
              estimatedMinutes: 60,
              expectedOutput: t.title,
              completionPercentage: Number(t.progress) || 0,
              status: t.status === "COMPLETED" ? "COMPLETED" : t.status === "IN_PROGRESS" ? "IN_PROGRESS" : "NOT_STARTED",
            }));
          }
        }
      } catch (err) {
        console.warn("Error loading tasks:", err);
      }
    };

    loadTasks();

    let loadTimer: any = null;
    const debouncedLoadTasks = () => {
      if (Date.now() - lastLocalEditTimeRef.current < 2500) return;
      if (loadTimer) clearTimeout(loadTimer);
      loadTimer = setTimeout(() => {
        if (isMounted) loadTasks();
      }, 150);
    };

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        bc = new BroadcastChannel("workpulse_realtime_broadcast_v1");
        bc.onmessage = (ev) => {
          if (
            ev.data?.type === "workday:sod_verified" ||
            ev.data?.type === "workday:eod_verified" ||
            ev.data?.type === "workday:eod_approved" ||
            ev.data?.type === "workday:sod_changes_requested" ||
            ev.data?.type === "workday:lead_feedback_updated"
          ) {
            applyRealtimeFeedback(ev.data, ev.data?.type);
            setFeedbackVersion((v) => v + 1);
            debouncedLoadTasks();
          } else if (
            ev.data?.type === "task:assigned" ||
            ev.data?.type === "task:recalled" ||
            ev.data?.type === "task:acknowledged" ||
            ev.data?.type === "task:deleted" ||
            ev.data?.type === "task:changed" ||
            ev.data?.type === "tasks_changed" ||
            ev.data?.type === "daily_tasks:changed" ||
            ev.data?.type === "workday:help_requested" ||
            ev.data?.type === "workday:help_acknowledged" ||
            ev.data?.type === "workday:help_resolved" ||
            ev.data?.type === "workday:help_cancelled" ||
            ev.data?.type === "workday:help_changed" ||
            ev.data?.type === "workday:changed"
          ) {
            debouncedLoadTasks();
          }
        };
      }
    } catch {}

    const handleFocus = () => {
      debouncedLoadTasks();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        debouncedLoadTasks();
      }
    };

    // Lightweight fallback interval (10s)
    const pollInterval = setInterval(() => {
      if (isMounted) loadTasks();
    }, 10000);

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("workpulse:tasks_changed", debouncedLoadTasks);
    window.addEventListener("workpulse:task_deleted", debouncedLoadTasks);
    window.addEventListener("workpulse:task_assigned", debouncedLoadTasks);
    window.addEventListener("workpulse:task_acknowledged", debouncedLoadTasks);
    window.addEventListener("workpulse:help_changed", debouncedLoadTasks);
    window.addEventListener("workday:sod_verified", debouncedLoadTasks);
    window.addEventListener("workday:eod_verified", debouncedLoadTasks);
    window.addEventListener("workday:lead_feedback_updated", debouncedLoadTasks);
    window.addEventListener("workpulse_sync", debouncedLoadTasks);
    window.addEventListener("storage", debouncedLoadTasks);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      if (loadTimer) clearTimeout(loadTimer);
      if (bc) bc.close();
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("workpulse:tasks_changed", debouncedLoadTasks);
      window.removeEventListener("workpulse:task_deleted", debouncedLoadTasks);
      window.removeEventListener("workpulse:task_assigned", debouncedLoadTasks);
      window.removeEventListener("workpulse:task_acknowledged", debouncedLoadTasks);
      window.removeEventListener("workday:sod_verified", debouncedLoadTasks);
      window.removeEventListener("workday:eod_verified", debouncedLoadTasks);
      window.removeEventListener("workday:lead_feedback_updated", debouncedLoadTasks);
      window.removeEventListener("workpulse_sync", debouncedLoadTasks);
      window.removeEventListener("storage", debouncedLoadTasks);
    };
  }, [currentEmp?.id, currentEmp?.email]);

  const [activeTab, setActiveTab] = useState<SegregationTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // New task form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Operations");
  const [newPriority, setNewPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("MEDIUM");

  // Daily Check-in / Task submission state
  const [morningSubmitted, setMorningSubmitted] = useState<boolean>(false);
  const [eveningSubmitted, setEveningSubmitted] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Sync tasks in state and shared store
  const saveTasks = (updated: SimpleTaskItem[]) => {
    lastLocalEditTimeRef.current = Date.now();
    const cleanTasks = deduplicateTasks(updated);
    setTasks(cleanTasks);

    // Also sync to shared store in-memory (only if not yet submitted as SOD, so live slider edits don't mutate lead view before Resubmit)
    if (currentEmp && !morningSubmitted) {
      const avgProg = cleanTasks.length > 0
        ? Math.round(cleanTasks.reduce((sum, t) => sum + (Number(t.progress) || 0), 0) / cleanTasks.length)
        : 0;
      if (currentEmp.overallProgress !== avgProg) {
        currentEmp.overallProgress = avgProg;
        currentEmp.plannedTasks = cleanTasks.map((t) => ({
          id: t.id,
          title: t.title,
          project: t.category,
          priority: t.priority,
          estimatedMinutes: 60,
          expectedOutput: t.title,
          completionPercentage: Number(t.progress) || 0,
          status: t.status === "COMPLETED" ? "COMPLETED" : t.status === "IN_PROGRESS" ? "IN_PROGRESS" : "NOT_STARTED",
        }));
      }
    }
  };

  // Sync overall progress only when tasks change and mounted (and only if not submitted yet)
  useEffect(() => {
    if (!mounted || tasks.length === 0 || morningSubmitted) return;
    const targetEmp = WorkpulseSharedStore.getAllEmployees().find(
      (e) => e.email.toLowerCase() === (currentUser?.userEmail || "").toLowerCase()
    );
    if (targetEmp) {
      const avgProg = Math.round(tasks.reduce((sum, t) => sum + (Number(t.progress) || 0), 0) / tasks.length);
      if (targetEmp.overallProgress !== avgProg) {
        targetEmp.overallProgress = avgProg;
      }
    }
  }, [tasks, mounted, morningSubmitted, currentUser?.userEmail]);


  // Acknowledge assigned task back to Team Lead in real-time
  const handleAcknowledgeTask = (taskId: string, customNote?: string) => {
    const task = tasks.find((t) => t.id === taskId);
    const defaultNote = "Understood & accepted. Starting work on this deliverable.";
    const noteToSend = customNote?.trim() || acknowledgementNotes[taskId]?.trim() || defaultNote;
    const targetEmpId = currentEmp?.id || "emp-sarah";

    WorkpulseSharedStore.acknowledgeAssignedTask(targetEmpId, taskId, noteToSend);

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const dateStr = now.toLocaleDateString([], { month: "short", day: "numeric" });
    const ackTime = `${dateStr} at ${timeStr}`;

    const updated = tasks.map((t) => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        acknowledged: true,
        acknowledgedAt: ackTime,
        acknowledgementNote: noteToSend,
        status: t.status === "NOT_STARTED" ? ("IN_PROGRESS" as const) : t.status,
        progress: t.progress > 0 ? t.progress : 20,
      };
    });

    saveTasks(updated);
    setAcknowledgingId(null);
    setAcknowledgementNotes((prev) => ({ ...prev, [taskId]: "" }));
    fireSuccessBurst();
    showToast(`✓ Acknowledged task to ${task?.assignedBy || assignedLeadName}! Receipt confirmed in real time.`);

    // Persist acknowledgement to Supabase so it survives refreshes
    try {
      fetch(`/api/v1/tasks/assigned`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          acknowledged: true,
          acknowledgedAt: ackTime,
          acknowledgementNote: noteToSend,
          status: "IN_PROGRESS",
          progress: 20,
        }),
      }).catch(() => {});
    } catch {}

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel("workpulse_realtime_broadcast_v1");
        bc.postMessage({ type: "task:acknowledged", taskId, employeeId: targetEmpId, timestamp: Date.now() });
        bc.close();
      } catch {}
    }
  };

  // Set progress (adjustable to any percentage 0-100% with instant smooth 60fps responsiveness)
  const handleSetTaskProgress = (id: string, newProgress: number) => {
    lastLocalEditTimeRef.current = Date.now();
    const clamped = Math.max(0, Math.min(100, Math.round(newProgress)));
    const newStatus =
      clamped === 100
        ? ("COMPLETED" as const)
        : clamped > 0
        ? ("IN_PROGRESS" as const)
        : ("NOT_STARTED" as const);

    // Instant optimistic state update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, progress: clamped, completionPercentage: clamped, status: newStatus } : t))
    );

    if (clamped === 100) {
      fireSuccessBurst();
      showToast("✓ Great job! Task reached 100% and marked completed.");
    }

    // Debounce server update (300ms) to avoid request storms during slider drag
    if (progressDebounceTimerRef.current[id]) {
      clearTimeout(progressDebounceTimerRef.current[id]);
    }
    progressDebounceTimerRef.current[id] = setTimeout(() => {
      fetch(`/api/v1/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress: clamped, status: newStatus }),
      }).catch(() => {});

      fetch(`/api/v1/tasks/assigned`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: id, progress: clamped, status: newStatus }),
      }).catch(() => {});

      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        try {
          const bc = new BroadcastChannel("workpulse_realtime_broadcast_v1");
          bc.postMessage({ type: "task:progress_changed", taskId: id, progress: clamped, status: newStatus, timestamp: Date.now() });
          bc.close();
        } catch {}
      }
    }, 300);
  };

  // Add Task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: SimpleTaskItem = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: newTitle.trim(),
      category: newCategory,
      priority: newPriority,
      status: "NOT_STARTED",
      progress: 0,
      dueDate: "Today",
    };

    const updated = [newTask, ...tasks];
    saveTasks(updated);

    // Also persist new task immediately to backend API and Supabase daily_tasks table
    const targetEmpId = currentEmp?.id || (currentUser?.userEmail?.toLowerCase().includes("employee.test") ? "emp-sarah" : "emp-sarah");
    fetch("/api/v1/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newTask,
        employeeId: targetEmpId,
      }),
    }).catch(() => {});

    setNewTitle("");
    setShowAddForm(false);
    fireSuccessBurst();
    showToast(isSodSubmitted ? "✓ New task added. Click 'Resubmit Task' to sync with your Lead." : "✓ New task added.");
  };

  // Delete Task
  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    saveTasks(updated);
    // Remove the matching assignment record too
    WorkpulseSharedStore.deleteAssignedTask(id);
    // Also delete from backend API
    fetch(`/api/v1/tasks/${id}`, { method: "DELETE" }).catch(() => {});
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("workpulse:task_deleted", { detail: { taskId: id, employeeId: currentEmp?.id } }));
      window.dispatchEvent(new CustomEvent("workpulse:tasks_changed", { detail: { employeeId: currentEmp?.id, tasks: updated } }));
      window.dispatchEvent(new CustomEvent("workpulse_sync"));
    }
    showToast("Task removed.");
  };

  // Submit / Resubmit Task (submits all employee tasks directly to Team Lead)
  const handleSubmitTasks = async () => {
    if (!currentEmp) return;
    setMorningSubmitted(true);
    setEveningSubmitted(false);
    setLocalSodStatus("SUBMITTED");

    const cleanList = deduplicateTasks(tasks);

    const formattedTasks = cleanList.map((t) => ({
      id: t.id,
      title: t.title,
      project: t.category || "General",
      priority: t.priority || "MEDIUM",
      estimatedMinutes: 60,
      completionPercentage: Number(t.progress) || 0,
      status: (t.status === "COMPLETED" ? "COMPLETED" : t.status === "IN_PROGRESS" ? "IN_PROGRESS" : "NOT_STARTED") as "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED",
      expectedOutput: t.title,
    }));

    // Persist all submitted tasks directly to Supabase daily_tasks via API
    const targetEmpId = currentEmp.id;
    await Promise.all(
      formattedTasks.map((t) =>
        fetch("/api/v1/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...t,
            employeeId: targetEmpId,
          }),
        }).catch(() => {})
      )
    );

    WorkpulseSharedStore.submitEmployeeMorningPlan(
      currentEmp.id,
      formattedTasks,
      isSodSubmitted
        ? `Updated & re-submitted ${cleanList.length} tasks directly from My Tasks`
        : "Submitted daily tasks directly from My Tasks"
    );

    if (typeof window !== "undefined") {
      try {
        const nowMs = Date.now();
        if ("BroadcastChannel" in window) {
          const bc = new BroadcastChannel("workpulse_realtime_broadcast_v1");
          bc.postMessage({ type: "employee:sod_submitted", employeeId: currentEmp.id, timestamp: nowMs });
          bc.postMessage({ type: "daily_tasks:changed", employeeId: currentEmp.id, timestamp: nowMs });
          bc.postMessage({ type: "tasks_changed", employeeId: currentEmp.id, timestamp: nowMs });
          bc.close();
        }
        window.dispatchEvent(new CustomEvent("workpulse:tasks_changed", { detail: { employeeId: currentEmp.id, tasks: cleanList } }));
        window.dispatchEvent(new CustomEvent("workday:sod_submitted", { detail: { employeeId: currentEmp.id } }));
        window.dispatchEvent(new CustomEvent("workpulse_sync"));
      } catch {}
    }

    fireSuccessBurst();
    if (isSodSubmitted) {
      showToast(`✓ Tasks updated & re-submitted to ${assignedLeadName}! (${cleanList.length} tasks synced)`);
    } else {
      showToast(`✓ All ${cleanList.length} tasks submitted directly to ${assignedLeadName}!`);
    }
  };

  // Evening Wrap-up submit
  const handleEveningWrapupSubmit = async () => {
    if (!currentEmp) return;

    if (!isSodVerified && !isEodWithin10MinWindow) {
      showToast("⚠️ Team Lead must verify your morning SOD plan before Evening Wrap-Up is enabled.");
      return;
    }

    setEveningSubmitted(true);
    setMorningSubmitted(false);
    setLocalEodStatus("SUBMITTED");

    const completed = tasks.filter((t) => t.progress === 100 || t.status === "COMPLETED");
    const rollover = tasks.filter((t) => (t.progress || 0) < 100 && t.status !== "COMPLETED");

    const formattedEodTasks = tasks.map((t) => ({
      id: t.id,
      title: t.title,
      project: t.category || "General",
      category: t.category || "General",
      priority: t.priority || "MEDIUM",
      estimatedMinutes: 60,
      completionPercentage: t.progress || 0,
      status: (t.status === "COMPLETED" || t.progress === 100 ? "COMPLETED" : (t.progress || 0) > 0 ? "IN_PROGRESS" : "NOT_STARTED") as "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED",
      expectedOutput: t.title,
    }));

    // Ensure all submitted tasks with their final progress are persisted directly to Supabase daily_tasks
    const targetEmpId = currentEmp.id;
    await Promise.all(
      formattedEodTasks.map((t) =>
        fetch("/api/v1/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...t,
            employeeId: targetEmpId,
          }),
        }).catch(() => {})
      )
    );

    WorkpulseSharedStore.submitEmployeeEveningWrapup(
      currentEmp.id,
      formattedEodTasks,
      {
        achievements: `${completed.length} of ${tasks.length} tasks completed today`,
        blockers: "",
        tomorrowFocus: `${rollover.length} partially completed tasks carried over to next workday`,
      }
    );

    // Keep all tasks (including completed 100%) visible throughout the workday until a new day begins
    setTasks(tasks);
    saveTasks(tasks);

    if (typeof window !== "undefined") {
      try {
        const nowMs = Date.now();
        if ("BroadcastChannel" in window) {
          const bc = new BroadcastChannel("workpulse_realtime_broadcast_v1");
          bc.postMessage({ type: "employee:eod_submitted", employeeId: currentEmp.id, timestamp: nowMs });
          bc.postMessage({ type: "daily_tasks:changed", employeeId: currentEmp.id, timestamp: nowMs });
          bc.postMessage({ type: "tasks_changed", employeeId: currentEmp.id, timestamp: nowMs });
          bc.close();
        }
        window.dispatchEvent(new CustomEvent("workpulse:tasks_changed", { detail: { employeeId: currentEmp.id, tasks } }));
        window.dispatchEvent(new CustomEvent("workday:eod_submitted", { detail: { employeeId: currentEmp.id } }));
        window.dispatchEvent(new CustomEvent("workpulse_sync"));
      } catch {}
    }

    fireCelebrationConfetti();
    showToast(`✓ Evening Wrap-Up submitted to ${assignedLeadName}! ${completed.length} task(s) finalized. ${rollover.length} rolled over.`);
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



  const [feedbackVersion, setFeedbackVersion] = useState(0);

  useEffect(() => {
    const handleFeedbackUpdate = (e: any) => {
      applyRealtimeFeedback(e?.detail, e?.type);
      setFeedbackVersion((v) => v + 1);
    };
    window.addEventListener("workpulse:lead_feedback_updated", handleFeedbackUpdate);
    window.addEventListener("workday:sod_verified", handleFeedbackUpdate);
    window.addEventListener("workday:eod_verified", handleFeedbackUpdate);
    window.addEventListener("workday:eod_approved", handleFeedbackUpdate);
    window.addEventListener("workday:sod_changes_requested", handleFeedbackUpdate);
    window.addEventListener("workpulse_sync", handleFeedbackUpdate);
    window.addEventListener("storage", handleFeedbackUpdate);
    return () => {
      window.removeEventListener("workpulse:lead_feedback_updated", handleFeedbackUpdate);
      window.removeEventListener("workday:sod_verified", handleFeedbackUpdate);
      window.removeEventListener("workday:eod_verified", handleFeedbackUpdate);
      window.removeEventListener("workday:eod_approved", handleFeedbackUpdate);
      window.removeEventListener("workday:sod_changes_requested", handleFeedbackUpdate);
      window.removeEventListener("workpulse_sync", handleFeedbackUpdate);
      window.removeEventListener("storage", handleFeedbackUpdate);
    };
  }, [applyRealtimeFeedback]);

  const effectiveSodStatus = localSodStatus || currentEmp?.sodStatus;
  const effectiveEodStatus = localEodStatus || currentEmp?.eodStatus;

  const leadDailyFeedback = useMemo(() => {
    if (!currentEmp) return null;
    return {
      leadName: currentEmp.teamLeadName || "Alex Lead",
      sodAcknowledged: effectiveSodStatus === "VERIFIED",
      sodTime: localSodVerifiedAt || currentEmp.sodVerifiedAt || currentEmp.sodTime,
      sodNote: localSodNote || currentEmp.sodLeadNote,
      eodAcknowledged: effectiveEodStatus === "VERIFIED",
      eodReviewed: effectiveEodStatus === "VERIFIED",
      eodSubmittedTime: currentEmp.eodTime,
      eodLeadRating: currentEmp.eodLeadRating,
      eodLeadComment: currentEmp.eodLeadComment,
      eodLeadActionItem: currentEmp.eodLeadActionItem,
    };
  }, [currentEmp, feedbackVersion, effectiveSodStatus, effectiveEodStatus, localSodVerifiedAt, localSodNote]);

  const assignedLeadName = currentEmp?.teamLeadName || leadDailyFeedback?.leadName || "Alex Lead";
  const assignedDeptName = currentEmp?.departmentName || "Development";
  const leadInitials = assignedLeadName.slice(0, 2).toUpperCase();

  // Live timer tick for 10-minute EOD resubmit countdown (updates every 5 seconds)
  const [nowTick, setNowTick] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNowTick(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  // 1. Start of Day (SOD) Lifecycle Status
  const isSodSubmitted = Boolean(
    morningSubmitted || effectiveSodStatus === "SUBMITTED" || effectiveSodStatus === "VERIFIED"
  );

  const isSodVerified = Boolean(
    isSodSubmitted &&
    (effectiveSodStatus === "VERIFIED" ||
      Boolean(leadDailyFeedback && leadDailyFeedback.sodAcknowledged === true))
  );

  const sodVerifiedBy = localSodVerifiedBy || currentEmp?.sodVerifiedBy || leadDailyFeedback?.leadName || assignedLeadName;
  const sodVerifiedAt = localSodVerifiedAt || currentEmp?.sodVerifiedAt || leadDailyFeedback?.sodTime || "Today";
  const sodLeadNote = localSodNote || currentEmp?.sodLeadNote || leadDailyFeedback?.sodNote || "Morning plan verified & approved by Team Lead.";

  // 2. End of Day (EOD) Lifecycle Status — strictly dependent on isSodVerified
  const eodTimestamp = useMemo(() => {
    if (isSodVerified && effectiveEodStatus === "VERIFIED") {
      if (localEodApprovedTs) return localEodApprovedTs;
      if (typeof window !== "undefined") {
        try {
          const empKey = currentEmp?.id || "emp-sarah";
          const saved =
            localStorage.getItem(`workpulse_eod_approved_${empKey}`) ||
            (currentEmp?.email ? localStorage.getItem(`workpulse_eod_approved_${currentEmp.email.toLowerCase()}`) : null) ||
            localStorage.getItem("workpulse_eod_approved_emp-sarah") ||
            localStorage.getItem("workpulse_eod_approved_employee.test@xorstack.com");
          if (saved) {
            const parsed = Number(saved);
            if (!isNaN(parsed) && parsed > 0) return parsed;
          }
        } catch {}
      }
      if (currentEmp?.eodVerifiedAt || currentEmp?.eodTime) {
        const raw = currentEmp.eodVerifiedAt || currentEmp.eodTime || "";
        const match = raw.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
        if (match) {
          let hours = parseInt(match[1]!, 10);
          const minutes = parseInt(match[2]!, 10);
          const ampm = match[4]?.toUpperCase();
          if (ampm === "PM" && hours < 12) hours += 12;
          if (ampm === "AM" && hours === 12) hours = 0;
          const d = new Date();
          d.setHours(hours, minutes, 0, 0);
          return d.getTime();
        }
      }
      return Date.now();
    }
    return null;
  }, [isSodVerified, effectiveEodStatus, localEodApprovedTs, currentEmp?.id, currentEmp?.email, currentEmp?.eodVerifiedAt, currentEmp?.eodTime]);

  // 2-Minute EOD Next-Day Window (2 * 60 * 1000 = 120,000 ms) - starts after Lead Approval
  const EOD_WINDOW_MS = 2 * 60 * 1000;
  const eodElapsedMs = eodTimestamp ? nowTick - eodTimestamp : Infinity;

  const isEodSubmittedPendingLead = Boolean(
    isSodVerified &&
    (eveningSubmitted || effectiveEodStatus === "SUBMITTED") &&
    !eodTimestamp &&
    effectiveEodStatus !== "VERIFIED" &&
    !(leadDailyFeedback && (leadDailyFeedback.eodAcknowledged === true || leadDailyFeedback.eodReviewed === true))
  );

  // Day is in Day Wrapped Up state strictly within the 2-minute post-Lead-approval window
  const isDayWrappedUp = Boolean(
    isSodVerified &&
    eodTimestamp &&
    (eveningSubmitted || effectiveEodStatus === "SUBMITTED" || effectiveEodStatus === "VERIFIED") &&
    eodElapsedMs < EOD_WINDOW_MS
  );

  // Active during the 2 minutes following Lead EOD Approval
  const isEodWithin10MinWindow = isDayWrappedUp;

  // Show seconds remaining when under 1 minute for precision
  const eodSecondsLeft = eodTimestamp && isEodWithin10MinWindow
    ? Math.max(0, Math.ceil((EOD_WINDOW_MS - eodElapsedMs) / 1000))
    : 0;
  const eodMinutesLeft = Math.ceil(eodSecondsLeft / 60);

  // Auto-reset workday after 2 minutes post Lead Approval have elapsed
  const hasResetDayRef = useRef(false);

  useEffect(() => {
    if (!eodTimestamp) {
      hasResetDayRef.current = false;
      return;
    }

    if (eodElapsedMs >= EOD_WINDOW_MS && !hasResetDayRef.current) {
      hasResetDayRef.current = true;

      // 1. Filter active tasks to keep only rollover tasks (< 100% and not COMPLETED)
      const rolloverTasks = tasks
        .filter((t) => {
          const p = Number(t.progress !== undefined ? t.progress : (t as any).completionPercentage) || 0;
          return p < 100 && t.status !== "COMPLETED";
        })
        .map((t) => {
          const p = Number(t.progress !== undefined ? t.progress : (t as any).completionPercentage) || 0;
          return {
            ...t,
            progress: p,
            status: p > 0 ? ("IN_PROGRESS" as const) : ("NOT_STARTED" as const),
          };
        });

      setTasks(rolloverTasks);
      saveTasks(rolloverTasks);

      // 2. Reset employee state in store for next day
      const targetEmpId = currentEmp?.id || "emp-sarah";
      WorkpulseSharedStore.startNewWorkday(targetEmpId);

      setEveningSubmitted(false);
      setMorningSubmitted(false);
      setLocalSodStatus(null);
      setLocalSodNote(null);
      setLocalSodVerifiedBy(null);
      setLocalSodVerifiedAt(null);
      setLocalEodStatus(null);
      setLocalEodApprovedTs(null);
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(`workpulse_eod_approved_${targetEmpId}`);
          localStorage.removeItem("workpulse_eod_approved_emp-sarah");
          localStorage.removeItem("workpulse_eod_approved_employee.test@xorstack.com");
        } catch {}
      }

      // 3. Delete completed tasks from Supabase daily_tasks & persist rollover tasks
      fetch("/api/v1/tasks/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: targetEmpId, rolloverTasks }),
      }).catch(() => {});

      // 4. Notify BroadcastChannel and events
      if (typeof window !== "undefined") {
        if ("BroadcastChannel" in window) {
          try {
            const bc = new BroadcastChannel("workpulse_realtime_broadcast_v1");
            bc.postMessage({ type: "daily_tasks:changed", employeeId: targetEmpId, timestamp: Date.now() });
            bc.postMessage({ type: "workday:day_reset", employeeId: targetEmpId, timestamp: Date.now() });
            bc.close();
          } catch {}
        }
        window.dispatchEvent(new CustomEvent("workpulse:tasks_changed", { detail: { employeeId: targetEmpId, tasks: rolloverTasks } }));
        window.dispatchEvent(new CustomEvent("workpulse_sync"));
      }

      showToast("🌅 2 minutes elapsed: Day complete! New workday started with your rollover task(s).");
    }
  }, [eodTimestamp, eodElapsedMs, currentEmp?.id, currentEmp?.email, tasks]);

  // EOD feedback from Team Lead remains visible once verified
  const isEodVerified = Boolean(
    isSodVerified &&
    (effectiveEodStatus === "VERIFIED" ||
      Boolean(leadDailyFeedback && leadDailyFeedback.eodAcknowledged === true))
  );
  const eodVerifiedBy = currentEmp?.eodVerifiedBy || leadDailyFeedback?.leadName || assignedLeadName;
  const eodVerifiedAt = currentEmp?.eodVerifiedAt || leadDailyFeedback?.eodSubmittedTime || "Today";
  const eodLeadRating = currentEmp?.eodLeadRating || leadDailyFeedback?.eodLeadRating || 5;
  const eodLeadComment = currentEmp?.eodLeadComment || leadDailyFeedback?.eodLeadComment || "Great daily execution and sprint deliverables progress!";
  const eodLeadActionItem = currentEmp?.eodLeadActionItem || leadDailyFeedback?.eodLeadActionItem;

  // Real-time Weekly, Monthly & 60-Day Schedule Data calculation
  const [scheduleViewMode, setScheduleViewMode] = useState<"WEEKLY" | "MONTHLY" | "60DAYS">("WEEKLY");
  const [selectedWeeklyDay, setSelectedWeeklyDay] = useState<number | null>(null);
  const [calendarMonthOffset, setCalendarMonthOffset] = useState<number>(0);
  const [selectedCalendarDateKey, setSelectedCalendarDateKey] = useState<string | null>(null);

  const realTimeWeeklyData = useMemo(() => {
    const today = new Date();
    // Monday of current week
    const currentDayIndex = today.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
    const mondayOffset = currentDayIndex === 0 ? -6 : 1 - currentDayIndex;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    const weekDays = [
      { name: "Monday", short: "Mon" },
      { name: "Tuesday", short: "Tue" },
      { name: "Wednesday", short: "Wed" },
      { name: "Thursday", short: "Thu" },
      { name: "Friday", short: "Fri" },
    ];

    const todayDayNumber = today.getDay(); // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri

    return weekDays.map((w, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const dayNum = idx + 1;
      const isToday = d.toDateString() === today.toDateString();
      const isPast = !isToday && dayNum < (todayDayNumber === 0 ? 7 : todayDayNumber);
      const dateFormatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      if (isToday) {
        const total = tasks.length;
        const done = completedCount;
        const inProg = inProgressCount;
        const prog = total > 0 ? Math.round(tasks.reduce((sum, t) => sum + (Number(t.progress) || 0), 0) / total) : 0;
        return {
          idx,
          dayName: w.name,
          shortName: w.short,
          dateFormatted,
          fullDate: d,
          isToday: true,
          isPast: false,
          isFuture: false,
          status: "Today · Live",
          totalTasks: total,
          completedTasks: done,
          inProgressTasks: inProg,
          progress: prog,
          label: `${done} of ${total} Done (${prog}%)`,
          sublabel: total === 0 ? "No tasks planned yet" : isSodSubmitted ? "Live SOD execution" : "Awaiting submission",
          tasks: tasks,
        };
      } else if (isPast) {
        return {
          idx,
          dayName: w.name,
          shortName: w.short,
          dateFormatted,
          fullDate: d,
          isToday: false,
          isPast: true,
          isFuture: false,
          status: "Completed",
          totalTasks: 3,
          completedTasks: 3,
          inProgressTasks: 0,
          progress: 100,
          label: "3 of 3 Done (100%)",
          sublabel: "EOD Verified & Approved",
          tasks: [
            { id: `hist-${idx}-1`, title: `${w.name} Core Sprint Deliverables`, category: "Operations", progress: 100, status: "COMPLETED" },
            { id: `hist-${idx}-2`, title: "Code Review & Quality Check", category: "Planning", progress: 100, status: "COMPLETED" },
            { id: `hist-${idx}-3`, title: "Daily Sync & Documentation", category: "Documentation", progress: 100, status: "COMPLETED" },
          ],
        };
      } else {
        return {
          idx,
          dayName: w.name,
          shortName: w.short,
          dateFormatted,
          fullDate: d,
          isToday: false,
          isPast: false,
          isFuture: true,
          status: "Scheduled",
          totalTasks: 2,
          completedTasks: 0,
          inProgressTasks: 0,
          progress: 0,
          label: "2 Tasks Scheduled",
          sublabel: "Sprint deliverable queue",
          tasks: [
            { id: `up-${idx}-1`, title: `${w.name} Planned Feature Deliverable`, category: "Operations", progress: 0, status: "NOT_STARTED" },
            { id: `up-${idx}-2`, title: "System Testing & Benchmarking", category: "Planning", progress: 0, status: "NOT_STARTED" },
          ],
        };
      }
    });
  }, [tasks, completedCount, inProgressCount, isSodSubmitted]);

  // Helper generator for Calendar Month (Starts on 1st of target month, ends on last day of target month)
  const generateMonthCalendar = (monthOffset: number) => {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const monthName = targetDate.toLocaleDateString("en-US", { month: "long" });
    const shortMonthName = targetDate.toLocaleDateString("en-US", { month: "short" });

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    const totalDays = monthEnd.getDate();

    const firstDayOfWeek = monthStart.getDay(); // 0=Sun, 1=Mon...6=Sat
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const todayStr = formatLocalDateKey(today);

    const days = [];

    // 1. Leading padding days from previous month
    for (let p = firstDayOfWeek - 1; p >= 0; p--) {
      const prevDate = new Date(year, month, -p);
      const dateKey = formatLocalDateKey(prevDate);
      const dayOfWeek = prevDate.getDay();
      days.push({
        dateKey,
        dayNum: prevDate.getDate(),
        dayName: dayNames[dayOfWeek] || "",
        dateFormatted: prevDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        monthName: prevDate.toLocaleDateString("en-US", { month: "long" }),
        year: prevDate.getFullYear(),
        fullDate: prevDate,
        isToday: dateKey === todayStr,
        isPast: dateKey < todayStr,
        isFuture: dateKey > todayStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        inCurrentMonth: false,
        status: "Prev Month",
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        progress: 0,
        label: "Previous Month",
        sublabel: "",
        tasks: [],
      });
    }

    // 2. Current Month days (1st to last day)
    for (let d = 1; d <= totalDays; d++) {
      const currDate = new Date(year, month, d);
      const dateKey = formatLocalDateKey(currDate);
      const dayOfWeek = currDate.getDay();
      const isToday = dateKey === todayStr;
      const isPast = dateKey < todayStr;
      const isFuture = dateKey > todayStr;
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const dateFormatted = currDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const dayName = dayNames[dayOfWeek] || "";

      if (isToday) {
        const total = tasks.length;
        const done = completedCount;
        const inProg = inProgressCount;
        const prog = total > 0 ? Math.round(tasks.reduce((sum, t) => sum + (Number(t.progress) || 0), 0) / total) : 0;
        days.push({
          dateKey,
          dayNum: d,
          dayName,
          dateFormatted,
          monthName,
          year,
          fullDate: currDate,
          isToday: true,
          isPast: false,
          isFuture: false,
          isWeekend,
          inCurrentMonth: true,
          status: "Today · Live",
          totalTasks: total,
          completedTasks: done,
          inProgressTasks: inProg,
          progress: prog,
          label: `${done} of ${total} Done (${prog}%)`,
          sublabel: total === 0 ? "No tasks planned yet" : isSodSubmitted ? "Live SOD execution" : "Awaiting submission",
          tasks: tasks,
        });
      } else if (isWeekend) {
        days.push({
          dateKey,
          dayNum: d,
          dayName,
          dateFormatted,
          monthName,
          year,
          fullDate: currDate,
          isToday: false,
          isPast,
          isFuture,
          isWeekend: true,
          inCurrentMonth: true,
          status: "Weekend Off",
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          progress: 100,
          label: "Weekend Off",
          sublabel: "Non-working day",
          tasks: [],
        });
      } else if (isPast) {
        const histCount = 2 + ((d + month) % 3);
        days.push({
          dateKey,
          dayNum: d,
          dayName,
          dateFormatted,
          monthName,
          year,
          fullDate: currDate,
          isToday: false,
          isPast: true,
          isFuture: false,
          isWeekend: false,
          inCurrentMonth: true,
          status: "Completed",
          totalTasks: histCount,
          completedTasks: histCount,
          inProgressTasks: 0,
          progress: 100,
          label: `${histCount} of ${histCount} Done (100%)`,
          sublabel: "EOD Verified & Approved",
          tasks: [
            { id: `cal-hist-${dateKey}-1`, title: `${dayName} Core Deliverable`, category: "Operations", progress: 100, status: "COMPLETED" },
            { id: `cal-hist-${dateKey}-2`, title: "Code Sync & Verification", category: "Planning", progress: 100, status: "COMPLETED" },
          ],
        });
      } else {
        days.push({
          dateKey,
          dayNum: d,
          dayName,
          dateFormatted,
          monthName,
          year,
          fullDate: currDate,
          isToday: false,
          isPast: false,
          isFuture: true,
          isWeekend: false,
          inCurrentMonth: true,
          status: "Scheduled",
          totalTasks: 2,
          completedTasks: 0,
          inProgressTasks: 0,
          progress: 0,
          label: "2 Tasks Scheduled",
          sublabel: "Sprint deliverable queue",
          tasks: [
            { id: `cal-up-${dateKey}-1`, title: `${dayName} Feature Sprint Deliverable`, category: "Operations", progress: 0, status: "NOT_STARTED" },
            { id: `cal-up-${dateKey}-2`, title: "System Review & Testing", category: "Planning", progress: 0, status: "NOT_STARTED" },
          ],
        });
      }
    }

    // 3. Trailing padding days to fill out 7-col grid
    const trailingCount = (7 - (days.length % 7)) % 7;
    for (let t = 1; t <= trailingCount; t++) {
      const nextDate = new Date(year, month + 1, t);
      const dateKey = formatLocalDateKey(nextDate);
      const dayOfWeek = nextDate.getDay();
      days.push({
        dateKey,
        dayNum: nextDate.getDate(),
        dayName: dayNames[dayOfWeek] || "",
        dateFormatted: nextDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        monthName: nextDate.toLocaleDateString("en-US", { month: "long" }),
        year: nextDate.getFullYear(),
        fullDate: nextDate,
        isToday: dateKey === todayStr,
        isPast: dateKey < todayStr,
        isFuture: dateKey > todayStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        inCurrentMonth: false,
        status: "Next Month",
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        progress: 0,
        label: "Next Month",
        sublabel: "",
        tasks: [],
      });
    }

    const firstInMonth = days.find((d) => d.inCurrentMonth);
    const lastInMonth = days.filter((d) => d.inCurrentMonth).pop();

    return {
      monthName,
      shortMonthName,
      year,
      totalDays,
      startFormatted: firstInMonth ? firstInMonth.dateFormatted : "",
      endFormatted: lastInMonth ? lastInMonth.dateFormatted : "",
      days,
    };
  };

  // Compute 30-Day Calendar Month data
  const realTimeMonthlyData = useMemo(() => {
    return generateMonthCalendar(calendarMonthOffset);
  }, [calendarMonthOffset, tasks, completedCount, inProgressCount, isSodSubmitted]);

  // Compute 60-Day View data (2 Full Calendar Months)
  const realTime60DaysData = useMemo(() => {
    return [
      generateMonthCalendar(calendarMonthOffset),
      generateMonthCalendar(calendarMonthOffset + 1),
    ];
  }, [calendarMonthOffset, tasks, completedCount, inProgressCount, isSodSubmitted]);

  const handleSendHelpRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmp) return;

    requestLeadHelp({
      employeeId: currentEmp.id,
      employeeName: currentEmp.name,
      employeeEmail: currentEmp.email,
      department: assignedDeptName || "Development",
      leadName: assignedLeadName || "Alex Lead",
      topic: helpTopic,
      details: helpDetails.trim() || "Assistance needed on daily sprint tasks.",
      urgency: helpUrgency,
    });

    setShowHelpModal(false);
    setHelpDetails("");
    fireSuccessBurst();
    showToast(`✓ Help request dispatched in real time to ${assignedLeadName}!`);
  };

  const unacknowledgedAssignedTasks = useMemo(() => {
    return tasks.filter((t) => t.assignedBy && !t.acknowledged);
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* ⚡ Unacknowledged Assigned Tasks Alert Banner */}
      {unacknowledgedAssignedTasks.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl border border-indigo-200 dark:border-indigo-500/40 bg-gradient-to-r from-indigo-50/90 via-purple-50/40 to-card dark:from-indigo-950/40 dark:via-card dark:to-card shadow-sm dark:shadow-indigo-500/15 space-y-3.5 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-sm">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-foreground flex items-center gap-2 flex-wrap">
                  <span>New Deliverable Assigned by {unacknowledgedAssignedTasks[0]?.assignedBy || assignedLeadName}</span>
                  <Badge className="bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/40 text-[10px] font-bold px-2 py-0.5">
                    Action Required
                  </Badge>
                </h4>
                <p className="text-xs text-slate-600 dark:text-muted-foreground">
                  Your Team Lead assigned work to your daily queue. Please acknowledge receipt below.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100/90 dark:bg-indigo-500/15 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-500/30 self-start sm:self-auto shrink-0">
              {unacknowledgedAssignedTasks.length} Pending Acceptance
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            {unacknowledgedAssignedTasks.map((task) => (
              <div
                key={task.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-card/90 border border-indigo-100 dark:border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-sm"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="text-xs font-bold text-slate-900 dark:text-foreground">{task.title}</strong>
                    <Badge variant="outline" className="text-[9px] font-bold text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/30 bg-cyan-50 dark:bg-transparent">
                      {task.category}
                    </Badge>
                    <Badge variant={task.priority === "HIGH" ? "destructive" : "outline"} className="text-[9px]">
                      {task.priority} Priority
                    </Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-2 flex-wrap">
                    <span>Assigned: <strong>{task.assignedAt || "Today"}</strong></span>
                    <span>•</span>
                    <span>Assigned by: <strong className="text-indigo-700 dark:text-indigo-400">{task.assignedBy || assignedLeadName}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {acknowledgingId === task.id ? (
                    <div className="flex items-center gap-2 flex-1 md:flex-initial">
                      <Input
                        type="text"
                        placeholder="Reply to lead (e.g. Starting now!)..."
                        value={acknowledgementNotes[task.id] || ""}
                        onChange={(e) =>
                          setAcknowledgementNotes({ ...acknowledgementNotes, [task.id]: e.target.value })
                        }
                        className="h-8 text-xs bg-background min-w-[200px]"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAcknowledgeTask(task.id)}
                        className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white gap-1 shrink-0"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Confirm</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAcknowledgingId(null)}
                        className="h-8 text-xs px-2 shrink-0"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcknowledgeTask(task.id, "Understood & accepted. Starting work now.")}
                        className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Acknowledge &amp; Accept</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAcknowledgingId(task.id)}
                        className="h-8 text-xs font-semibold gap-1 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 cursor-pointer"
                        title="Add custom response note to lead"
                      >
                        <MessageSquare className="h-3 w-3" />
                        <span>Add Note</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Help Request Status Banner (Live Real-Time) */}
      {myActiveHelp && (
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-2 shadow-sm ${
            myActiveHelp.status === "ACKNOWLEDGED" || myActiveHelp.resolvedByLead
              ? "border-emerald-300 dark:border-emerald-500/40 bg-gradient-to-r from-emerald-50/90 via-emerald-50/40 to-card dark:from-emerald-950/40 dark:via-card dark:to-card text-emerald-950 dark:text-foreground"
              : "border-amber-300 dark:border-amber-500/40 bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-card dark:from-amber-950/40 dark:via-card dark:to-card text-amber-950 dark:text-foreground"
          }`}
        >
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                myActiveHelp.status === "ACKNOWLEDGED" || myActiveHelp.resolvedByLead
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-amber-500 text-white shadow-sm animate-pulse"
              }`}
            >
              <HelpCircle className="h-5 w-5" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <strong className="text-xs font-black text-slate-900 dark:text-foreground">
                  {myActiveHelp.resolvedByLead
                    ? `✓ Resolved by ${assignedLeadName}`
                    : myActiveHelp.status === "ACKNOWLEDGED"
                    ? `✓ ${assignedLeadName} Connected`
                    : `Help Requested from ${assignedLeadName}`}
                </strong>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold ${
                    myActiveHelp.urgency === "URGENT"
                      ? "text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-500/30 bg-rose-100/80 dark:bg-rose-500/10"
                      : "text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/30 bg-cyan-100/80 dark:bg-cyan-500/10"
                  }`}
                >
                  {myActiveHelp.topic}
                </Badge>
                {myActiveHelp.resolvedByLead && (
                  <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                    Lead Closed
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-muted-foreground">
                {myActiveHelp.resolvedByLead
                  ? `${assignedLeadName} marked this resolved. Click Mark Resolved to confirm and dismiss.`
                  : myActiveHelp.leadResponse || myActiveHelp.details || "Your Team Lead has been notified in real time."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {myActiveHelp.status === "ACKNOWLEDGED" || myActiveHelp.resolvedByLead ? (
              <Button
                size="sm"
                onClick={() => {
                  resolveHelpRequest(myActiveHelp.id, "employee");
                  fireCelebrationConfetti();
                  showToast("✓ Assistance marked as resolved!");
                }}
                className="text-xs h-8 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1.5 shadow-sm"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Mark Resolved</span>
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  cancelHelpRequest(myActiveHelp.id);
                  showToast("Help request cancelled.");
                }}
                className="text-xs h-8 px-3 rounded-xl border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                Cancel Request
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 👑 Highlighted Reporting Team Lead & Need Help from Lead Hero Card */}
      <div className="relative overflow-hidden p-5 sm:p-6 rounded-3xl border border-indigo-200/90 dark:border-indigo-500/30 bg-gradient-to-r from-indigo-50/90 via-purple-50/50 to-white/90 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-card shadow-sm dark:shadow-indigo-500/10 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all">
        {/* Soft background ambient decorations for rich aesthetic */}
        <div className="absolute top-0 right-1/4 w-56 h-56 bg-indigo-400/10 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 right-0 w-44 h-44 bg-amber-400/10 dark:bg-amber-500/10 rounded-full blur-2xl pointer-events-none -mb-10" />

        {/* Left: Alex Lead Profile Hub */}
        <div className="flex items-center gap-4 relative z-10 min-w-0">
          <div className="relative shrink-0">
            <div className="h-14 w-14 rounded-2xl bg-indigo-600 dark:bg-indigo-700 text-white font-black text-base flex items-center justify-center shadow-md shadow-indigo-500/25 ring-4 ring-indigo-100 dark:ring-indigo-500/20 tracking-tight">
              {leadInitials}
            </div>
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white dark:border-card flex items-center justify-center shadow-sm" title="Lead Active on Shift">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
            </div>
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-100/90 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                Reporting Team Lead
              </span>
              <Badge variant="outline" className="text-[10px] font-bold text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                {assignedDeptName} Team
              </Badge>
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 bg-emerald-100/80 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Shift 10:00 AM – 07:00 PM
              </span>
            </div>

            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-foreground tracking-tight">
                {assignedLeadName}
              </h3>
              <span className="text-xs text-muted-foreground font-medium">· Technical Supervisor</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-muted-foreground leading-relaxed">
              Your daily task plan, morning SOD verification, and evening wrap-up sync directly to {assignedLeadName}.
            </p>
          </div>
        </div>

        {/* Right: Distinct "Need Help from Lead" Action Hub */}
        <div className="flex items-center gap-3 shrink-0 relative z-10">
          {!myActiveHelp ? (
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="group relative inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-lg shadow-amber-600/25 ring-2 ring-amber-400/40 dark:ring-amber-400/20 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
            >
              <div className="h-8 w-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <div className="text-[13px] font-black tracking-tight leading-none flex items-center gap-1.5">
                  <span>Need Help from Lead?</span>
                  <HelpCircle className="h-3.5 w-3.5 opacity-80" />
                </div>
                <div className="text-[10px] font-semibold text-white/90 leading-tight pt-1">Instant ping · Real-time unblocker</div>
              </div>
            </button>
          ) : (
            <div
              className={`p-3 px-4 rounded-2xl border-2 flex items-center gap-3 shadow-sm ${
                myActiveHelp.status === "ACKNOWLEDGED" || myActiveHelp.resolvedByLead
                  ? "bg-emerald-50 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/40 text-emerald-950 dark:text-emerald-200"
                  : "bg-amber-50 dark:bg-amber-500/15 border-amber-300 dark:border-amber-500/40 text-amber-950 dark:text-amber-200"
              }`}
            >
              <div
                className={`h-9 w-9 rounded-xl text-white flex items-center justify-center shrink-0 ${
                  myActiveHelp.status === "ACKNOWLEDGED" || myActiveHelp.resolvedByLead
                    ? "bg-emerald-500"
                    : "bg-amber-500 animate-pulse"
                }`}
              >
                {myActiveHelp.status === "ACKNOWLEDGED" || myActiveHelp.resolvedByLead ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <HelpCircle className="h-5 w-5" />
                )}
              </div>
              <div className="text-left">
                <div
                  className={`text-xs font-black ${
                    myActiveHelp.status === "ACKNOWLEDGED" || myActiveHelp.resolvedByLead
                      ? "text-emerald-900 dark:text-emerald-200"
                      : "text-amber-900 dark:text-amber-200"
                  }`}
                >
                  {myActiveHelp.resolvedByLead
                    ? `Resolved by ${assignedLeadName}`
                    : myActiveHelp.status === "ACKNOWLEDGED"
                    ? `✓ Connected with ${assignedLeadName}`
                    : "Help Ping Dispatched"}
                </div>
                <div
                  className={`text-[10px] font-semibold ${
                    myActiveHelp.status === "ACKNOWLEDGED" || myActiveHelp.resolvedByLead
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-amber-700 dark:text-amber-400"
                  }`}
                >
                  {myActiveHelp.resolvedByLead
                    ? "Pending your confirmation"
                    : myActiveHelp.status === "ACKNOWLEDGED"
                    ? "Reviewing with your lead"
                    : "Awaiting response in real time"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Help Request Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-md max-h-[92vh] overflow-y-auto p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-card border border-indigo-200 dark:border-indigo-500/30 shadow-2xl space-y-4 animate-in zoom-in-95 custom-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-2xl bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-foreground">Need Help from Team Lead?</h3>
                  <p className="text-[11px] text-muted-foreground">Notifies {assignedLeadName} instantly in real time.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendHelpRequest} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Assistance Category</label>
                <select
                  value={helpTopic}
                  onChange={(e) => setHelpTopic(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:outline-none"
                >
                  <option value="Blocker / Technical Issue">Blocker / Technical Issue</option>
                  <option value="Code Review / Architecture">Code Review / Architecture</option>
                  <option value="Sprint Deliverable Clarification">Sprint Deliverable Clarification</option>
                  <option value="Urgent Unblocker">Urgent Unblocker</option>
                  <option value="General Guidance">General Guidance</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Details / Context</label>
                <textarea
                  rows={3}
                  value={helpDetails}
                  onChange={(e) => setHelpDetails(e.target.value)}
                  placeholder="Describe what you need help with (e.g. error, blocker, or requirement)..."
                  className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Urgency Level</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setHelpUrgency("NORMAL")}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      helpUrgency === "NORMAL"
                        ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 shadow-sm"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Normal Assistance
                  </button>
                  <button
                    type="button"
                    onClick={() => setHelpUrgency("URGENT")}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      helpUrgency === "URGENT"
                        ? "border-rose-500 bg-rose-50 dark:bg-rose-500/15 text-rose-800 dark:text-rose-300 shadow-sm"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    ⚡ Urgent Blocker
                  </button>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHelpModal(false)}
                  className="h-9 px-4 rounded-xl text-xs w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 w-full sm:w-auto"
                >
                  Send Help Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. Daily Morning Plan & Evening Wrap-Up (Plain English) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Today's Tasks & Plan Submission */}
        <Interactive3DCard className={`p-4 sm:p-5 border space-y-3 rounded-2xl sm:rounded-3xl transition-all ${
          isEodWithin10MinWindow
            ? "border-slate-200 dark:border-border/60 bg-slate-50/70 dark:bg-card/40 opacity-80"
            : isSodVerified
            ? "border-emerald-200 dark:border-emerald-500/40 bg-gradient-to-r from-emerald-50/70 via-emerald-50/30 to-card dark:from-emerald-950/20 dark:via-card dark:to-card shadow-sm"
            : isSodSubmitted
            ? "border-cyan-200 dark:border-cyan-500/30 bg-gradient-to-r from-cyan-50/70 via-cyan-50/30 to-card dark:from-cyan-950/20 dark:via-card dark:to-card shadow-sm"
            : "border-cyan-200 dark:border-cyan-500/20 bg-gradient-to-r from-cyan-50/60 via-slate-50/40 to-card dark:from-cyan-950/10 dark:via-card dark:to-card shadow-sm"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                isEodWithin10MinWindow
                  ? "bg-slate-100 dark:bg-muted text-slate-500 dark:text-muted-foreground"
                  : isSodVerified
                  ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
                  : "bg-cyan-100 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30"
              }`}>
                <ListTodo className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-foreground flex items-center gap-1.5 flex-wrap">
                  <span>Today&apos;s Task Plan</span>
                  <Badge
                    variant="outline"
                    className={`text-[9px] font-bold ${
                      isEodWithin10MinWindow
                        ? "text-slate-600 dark:text-muted-foreground border-slate-200 dark:border-border bg-slate-100/80 dark:bg-muted/40"
                        : isSodVerified
                        ? "text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30 bg-emerald-100/90 dark:bg-emerald-500/10"
                        : isSodSubmitted
                        ? "text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/30 bg-cyan-100/90 dark:bg-cyan-500/10"
                        : "text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/30 bg-amber-100/90 dark:bg-amber-500/10"
                    }`}
                  >
                    {isDayWrappedUp
                      ? "✓ Day Wrapped Up"
                      : isSodVerified
                      ? "✓ Tasks Verified by Lead"
                      : isSodSubmitted
                      ? "Tasks Submitted · Active"
                      : "Ready to Submit"}
                  </Badge>
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-muted-foreground">
                  {isDayWrappedUp
                    ? isEodWithin10MinWindow
                      ? `Day wrapped up · Resubmissions allowed for ${eodSecondsLeft < 60 ? `${eodSecondsLeft}s` : `${eodMinutesLeft}m`} (${tasks.length} task(s))`
                      : `Day wrapped up · All tasks finalized for today (${tasks.length} task(s))`
                    : isSodVerified
                    ? `Verified by ${sodVerifiedBy} (${sodVerifiedAt})`
                    : isSodSubmitted
                    ? `Submitted to ${assignedLeadName} at ${currentEmp?.sodTime || 'Just now'}`
                    : tasks.length === 0
                    ? "No tasks added yet. Click 'Add Task' to plan your daily deliverables."
                    : `${tasks.length} task(s) ready to submit directly to your Lead`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isDayWrappedUp ? (
                <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground border-border/80 px-2.5 py-1">
                  ✓ Day Wrapped Up
                </Badge>
              ) : isSodSubmitted ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSubmitTasks}
                  className="text-xs font-bold h-8 shrink-0 flex items-center gap-1.5 transition-all text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/30 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 cursor-pointer shadow-sm"
                  title="Update and resubmit morning SOD plan if any tasks were missed"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Resubmit Task</span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleSubmitTasks}
                  className="text-xs font-bold h-8 shrink-0 flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Task</span>
                </Button>
              )}
            </div>
          </div>

          {/* Lead Feedback / Verification on Tasks */}
          {isSodVerified && !isDayWrappedUp && (
            <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-background/80 border border-emerald-200 dark:border-emerald-500/25 text-xs flex items-center justify-between gap-2 animate-in fade-in">
              <span className="text-[11px] text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span><strong>{sodVerifiedBy}:</strong> &quot;{sodLeadNote}&quot;</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400/80 shrink-0 font-bold">Verified</span>
            </div>
          )}

          {isSodSubmitted && !isSodVerified && !isEodWithin10MinWindow && (
            <div className="p-2.5 rounded-xl bg-cyan-50/80 dark:bg-background/80 border border-cyan-200 dark:border-cyan-500/20 text-xs flex items-center justify-between gap-2 animate-in fade-in">
              <span className="text-[11px] text-cyan-800 dark:text-cyan-300 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 shrink-0 animate-pulse text-cyan-600 dark:text-cyan-400" />
                <span>Tasks submitted to Lead. Click &quot;Resubmit Task&quot; anytime to update before or during workday.</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-700 dark:text-muted-foreground shrink-0 font-semibold">Pending Lead Review</span>
            </div>
          )}
        </Interactive3DCard>

        {/* Evening Wrap-Up */}
        <Interactive3DCard className={`p-4 sm:p-5 border space-y-3 rounded-2xl sm:rounded-3xl transition-all ${
          !isSodVerified && !isEodWithin10MinWindow
            ? "border-slate-200 dark:border-border/60 bg-slate-50/70 dark:bg-card/40 opacity-75 shadow-sm"
            : isEodWithin10MinWindow
            ? "border-purple-200 dark:border-purple-500/30 bg-gradient-to-r from-purple-50/70 via-purple-50/30 to-card dark:from-purple-950/20 dark:via-card dark:to-card shadow-sm"
            : isSodVerified
            ? "border-purple-200 dark:border-purple-500/20 bg-gradient-to-r from-purple-50/60 via-slate-50/30 to-card dark:from-purple-950/10 dark:via-card dark:to-card shadow-sm"
            : "border-slate-200 dark:border-border/60 bg-card/60 shadow-sm"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                !isSodVerified && !isEodWithin10MinWindow
                  ? "bg-slate-100 dark:bg-muted text-slate-500 dark:text-muted-foreground"
                  : "bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30"
              }`}>
                {!isSodVerified && !isEodWithin10MinWindow ? <Lock className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-foreground flex items-center gap-1.5 flex-wrap">
                  <span>Evening Wrap-Up</span>
                  <Badge
                    variant="outline"
                    className={`text-[9px] font-bold ${
                      isDayWrappedUp
                        ? "text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-500/30 bg-purple-100/90 dark:bg-purple-500/10"
                        : isEodSubmittedPendingLead
                        ? "text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-500/30 bg-purple-100/90 dark:bg-purple-500/20"
                        : !isSodSubmitted
                        ? "text-slate-600 dark:text-muted-foreground border-slate-200 dark:border-border bg-slate-100/80 dark:bg-muted/40"
                        : !isSodVerified
                        ? "text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-500/30 bg-amber-100/90 dark:bg-amber-500/10"
                        : "text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-500/30 bg-purple-100/90 dark:bg-purple-500/10"
                    }`}
                  >
                    {isDayWrappedUp
                      ? "Approved · 2-Min Next Day Window"
                      : isEodSubmittedPendingLead
                      ? "Wrap-Up Submitted · Awaiting Lead Review"
                      : !isSodSubmitted
                      ? "Locked · Submit SOD First"
                      : !isSodVerified
                      ? "Locked · Awaiting Lead Verification"
                      : "Ready to Submit"}
                  </Badge>
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-muted-foreground">
                  {isDayWrappedUp
                    ? `Approved by ${assignedLeadName}! Next workday starts in ${eodSecondsLeft < 60 ? `${eodSecondsLeft}s` : `${eodMinutesLeft}m`}`
                    : isEodSubmittedPendingLead
                    ? `Submitted to ${assignedLeadName}. 2-min timer will start once Lead reviews & approves your submission.`
                    : !isSodSubmitted
                    ? "Morning SOD plan must be submitted first before wrap-up is enabled"
                    : !isSodVerified
                    ? `${assignedLeadName} must verify your morning SOD plan before Evening Wrap-Up is enabled`
                    : `${completedCount} of ${tasks.length} tasks completed today`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isEodWithin10MinWindow ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleEveningWrapupSubmit}
                  className="text-xs font-bold h-8 shrink-0 flex items-center gap-1.5 transition-all text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-500/40 hover:bg-purple-50 dark:hover:bg-purple-500/10 cursor-pointer shadow-sm"
                  title={`Resubmit window open for ${eodSecondsLeft < 60 ? `${eodSecondsLeft}s` : `${eodMinutesLeft}m`}`}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Resubmit Wrap-Up ({eodSecondsLeft < 60 ? `${eodSecondsLeft}s` : `${eodMinutesLeft}m`} left)</span>
                </Button>
              ) : isEodSubmittedPendingLead ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleEveningWrapupSubmit}
                  className="text-xs font-bold h-8 shrink-0 flex items-center gap-1.5 transition-all text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-500/40 hover:bg-purple-50 dark:hover:bg-purple-500/10 cursor-pointer shadow-sm"
                  title="Update & re-submit your evening wrap-up before Team Lead review"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Resubmit Wrap-Up</span>
                </Button>
              ) : isDayWrappedUp ? (
                <Badge variant="outline" className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5">
                  ✓ Day Completed
                </Badge>
              ) : !isSodVerified ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled
                  className="text-xs font-semibold h-8 shrink-0 flex items-center gap-1.5 opacity-50 cursor-not-allowed border-border"
                  title={!isSodSubmitted ? "Submit morning SOD plan first" : "Team Lead must verify your morning SOD plan first"}
                >
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Locked</span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleEveningWrapupSubmit}
                  className="text-xs font-bold h-8 shrink-0 flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white shadow-sm cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Wrap-Up</span>
                </Button>
              )}
            </div>
          </div>

          {/* 10-Minute Window Helper Note */}
          {isEodWithin10MinWindow && (
            <div className="text-[10px] text-purple-700 dark:text-purple-300/90 flex items-center gap-1 pt-0.5">
              <Clock className="h-3 w-3 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>Resubmissions allowed for <strong>{eodSecondsLeft < 60 ? `${eodSecondsLeft}s` : `${eodMinutesLeft}m`} more</strong>. Completed tasks stay active throughout today.</span>
            </div>
          )}

          {/* Pending Lead Review Helper Note */}
          {isEodSubmittedPendingLead && (
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-[11px] text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0 text-purple-600 dark:text-purple-400" />
              <span>Evening wrap-up submitted to <strong>{assignedLeadName}</strong>. Waiting for Team Lead to review & approve. 2-minute timer will start upon Lead approval.</span>
            </div>
          )}

          {/* Locked reason helper note when SOD submitted but not verified yet */}
          {!isDayWrappedUp && !isEodSubmittedPendingLead && isSodSubmitted && !isSodVerified && (
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Evening wrap-up unlocks once <strong>{assignedLeadName}</strong> verifies your morning task plan.</span>
            </div>
          )}

          {/* Lead Feedback on Evening Wrap-Up */}
          {isEodVerified && (
            <div className="p-3 rounded-xl bg-emerald-50/90 dark:bg-background/80 border border-emerald-200 dark:border-emerald-500/25 space-y-1 text-xs animate-in fade-in shadow-sm">
              <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-400 font-black text-[11px]">
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                  <span>Rated {eodLeadRating}.0 / 5 Stars by {eodVerifiedBy}</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-muted-foreground">{eodVerifiedAt}</span>
              </div>
              <p className="text-slate-700 dark:text-foreground/90 italic">&quot;{eodLeadComment}&quot;</p>
              {eodLeadActionItem && (
                <p className="text-[11px] text-slate-600 dark:text-muted-foreground">🎯 <strong>Action Item:</strong> {eodLeadActionItem}</p>
              )}
            </div>
          )}
        </Interactive3DCard>
      </div>

      {/* 2. Task Segregation Navigation & Controls */}
      <Interactive3DCard className="p-5 border border-slate-200/90 dark:border-border/80 bg-white/80 dark:bg-card/60 rounded-3xl space-y-4 shadow-sm">
        {/* Top bar: Tabs + Add Task button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Segregation Tabs */}
          <div className="flex items-center p-1.5 rounded-2xl bg-slate-100/90 dark:bg-background/60 border border-slate-200 dark:border-border/70 overflow-x-auto gap-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                activeTab === "ALL"
                  ? "bg-white dark:bg-card text-slate-900 dark:text-foreground font-black shadow-sm border border-slate-200/80 dark:border-border"
                  : "text-slate-600 dark:text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-muted/30"
              }`}
            >
              All Tasks ({tasks.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("TODO")}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                activeTab === "TODO"
                  ? "bg-white dark:bg-card text-slate-900 dark:text-foreground font-black shadow-sm border border-slate-200/80 dark:border-border"
                  : "text-slate-600 dark:text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-muted/30"
              }`}
            >
              To Do ({todoCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("IN_PROGRESS")}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                activeTab === "IN_PROGRESS"
                  ? "bg-white dark:bg-card text-slate-900 dark:text-foreground font-black shadow-sm border border-slate-200/80 dark:border-border"
                  : "text-slate-600 dark:text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-muted/30"
              }`}
            >
              In Progress ({inProgressCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("COMPLETED")}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                activeTab === "COMPLETED"
                  ? "bg-white dark:bg-card text-slate-900 dark:text-foreground font-black shadow-sm border border-slate-200/80 dark:border-border"
                  : "text-slate-600 dark:text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-muted/30"
              }`}
            >
              Completed ({completedCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("WEEK")}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                activeTab === "WEEK" || activeTab === "MONTH"
                  ? "bg-white dark:bg-card text-slate-900 dark:text-foreground font-black shadow-sm border border-slate-200/80 dark:border-border"
                  : "text-slate-600 dark:text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-muted/30"
              }`}
            >
              Schedule (Week/Month)
            </button>
          </div>

          {/* New Task Button */}
          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="h-10 px-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-black text-xs gap-2 shrink-0 shadow-md shadow-cyan-500/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            <span>{showAddForm ? "Close Form" : "Add Task"}</span>
          </Button>
        </div>

        {/* 3. Simple Add Task Form (Collapsible) */}
        {showAddForm && (
          <form onSubmit={handleAddTask} className="p-5 rounded-2xl bg-slate-50 dark:bg-card border border-cyan-200 dark:border-primary/40 space-y-4 shadow-sm animate-in fade-in slide-in-from-top-2">
            <h4 className="text-xs font-black text-slate-900 dark:text-foreground">Create New Task</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-muted-foreground">What needs to be done?</label>
                <Input
                  type="text"
                  placeholder="e.g., Draft customer feedback summary"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="h-10 text-xs rounded-xl bg-white dark:bg-background"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-muted-foreground">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-white dark:bg-background px-3 text-xs text-foreground focus:outline-none"
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
                <span className="text-[11px] font-semibold text-slate-600 dark:text-muted-foreground">Priority:</span>
                <button
                  type="button"
                  onClick={() => setNewPriority("MEDIUM")}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                    newPriority === "MEDIUM"
                      ? "bg-slate-200 dark:bg-secondary text-slate-900 dark:text-foreground border border-slate-300 dark:border-border shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => setNewPriority("HIGH")}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                    newPriority === "HIGH"
                      ? "bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 shadow-sm"
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
                  className="text-xs h-9 px-3.5 rounded-xl"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="text-xs font-bold h-9 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm">
                  Add Task
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* 4. Search and Category Filter Bar */}
        {activeTab !== "WEEK" && activeTab !== "MONTH" && activeTab !== "60DAYS" && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 text-xs">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl bg-slate-50 dark:bg-background/50 border-slate-200 dark:border-input"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-muted-foreground shrink-0">Filter:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-slate-900 text-white dark:bg-primary dark:text-primary-foreground shadow-sm"
                      : "bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground border border-slate-200 dark:border-border"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </Interactive3DCard>

      {/* 5. Main Content: Task List or Weekly/Monthly/60-Day View */}
      {activeTab === "WEEK" || activeTab === "MONTH" || activeTab === "60DAYS" ? (
        /* Real-Time Interactive Weekly, Monthly & 60-Day View */
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Interactive3DCard className="p-5 sm:p-6 border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card/70 rounded-3xl space-y-5 shadow-sm">
            {/* Header with live time context & week/month/60-day dates */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-border/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-500/20">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-foreground">
                      {scheduleViewMode === "WEEKLY"
                        ? "Weekly Schedule & Execution"
                        : scheduleViewMode === "MONTHLY"
                        ? "30-Day Monthly Schedule & Execution"
                        : "60-Day Rolling Schedule & Execution"}
                    </h3>
                    <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Live Sync</span>
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-muted-foreground">
                    {scheduleViewMode === "WEEKLY"
                      ? `Real-time deliverable tracking for the current week (${realTimeWeeklyData[0]?.dateFormatted} – ${realTimeWeeklyData[4]?.dateFormatted})`
                      : scheduleViewMode === "MONTHLY"
                      ? `Rolling 30-day view (${realTimeMonthlyData.startFormatted} – ${realTimeMonthlyData.endFormatted})`
                      : `Rolling 60-day view (${realTime60DaysData[0]?.startFormatted} – ${realTime60DaysData[1]?.endFormatted})`}
                  </p>
                </div>
              </div>

              {/* View Toggle & Summary Pill */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-muted/60 border border-slate-200 dark:border-border text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => { setScheduleViewMode("WEEKLY"); setActiveTab("WEEK"); }}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      scheduleViewMode === "WEEKLY"
                        ? "bg-white dark:bg-card text-foreground font-bold shadow-xs border border-border/80"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    7-Day Week
                  </button>
                  <button
                    type="button"
                    onClick={() => { setScheduleViewMode("MONTHLY"); setActiveTab("MONTH"); }}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      scheduleViewMode === "MONTHLY"
                        ? "bg-white dark:bg-card text-foreground font-bold shadow-xs border border-border/80"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    30-Day Month
                  </button>
                  <button
                    type="button"
                    onClick={() => { setScheduleViewMode("60DAYS"); setActiveTab("60DAYS"); }}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      scheduleViewMode === "60DAYS"
                        ? "bg-white dark:bg-card text-foreground font-bold shadow-xs border border-border/80"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    60-Day View
                  </button>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-200/80 dark:border-border/60 flex items-center gap-2 text-xs">
                  <Activity className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Today: <strong className="text-slate-900 dark:text-foreground">{completedCount}/{tasks.length} Done</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Schedule View Content: WEEKLY (5-Day Cards) or MONTHLY / 60DAYS (Calendar Style Grids) */}
            {scheduleViewMode === "WEEKLY" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {realTimeWeeklyData.map((d) => {
                  const isSelected = (selectedWeeklyDay === null && d.isToday) || selectedWeeklyDay === d.idx;
                  return (
                    <button
                      key={d.dayName}
                      type="button"
                      onClick={() => setSelectedWeeklyDay(d.idx)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between gap-3 ${
                        isSelected
                          ? "bg-cyan-50/90 dark:bg-cyan-950/30 border-cyan-400 dark:border-cyan-500/60 ring-2 ring-cyan-400/30 shadow-md"
                          : d.isToday
                          ? "bg-slate-50/90 dark:bg-card border-cyan-200 dark:border-cyan-500/30 hover:border-cyan-300"
                          : "bg-white dark:bg-card/60 border-slate-200/80 dark:border-border/70 hover:border-slate-300 dark:hover:border-border hover:shadow-sm"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-xs text-slate-900 dark:text-foreground">
                            {d.dayName}
                          </span>
                          {d.isToday ? (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-cyan-600 text-white shadow-xs">
                              Today
                            </span>
                          ) : d.isPast ? (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                              Done
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground border border-slate-200 dark:border-border">
                              Upcoming
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-slate-500 dark:text-muted-foreground">
                          {d.dateFormatted}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-600 dark:text-muted-foreground font-medium">
                            {d.isToday ? `${d.completedTasks}/${d.totalTasks} Done` : d.isPast ? "3/3 Done" : "2 Planned"}
                          </span>
                          <span className="font-mono font-bold text-slate-800 dark:text-foreground">
                            {d.progress}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-muted/60 rounded-full overflow-hidden border border-slate-200/50 dark:border-transparent">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              d.progress === 100
                                ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                                : d.progress > 0
                                ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                                : "bg-slate-300 dark:bg-muted"
                            }`}
                            style={{ width: `${d.progress}%` }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : scheduleViewMode === "MONTHLY" ? (
              /* 30-Day Calendar Month View (Starts from 1st of Month to End of Month) */
              <div className="space-y-3">
                {/* Month Navigation & Title Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 dark:bg-card border border-slate-200/80 dark:border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-black">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-foreground flex items-center gap-2">
                        <span>{realTimeMonthlyData.monthName} {realTimeMonthlyData.year}</span>
                        <Badge variant="outline" className="text-[10px] font-bold text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/30 bg-cyan-50 dark:bg-cyan-500/10">
                          {realTimeMonthlyData.totalDays} Days Calendar
                        </Badge>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-muted-foreground font-medium">
                        Month Start Date ({realTimeMonthlyData.startFormatted}) to Month End Date ({realTimeMonthlyData.endFormatted})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCalendarMonthOffset((prev) => prev - 1)}
                      className="h-8 w-8 p-0 rounded-xl cursor-pointer"
                      title="Previous Month"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCalendarMonthOffset(0);
                        setSelectedCalendarDateKey(formatLocalDateKey(new Date()));
                      }}
                      className="h-8 px-3 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Current Month
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCalendarMonthOffset((prev) => prev + 1)}
                      className="h-8 w-8 p-0 rounded-xl cursor-pointer"
                      title="Next Month"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* 7-Column Calendar Grid */}
                <div className="space-y-1.5">
                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
                    {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((dayName, idx) => (
                      <div
                        key={dayName}
                        className={`py-1.5 rounded-xl text-[10px] sm:text-xs font-black tracking-wider ${
                          idx === 0 || idx === 6
                            ? "bg-slate-100/70 dark:bg-muted/40 text-slate-400 dark:text-muted-foreground"
                            : "bg-slate-100 dark:bg-muted/70 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {dayName}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {realTimeMonthlyData.days.map((d) => {
                      const isSelected = (selectedCalendarDateKey === null && d.isToday) || selectedCalendarDateKey === d.dateKey;
                      if (!d.inCurrentMonth) {
                        return (
                          <div
                            key={d.dateKey}
                            className="p-2 rounded-2xl border border-transparent bg-slate-50/40 dark:bg-muted/10 opacity-25 text-center min-h-[72px] sm:min-h-[85px] flex flex-col justify-between"
                          >
                            <span className="text-[10px] font-bold text-slate-400">{d.dayNum}</span>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={d.dateKey}
                          type="button"
                          onClick={() => setSelectedCalendarDateKey(d.dateKey)}
                          className={`p-2 sm:p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 min-h-[76px] sm:min-h-[88px] relative overflow-hidden ${
                            isSelected
                              ? "bg-cyan-50/90 dark:bg-cyan-950/40 border-cyan-500 dark:border-cyan-400 ring-2 ring-cyan-400/40 shadow-md scale-[1.02] z-10"
                              : d.isToday
                              ? "bg-emerald-50/70 dark:bg-card border-emerald-400 dark:border-emerald-500/60 shadow-xs"
                              : d.isWeekend
                              ? "bg-slate-50/60 dark:bg-card/30 border-slate-200/60 dark:border-border/40 text-muted-foreground opacity-70 hover:opacity-100"
                              : "bg-white dark:bg-card/70 border-slate-200/80 dark:border-border/80 hover:border-cyan-300 dark:hover:border-cyan-500/40 hover:shadow-xs"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className={`text-xs font-black ${d.isToday ? "text-emerald-700 dark:text-emerald-400" : "text-foreground"}`}>
                              {d.dayNum}
                            </span>
                            {d.isToday ? (
                              <span className="px-1.5 py-0.2 rounded-md text-[8px] font-black uppercase bg-emerald-600 text-white shadow-2xs">
                                Today
                              </span>
                            ) : d.isWeekend ? (
                              <span className="text-[9px] font-semibold text-slate-400">Off</span>
                            ) : d.isPast ? (
                              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">✓</span>
                            ) : null}
                          </div>

                          <div className="w-full space-y-1">
                            <div className="flex items-center justify-between text-[9px] font-semibold text-slate-500 dark:text-muted-foreground">
                              <span className="truncate">
                                {d.isToday ? `${d.completedTasks}/${d.totalTasks}` : d.isWeekend ? "" : d.isPast ? "Done" : "2 Plan"}
                              </span>
                              {!d.isWeekend && <span className="font-mono font-bold">{d.progress}%</span>}
                            </div>

                            {!d.isWeekend && (
                              <div className="h-1 w-full bg-slate-100 dark:bg-muted/60 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    d.progress === 100
                                      ? "bg-emerald-500"
                                      : d.progress > 0
                                      ? "bg-cyan-500"
                                      : "bg-slate-200 dark:bg-muted"
                                  }`}
                                  style={{ width: `${d.progress}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* 60-Day View: 2 Full Calendar Months Side by Side (Start of Month to End of Month) */
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 dark:bg-card border border-slate-200/80 dark:border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-black">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-foreground flex items-center gap-2">
                        <span>60-Day 2-Month Calendar Schedule</span>
                        <Badge variant="outline" className="text-[10px] font-bold text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/30 bg-cyan-50 dark:bg-cyan-500/10">
                          {realTime60DaysData[0]?.monthName} &amp; {realTime60DaysData[1]?.monthName}
                        </Badge>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-muted-foreground font-medium">
                        Showing 2 complete calendar months ({realTime60DaysData[0]?.startFormatted} – {realTime60DaysData[1]?.endFormatted})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCalendarMonthOffset((prev) => prev - 1)}
                      className="h-8 w-8 p-0 rounded-xl cursor-pointer"
                      title="Previous Period"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCalendarMonthOffset(0);
                        setSelectedCalendarDateKey(formatLocalDateKey(new Date()));
                      }}
                      className="h-8 px-3 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Current 60 Days
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCalendarMonthOffset((prev) => prev + 1)}
                      className="h-8 w-8 p-0 rounded-xl cursor-pointer"
                      title="Next Period"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {realTime60DaysData.map((mMonth, mIdx) => (
                    <div key={mIdx} className="space-y-2 p-4 rounded-3xl bg-slate-50/50 dark:bg-card/40 border border-slate-200/70 dark:border-border/60">
                      <div className="flex items-center justify-between pb-1">
                        <h5 className="text-xs font-black text-slate-900 dark:text-foreground flex items-center gap-1.5">
                          <span>{mMonth.monthName} {mMonth.year}</span>
                          <span className="text-[10px] font-normal text-muted-foreground">({mMonth.startFormatted} – {mMonth.endFormatted})</span>
                        </h5>
                        <Badge variant="outline" className="text-[9px] font-bold">
                          {mMonth.totalDays} Days
                        </Badge>
                      </div>

                      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center">
                        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((dayName, idx) => (
                          <div
                            key={dayName}
                            className={`py-1 rounded-lg text-[9px] font-black tracking-wider ${
                              idx === 0 || idx === 6
                                ? "bg-slate-100/60 dark:bg-muted/30 text-slate-400"
                                : "bg-slate-100 dark:bg-muted/60 text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            {dayName}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                        {mMonth.days.map((d) => {
                          const isSelected = (selectedCalendarDateKey === null && d.isToday) || selectedCalendarDateKey === d.dateKey;
                          if (!d.inCurrentMonth) {
                            return (
                              <div
                                key={d.dateKey}
                                className="p-1.5 rounded-xl border border-transparent bg-slate-50/20 dark:bg-muted/5 opacity-20 text-center min-h-[64px] flex flex-col justify-between"
                              >
                                <span className="text-[9px] font-bold text-slate-400">{d.dayNum}</span>
                              </div>
                            );
                          }

                          return (
                            <button
                              key={d.dateKey}
                              type="button"
                              onClick={() => setSelectedCalendarDateKey(d.dateKey)}
                              className={`p-1.5 sm:p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 min-h-[68px] relative overflow-hidden ${
                                isSelected
                                  ? "bg-cyan-50/90 dark:bg-cyan-950/40 border-cyan-500 dark:border-cyan-400 ring-2 ring-cyan-400/40 shadow-md scale-[1.02] z-10"
                                  : d.isToday
                                  ? "bg-emerald-50/70 dark:bg-card border-emerald-400 dark:border-emerald-500/60 shadow-xs"
                                  : d.isWeekend
                                  ? "bg-slate-50/60 dark:bg-card/30 border-slate-200/60 dark:border-border/40 text-muted-foreground opacity-70 hover:opacity-100"
                                  : "bg-white dark:bg-card/70 border-slate-200/80 dark:border-border/80 hover:border-cyan-300 dark:hover:border-cyan-500/40 hover:shadow-xs"
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className={`text-[11px] font-black ${d.isToday ? "text-emerald-700 dark:text-emerald-400" : "text-foreground"}`}>
                                  {d.dayNum}
                                </span>
                                {d.isToday ? (
                                  <span className="px-1 py-0.1 rounded text-[7px] font-black uppercase bg-emerald-600 text-white">
                                    Today
                                  </span>
                                ) : d.isWeekend ? (
                                  <span className="text-[8px] font-semibold text-slate-400">Off</span>
                                ) : d.isPast ? (
                                  <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400">✓</span>
                                ) : null}
                              </div>

                              <div className="w-full space-y-0.5">
                                <div className="flex items-center justify-between text-[8px] font-semibold text-slate-500 dark:text-muted-foreground">
                                  <span className="truncate">
                                    {d.isToday ? `${d.completedTasks}/${d.totalTasks}` : d.isWeekend ? "" : d.isPast ? "Done" : "2 Plan"}
                                  </span>
                                  {!d.isWeekend && <span className="font-mono font-bold">{d.progress}%</span>}
                                </div>

                                {!d.isWeekend && (
                                  <div className="h-1 w-full bg-slate-100 dark:bg-muted/60 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        d.progress === 100
                                          ? "bg-emerald-500"
                                          : d.progress > 0
                                          ? "bg-cyan-500"
                                          : "bg-slate-200 dark:bg-muted"
                                      }`}
                                      style={{ width: `${d.progress}%` }}
                                    />
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Detailed Breakdown for Selected Day */}
            {(() => {
              const todayKey = formatLocalDateKey(new Date());
              const keyToFind = selectedCalendarDateKey || todayKey;

              let activeDay: any = null;
              if (scheduleViewMode === "WEEKLY") {
                const activeDataSet = realTimeWeeklyData;
                activeDay = (selectedWeeklyDay !== null ? activeDataSet.find((d) => d.idx === selectedWeeklyDay) : null) || activeDataSet.find((d) => d.isToday) || activeDataSet[0];
              } else if (scheduleViewMode === "MONTHLY") {
                const allDays = realTimeMonthlyData.days;
                activeDay = allDays.find((d) => d.dateKey === keyToFind) || allDays.find((d) => d.isToday) || allDays.find((d) => d.inCurrentMonth) || allDays[0];
              } else {
                const month1Days = realTime60DaysData[0]?.days || [];
                const month2Days = realTime60DaysData[1]?.days || [];
                const allDays = [...month1Days, ...month2Days];
                activeDay = allDays.find((d) => d.dateKey === keyToFind) || allDays.find((d) => d.isToday) || allDays.find((d) => d.inCurrentMonth) || allDays[0];
              }

              if (!activeDay) return null;

              return (
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-background/40 border border-slate-200/80 dark:border-border/70 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60 dark:border-border/50">
                    <div className="flex items-center gap-2.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-foreground">
                        {activeDay.dayName} Deliverables ({activeDay.dateFormatted})
                      </h4>
                      {activeDay.isToday && (
                        <Badge className="bg-cyan-100 dark:bg-cyan-500/15 text-cyan-800 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30 text-[9px] font-bold px-2 py-0.5">
                          Active Workday · Real-time
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-600 dark:text-muted-foreground">
                      {activeDay.label}
                    </span>
                  </div>

                  {/* Tasks List for that day */}
                  <div className="space-y-2.5">
                    {activeDay.tasks.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500 dark:text-muted-foreground bg-white dark:bg-card/40 rounded-xl border border-slate-200/60 dark:border-border/40">
                        No deliverables scheduled for {activeDay.dayName}.
                      </div>
                    ) : (
                      activeDay.tasks.map((task: any, i: number) => {
                        const isDone = task.status === "COMPLETED" || Number(task.progress) === 100;
                        const pct = Number(task.progress) || 0;
                        return (
                          <div
                            key={task.id || i}
                            className="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-card border border-slate-200/80 dark:border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-cyan-300 dark:hover:border-cyan-500/30 transition-all"
                          >
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-xs font-bold ${isDone ? "line-through text-slate-400 dark:text-muted-foreground" : "text-slate-900 dark:text-foreground"}`}>
                                  {task.title}
                                </span>
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0.2 rounded-md font-bold bg-slate-50 dark:bg-muted/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-border">
                                  {task.category || task.project || "General"}
                                </Badge>
                                {task.priority === "HIGH" && (
                                  <Badge variant="destructive" className="text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                                    Important
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Percentage Indicator */}
                            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                              <div className="w-28 h-2 bg-slate-100 dark:bg-muted/60 rounded-full overflow-hidden border border-slate-200/50 dark:border-transparent hidden sm:block">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isDone
                                      ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                                      : pct > 0
                                      ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                                      : "bg-slate-200 dark:bg-muted"
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span
                                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                                  isDone
                                    ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/30"
                                    : pct > 0
                                    ? "text-cyan-700 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-500/30"
                                    : "text-slate-600 bg-slate-50 dark:text-muted-foreground dark:bg-muted/40 border-slate-200 dark:border-border"
                                }`}
                              >
                                {pct}% {isDone ? "✓" : ""}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })()}
          </Interactive3DCard>
        </div>
      ) : (
        /* Task Cards List (Clean, Unique Percentage UI - Radio & Mark Done removed) */
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-card/40 rounded-3xl border border-slate-200 dark:border-border/60 text-xs text-muted-foreground space-y-2 shadow-sm">
              <CheckCircle2 className="h-8 w-8 text-slate-400 dark:text-muted-foreground mx-auto" />
              <p className="font-bold text-sm text-foreground">No tasks found</p>
              <p>You have no tasks in this view. Click &quot;Add Task&quot; above to create one.</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const pct = Number(task.progress) || 0;
              const isDone = task.status === "COMPLETED" || pct === 100;

              return (
                <div
                  key={task.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                    isDone
                      ? "bg-slate-50/80 dark:bg-card/40 border-slate-200/80 dark:border-border/40 shadow-2xs opacity-85"
                      : "bg-white dark:bg-card border-slate-200 dark:border-border hover:border-cyan-400/60 shadow-xs"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Quick Completion Checkbox & Title Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => handleSetTaskProgress(task.id, isDone ? 0 : 100)}
                        className={`h-5 w-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                          isDone
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                            : "border-slate-300 dark:border-border hover:border-cyan-500 text-transparent"
                        }`}
                        title={isDone ? "Mark as incomplete" : "Mark as complete (100%)"}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs sm:text-sm font-bold leading-tight ${
                              isDone ? "line-through text-slate-400 dark:text-muted-foreground" : "text-slate-900 dark:text-foreground"
                            }`}
                          >
                            {task.title}
                          </span>

                          <Badge variant="outline" className="text-[9px] px-2 py-0.5 rounded-md font-bold bg-slate-100 dark:bg-muted/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-border">
                            {task.category}
                          </Badge>

                          {task.priority === "HIGH" && (
                            <Badge variant="destructive" className="text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                              Important
                            </Badge>
                          )}

                          {task.assignedBy && (
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-500/20">
                              Assigned by {task.assignedBy}
                            </span>
                          )}
                        </div>

                        {task.assignedBy && task.acknowledged && task.acknowledgementNote && (
                          <p className="text-[10px] text-slate-500 dark:text-muted-foreground italic">
                            &quot;{task.acknowledgementNote}&quot;
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Clean Progress Slider, Percentage & Delete */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-border/40">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={pct}
                          onChange={(e) => handleSetTaskProgress(task.id, Number(e.target.value))}
                          className="w-24 sm:w-32 accent-cyan-500 cursor-pointer h-1.5"
                          title={`Progress: ${pct}%`}
                        />
                        <span
                          className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                            isDone
                              ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/30"
                              : pct > 0
                              ? "text-cyan-700 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-500/30"
                              : "text-slate-600 bg-slate-100 dark:text-muted-foreground dark:bg-muted/40 border-slate-200 dark:border-border"
                          }`}
                        >
                          {pct}%
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
