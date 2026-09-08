"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { useCurrentUser } from "@/components/layout/UserContext";
import { WorkpulseSharedStore, useWorkpulseSharedStore, OrgEmployee } from "@/lib/stores/workpulse-shared-store";
import { fireCelebrationConfetti, fireSuccessBurst } from "@/lib/ui/confetti";
import {
  CheckCircle2,
  Circle,
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
} from "lucide-react";

export interface SimpleTaskItem {
  id: string;
  title: string;
  category: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  progress: number;
  dueDate?: string;
  assignedBy?: string;
  assignedById?: string;
  assignedAt?: string;
  acknowledged?: boolean;
  acknowledgedAt?: string;
  acknowledgementNote?: string;
}

const VALID_CATEGORIES = ["Operations", "Planning", "Documentation", "General", "Frontend & UI", "Platform Architecture", "Security & Auth", "QA & Testing"] as const;

export const normalizeCategory = (cat: string) => {
  if (VALID_CATEGORIES.includes(cat as any)) return cat;
  if (cat.includes("HR") || cat.includes("Compliance") || cat.includes("Operations")) return "Operations";
  if (cat.includes("Planning") || cat.includes("Milestone")) return "Planning";
  if (cat.includes("Doc") || cat.includes("Probation")) return "Documentation";
  if (cat.includes("UI") || cat.includes("Frontend")) return "Frontend & UI";
  if (cat.includes("Architecture") || cat.includes("Backend")) return "Platform Architecture";
  if (cat.includes("QA") || cat.includes("Test")) return "QA & Testing";
  if (cat.includes("Auth") || cat.includes("Security")) return "Security & Auth";
  return "General";
};

export const DEFAULT_FRIENDLY_TASKS: SimpleTaskItem[] = [];

