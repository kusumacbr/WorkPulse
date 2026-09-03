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

export const DEFAULT_FRIENDLY_TASKS: SimpleTaskItem[] = [
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

  const [tasks, setTasks] = useState<SimpleTaskItem[]>(DEFAULT_FRIENDLY_TASKS);
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
    const loadTasks = () => {
      if (typeof window !== "undefined") {
        try {
          const key = currentEmp?.id ? `workpulse_simple_tasks_${currentEmp.id}` : "workpulse_simple_tasks";
          const saved =
            localStorage.getItem(key) ||
            (currentEmp?.email ? localStorage.getItem(`workpulse_simple_tasks_${currentEmp.email.toLowerCase()}`) : null) ||
            localStorage.getItem("workpulse_simple_tasks");
          if (saved) {
            const parsed = JSON.parse(saved);
            // An empty array is a valid saved state: it means the user deleted every task.
            // Do not fall back to the default demo tasks after a refresh in that case.
            if (Array.isArray(parsed)) {
              setTasks(
                parsed.map((t: SimpleTaskItem) => ({
                  ...t,
                  category: normalizeCategory(t.category || "General"),
                }))
              );
            }
          }
        } catch {}
      }
    };

    loadTasks();

    window.addEventListener("workpulse:task_assigned", loadTasks);
    window.addEventListener("workpulse:task_acknowledged", loadTasks);
    window.addEventListener("workpulse_sync", loadTasks);
    window.addEventListener("storage", loadTasks);

    return () => {
      window.removeEventListener("workpulse:task_assigned", loadTasks);
      window.removeEventListener("workpulse:task_acknowledged", loadTasks);
      window.removeEventListener("workpulse_sync", loadTasks);
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

  // Sync to localStorage and shared store
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
        window.dispatchEvent(new CustomEvent("workpulse_sync"));

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
        ? Math.round(updated.reduce((sum, t) => sum + (t.progress || 0), 0) / updated.length)
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
          completionPercentage: t.progress,
          status: t.status === "COMPLETED" ? "COMPLETED" : t.status === "IN_PROGRESS" ? "IN_PROGRESS" : "NOT_STARTED",
        })),
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
        <div className="p-4 sm:p-5 rounded-3xl border-2 border-indigo-500/50 bg-gradient-to-r from-indigo-950/40 via-card to-card shadow-lg shadow-indigo-500/15 space-y-3.5 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 shadow-sm">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-black text-foreground flex items-center gap-2 flex-wrap">
                  <span>New Deliverable Assigned by {unacknowledgedAssignedTasks[0]?.assignedBy || assignedLeadName}</span>
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40 text-[10px] font-bold px-2 py-0.5">
                    Action Required
                  </Badge>
                </h4>
                <p className="text-xs text-muted-foreground">
                  Your Team Lead assigned work to your daily queue. Please acknowledge receipt below.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/15 px-3 py-1 rounded-full border border-indigo-500/30 self-start sm:self-auto shrink-0">
              {unacknowledgedAssignedTasks.length} Pending Acceptance
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            {unacknowledgedAssignedTasks.map((task) => (
              <div
                key={task.id}
                className="p-3.5 rounded-2xl bg-card/90 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-sm"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="text-xs font-bold text-foreground">{task.title}</strong>
                    <Badge variant="outline" className="text-[9px] font-bold text-cyan-400 border-cyan-500/30">
                      {task.category}
                    </Badge>
                    <Badge variant={task.priority === "HIGH" ? "destructive" : "outline"} className="text-[9px]">
                      {task.priority} Priority
                    </Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-2 flex-wrap">
                    <span>Assigned: <strong>{task.assignedAt || "Today"}</strong></span>
                    <span>•</span>
                    <span>Assigned by: <strong className="text-indigo-400">{task.assignedBy || assignedLeadName}</strong></span>
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
                        className="h-8 text-xs font-semibold gap-1 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10 cursor-pointer"
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
              ? "border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 via-card to-card text-foreground"
              : "border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-card to-card text-foreground"
          }`}
        >
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                myActiveHelp.status === "ACKNOWLEDGED"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse"
              }`}
            >
              <HelpCircle className="h-5 w-5" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <strong className="text-xs font-bold text-foreground">
                  {myActiveHelp.status === "ACKNOWLEDGED"
                    ? `✓ ${assignedLeadName} Connected`
                    : `Help Requested from ${assignedLeadName}`}
                </strong>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold ${
                    myActiveHelp.urgency === "URGENT"
                      ? "text-rose-400 border-rose-500/30 bg-rose-500/10"
                      : "text-cyan-400 border-cyan-500/30 bg-cyan-500/10"
                  }`}
                >
                  {myActiveHelp.topic}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
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
      <div className="relative overflow-hidden p-4 sm:p-5 rounded-3xl border-2 border-indigo-500/40 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-card shadow-lg shadow-indigo-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-indigo-500/30 ring-2 ring-indigo-400/40 shrink-0">
              {leadInitials}
            </div>
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center" title="Lead Active">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                Reporting Team Lead
              </span>
              <Badge variant="outline" className="text-[10px] font-bold text-indigo-300 border-indigo-500/30 bg-indigo-500/10">
                {assignedDeptName} Team
              </Badge>
            </div>
            <h3 className="text-base font-black text-foreground tracking-tight">
              {assignedLeadName}
            </h3>
            <p className="text-xs text-muted-foreground">
              Daily task plans, verification sign-offs &amp; evening wrap-ups sync directly to your lead.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!myActiveHelp ? (
            <Button
              onClick={() => setShowHelpModal(true)}
              className="h-11 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-xs gap-2 shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/30 transition-all hover:scale-[1.03] active:scale-[0.98]"
            >
              <HelpCircle className="h-4 w-4 text-white animate-pulse" />
              <span>Need Help from Lead?</span>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold px-3 py-1.5 animate-pulse flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Help Requested</span>
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Help Request Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-card border border-indigo-500/30 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Need Help from Team Lead?</h3>
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
                        ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
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
                        ? "border-rose-500/50 bg-rose-500/10 text-rose-400"
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
                  className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20"
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
        <Interactive3DCard className={`p-4 border space-y-3 ${
          isEodWithin10MinWindow
            ? "border-border/60 bg-card/40 opacity-80"
            : isSodVerified
            ? "border-emerald-500/40 bg-emerald-500/5"
            : isSodSubmitted
            ? "border-cyan-500/30 bg-cyan-500/5"
            : "border-cyan-500/20 bg-cyan-500/5"
        }`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                isEodWithin10MinWindow
                  ? "bg-muted text-muted-foreground"
                  : isSodVerified
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-cyan-500/15 text-cyan-400"
              }`}>
                <ListTodo className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span>Today&apos;s Task Plan</span>
                  <Badge
                    variant="outline"
                    className={`text-[9px] font-bold ${
                      isEodWithin10MinWindow
                        ? "text-muted-foreground border-border bg-muted/40"
                        : isSodVerified
                        ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                        : isSodSubmitted
                        ? "text-cyan-400 border-cyan-500/30 bg-cyan-500/10"
                        : "text-amber-300 border-amber-500/30 bg-amber-500/10"
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
                <p className="text-[11px] text-muted-foreground">
                  {isEodWithin10MinWindow
                    ? `Day wrapped up · Next workday starts in ${eodMinutesLeft}m with ${tasks.length} rollover task(s)`
                    : isSodVerified
                    ? `Verified by ${sodVerifiedBy} (${sodVerifiedAt})`
                    : isSodSubmitted
                    ? `Submitted to ${assignedLeadName} at ${currentEmp?.sodTime || 'Just now'}`
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
                  className="text-xs font-semibold h-8 shrink-0 flex items-center gap-1.5 transition-all text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/10 cursor-pointer shadow-sm"
                  title="Update and resubmit morning SOD plan if any tasks were missed"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Resubmit Task</span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleSubmitTasks}
                  className="text-xs font-bold h-8 shrink-0 flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Task</span>
                </Button>
              )}
            </div>
          </div>

          {/* Lead Feedback / Verification on Tasks */}
          {isSodVerified && !isEodWithin10MinWindow && (
            <div className="p-2.5 rounded-lg bg-background/80 border border-emerald-500/25 text-xs flex items-center justify-between gap-2 animate-in fade-in">
              <span className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span><strong>{sodVerifiedBy}:</strong> &quot;{sodLeadNote}&quot;</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400/80 shrink-0">Verified</span>
            </div>
          )}

          {isSodSubmitted && !isSodVerified && !isEodWithin10MinWindow && (
            <div className="p-2.5 rounded-lg bg-background/80 border border-cyan-500/20 text-xs flex items-center justify-between gap-2 animate-in fade-in">
              <span className="text-[11px] text-cyan-300 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 shrink-0 animate-pulse text-cyan-400" />
                <span>Tasks submitted to Lead. Click &quot;Resubmit Task&quot; anytime to update before or during workday.</span>
              </span>
              <span className="text-[10px] font-mono text-muted-foreground shrink-0">Pending Lead Review</span>
            </div>
          )}
        </Interactive3DCard>

        {/* Evening Wrap-Up */}
        <Interactive3DCard className={`p-4 border space-y-3 ${
          !isSodVerified && !isEodWithin10MinWindow
            ? "border-border/60 bg-card/40 opacity-75"
            : isEodWithin10MinWindow
            ? "border-purple-500/30 bg-purple-500/5"
            : isSodVerified
            ? "border-purple-500/20 bg-purple-500/5"
            : "border-border/60 bg-card/40"
        }`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                !isSodVerified && !isEodWithin10MinWindow
                  ? "bg-muted text-muted-foreground"
                  : "bg-purple-500/15 text-purple-400"
              }`}>
                {!isSodVerified && !isEodWithin10MinWindow ? <Lock className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span>Evening Wrap-Up</span>
                  <Badge
                    variant="outline"
                    className={`text-[9px] font-bold ${
                      isEodWithin10MinWindow
                        ? "text-purple-300 border-purple-500/30 bg-purple-500/10 animate-pulse"
                        : !isSodSubmitted
                        ? "text-muted-foreground border-border bg-muted/40"
                        : !isSodVerified
                        ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
                        : "text-purple-300 border-purple-500/30 bg-purple-500/10"
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
                <p className="text-[11px] text-muted-foreground">
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
                  className="text-xs font-semibold h-8 shrink-0 flex items-center gap-1.5 transition-all text-purple-300 border-purple-500/40 hover:bg-purple-500/10 cursor-pointer shadow-sm"
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
                  className="text-xs font-bold h-8 shrink-0 flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white shadow-sm cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Wrap-Up</span>
                </Button>
              )}
            </div>
          </div>

          {/* 10-Minute Window Helper Note */}
          {isEodWithin10MinWindow && (
            <div className="text-[10px] text-purple-300/90 flex items-center gap-1 pt-0.5">
              <Clock className="h-3 w-3 text-purple-400 shrink-0" />
              <span>Resubmissions allowed for <strong>{eodSecondsLeft < 60 ? `${eodSecondsLeft}s` : `${eodMinutesLeft}m`} more</strong> (2-min window). Workday will reset to New Day after 2 mins.</span>
            </div>
          )}

          {/* Locked reason helper note when SOD submitted but not verified yet */}
          {!isEodWithin10MinWindow && isSodSubmitted && !isSodVerified && (
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0 text-amber-400" />
              <span>Evening wrap-up unlocks once <strong>{assignedLeadName}</strong> verifies your morning task plan.</span>
            </div>
          )}

          {/* Lead Feedback on Evening Wrap-Up */}
          {isEodVerified && isEodWithin10MinWindow && (
            <div className="p-2.5 rounded-lg bg-background/80 border border-emerald-500/25 space-y-1 text-xs animate-in fade-in">
              <div className="flex items-center justify-between text-emerald-400 font-bold text-[11px]">
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>Rated {eodLeadRating}.0 / 5 Stars by {eodVerifiedBy}</span>
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">{eodVerifiedAt}</span>
              </div>
              <p className="text-foreground/90 italic">&quot;{eodLeadComment}&quot;</p>
              {eodLeadActionItem && (
                <p className="text-[11px] text-muted-foreground">🎯 <strong>Action Item:</strong> {eodLeadActionItem}</p>
              )}
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

                        {task.assignedBy && (
                          <Badge className="bg-indigo-500/15 text-indigo-400 border-indigo-500/30 text-[9px] font-bold px-1.5 py-0">
                            👤 Assigned by {task.assignedBy}
                          </Badge>
                        )}

                        {task.assignedBy && !task.acknowledged && (
                          <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[9px] font-bold px-1.5 py-0 animate-pulse">
                            ⏳ Awaiting Acknowledgement
                          </Badge>
                        )}

                        {task.assignedBy && task.acknowledged && (
                          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[9px] font-bold px-1.5 py-0">
                            ✓ Acknowledged ({task.acknowledgedAt || "Accepted"})
                          </Badge>
                        )}
                      </div>

                      {task.assignedBy && task.acknowledged && task.acknowledgementNote && (
                        <p className="text-[10px] text-muted-foreground italic pt-0.5">
                          💬 <strong>Your Note to Lead:</strong> &quot;{task.acknowledgementNote}&quot;
                        </p>
                      )}

                      {task.assignedBy && !task.acknowledged && (
                        <div className="flex items-center gap-2 pt-1">
                          {acknowledgingId === task.id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                type="text"
                                placeholder="Note to lead..."
                                value={acknowledgementNotes[task.id] || ""}
                                onChange={(e) =>
                                  setAcknowledgementNotes({ ...acknowledgementNotes, [task.id]: e.target.value })
                                }
                                className="h-7 text-xs max-w-xs"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                onClick={() => handleAcknowledgeTask(task.id)}
                                className="h-7 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                              >
                                Send
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setAcknowledgingId(null)}
                                className="h-7 text-[10px]"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleAcknowledgeTask(task.id, "Understood & accepted. Starting work now.")}
                                className="h-6 text-[10px] px-2.5 font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg cursor-pointer shadow-sm"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                <span>Acknowledge</span>
                              </Button>
                              <button
                                type="button"
                                onClick={() => setAcknowledgingId(task.id)}
                                className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
                              >
                                Add Note
                              </button>
                            </div>
                          )}
                        </div>
                      )}

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