type SegregationTab = "ALL" | "TODO" | "IN_PROGRESS" | "COMPLETED" | "WEEK";

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

  // Acknowledgement response state
  const [acknowledgementNotes, setAcknowledgementNotes] = useState<Record<string, string>>({});
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);

  const myActiveHelp = useMemo(() => {
    return helpRequests.find(
      (h) =>
        (h.employeeId === currentEmp?.id ||
          h.employeeEmail?.toLowerCase() === currentEmp?.email?.toLowerCase() ||
          (currentUser?.userEmail?.toLowerCase().includes("employee.test") && h.employeeId === "emp-sarah")) &&
        (h.status === "PENDING" || h.status === "ACKNOWLEDGED")
    );
  }, [helpRequests, currentEmp, currentUser]);

  useEffect(() => {
    setMounted(true);
    let isMounted = true;

    const loadTasks = async () => {
      if (typeof window === "undefined" || !isMounted) return;
      try {
        // First attempt to load from API for cross-device consistency
        if (currentEmp?.id) {
          const res = await fetch(`/api/v1/tasks?employeeId=${currentEmp.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.data?.tasks?.length > 0 && isMounted) {
              setTasks(data.data.tasks.map((t: any) => ({
                ...t,
                category: normalizeCategory(t.category || t.project || "General"),
                progress: Number(t.progress !== undefined ? t.progress : t.completionPercentage) || 0,
                dueDate: t.dueDate || "Today",
              })));
              return;
            }
          }
        }

        // Fallback to localStorage if API is empty or fails
        const key = currentEmp?.id ? `workpulse_simple_tasks_${currentEmp.id}` : "workpulse_simple_tasks";
        const saved =
          localStorage.getItem(key) ||
          (currentEmp?.email ? localStorage.getItem(`workpulse_simple_tasks_${currentEmp.email.toLowerCase()}`) : null) ||
          localStorage.getItem("workpulse_simple_tasks");
        if (saved && isMounted) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setTasks(
              parsed.map((t: SimpleTaskItem) => ({
                ...t,
                category: normalizeCategory(t.category || "General"),
                progress: Number(t.progress !== undefined ? t.progress : (t as any).completionPercentage) || 0,
              }))
            );
            return;
          }
        }
        if (currentEmp?.plannedTasks && currentEmp.plannedTasks.length > 0 && isMounted) {
          setTasks(
            currentEmp.plannedTasks.map((t: any) => ({
              id: t.id,
              title: t.title,
              category: normalizeCategory(t.project || t.category || "General"),
              priority: t.priority || "MEDIUM",
              status: t.status === "COMPLETED" ? "COMPLETED" : t.status === "IN_PROGRESS" ? "IN_PROGRESS" : "NOT_STARTED",
              progress: Number(t.completionPercentage !== undefined ? t.completionPercentage : t.progress) || 0,
              dueDate: "Today",
            }))
          );
        } else if (isMounted) {
          setTasks([]);
        }
      } catch (err) {
        console.warn("Error loading tasks:", err);
      }
    };

    loadTasks();

    window.addEventListener("workpulse:task_assigned", loadTasks);
    window.addEventListener("workpulse:task_acknowledged", loadTasks);
    window.addEventListener("storage", loadTasks);

    return () => {
      isMounted = false;
      window.removeEventListener("workpulse:task_assigned", loadTasks);
      window.removeEventListener("workpulse:task_acknowledged", loadTasks);
      window.removeEventListener("storage", loadTasks);
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

  // Sync to localStorage, shared store, and Supabase
  const saveTasks = (updated: SimpleTaskItem[]) => {
    setTasks(updated);
    if (typeof window !== "undefined") {
      try {
        if (currentEmp?.id) {
          localStorage.setItem(`workpulse_simple_tasks_${currentEmp.id}`, JSON.stringify(updated));
        }
        if (currentEmp?.email) {
          localStorage.setItem(`workpulse_simple_tasks_${currentEmp.email.toLowerCase()}`, JSON.stringify(updated));
        }
        localStorage.setItem("workpulse_simple_tasks", JSON.stringify(updated));

        if ("BroadcastChannel" in window) {
          const bc = new BroadcastChannel("workpulse_realtime_broadcast_v1");
          bc.postMessage({ type: "employee:tasks_updated", employeeId: currentEmp?.id, timestamp: Date.now() });
          bc.close();
        }
      } catch {
        // safe fallback
      }
    }
    // Also sync to shared store
    if (currentEmp) {
      const avgProg = updated.length > 0
        ? Math.round(updated.reduce((sum, t) => sum + (Number(t.progress) || 0), 0) / updated.length)
        : 0;
      WorkpulseSharedStore.updateEmployee(currentEmp.id, {
        overallProgress: avgProg,
        plannedTasks: updated.map((t) => ({
          id: t.id,
          title: t.title,
          project: t.category,
          priority: t.priority,
          estimatedMinutes: 60,
          expectedOutput: t.title,
          completionPercentage: Number(t.progress) || 0,
          status: t.status === "COMPLETED" ? "COMPLETED" : t.status === "IN_PROGRESS" ? "IN_PROGRESS" : "NOT_STARTED",
        })),
      });

      // Background persist to API / Supabase
      updated.forEach((t) => {
        fetch(`/api/v1/tasks/${t.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            progress: Number(t.progress) || 0,
            completionPercentage: Number(t.progress) || 0,
            status: t.status,
          }),
        }).catch(() => {});
      });
    }
  };

  // Sync on initial render and when user identity is established
  useEffect(() => {
    const targetEmp = WorkpulseSharedStore.getAllEmployees().find(
      (e) => e.email.toLowerCase() === (currentUser?.userEmail || "").toLowerCase()
    );
    if (targetEmp) {
      const avgProg = tasks.length > 0
        ? Math.round(tasks.reduce((sum, t) => sum + (t.progress || 0), 0) / tasks.length)
        : 0;
      WorkpulseSharedStore.updateEmployee(targetEmp.id, {
        overallProgress: avgProg,
        plannedTasks: tasks.map((t) => ({
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
  }, [currentUser?.userEmail]);

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
    showToast(isSodSubmitted ? "✓ New task added. Click 'Resubmit Task' to sync with your Lead." : "✓ New task added.");
  };

  // Delete Task
  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    saveTasks(updated);
    // Remove the matching assignment record too, so it cannot be rehydrated by
    // the team-work views after a refresh or cross-tab sync.
    WorkpulseSharedStore.deleteAssignedTask(id);
    showToast("Task removed.");
  };

  // Submit / Resubmit Task (submits all employee tasks directly to Team Lead)
  const handleSubmitTasks = async () => {
    if (!currentEmp) return;
    setMorningSubmitted(true);
    setEveningSubmitted(false);

    if (typeof window !== "undefined") {
      try {
        const nowMs = Date.now();
        localStorage.setItem(`workpulse_morning_plan_submitted_${currentEmp.id}`, "true");
        localStorage.setItem(`workpulse_morning_plan_timestamp_${currentEmp.id}`, String(nowMs));
        if (currentEmp.email) {
          localStorage.setItem(`workpulse_morning_plan_submitted_${currentEmp.email.toLowerCase()}`, "true");
          localStorage.setItem(`workpulse_morning_plan_timestamp_${currentEmp.email.toLowerCase()}`, String(nowMs));
        }
        if (currentEmp.id === "emp-sarah" || currentEmp.email?.toLowerCase() === "employee.test@xorstack.com") {
          localStorage.setItem("workpulse_morning_plan_submitted_emp-sarah", "true");
          localStorage.setItem("workpulse_morning_plan_submitted_employee.test@xorstack.com", "true");
          localStorage.setItem("workpulse_morning_plan_timestamp_emp-sarah", String(nowMs));
          localStorage.setItem("workpulse_morning_plan_timestamp_employee.test@xorstack.com", String(nowMs));
        }
        if ("BroadcastChannel" in window) {
          const bc = new BroadcastChannel("workpulse_realtime_broadcast_v1");
          bc.postMessage({ type: "employee:sod_submitted", employeeId: currentEmp.id, timestamp: nowMs });
          bc.close();
        }
      } catch {}
    }

    const formattedTasks = tasks.map((t) => ({
      id: t.id,
      title: t.title,
      project: t.category || "General",
      priority: t.priority || "MEDIUM",
      estimatedMinutes: 60,
      completionPercentage: t.progress || 0,
      status: (t.status === "COMPLETED" ? "COMPLETED" : t.status === "IN_PROGRESS" ? "IN_PROGRESS" : "NOT_STARTED") as "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED",
      expectedOutput: t.title,
    }));

    WorkpulseSharedStore.submitEmployeeMorningPlan(
      currentEmp.id,
      formattedTasks,
      isSodSubmitted
        ? `Updated & re-submitted ${tasks.length} tasks directly from My Tasks`
        : "Submitted daily tasks directly from My Tasks"
    );

    fireSuccessBurst();
    if (isSodSubmitted) {
      showToast(`✓ Tasks updated & re-submitted to ${assignedLeadName}! (${tasks.length} tasks synced)`);
    } else {
      showToast(`✓ All ${tasks.length} tasks submitted directly to ${assignedLeadName}!`);
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

    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(`workpulse_morning_plan_submitted_${currentEmp.id}`);
        if (currentEmp.email) {
          localStorage.removeItem(`workpulse_morning_plan_submitted_${currentEmp.email.toLowerCase()}`);
        }
        localStorage.removeItem("workpulse_morning_plan_submitted_emp-sarah");
        localStorage.removeItem("workpulse_morning_plan_submitted_employee.test@xorstack.com");

        const eodTasksSnapshot = tasks.map((t) => ({
          id: t.id,
          title: t.title,
          project: t.category || "General",
          category: t.category || "General",
          priority: t.priority || "MEDIUM",
          estimatedMinutes: 60,
          completionPercentage: t.progress || 0,
          status: (t.status === "COMPLETED" || t.progress === 100 ? "COMPLETED" : t.status === "IN_PROGRESS" || (t.progress || 0) > 0 ? "IN_PROGRESS" : "NOT_STARTED") as "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED",
          expectedOutput: t.title,
        }));
        localStorage.setItem(`workpulse_eod_submitted_tasks_${currentEmp.id}`, JSON.stringify(eodTasksSnapshot));
        if (currentEmp.email) {
          localStorage.setItem(`workpulse_eod_submitted_tasks_${currentEmp.email.toLowerCase()}`, JSON.stringify(eodTasksSnapshot));
        }
        localStorage.setItem("workpulse_eod_submitted_tasks_emp-sarah", JSON.stringify(eodTasksSnapshot));
        localStorage.setItem("workpulse_eod_submitted_tasks_employee.test@xorstack.com", JSON.stringify(eodTasksSnapshot));
      } catch {}
    }

    const completed = tasks.filter((t) => t.progress === 100 || t.status === "COMPLETED");
    const rollover = tasks.filter((t) => (t.progress || 0) < 100 && t.status !== "COMPLETED");

    WorkpulseSharedStore.submitEmployeeEveningWrapup(
      currentEmp.id,
      tasks.map((t) => ({
        id: t.id,
        title: t.title,
        project: t.category,
        category: t.category,
        priority: t.priority,
        estimatedMinutes: 60,
        completionPercentage: t.progress,
        status: t.status === "COMPLETED" ? "COMPLETED" : t.status === "IN_PROGRESS" ? "IN_PROGRESS" : "NOT_STARTED",
      })),
      {
        achievements: `${completed.length} of ${tasks.length} tasks completed today`,
        blockers: "",
        tomorrowFocus: `${rollover.length} partially completed tasks carried over to next workday`,
      }
    );

    // Keep only partially completed tasks in active queue
    setTasks(rollover);

    fireCelebrationConfetti();
    showToast(`✓ Evening Wrap-Up submitted! 10-minute resubmission window open. ${completed.length} task(s) finalized. ${rollover.length} rolled over.`);
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
    const handleFeedbackUpdate = () => {
      setFeedbackVersion((v) => v + 1);
    };
    window.addEventListener("workpulse:lead_feedback_updated", handleFeedbackUpdate);
    window.addEventListener("storage", handleFeedbackUpdate);
    return () => {
      window.removeEventListener("workpulse:lead_feedback_updated", handleFeedbackUpdate);
      window.removeEventListener("storage", handleFeedbackUpdate);
    };
  }, []);

  const leadDailyFeedback = useMemo(() => {
    if (mounted && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("workpulse_lead_daily_feedback");
        if (raw) {
          const parsed = JSON.parse(raw);
          const empId = currentEmp?.id;
          const empEmail = currentEmp?.email?.toLowerCase();
          return (empId ? parsed[empId] : null) ||
            (empEmail ? parsed[empEmail] : null) ||
            (empId === "emp-sarah" || empEmail === "employee.test@xorstack.com" ? (parsed["emp-sarah"] || parsed["employee.test@xorstack.com"]) : null) ||
            null;
        }
      } catch {}
    }
    return null;
  }, [currentEmp?.id, currentEmp?.email, allEmployees, feedbackVersion, mounted]);

  const assignedLeadName = currentEmp?.teamLeadName || leadDailyFeedback?.leadName || "Alex Lead";
  const assignedDeptName = currentEmp?.departmentName || "Development";
  const leadInitials = assignedLeadName.slice(0, 2).toUpperCase();

  // Live timer tick for 10-minute EOD resubmit countdown (updates every 5 seconds)
  const [nowTick, setNowTick] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNowTick(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  const eodTimestamp = useMemo(() => {
    if (mounted && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`workpulse_eod_timestamp_${currentEmp?.id}`);
        if (raw) return Number(raw);
        if (leadDailyFeedback && leadDailyFeedback.eodTimestamp) {
          return Number(leadDailyFeedback.eodTimestamp);
        }
      } catch {}
    }
    return null;
  }, [currentEmp?.id, leadDailyFeedback, feedbackVersion, mounted, eveningSubmitted]);

  // 2-Minute EOD Resubmission Window (2 * 60 * 1000 = 120,000 ms)
  const EOD_WINDOW_MS = 2 * 60 * 1000; // 2-minute resubmission window
  const eodElapsedMs = eodTimestamp ? nowTick - eodTimestamp : Infinity;

  // Active during the 2 minutes following EOD submission
  const isEodWithin10MinWindow = Boolean(
    eodTimestamp &&
    (eveningSubmitted || currentEmp?.eodStatus === "SUBMITTED" || currentEmp?.eodStatus === "VERIFIED") &&
    eodElapsedMs < EOD_WINDOW_MS
  );
  // Show seconds remaining when under 1 minute for precision
  const eodSecondsLeft = eodTimestamp && isEodWithin10MinWindow
    ? Math.max(0, Math.ceil((EOD_WINDOW_MS - eodElapsedMs) / 1000))
    : 0;
  const eodMinutesLeft = Math.ceil(eodSecondsLeft / 60);

  // Check if morning plan was explicitly submitted today
  const isMorningPlanInStorage = useMemo(() => {
    if (mounted && typeof window !== "undefined" && currentEmp) {
      try {
        const key = `workpulse_morning_plan_submitted_${currentEmp.id}`;
        const emailKey = currentEmp.email ? `workpulse_morning_plan_submitted_${currentEmp.email.toLowerCase()}` : null;
        return (
          localStorage.getItem(key) === "true" ||
          (emailKey ? localStorage.getItem(emailKey) === "true" : false) ||
          ((currentEmp.id === "emp-sarah" || currentEmp.email?.toLowerCase() === "employee.test@xorstack.com") &&
            (localStorage.getItem("workpulse_morning_plan_submitted_emp-sarah") === "true" ||
             localStorage.getItem("workpulse_morning_plan_submitted_employee.test@xorstack.com") === "true"))
        );
      } catch {}
    }
    return false;
  }, [currentEmp?.id, currentEmp?.email, mounted, feedbackVersion, morningSubmitted]);

  // After 10 mins post-EOD (or initially before any EOD), it is a NEW DAY
  const isNewDay = !eodTimestamp || eodElapsedMs >= EOD_WINDOW_MS;

  const isSodSubmitted = Boolean(
    isNewDay &&
    !eveningSubmitted &&
    (morningSubmitted || isMorningPlanInStorage)
  );

  const isSodVerified = Boolean(
    isNewDay &&
    !eveningSubmitted &&
    isSodSubmitted &&
    ((currentEmp?.sodStatus === "VERIFIED") ||
      (leadDailyFeedback &&
        leadDailyFeedback.sodAcknowledged &&
        (!eodTimestamp || (leadDailyFeedback.sodTimestampMs || 0) > eodTimestamp)))
  );

  const sodVerifiedBy = currentEmp?.sodVerifiedBy || leadDailyFeedback?.leadName || assignedLeadName;
  const sodVerifiedAt = currentEmp?.sodVerifiedAt || leadDailyFeedback?.sodTime || "Today";
  const sodLeadNote = currentEmp?.sodLeadNote || leadDailyFeedback?.sodNote || "Morning plan verified & approved by Team Lead.";

  const isEodVerified = Boolean(
    isEodWithin10MinWindow &&
    (currentEmp?.eodStatus === "VERIFIED" ||
      (leadDailyFeedback && leadDailyFeedback.eodAcknowledged === true))
  );
  const eodVerifiedBy = currentEmp?.eodVerifiedBy || leadDailyFeedback?.eodVerifiedBy || leadDailyFeedback?.leadName || assignedLeadName;
  const eodVerifiedAt = currentEmp?.eodVerifiedAt || leadDailyFeedback?.eodTime || "Today";
  const eodLeadRating = currentEmp?.eodLeadRating || leadDailyFeedback?.eodLeadRating || leadDailyFeedback?.rating || 5;
  const eodLeadComment = currentEmp?.eodLeadComment || leadDailyFeedback?.eodLeadComment || leadDailyFeedback?.eodComment || "Great daily execution and sprint deliverables progress!";
  const eodLeadActionItem = currentEmp?.eodLeadActionItem || leadDailyFeedback?.eodLeadActionItem || leadDailyFeedback?.actionItem;

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
            myActiveHelp.status === "ACKNOWLEDGED"
              ? "border-emerald-300 dark:border-emerald-500/40 bg-gradient-to-r from-emerald-50/90 via-emerald-50/40 to-card dark:from-emerald-950/40 dark:via-card dark:to-card text-emerald-950 dark:text-foreground"
              : "border-amber-300 dark:border-amber-500/40 bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-card dark:from-amber-950/40 dark:via-card dark:to-card text-amber-950 dark:text-foreground"
          }`}
        >
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                myActiveHelp.status === "ACKNOWLEDGED"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-amber-500 text-white shadow-sm animate-pulse"
              }`}
            >
              <HelpCircle className="h-5 w-5" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <strong className="text-xs font-black text-slate-900 dark:text-foreground">
                  {myActiveHelp.status === "ACKNOWLEDGED"
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
              </div>
              <p className="text-[11px] text-slate-600 dark:text-muted-foreground">
                {myActiveHelp.leadResponse || myActiveHelp.details || "Your Team Lead has been notified in real time."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {myActiveHelp.status === "ACKNOWLEDGED" ? (
              <Button
                size="sm"
                onClick={() => {
                  resolveHelpRequest(myActiveHelp.id);
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
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white font-black text-base flex items-center justify-center shadow-md shadow-indigo-500/25 ring-4 ring-indigo-100 dark:ring-indigo-500/20 tracking-tight">
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
              <Badge variant="outline" className="text-[10px] font-bold text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30 bg-purple-100/80 dark:bg-purple-500/15">
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
              className="group relative inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white font-black text-xs shadow-lg shadow-orange-500/25 ring-2 ring-orange-400/40 dark:ring-orange-400/20 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
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
            <div className="p-3 px-4 rounded-2xl bg-amber-50 dark:bg-amber-500/15 border-2 border-amber-300 dark:border-amber-500/40 flex items-center gap-3 shadow-sm">
              <div className="h-9 w-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 animate-bounce">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-amber-900 dark:text-amber-200">
                  {myActiveHelp.status === "ACKNOWLEDGED" ? `Connected with ${assignedLeadName}` : "Help Ping Dispatched"}
                </div>
                <div className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                  {myActiveHelp.status === "ACKNOWLEDGED" ? "Reviewing with your lead" : "Awaiting response in real time"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Help Request Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-card border border-indigo-200 dark:border-indigo-500/30 shadow-2xl space-y-4 animate-in zoom-in-95">
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

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHelpModal(false)}
                  className="h-9 px-4 rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20"
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
        <Interactive3DCard className={`p-4 sm:p-5 border space-y-3 rounded-3xl transition-all ${
          isEodWithin10MinWindow
            ? "border-slate-200 dark:border-border/60 bg-slate-50/70 dark:bg-card/40 opacity-80"
            : isSodVerified
            ? "border-emerald-200 dark:border-emerald-500/40 bg-gradient-to-r from-emerald-50/70 via-emerald-50/30 to-card dark:from-emerald-950/20 dark:via-card dark:to-card shadow-sm"
            : isSodSubmitted
            ? "border-cyan-200 dark:border-cyan-500/30 bg-gradient-to-r from-cyan-50/70 via-cyan-50/30 to-card dark:from-cyan-950/20 dark:via-card dark:to-card shadow-sm"
            : "border-cyan-200 dark:border-cyan-500/20 bg-gradient-to-r from-cyan-50/60 via-slate-50/40 to-card dark:from-cyan-950/10 dark:via-card dark:to-card shadow-sm"
        }`}>
          <div className="flex items-center justify-between gap-3">
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
                    {isEodWithin10MinWindow
                      ? "✓ Day Wrapped Up"
                      : isSodVerified
                      ? "✓ Tasks Verified by Lead"
                      : isSodSubmitted
                      ? "Tasks Submitted · Active"
                      : "Ready to Submit"}
                  </Badge>
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-muted-foreground">
                  {isEodWithin10MinWindow
                    ? `Day wrapped up · Next workday starts in ${eodMinutesLeft}m with ${tasks.length} rollover task(s)`
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
              {isEodWithin10MinWindow ? (
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
          {isSodVerified && !isEodWithin10MinWindow && (
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
        <Interactive3DCard className={`p-4 sm:p-5 border space-y-3 rounded-3xl transition-all ${
          !isSodVerified && !isEodWithin10MinWindow
            ? "border-slate-200 dark:border-border/60 bg-slate-50/70 dark:bg-card/40 opacity-75 shadow-sm"
            : isEodWithin10MinWindow
            ? "border-purple-200 dark:border-purple-500/30 bg-gradient-to-r from-purple-50/70 via-purple-50/30 to-card dark:from-purple-950/20 dark:via-card dark:to-card shadow-sm"
            : isSodVerified
            ? "border-purple-200 dark:border-purple-500/20 bg-gradient-to-r from-purple-50/60 via-slate-50/30 to-card dark:from-purple-950/10 dark:via-card dark:to-card shadow-sm"
            : "border-slate-200 dark:border-border/60 bg-card/60 shadow-sm"
        }`}>
          <div className="flex items-center justify-between gap-3">
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
                      isEodWithin10MinWindow
                        ? "text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-500/30 bg-purple-100/90 dark:bg-purple-500/10 animate-pulse"
                        : !isSodSubmitted
                        ? "text-slate-600 dark:text-muted-foreground border-slate-200 dark:border-border bg-slate-100/80 dark:bg-muted/40"
                        : !isSodVerified
                        ? "text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-500/30 bg-amber-100/90 dark:bg-amber-500/10"
                        : "text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-500/30 bg-purple-100/90 dark:bg-purple-500/10"
                    }`}
                  >
                    {isEodWithin10MinWindow
                      ? "Wrap-Up Sent · Day Completed"
                      : !isSodSubmitted
                      ? "Locked · Submit SOD First"
                      : !isSodVerified
                      ? "Locked · Awaiting Lead Verification"
                      : "Ready to Submit"}
                  </Badge>
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-muted-foreground">
                  {isEodWithin10MinWindow
                    ? `Submitted to ${assignedLeadName} for evening verification`
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
              <span>Resubmissions allowed for <strong>{eodSecondsLeft < 60 ? `${eodSecondsLeft}s` : `${eodMinutesLeft}m`} more</strong> (2-min window). Workday will reset to New Day after 2 mins.</span>
            </div>
          )}

          {/* Locked reason helper note when SOD submitted but not verified yet */}
          {!isEodWithin10MinWindow && isSodSubmitted && !isSodVerified && (
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Evening wrap-up unlocks once <strong>{assignedLeadName}</strong> verifies your morning task plan.</span>
            </div>
          )}

          {/* Lead Feedback on Evening Wrap-Up */}
          {isEodVerified && isEodWithin10MinWindow && (
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
                activeTab === "WEEK"
                  ? "bg-white dark:bg-card text-slate-900 dark:text-foreground font-black shadow-sm border border-slate-200/80 dark:border-border"
                  : "text-slate-600 dark:text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-muted/30"
              }`}
            >
              Weekly Schedule
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
        {activeTab !== "WEEK" && (
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

      {/* 5. Main Content: Task List or Weekly View */}
      {activeTab === "WEEK" ? (
        /* Simple Weekly View */
        <Interactive3DCard className="p-5 border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card/60 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
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
                className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                  d.isToday
                    ? "bg-cyan-50 dark:bg-primary/10 border-cyan-300 dark:border-primary/50 shadow-sm"
                    : "bg-white dark:bg-card border-slate-200 dark:border-border/70"
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
            <div className="p-12 text-center bg-white dark:bg-card/40 rounded-3xl border border-slate-200 dark:border-border/60 text-xs text-muted-foreground space-y-2 shadow-sm">
              <CheckCircle2 className="h-8 w-8 text-slate-400 dark:text-muted-foreground mx-auto" />
              <p className="font-bold text-sm text-foreground">No tasks found</p>
              <p>You have no tasks in this view. Click &quot;Add Task&quot; above to create one.</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isDone = task.status === "COMPLETED";

              return (
                <div
                  key={task.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
                    isDone
                      ? "bg-slate-50/80 dark:bg-card/40 border-slate-200 dark:border-border/50 opacity-80"
                      : "bg-white dark:bg-card/90 border-slate-200 dark:border-border hover:border-cyan-400 dark:hover:border-primary/40 shadow-sm"
                  }`}
                >
                  {/* Left: 1-Click Complete Checkbox + Title */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => handleToggleComplete(task.id)}
                      className="mt-0.5 shrink-0 text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer"
                      title={isDone ? "Mark incomplete" : "Mark completed"}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-bold leading-snug ${
                            isDone ? "line-through text-slate-400 dark:text-muted-foreground" : "text-slate-900 dark:text-foreground"
                          }`}
                        >
                          {task.title}
                        </span>

                        <Badge variant="outline" className="text-[9px] px-2 py-0.5 rounded-full font-semibold border-slate-200 dark:border-border">
                          {task.category}
                        </Badge>

                        {task.priority === "HIGH" && (
                          <Badge variant="destructive" className="text-[9px] px-2 py-0.5 rounded-full font-bold">
                            Important
                          </Badge>
                        )}

                        {task.assignedBy && (
                          <Badge className="bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full">
                            👤 Assigned by {task.assignedBy}
                          </Badge>
                        )}

                        {task.assignedBy && !task.acknowledged && (
                          <Badge className="bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                            ⏳ Awaiting Acknowledgement
                          </Badge>
                        )}

                        {task.assignedBy && task.acknowledged && (
                          <Badge className="bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full">
                            ✓ Acknowledged ({task.acknowledgedAt || "Accepted"})
                          </Badge>
                        )}
                      </div>

                      {task.assignedBy && task.acknowledged && task.acknowledgementNote && (
                        <p className="text-[11px] text-slate-500 dark:text-muted-foreground italic pt-0.5">
                          💬 <strong>Your Note to Lead:</strong> &quot;{task.acknowledgementNote}&quot;
                        </p>
                      )}

                      {task.assignedBy && !task.acknowledged && (
                        <div className="flex items-center gap-2 pt-1">
                          {acknowledgingId === task.id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                type="text"
                                placeholder="Reply to lead (e.g. Starting now!)..."
                                value={acknowledgementNotes[task.id] || ""}
                                onChange={(e) =>
                                  setAcknowledgementNotes({ ...acknowledgementNotes, [task.id]: e.target.value })
                                }
                                className="h-8 text-xs bg-white dark:bg-background min-w-[200px]"
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
                                className="h-7 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white gap-1 shadow-sm cursor-pointer px-2.5 rounded-lg"
                              >
                                <Check className="h-3 w-3" />
                                <span>Accept &amp; Acknowledge</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setAcknowledgingId(task.id)}
                                className="h-7 text-[11px] font-semibold gap-1 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 cursor-pointer px-2.5 rounded-lg"
                              >
                                <MessageSquare className="h-3 w-3" />
                                <span>Add Note</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Adjustable Progress Slider with Quick Presets */}
                      <div className="space-y-1.5 pt-1 max-w-sm">
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={Number(task.progress) || 0}
                            onChange={(e) => handleSetTaskProgress(task.id, Number(e.target.value))}
                            onInput={(e) => handleSetTaskProgress(task.id, Number((e.target as HTMLInputElement).value))}
                            className="progress-range-slider flex-1"
                            title={`Drag to set progress: ${task.progress || 0}%`}
                          />
                          <span className="text-xs font-mono font-black text-sky-600 dark:text-sky-400 w-12 text-right shrink-0 bg-sky-50 dark:bg-sky-950/40 px-1.5 py-0.5 rounded-md border border-sky-200 dark:border-sky-500/20">
                            {Number(task.progress) || 0}%
                          </span>
                        </div>

                        {/* Quick Preset Buttons */}
                        <div className="flex items-center gap-1.5">
                          {[0, 25, 50, 75, 100].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => handleSetTaskProgress(task.id, pct)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                (Number(task.progress) || 0) === pct
                                  ? "bg-sky-600 text-white shadow-sm ring-1 ring-sky-400"
                                  : "bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground hover:bg-slate-200 dark:hover:bg-muted/80 hover:text-foreground"
                              }`}
                            >
                              {pct === 100 ? "100% ✓" : `${pct}%`}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Action Controls */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleToggleComplete(task.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        isDone
                          ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
                          : "bg-slate-100 dark:bg-muted text-slate-700 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground border border-slate-200 dark:border-border"
                      }`}
                    >
                      {isDone ? "✓ Done" : "Mark Done"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
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
