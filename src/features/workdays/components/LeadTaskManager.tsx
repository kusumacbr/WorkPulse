"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TeamHeatmapGrid } from "@/features/team/components/TeamHeatmapGrid";
import { deduplicateTasks } from "@/features/workdays/components/SimpleTaskManager";
import { fireCelebrationConfetti, fireSuccessBurst } from "@/lib/ui/confetti";
import {
  Users,
  CheckCircle2,
  Plus,
  ListTodo,
  Send,
  Star,
  ChevronUp,
  ChevronRight,
  Trash2,
  Check,
  Moon,
  Clock,
  Layers,
  Eye,
  HelpCircle,
  ShieldCheck,
  MessageSquare,
  Sun,
  Activity,
} from "lucide-react";

export interface LeadPersonalTask {
  id: string;
  title: string;
  category?: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  progress: number;
  timeSlot?: string;
}

export interface AssignedTaskLogItem {
  id: string;
  title: string;
  category?: string;
  project?: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  progress: number;
  dueDate?: string;
  assignedBy: string;
  assignedById?: string;
  assignedAt: string;
  acknowledged?: boolean;
  acknowledgedAt?: string;
  acknowledgementNote?: string;
  targetEmployeeId: string;
  targetEmployeeName: string;
  targetEmployeeEmail: string;
  targetEmployeeAvatar?: string;
  targetEmployeeDesignation?: string;
}

const DEFAULT_ASSIGNED_TASKS_LOG: AssignedTaskLogItem[] = [];

const DEFAULT_LEAD_TASKS: LeadPersonalTask[] = [];

type LeadTaskTab = "TEAM_UPDATES" | "ASSIGN_WORK" | "HEATMAP" | "MY_TASKS";

import { useCurrentUser } from "@/components/layout/UserContext";
import { useWorkpulseSharedStore, WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";



export function LeadTaskManager() {
  const currentUser = useCurrentUser();
  const { allEmployees, helpRequests, acknowledgeHelpRequest, resolveHelpRequest } = useWorkpulseSharedStore();

  const currentLeadEmp = useMemo(() => {
    const emailLower = (currentUser?.userEmail || "").toLowerCase();
    return allEmployees.find(
      (e) =>
        e.email.toLowerCase() === emailLower ||
        e.id === currentUser?.userEmail ||
        (emailLower === "lead.test@xorstack.com" && e.id === "lead-alex")
    );
  }, [allEmployees, currentUser]);

  const leadName = currentLeadEmp?.name || currentUser.userName || "Alex Lead";
  const leadId = currentLeadEmp?.id || "lead-alex";

  const [feedbackVersion, setFeedbackVersion] = useState(0);
  const [expandedApprovedTasks, setExpandedApprovedTasks] = useState<Record<string, boolean>>({});
  const [expandedWrapupTasks, setExpandedWrapupTasks] = useState<Record<string, boolean>>({});

  const [mounted, setMounted] = useState(false);

  // Live Assigned Deliverables Log
  const [assignedTasksLog, setAssignedTasksLog] = useState<AssignedTaskLogItem[]>(DEFAULT_ASSIGNED_TASKS_LOG);

  const loadAssignedTasksLog = async () => {
    try {
      const res = await fetch(`/api/v1/tasks/assigned?leadId=${leadId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.data?.tasks)) {
          setAssignedTasksLog(data.data.tasks);
          if (typeof window !== "undefined") {
            if (data.data.tasks.length === 0) {
              localStorage.removeItem("workpulse_assigned_tasks_log");
            } else {
              localStorage.setItem("workpulse_assigned_tasks_log", JSON.stringify(data.data.tasks));
            }
          }
          return;
        }
      }
    } catch {}
    setAssignedTasksLog([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("workpulse_assigned_tasks_log");
    }
  };

  React.useEffect(() => {
    setMounted(true);
    loadAssignedTasksLog();

    const handleUpdate = () => {
      setFeedbackVersion((v) => v + 1);
      loadAssignedTasksLog();
    };

    const handleFocus = () => {
      loadAssignedTasksLog();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("workpulse:lead_feedback_updated", handleUpdate);
    window.addEventListener("workpulse:task_assigned", handleUpdate);
    window.addEventListener("workpulse:task_acknowledged", handleUpdate);
    window.addEventListener("workpulse:tasks_changed", handleUpdate);
    window.addEventListener("workpulse:task_deleted", handleUpdate);
    window.addEventListener("workday:sod_submitted", handleUpdate);
    window.addEventListener("workday:eod_submitted", handleUpdate);
    window.addEventListener("workday:eod_verified", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        bc = new BroadcastChannel("workpulse_realtime_broadcast_v1");
        bc.onmessage = (ev) => {
          if (ev.data?.type === "task:progress_changed") {
            const { taskId, progress, status } = ev.data;
            setAssignedTasksLog((prev) =>
              prev.map((t) => (t.id === taskId ? { ...t, progress, status: status || t.status } : t))
            );
            return;
          }
          if (
            ev.data?.type === "task:acknowledged" ||
            ev.data?.type === "task:assigned" ||
            ev.data?.type === "task:recalled" ||
            ev.data?.type === "employee:sod_submitted"
          ) {
            handleUpdate();
          }
        };
      }
    } catch {}

    return () => {
      if (bc) bc.close();
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("workpulse:lead_feedback_updated", handleUpdate);
      window.removeEventListener("workpulse:task_assigned", handleUpdate);
      window.removeEventListener("workpulse:task_acknowledged", handleUpdate);
      window.removeEventListener("workpulse:tasks_changed", handleUpdate);
      window.removeEventListener("workpulse:task_deleted", handleUpdate);
      window.removeEventListener("workday:sod_submitted", handleUpdate);
      window.removeEventListener("workday:eod_submitted", handleUpdate);
      window.removeEventListener("workday:eod_verified", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [leadId]);



  // Live clock tick so the Lead view re-evaluates in real-time every second
  const [nowTick, setNowTick] = React.useState(Date.now());
  React.useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // 2-minute EOD resubmission window (must match SimpleTaskManager)
  const EOD_WINDOW_MS = 2 * 60 * 1000;

  // Returns { eodSubmitted, newDayStarted, eodTimestamp }
  // newDayStarted = EOD was submitted today, approved by lead, and 2-min window already elapsed → new workday
  const getEodNewDayState = React.useCallback((memberId: string, memberEmail?: string) => {
    if (!mounted || typeof window === "undefined") return { eodSubmitted: false, newDayStarted: false, eodTimestamp: null };

    const todayKey = new Date().toISOString().split("T")[0];
    const hasFlag = (id: string) =>
      localStorage.getItem(`workpulse_eod_submitted_${id}_${todayKey}`) === "true";

    const storeEmp = allEmployees.find(
      (e) => e.id.toLowerCase() === memberId.toLowerCase() || (memberEmail && e.email.toLowerCase() === memberEmail.toLowerCase())
    );

    const eodSubmitted = Boolean(
      hasFlag(memberId) ||
      (memberEmail ? hasFlag(memberEmail.toLowerCase()) : false) ||
      ((memberId === "emp-sarah" || memberEmail?.toLowerCase() === "employee.test@xorstack.com") &&
        (hasFlag("emp-sarah") || hasFlag("employee.test@xorstack.com"))) ||
      storeEmp?.eodStatus === "SUBMITTED" ||
      storeEmp?.eodStatus === "VERIFIED"
    );

    if (!eodSubmitted) return { eodSubmitted: false, newDayStarted: false, eodTimestamp: null };

    // Read timestamp to check if 2-min window has elapsed (only active if approved)
    const rawTs =
      localStorage.getItem(`workpulse_eod_approved_timestamp_${memberId}`) ||
      localStorage.getItem(`workpulse_eod_timestamp_${memberId}`) ||
      (memberEmail ? localStorage.getItem(`workpulse_eod_approved_timestamp_${memberEmail.toLowerCase()}`) : null);
    const eodTimestamp = rawTs ? Number(rawTs) : null;
    const elapsed = eodTimestamp ? nowTick - eodTimestamp : Infinity;
    const isApproved = storeEmp?.eodStatus === "VERIFIED" || Boolean(eodTimestamp);
    const newDayStarted = isApproved && elapsed >= EOD_WINDOW_MS;

    // If the employee already submitted a fresh SOD for the new day,
    // treat this as a completely clean slate — no previous day's EOD data shown
    if (newDayStarted) {
      const hasSodFlag = (id: string) =>
        localStorage.getItem(`workpulse_morning_plan_submitted_${id}`) === "true";

      const freshSodSubmitted = (
        hasSodFlag(memberId) ||
        (memberEmail ? hasSodFlag(memberEmail.toLowerCase()) : false) ||
        ((memberId === "emp-sarah" || memberEmail?.toLowerCase() === "employee.test@xorstack.com") &&
          (hasSodFlag("emp-sarah") || hasSodFlag("employee.test@xorstack.com")))
      );

      if (freshSodSubmitted) {
        // New day SOD submitted → completely fresh state: no EOD, no new-day banner
        return { eodSubmitted: false, newDayStarted: false, eodTimestamp: null };
      }
    }

    return { eodSubmitted, newDayStarted, eodTimestamp };
  }, [mounted, nowTick, feedbackVersion, allEmployees]);

  const leadFeedbackMap = useMemo(() => {
    if (mounted && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("workpulse_lead_daily_feedback");
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    return {};
  }, [allEmployees, feedbackVersion, mounted]);

  // Dynamic direct reports from shared store (strictly reports of this lead)
  const dynamicTeamMembers = useMemo(() => {
    const members = allEmployees.filter(
      (e) =>
        e.id !== leadId &&
        e.id !== "lead-alex" &&
        e.email.toLowerCase() !== (currentUser.userEmail || "").toLowerCase() &&
        !e.email.toLowerCase().includes("lead") &&
        !e.email.toLowerCase().includes("hr") &&
        (e.teamLeadId === leadId ||
          e.departmentId === "dept-development" ||
          e.departmentName?.toLowerCase().includes("development") ||
          (leadId === "lead-alex" && (e.id === "emp-sarah" || e.id === "emp-rohit" || e.email.toLowerCase().includes("employee.test"))) ||
          e.teamLeadName?.toLowerCase() === leadName.toLowerCase())
    );
    return members;
  }, [allEmployees, leadId, leadName, currentUser.userEmail]);

  const [memberTasksMap, setMemberTasksMap] = useState<Record<string, any[]>>({});
  const dynamicTeamMemberIds = dynamicTeamMembers.map(m => m.id).join(',');

  useEffect(() => {
    let isSubscribed = true;
    const fetchAllTasks = async () => {
      if (!dynamicTeamMembers || dynamicTeamMembers.length === 0) return;
      const newMap: Record<string, any[]> = {};
      for (const m of dynamicTeamMembers) {
        try {
          const [tasksRes, assignedRes] = await Promise.all([
            fetch(`/api/v1/tasks?employeeId=${m.id}`),
            fetch(`/api/v1/tasks/assigned?employeeId=${m.id}`)
          ]);
          let memberTasks: any[] = [];
          if (tasksRes.ok) {
            const data = await tasksRes.json();
            if (Array.isArray(data.data?.tasks)) {
              memberTasks = [...memberTasks, ...data.data.tasks];
            }
          }
          if (assignedRes.ok) {
            const data = await assignedRes.json();
            if (Array.isArray(data.data?.tasks)) {
              memberTasks = [...memberTasks, ...data.data.tasks];
            }
          }
          newMap[m.id] = deduplicateTasks(memberTasks);
        } catch (e) {
          console.warn("Failed to fetch API tasks for", m.id, e);
          newMap[m.id] = [];
        }
      }
      if (isSubscribed) {
        setMemberTasksMap(newMap);
      }
    };

    let fetchTimer: any = null;
    const debouncedFetch = () => {
      if (fetchTimer) clearTimeout(fetchTimer);
      fetchTimer = setTimeout(() => {
        if (isSubscribed) fetchAllTasks();
      }, 300);
    };

    const interval = setInterval(fetchAllTasks, 3000);
    window.addEventListener("focus", debouncedFetch);
    window.addEventListener("workpulse:tasks_changed", debouncedFetch);
    window.addEventListener("workpulse:task_deleted", debouncedFetch);
    window.addEventListener("workday:sod_submitted", debouncedFetch);
    window.addEventListener("employee:sod_submitted", debouncedFetch);
    window.addEventListener("workpulse_sync", debouncedFetch);

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        bc = new BroadcastChannel("workpulse_realtime_broadcast_v1");
        bc.onmessage = (ev) => {
          if (
            ev.data?.type === "daily_tasks:changed" ||
            ev.data?.type === "task:deleted" ||
            ev.data?.type === "tasks_changed" ||
            ev.data?.type === "employee:sod_submitted" ||
            ev.data?.type === "employee:tasks_updated" ||
            ev.data?.type === "workday:sod_submitted" ||
            ev.data?.type === "workpulse_sync"
          ) {
            debouncedFetch();
          }
        };
      }
    } catch {}

    return () => {
      isSubscribed = false;
      clearInterval(interval);
      if (bc) bc.close();
      window.removeEventListener("focus", debouncedFetch);
      window.removeEventListener("workpulse:tasks_changed", debouncedFetch);
      window.removeEventListener("workpulse:task_deleted", debouncedFetch);
      window.removeEventListener("workday:sod_submitted", debouncedFetch);
      window.removeEventListener("employee:sod_submitted", debouncedFetch);
      window.removeEventListener("workpulse_sync", debouncedFetch);
    };
  }, [dynamicTeamMemberIds, feedbackVersion, mounted]);

  const [activeTab, setActiveTab] = useState<LeadTaskTab>("TEAM_UPDATES");
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [memberFilter, setMemberFilter] = useState("ALL");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Per-member inputs for Morning and Evening verifications
  const [activeSodNotes, setActiveSodNotes] = useState<Record<string, string>>({});
  const [activeRatings, setActiveRatings] = useState<Record<string, number>>({});
  const [activeComments, setActiveComments] = useState<Record<string, string>>({});
  const [activeActionItems, setActiveActionItems] = useState<Record<string, string>>({});

  // Assign deliverable form state (Tab 2)
  const [assigneeId, setAssigneeId] = useState<string>(dynamicTeamMembers[0]?.id || "emp-sarah");
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Operations");
  const [newPriority, setNewPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("MEDIUM");

  // Lead personal task state (Tab 3)
  const [leadTasks, setLeadTasks] = useState<LeadPersonalTask[]>(DEFAULT_LEAD_TASKS);

  useEffect(() => {
    const loadLeadTasks = async () => {
      try {
        const res = await fetch(`/api/v1/tasks/lead-tasks/sync?leadId=${leadId}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.data?.tasks)) {
            setLeadTasks(data.data.tasks);
            if (typeof window !== "undefined") {
              localStorage.setItem("workpulse_lead_personal_tasks", JSON.stringify(data.data.tasks));
            }
            return;
          }
        }
      } catch {}
      // Fallback to localStorage
      if (typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem("workpulse_lead_personal_tasks");
          if (saved !== null) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              setLeadTasks(parsed);
              return;
            }
          }
        } catch {}
      }
      setLeadTasks([]);
    };
    loadLeadTasks();
  }, [leadId]);

  const [showAddLeadTask, setShowAddLeadTask] = useState(false);
  const [leadTaskTitle, setLeadTaskTitle] = useState("");
  const [leadTaskCategory, setLeadTaskCategory] = useState("Operations");
  const [leadTaskFilter, setLeadTaskFilter] = useState<"ALL" | "OPEN" | "COMPLETED">("ALL");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const saveLeadTasks = async (updated: LeadPersonalTask[]) => {
    setLeadTasks(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("workpulse_lead_personal_tasks", JSON.stringify(updated));
      } catch {}
    }
    // Sync to Supabase
    try {
      await fetch(`/api/v1/tasks/lead-tasks/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, tasks: updated }),
      });
    } catch {}
  };

  // 1-Click Verify & Approve Morning Plan
  const handleApproveMorningPlan = (empId: string, empName: string) => {
    const note = activeSodNotes[empId]?.trim() || "Morning plan verified & approved by Team Lead.";
    WorkpulseSharedStore.leadVerifyMorningPlan(empId, leadName, note);
    setActiveSodNotes((prev) => ({ ...prev, [empId]: "" }));
    fireSuccessBurst();
    showToast(`✓ Morning plan for ${empName} verified & approved!`);
  };

  // 1-Click Verify & Approve Evening Wrap-Up
  const handleSendEveningFeedback = (empId: string, empName: string) => {
    const comment = activeComments[empId]?.trim() || "Great daily execution and sprint deliverables progress!";
    const rating = activeRatings[empId] || 5;
    const actionItem = activeActionItems[empId]?.trim() || "Present highlights in tomorrow's sync.";

    WorkpulseSharedStore.leadVerifyEveningWrapup(empId, leadName, {
      rating,
      comment,
      actionItem,
    });

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel("workpulse_realtime_broadcast_v1");
        bc.postMessage({ type: "workday:eod_approved", employeeId: empId, timestamp: Date.now() });
        bc.close();
      } catch {}
    }

    setActiveComments((prev) => ({ ...prev, [empId]: "" }));
    fireCelebrationConfetti();
    showToast(`✓ Evening wrap-up for ${empName} verified & feedback sent! 2-min next-day countdown started.`);
  };

  // Assign deliverable (Tab 2)
  const handleAssignWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const targetEmp = dynamicTeamMembers.find((e) => e.id === assigneeId) || dynamicTeamMembers[0];
    const targetName = targetEmp ? targetEmp.name : "Team Member";
    const taskId = `atask-${Date.now()}`;

    WorkpulseSharedStore.assignTaskToEmployee(assigneeId, {
      id: taskId,
      title: newTitle.trim(),
      category: newCategory,
      project: newCategory,
      priority: newPriority,
      assignedBy: leadName,
      assignedById: leadId,
    });

    // Also save to Supabase
    try {
      await fetch(`/api/v1/tasks/assigned`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: taskId,
          title: newTitle.trim(),
          category: newCategory,
          priority: newPriority,
          assignedBy: leadName,
          assignedById: leadId,
          targetEmployeeId: assigneeId,
          targetEmployeeName: targetName,
          targetEmployeeEmail: targetEmp?.email || "",
        }),
      });
    } catch {}

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel("workpulse_realtime_broadcast_v1");
        bc.postMessage({ type: "task:assigned", targetEmployeeId: assigneeId, taskId, timestamp: Date.now() });
        bc.close();
      } catch {}
    }

    loadAssignedTasksLog();
    setNewTitle("");
    fireSuccessBurst();
    showToast(`✓ Work assigned to ${targetName}! Sent in real time.`);
  };

  // Recall / Delete assigned task (permanent Supabase delete)
  const handleDeleteAssignedTask = async (taskId: string) => {
    WorkpulseSharedStore.deleteAssignedTask(taskId);
    const updated = assignedTasksLog.filter((t) => t.id !== taskId);
    setAssignedTasksLog(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("workpulse_assigned_tasks_log", JSON.stringify(updated));
      } catch {}
    }
    // Delete from Supabase permanently
    try {
      await fetch(`/api/v1/tasks/assigned`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });
    } catch {}

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel("workpulse_realtime_broadcast_v1");
        bc.postMessage({ type: "task:recalled", taskId, timestamp: Date.now() });
        bc.close();
      } catch {}
    }

    showToast("Assigned task recalled / removed permanently.");
  };

  // Toggle lead personal task
  const handleToggleLeadTask = (id: string) => {
    const updated = leadTasks.map((t) => {
      if (t.id !== id) return t;
      const isDone = t.status !== "COMPLETED";
      if (isDone) fireSuccessBurst();
      return {
        ...t,
        status: isDone ? ("COMPLETED" as const) : ("IN_PROGRESS" as const),
        progress: isDone ? 100 : 50,
      };
    });
    saveLeadTasks(updated);
    showToast("✓ Task updated.");
  };

  // Add new lead personal task
  const handleAddLeadTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadTaskTitle.trim()) return;

    const newTask: LeadPersonalTask = {
      id: `lt-${Date.now()}`,
      title: leadTaskTitle.trim(),
      category: leadTaskCategory,
      priority: "MEDIUM",
      status: "NOT_STARTED",
      progress: 0,
      timeSlot: "Today",
    };

    const updated = [newTask, ...leadTasks];
    saveLeadTasks(updated);
    setLeadTaskTitle("");
    setShowAddLeadTask(false);
    showToast(`✓ Added: "${newTask.title}"`);
  };

  // Delete lead personal task (permanent Supabase & local delete)
  const handleDeleteLeadTask = async (id: string) => {
    const updated = leadTasks.filter((t) => t.id !== id);
    setLeadTasks(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("workpulse_lead_personal_tasks", JSON.stringify(updated));
      } catch {}
    }
    // Delete from Supabase permanently
    try {
      await fetch(`/api/v1/tasks/lead-tasks/sync`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: id, leadId }),
      });
    } catch {}
    await saveLeadTasks(updated);
    showToast("Task removed permanently.");
  };

  const filteredMembers = useMemo(() => {
    if (memberFilter === "ALL") return dynamicTeamMembers;
    return dynamicTeamMembers.filter((m) => m.id === memberFilter);
  }, [memberFilter, dynamicTeamMembers]);

  const filteredLeadTasks = useMemo(() => {
    return leadTasks.filter((t) => {
      if (leadTaskFilter === "OPEN" && t.status === "COMPLETED") return false;
      if (leadTaskFilter === "COMPLETED" && t.status !== "COMPLETED") return false;
      return true;
    });
  }, [leadTasks, leadTaskFilter]);

  const activeTeamHelpRequests = useMemo(() => {
    return helpRequests.filter(
      (h) => h.status !== "RESOLVED" && !h.resolvedByLead
    );
  }, [helpRequests]);

  return (
    <div className="space-y-5">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Real-Time Live Team Assistance Queue (SOS Requests) */}
      {activeTeamHelpRequests.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl border border-rose-500/30 bg-gradient-to-r from-rose-500/[0.06] via-card to-card space-y-3.5 shadow-md animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold animate-pulse">
                <HelpCircle className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                  <span>Team Assistance Requests</span>
                  <Badge variant="outline" className="text-[10px] font-bold text-rose-400 border-rose-500/30 bg-rose-500/10">
                    {activeTeamHelpRequests.length} Active SOS
                  </Badge>
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Direct reports requesting lead unblocking or technical guidance in real time.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {activeTeamHelpRequests.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-2xl bg-card border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="text-foreground text-xs font-bold">{req.employeeName}</strong>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold ${
                        req.urgency === "URGENT"
                          ? "text-rose-400 border-rose-500/30 bg-rose-500/10"
                          : "text-cyan-400 border-cyan-500/30 bg-cyan-500/10"
                      }`}
                    >
                      {req.topic}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">{req.createdAt}</span>
                    {req.resolvedByEmployee ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                        ✓ Employee Resolved
                      </Badge>
                    ) : req.status === "ACKNOWLEDGED" ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                        ✓ Connected
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-xs text-foreground/90 font-medium leading-relaxed">
                    &ldquo;{req.details || "Assistance needed on sprint task."}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {req.status === "PENDING" ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        acknowledgeHelpRequest(req.id, "Alex Lead has acknowledged and will connect with you shortly.");
                        fireSuccessBurst();
                        showToast(`✓ Acknowledged ${req.employeeName}'s help request!`);
                      }}
                      className="text-xs h-8 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-sm"
                    >
                      Acknowledge &amp; Connect
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => {
                        resolveHelpRequest(req.id, "lead");
                        fireCelebrationConfetti();
                        showToast(`✓ Resolved help request for ${req.employeeName}!`);
                      }}
                      className="text-xs h-8 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1 shadow-sm"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Mark Resolved</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1. Sleek Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 rounded-2xl bg-card/80 border border-border">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("TEAM_UPDATES")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === "TEAM_UPDATES"
                ? "bg-primary text-primary-foreground font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Team Updates ({dynamicTeamMembers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ASSIGN_WORK")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === "ASSIGN_WORK"
                ? "bg-primary text-primary-foreground font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Assign Work ({assignedTasksLog.length})</span>
            {assignedTasksLog.filter((t) => !t.acknowledged).length > 0 && (
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("HEATMAP")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === "HEATMAP"
                ? "bg-primary text-primary-foreground font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Presence &amp; Submission Heatmap</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("MY_TASKS")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === "MY_TASKS"
                ? "bg-primary text-primary-foreground font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <ListTodo className="h-3.5 w-3.5" />
            <span>My Tasks ({leadTasks.length})</span>
          </button>
        </div>

        {activeTab === "MY_TASKS" && (
          <Button
            size="sm"
            variant="brand"
            onClick={() => setShowAddLeadTask(!showAddLeadTask)}
            className="text-xs font-bold gap-1.5 h-8 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{showAddLeadTask ? "Close" : "Add Task"}</span>
          </Button>
        )}
      </div>

      {/* 2. TAB 1: TEAM UPDATES */}
      {activeTab === "TEAM_UPDATES" && (
        <div className="space-y-3">
          {/* Real-Time Live Oversight Banner */}
          <div className="p-3 rounded-2xl bg-card/80 border border-border/80 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Activity className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-foreground">Live Team</h4>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  LIVE
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <div className="px-2.5 py-1 rounded-lg bg-background/80 border border-border/70 flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground uppercase">Avg</span>
                <span className="font-mono font-bold text-cyan-400">
                  {(() => {
                    let totalProg = 0;
                    let activeCount = 0;
                    dynamicTeamMembers.forEach((m) => {
                      const isSpecialSarah = m.id === "emp-sarah" || m.email?.toLowerCase() === "employee.test@xorstack.com";
                      let isSubmitted = false;
                      try {
                        if (mounted) {
                          const local = localStorage.getItem(`workpulse_morning_plan_submitted_${m.id}`);
                          const localEmail = m.email ? localStorage.getItem(`workpulse_morning_plan_submitted_${m.email.toLowerCase()}`) : null;
                          const localSarah1 = isSpecialSarah ? localStorage.getItem("workpulse_morning_plan_submitted_emp-sarah") : null;
                          const localSarah2 = isSpecialSarah ? localStorage.getItem("workpulse_morning_plan_submitted_employee.test@xorstack.com") : null;
                          if (local === "true" || localEmail === "true" || localSarah1 === "true" || localSarah2 === "true") {
                            isSubmitted = true;
                          } else if (!isSpecialSarah && (m.sodStatus === "SUBMITTED" || m.sodStatus === "VERIFIED")) {
                            isSubmitted = true;
                          }
                        }
                      } catch {}

                      if (isSubmitted) {
                        let tasks: any[] = m.plannedTasks || [];
                        try {
                          if (mounted) {
                            const local =
                              localStorage.getItem(`workpulse_simple_tasks_${m.id}`) ||
                              (m.email ? localStorage.getItem(`workpulse_simple_tasks_${m.email.toLowerCase()}`) : null) ||
                              (isSpecialSarah ? localStorage.getItem("workpulse_simple_tasks") : null);
                            if (local) {
                              const parsed = JSON.parse(local);
                              if (Array.isArray(parsed) && parsed.length > 0) tasks = deduplicateTasks(parsed);
                            }
                          }
                        } catch {}
                        tasks = deduplicateTasks(tasks);
                        const prog =
                          tasks.length > 0
                            ? Math.round(
                                tasks.reduce((sum, t) => sum + (Number(t.progress !== undefined ? t.progress : (t.completionPercentage || 0)) || 0), 0) /
                                  tasks.length
                              )
                            : (Number(m.overallProgress) || 0);
                        totalProg += prog;
                        activeCount++;
                      }
                    });
                    return activeCount > 0 ? Math.round(totalProg / activeCount) : 0;
                  })()}%
                </span>
              </div>

            </div>
          </div>

          {/* Member Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setMemberFilter("ALL")}
              className={`px-3 py-1 rounded-lg font-semibold text-xs transition-all ${
                memberFilter === "ALL"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "bg-muted/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({dynamicTeamMembers.length})
            </button>
            {dynamicTeamMembers.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMemberFilter(m.id)}
                className={`px-3 py-1 rounded-lg font-semibold text-xs whitespace-nowrap transition-all ${
                  memberFilter === m.id
                    ? "bg-primary text-primary-foreground font-bold shadow-sm"
                    : "bg-muted/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>

          {/* Differentiated Member Cards */}
          <div className="space-y-3">
            {filteredMembers.map((member) => {
              const isExpanded = expandedMemberId === member.id;

              // EOD + new day state — derived from date-scoped localStorage flag + 2-min window check
              const { eodSubmitted: isLocalEodSubmitted, newDayStarted: isNewDayForMember } =
                getEodNewDayState(member.id, member.email);

              const fb = leadFeedbackMap[member.id] ||
                (member.email ? leadFeedbackMap[member.email.toLowerCase()] : null) ||
                (member.id === "emp-sarah" || member.email?.toLowerCase() === "employee.test@xorstack.com" ? (leadFeedbackMap["employee.test@xorstack.com"] || leadFeedbackMap["emp-sarah"]) : null);

              // Check if morning plan was explicitly submitted by employee in localStorage
              const isSpecialSarah = member.id === "emp-sarah" || member.email?.toLowerCase() === "employee.test@xorstack.com";
              const hasLocalSodFlag = mounted && typeof window !== "undefined" && (
                localStorage.getItem(`workpulse_morning_plan_submitted_${member.id}`) === "true" ||
                (member.email ? localStorage.getItem(`workpulse_morning_plan_submitted_${member.email.toLowerCase()}`) === "true" : false) ||
                (isSpecialSarah &&
                  (localStorage.getItem("workpulse_morning_plan_submitted_emp-sarah") === "true" ||
                   localStorage.getItem("workpulse_morning_plan_submitted_employee.test@xorstack.com") === "true"))
              );

              // isEodSubmitted: employee has submitted today's EOD
              const isEodSubmitted = !isNewDayForMember && (
                isLocalEodSubmitted ||
                member.eodStatus === "SUBMITTED" ||
                member.eodStatus === "VERIFIED"
              );

              // SOD is submitted if employee submitted today, or if EOD was submitted (which implies work was done)
              const isSodSubmitted = !isNewDayForMember && (
                hasLocalSodFlag ||
                isEodSubmitted ||
                member.sodStatus === "SUBMITTED" ||
                member.sodStatus === "VERIFIED"
              );

              const isSodVerified = Boolean(
                !isNewDayForMember &&
                (isSodSubmitted || isEodSubmitted) &&
                (member.sodStatus === "VERIFIED" || (fb && fb.sodAcknowledged === true))
              );

              // Exact submission timestamp (no real-time ticks)
              const localSodTimestamp = mounted && typeof window !== "undefined"
                ? (
                    localStorage.getItem(`workpulse_morning_plan_timestamp_${member.id}`) ||
                    (member.email ? localStorage.getItem(`workpulse_morning_plan_timestamp_${member.email.toLowerCase()}`) : null) ||
                    (isSpecialSarah ? (localStorage.getItem("workpulse_morning_plan_timestamp_emp-sarah") || localStorage.getItem("workpulse_morning_plan_timestamp_employee.test@xorstack.com")) : null)
                  )
                : null;

              const displaySodTime = isSodSubmitted
                ? (localSodTimestamp
                    ? new Date(Number(localSodTimestamp)).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : (member.sodTime || fb?.sodTime || "Submitted"))
                : null;

              const localEodTimestamp = mounted && typeof window !== "undefined"
                ? (
                    localStorage.getItem(`workpulse_eod_timestamp_${member.id}`) ||
                    (member.email ? localStorage.getItem(`workpulse_eod_timestamp_${member.email.toLowerCase()}`) : null) ||
                    (isSpecialSarah ? (localStorage.getItem("workpulse_eod_timestamp_emp-sarah") || localStorage.getItem("workpulse_eod_timestamp_employee.test@xorstack.com")) : null)
                  )
                : null;

              const displayEodTime = isEodSubmitted
                ? (localEodTimestamp
                    ? new Date(Number(localEodTimestamp)).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : (member.eodTime || fb?.eodSubmittedTime || fb?.eodTime || "Submitted"))
                : null;

              const sodVerifiedBy = member.sodVerifiedBy || fb?.leadName || leadName;
              const sodVerifiedAt = member.sodVerifiedAt || fb?.sodTime || displaySodTime || "Today";
              const sodLeadNote = member.sodLeadNote || fb?.sodNote || "Morning plan verified & approved by Team Lead.";

              // isEodVerified: lead has acknowledged the EOD in the feedback store
              const isEodVerified = !isNewDayForMember && isEodSubmitted && Boolean(fb && fb.eodAcknowledged === true);
              const eodVerifiedBy = member.eodVerifiedBy || fb?.eodVerifiedBy || fb?.leadName || leadName;
              const eodVerifiedAt = member.eodVerifiedAt || fb?.eodTime || displayEodTime || "Today";
              const eodLeadRating = member.eodLeadRating || fb?.eodLeadRating || fb?.rating || 5;
              const eodLeadComment = member.eodLeadComment || fb?.eodLeadComment || fb?.eodComment || "Great daily execution and sprint deliverables progress!";
              const eodLeadActionItem = member.eodLeadActionItem || fb?.eodLeadActionItem || fb?.actionItem || "Present highlights in tomorrow's sync.";

              // Tasks to display: Supabase tasks from memberTasksMap are authoritative
              let tasksToDisplay: any[] = [];

              const memTasks = memberTasksMap[member.id];
              if (memTasks !== undefined && memTasks.length > 0) {
                tasksToDisplay = memTasks;
              } else if (member.plannedTasks && member.plannedTasks.length > 0) {
                tasksToDisplay = deduplicateTasks(member.plannedTasks);
              } else if (memTasks !== undefined) {
                tasksToDisplay = memTasks;
              }

              // Fallback to submitted EOD snapshot if member is in EOD submitted state
              if (tasksToDisplay.length === 0 && (isEodSubmitted || isSodSubmitted) && mounted && typeof window !== "undefined") {
                try {
                  const savedEodRaw =
                    localStorage.getItem(`workpulse_eod_submitted_tasks_${member.id}`) ||
                    (member.email ? localStorage.getItem(`workpulse_eod_submitted_tasks_${member.email.toLowerCase()}`) : null) ||
                    (isSpecialSarah ? localStorage.getItem("workpulse_eod_submitted_tasks_emp-sarah") : null);
                  if (savedEodRaw) {
                    const parsed = JSON.parse(savedEodRaw);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                      tasksToDisplay = deduplicateTasks(parsed);
                    }
                  }
                } catch {}
              }

              // Merge active assigned deliverables for this member from server log
              const memberAssigned = assignedTasksLog.filter(
                (at) =>
                  at.targetEmployeeId === member.id ||
                  (member.email && at.targetEmployeeEmail?.toLowerCase() === member.email.toLowerCase()) ||
                  (isSpecialSarah && (at.targetEmployeeId === "emp-sarah" || at.targetEmployeeEmail?.includes("employee.test")))
              );
              if (memberAssigned.length > 0) {
                tasksToDisplay = deduplicateTasks([...memberAssigned, ...tasksToDisplay]);
              } else {
                tasksToDisplay = deduplicateTasks(tasksToDisplay);
              }

              const memberProgress =
                (isSodSubmitted || isEodSubmitted) && tasksToDisplay.length > 0
                  ? Math.round(
                      tasksToDisplay.reduce((sum, t) => {
                        const pct = Number(t.progress !== undefined ? t.progress : (t.completionPercentage !== undefined ? t.completionPercentage : 0)) || 0;
                        return sum + pct;
                      }, 0) / tasksToDisplay.length
                    )
                  : (isEodSubmitted && member.overallProgress ? member.overallProgress : (member.overallProgress || 0));

              return (
                <div
                  key={member.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isSodVerified && isEodVerified
                      ? "border-emerald-300 dark:border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-500/[0.02] shadow-sm"
                      : isEodSubmitted || isSodSubmitted
                      ? "border-cyan-300 dark:border-cyan-500/40 bg-cyan-50/40 dark:bg-cyan-500/[0.02] shadow-sm"
                      : "border-slate-200 dark:border-border bg-white dark:bg-card/60 shadow-sm"
                  }`}
                >
                  {/* Clickable Header Row */}
                  <div
                    onClick={() => setExpandedMemberId(isExpanded ? null : member.id)}
                    className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-muted/20 transition-colors select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Avatar */}
                      <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                        {member.avatar || member.name.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-semibold text-slate-900 dark:text-foreground truncate">{member.name}</strong>
                          <span className="text-xs text-slate-500 dark:text-muted-foreground hidden sm:inline">· {member.designation}</span>
                          <span className="text-[10px] text-slate-600 dark:text-muted-foreground px-1.5 py-0.5 rounded bg-slate-100 dark:bg-muted/40 border border-slate-200/60 dark:border-transparent hidden md:inline">
                            {member.workMode === "OFFICE" ? "Office" : "Remote"}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                          {isNewDayForMember ? (
                            <span className="text-cyan-700 dark:text-cyan-400 font-bold">Awaiting morning plan</span>
                          ) : (
                            <>
                              <span>Plan: <span className="text-slate-900 dark:text-foreground font-semibold">{displaySodTime || (isEodSubmitted ? (displayEodTime ? `Ended at ${displayEodTime}` : "Day Ended") : "Pending")}</span></span>

                              {isEodSubmitted && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-purple-700 dark:text-purple-300 font-bold">
                                  <Moon className="h-2.5 w-2.5" />
                                  <span>Day Ended</span>
                                </span>
                              )}
                              <span>·</span>
                              <span>
                                Progress: <strong className="text-cyan-700 dark:text-cyan-400 font-mono font-black">{memberProgress}%</strong>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isNewDayForMember ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs font-bold gap-1.5 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/30 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 rounded-xl"
                          >
                            <Sun className="h-3.5 w-3.5" />
                            <span>View Details</span>
                            <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-90 text-cyan-500" : ""}`} />
                          </Button>
                        ) : (
                          <>
                            {/* SOD Status Badge / Navigation */}
                            {isEodSubmitted ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                <span>SOD Completed</span>
                              </span>
                            ) : isSodVerified ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                <span>Plan Verified</span>
                              </span>
                            ) : isSodSubmitted ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-100 dark:bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30 flex items-center gap-1 animate-pulse">
                                <Clock className="h-3 w-3" />
                                <span>Verify Plan</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>Plan Pending</span>
                              </span>
                            )}

                            {/* Navigation Action Button */}
                            <Button
                              size="sm"
                              variant={isSodSubmitted && !isSodVerified ? "brand" : isEodSubmitted && !isEodVerified ? "amber" : "outline"}
                              className="h-8 text-xs font-bold gap-1 rounded-xl shadow-xs"
                            >
                              <span>
                                {isSodSubmitted && !isSodVerified
                                  ? "Review Plan"
                                  : isEodSubmitted && !isEodVerified
                                  ? "Review Wrap-Up"
                                  : "View Details"}
                              </span>
                              <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Body: Vertical Stack (Approved Tasks on top, Evening Wrap-Up below) */}
                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-slate-200/80 dark:border-border/40 animate-in fade-in">
                      <div className="flex flex-col gap-4 mt-4">

                        {/* 🌅 New Workday Banner — shown when EOD is done + 2-min window elapsed */}
                        {isNewDayForMember && (
                          <div className="p-4 rounded-2xl border border-cyan-200 dark:border-cyan-500/40 bg-gradient-to-r from-cyan-50/90 via-slate-50/40 to-white dark:from-cyan-950/30 dark:via-card dark:to-card flex flex-col gap-3 shadow-sm">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <div className="flex items-center gap-2.5">
                                <span className="p-1.5 rounded-xl bg-cyan-100 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 shrink-0 border border-cyan-200 dark:border-cyan-500/30">
                                  <Sun className="h-4 w-4" />
                                </span>
                                <div>
                                  <p className="text-sm font-black text-cyan-950 dark:text-cyan-300 leading-tight">New Workday Started</p>
                                  <p className="text-[11px] text-slate-600 dark:text-muted-foreground">
                                    {member.name}&apos;s previous day is complete. Awaiting today&apos;s morning SOD plan.
                                  </p>
                                </div>
                              </div>
                              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cyan-100 dark:bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30 shrink-0 flex items-center gap-1 shadow-sm">
                                <Clock className="h-3 w-3" />
                                Day Reset
                              </span>
                            </div>
                            {/* Yesterday's EOD summary strip */}
                            {isEodVerified && (
                              <div className="p-3 rounded-xl bg-purple-50/90 dark:bg-purple-500/[0.06] border border-purple-200 dark:border-purple-500/20 text-[11px] flex items-center gap-3">
                                <span className="p-1 rounded-md bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 shrink-0 border border-purple-200 dark:border-purple-500/30">
                                  <Moon className="h-3.5 w-3.5" />
                                </span>
                                <div className="min-w-0">
                                  <span className="font-bold text-purple-900 dark:text-purple-300">Yesterday&apos;s Wrap-Up:</span>
                                  <span className="text-slate-600 dark:text-muted-foreground ml-1.5 font-medium">Rated {eodLeadRating}.0★ · Verified by {eodVerifiedBy}</span>
                                  {eodLeadComment && (
                                    <p className="text-[10px] text-slate-500 dark:text-muted-foreground/80 italic truncate mt-0.5">&quot;{eodLeadComment}&quot;</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* ☀️ Top Panel: Morning Tasks (SOD) */}
                        {isNewDayForMember ? (
                          /* New day: waiting for employee to submit fresh SOD */
                          <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/80 dark:bg-amber-500/[0.03] flex items-center gap-3 shadow-inner">
                            <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 shrink-0 border border-amber-200 dark:border-amber-500/20">
                              <ListTodo className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-amber-900 dark:text-amber-300">Morning SOD Plan — Awaiting Submission</p>
                              <p className="text-[11px] text-slate-600 dark:text-muted-foreground">
                                {member.name} hasn&apos;t submitted today&apos;s morning tasks yet.
                              </p>
                            </div>
                          </div>
                        ) : isEodSubmitted ? (
                          /* EOD submitted: show a compact locked SOD summary — no actions needed */
                          <div className="p-3.5 rounded-2xl border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-500/[0.04] flex items-center justify-between gap-3 shadow-inner">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 shrink-0 border border-emerald-200 dark:border-emerald-500/30">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs font-black text-emerald-900 dark:text-emerald-300">
                                  SOD Plan — Day Complete
                                </p>
                                <p className="text-[11px] text-slate-600 dark:text-muted-foreground truncate">
                                  {tasksToDisplay.length} task(s) approved by {sodVerifiedBy} · EOD submitted
                                </p>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 shrink-0">
                              Locked
                            </span>
                          </div>
                        ) : !isSodSubmitted ? (
                          /* SOD not submitted: show awaiting message */
                          <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/80 dark:bg-amber-500/[0.03] flex items-center gap-3 shadow-inner">
                            <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 shrink-0 border border-amber-200 dark:border-amber-500/20">
                              <ListTodo className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-amber-900 dark:text-amber-300">Morning SOD Plan — Awaiting Submission</p>
                              <p className="text-[11px] text-slate-600 dark:text-muted-foreground">
                                {member.name} hasn&apos;t submitted today&apos;s morning tasks yet.
                              </p>
                            </div>
                          </div>
                        ) : (
                        <div className={`p-4 rounded-2xl border space-y-3 shadow-inner ${
                          isSodVerified
                            ? "bg-emerald-50/70 dark:bg-emerald-500/[0.04] border-emerald-200 dark:border-emerald-500/25"
                            : "bg-amber-50/70 dark:bg-amber-500/[0.04] border-amber-200 dark:border-amber-500/25"
                        }`}>
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className={`font-bold text-xs flex items-center gap-1.5 ${
                              isSodVerified ? "text-emerald-900 dark:text-emerald-300" : "text-amber-900 dark:text-amber-300"
                            }`}>
                              <span className={`p-1 rounded-md ${
                                isSodVerified ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30" : "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30"
                              }`}>
                                {isSodVerified ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ListTodo className="h-3.5 w-3.5" />}
                              </span>
                              <span>{isSodVerified ? "Approved Tasks" : "Submitted Tasks"} ({tasksToDisplay.length})</span>
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-mono font-medium ${
                                isSodVerified ? "text-emerald-800 dark:text-emerald-400/80" : "text-amber-800 dark:text-amber-400/80"
                              }`}>
                                {displaySodTime ? `Submitted at ${displaySodTime}` : "Not submitted yet"}
                              </span>
                            </div>
                          </div>

                          {isSodVerified ? (
                            /* When Approved: Summary card with inline toggleable task list */
                            <div className="space-y-3 py-1">
                              <div className="p-3.5 rounded-xl bg-emerald-100/70 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs flex items-center justify-between gap-3 shadow-sm">
                                <div className="space-y-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-emerald-950 dark:text-emerald-300 text-xs">
                                      {tasksToDisplay.length} Tasks Verified &amp; Approved
                                    </span>
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-200/80 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                                      {memberProgress}% Progress
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 dark:text-muted-foreground">
                                    Verified by <strong className="text-slate-900 dark:text-foreground">{sodVerifiedBy}</strong> ({sodVerifiedAt})
                                  </p>
                                </div>

                                <Button
                                  size="sm"
                                  variant="brand"
                                  onClick={() => setExpandedApprovedTasks((prev) => ({
                                    ...prev,
                                    [member.id]: !prev[member.id],
                                  }))}
                                  className="h-8 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 shrink-0 rounded-xl cursor-pointer"
                                >
                                  {expandedApprovedTasks[member.id] ? (
                                    <>
                                      <ChevronUp className="h-3.5 w-3.5" />
                                      <span>Hide Approved Tasks</span>
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-3.5 w-3.5" />
                                      <span>View Approved Tasks</span>
                                    </>
                                  )}
                                </Button>
                              </div>

                              <div className="p-3 rounded-xl bg-white dark:bg-background/80 border border-emerald-200 dark:border-emerald-500/20 text-[11px] text-slate-600 dark:text-muted-foreground flex items-center gap-2 shadow-sm">
                                <span className="text-emerald-700 dark:text-emerald-400 font-bold shrink-0">Lead Note:</span>
                                <span className="italic truncate text-slate-700 dark:text-foreground/90">&quot;{sodLeadNote}&quot;</span>
                              </div>

                              {/* Inline Approved Tasks List (Expands below without opening a new window) */}
                              {expandedApprovedTasks[member.id] && (
                                <div className="space-y-2 pt-2 border-t border-emerald-200 dark:border-emerald-500/20 animate-in fade-in slide-in-from-top-2">
                                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-emerald-400 px-0.5">
                                    <span>Approved Deliverables ({tasksToDisplay.length})</span>
                                    <span className="font-mono text-[10px] text-slate-500 dark:text-muted-foreground">{memberProgress}% Completed</span>
                                  </div>
                                  <div className="space-y-2">
                                    {tasksToDisplay.map((t, i) => {
                                      const pct = Number(t.progress !== undefined ? t.progress : (t.completionPercentage !== undefined ? t.completionPercentage : 0)) || 0;
                                      const isDone = pct === 100 || t.status === "COMPLETED";
                                      return (
                                        <div
                                          key={t.id || i}
                                          className="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-background/90 border border-slate-200 dark:border-emerald-500/15 space-y-2.5 hover:border-emerald-400 dark:hover:border-emerald-500/30 transition-all shadow-sm"
                                        >
                                          <div className="flex items-center justify-between gap-2.5">
                                            <div className="space-y-1 min-w-0 flex-1">
                                              <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`text-xs font-bold leading-snug truncate ${isDone ? "text-slate-900 dark:text-foreground" : "text-slate-800 dark:text-foreground/90"}`}>
                                                  {t.title}
                                                </span>
                                                <Badge variant="outline" className="text-[9px] px-1.5 py-0.2 rounded-md font-bold bg-slate-50 dark:bg-muted/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-border">
                                                  {t.project || "General"}
                                                </Badge>
                                                {t.priority && (
                                                  <Badge variant={t.priority === "HIGH" ? "destructive" : "outline"} className="text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                                                    {t.priority === "HIGH" ? "Important" : "Normal"}
                                                  </Badge>
                                                )}
                                              </div>
                                              {t.expectedOutput && t.expectedOutput !== t.title && (
                                                <p className="text-[10px] text-slate-500 dark:text-muted-foreground truncate max-w-md">
                                                  Deliverable: {t.expectedOutput}
                                                </p>
                                              )}
                                            </div>

                                            {/* Progress Status Capsule */}
                                            <div className="flex items-center gap-1.5 shrink-0">
                                              <span
                                                className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border transition-all ${
                                                  isDone
                                                    ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/30"
                                                    : pct > 0
                                                    ? "text-sky-700 bg-sky-50 dark:text-sky-400 dark:bg-sky-950/40 border-sky-200 dark:border-sky-500/30"
                                                    : "text-slate-600 bg-slate-50 dark:text-muted-foreground dark:bg-muted/40 border border-slate-200 dark:border-border"
                                                }`}
                                              >
                                                <span className={`h-1.5 w-1.5 rounded-full ${isDone ? "bg-emerald-500 animate-pulse" : pct > 0 ? "bg-sky-500 animate-pulse" : "bg-slate-400"}`} />
                                                <span>{pct}%</span>
                                              </span>
                                            </div>
                                          </div>

                                          {/* Sleek Milestone Progress Meter */}
                                          <div className="space-y-1">
                                            <div className="h-1.5 w-full bg-slate-100 dark:bg-muted/60 rounded-full overflow-hidden border border-slate-200/60 dark:border-transparent">
                                              <div
                                                className={`h-full rounded-full transition-all duration-500 ease-out ${
                                                  isDone
                                                    ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                                                    : pct >= 50
                                                    ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                                                    : pct > 0
                                                    ? "bg-gradient-to-r from-amber-500 to-orange-400"
                                                    : "bg-slate-200 dark:bg-muted"
                                                }`}
                                                style={{ width: `${pct}%` }}
                                              />
                                            </div>
                                            <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 dark:text-muted-foreground px-0.5">
                                              <span className={pct >= 0 ? "font-bold text-slate-600 dark:text-slate-400" : ""}>0%</span>
                                              <span className={pct >= 25 ? "font-bold text-slate-600 dark:text-slate-400" : ""}>25%</span>
                                              <span className={pct >= 50 ? "font-bold text-slate-600 dark:text-slate-400" : ""}>50%</span>
                                              <span className={pct >= 75 ? "font-bold text-slate-600 dark:text-slate-400" : ""}>75%</span>
                                              <span className={pct >= 100 ? "font-bold text-emerald-600 dark:text-emerald-400" : ""}>100% ✓</span>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            /* When Awaiting Verification / Resubmitted: Show inline tasks list for review */
                            <>
                              <div className="space-y-2 text-xs">
                                {tasksToDisplay.length > 0 ? (
                                  tasksToDisplay.map((t, i) => {
                                    const pct = Number(t.progress !== undefined ? t.progress : (t.completionPercentage !== undefined ? t.completionPercentage : 0)) || 0;
                                    const isDone = pct === 100 || t.status === "COMPLETED";
                                    return (
                                      <div
                                        key={t.id || i}
                                        className="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-background/90 border border-amber-200 dark:border-amber-500/15 space-y-2.5 hover:border-amber-400 dark:hover:border-amber-500/30 transition-all shadow-sm"
                                      >
                                        <div className="flex items-center justify-between gap-2.5">
                                          <div className="space-y-1 min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span className={`text-xs font-bold leading-snug truncate ${isDone ? "text-slate-900 dark:text-foreground" : "text-slate-800 dark:text-foreground/90"}`}>
                                                {t.title}
                                              </span>
                                              <Badge variant="outline" className="text-[9px] px-1.5 py-0.2 rounded-md font-bold bg-slate-50 dark:bg-muted/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-border">
                                                {t.project || "General"}
                                              </Badge>
                                              {t.priority && (
                                                <Badge variant={t.priority === "HIGH" ? "destructive" : "outline"} className="text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                                                  {t.priority === "HIGH" ? "Important" : "Normal"}
                                                </Badge>
                                              )}
                                            </div>
                                            {t.expectedOutput && t.expectedOutput !== t.title && (
                                              <p className="text-[10px] text-slate-500 dark:text-muted-foreground truncate max-w-md">
                                                Deliverable: {t.expectedOutput}
                                              </p>
                                            )}
                                          </div>

                                          {/* Progress Status Capsule */}
                                          <div className="flex items-center gap-1.5 shrink-0">
                                            <span
                                              className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border transition-all ${
                                                isDone
                                                  ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/30"
                                                  : pct > 0
                                                  ? "text-sky-700 bg-sky-50 dark:text-sky-400 dark:bg-sky-950/40 border-sky-200 dark:border-sky-500/30"
                                                  : "text-slate-600 bg-slate-50 dark:text-muted-foreground dark:bg-muted/40 border border-slate-200 dark:border-border"
                                              }`}
                                            >
                                              <span className={`h-1.5 w-1.5 rounded-full ${isDone ? "bg-emerald-500 animate-pulse" : pct > 0 ? "bg-sky-500 animate-pulse" : "bg-slate-400"}`} />
                                              <span>{pct}%</span>
                                            </span>
                                          </div>
                                        </div>

                                        {/* Sleek Milestone Progress Meter */}
                                        <div className="space-y-1">
                                          <div className="h-1.5 w-full bg-slate-100 dark:bg-muted/60 rounded-full overflow-hidden border border-slate-200/60 dark:border-transparent">
                                            <div
                                              className={`h-full rounded-full transition-all duration-500 ease-out ${
                                                isDone
                                                  ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                                                  : pct >= 50
                                                  ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                                                  : pct > 0
                                                  ? "bg-gradient-to-r from-amber-500 to-orange-400"
                                                  : "bg-slate-200 dark:bg-muted"
                                              }`}
                                              style={{ width: `${pct}%` }}
                                            />
                                          </div>
                                          <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 dark:text-muted-foreground px-0.5">
                                            <span className={pct >= 0 ? "font-bold text-slate-600 dark:text-slate-400" : ""}>0%</span>
                                            <span className={pct >= 25 ? "font-bold text-slate-600 dark:text-slate-400" : ""}>25%</span>
                                            <span className={pct >= 50 ? "font-bold text-slate-600 dark:text-slate-400" : ""}>50%</span>
                                            <span className={pct >= 75 ? "font-bold text-slate-600 dark:text-slate-400" : ""}>75%</span>
                                            <span className={pct >= 100 ? "font-bold text-emerald-600 dark:text-emerald-400" : ""}>100% ✓</span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="p-3 text-center text-slate-500 dark:text-muted-foreground text-[11px] bg-slate-50 dark:bg-background/50 rounded-xl border border-slate-200/60 dark:border-transparent">
                                    No specific tasks submitted yet.
                                  </div>
                                )}
                              </div>

                              {member.sodEmployeeNote && (
                                <div className="p-2.5 rounded-xl bg-amber-100/80 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-200">
                                  <strong>Employee Note:</strong> &quot;{member.sodEmployeeNote}&quot;
                                </div>
                              )}

                              {/* Approval Form */}
                              <div className="pt-2 border-t border-amber-200 dark:border-amber-500/20 text-xs">
                                <div className="flex flex-col sm:flex-row items-center gap-2">
                                  <Input
                                    placeholder="Add guidance note (e.g. Prioritize PR reviews first)..."
                                    value={activeSodNotes[member.id] || ""}
                                    onChange={(e) => setActiveSodNotes({ ...activeSodNotes, [member.id]: e.target.value })}
                                    className="h-8 text-xs bg-white dark:bg-background/90 border-amber-300 dark:border-amber-500/30 flex-1 shadow-sm"
                                  />
                                  <Button
                                    size="sm"
                                    variant="brand"
                                    onClick={() => handleApproveMorningPlan(member.id, member.name)}
                                    className="h-8 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shrink-0 shadow-sm gap-1 cursor-pointer"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                    <span>Verify &amp; Approve Tasks</span>
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                        )}

                        {/* 🌙 Bottom Panel: Evening Wrap-Up */}
                        {isNewDayForMember ? (
                          /* New day: clean waiting card — no old EOD data shown */
                          <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-500/[0.03] border border-purple-200 dark:border-purple-500/20 flex items-center gap-3 shadow-inner">
                            <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 shrink-0 border border-purple-200 dark:border-purple-500/20">
                              <Moon className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-purple-900 dark:text-purple-300">Evening Wrap-Up — Awaiting New Day EOD</p>
                              <p className="text-[11px] text-slate-600 dark:text-muted-foreground">
                                EOD review will appear once {member.name} submits today&apos;s evening wrap-up.
                              </p>
                            </div>
                          </div>
                        ) : (
                        <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-500/[0.04] border border-purple-200 dark:border-purple-500/25 space-y-3 shadow-inner">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-purple-900 dark:text-purple-300 text-xs flex items-center gap-1.5">
                              <span className="p-1 rounded-md bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30">
                                <Moon className="h-3.5 w-3.5" />
                              </span>
                              <span>{isEodVerified ? "Approved Evening Wrap-Up" : "Evening Wrap-Up & Execution"}</span>
                            </span>
                            <span className="text-[10px] font-mono font-medium text-purple-800 dark:text-purple-300/80">
                              {isEodVerified
                                ? "Verified"
                                : isEodSubmitted
                                ? `Submitted at ${displayEodTime || member.eodTime || fb?.eodSubmittedTime || 'Today'}`
                                : "Awaiting Employee Submission"}
                            </span>
                          </div>

                          {isEodVerified ? (
                            /* When Approved: Summary card with inline toggleable task list */
                            <div className="space-y-3 py-1">
                              <div className="p-3.5 rounded-xl bg-purple-100/70 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-xs flex items-center justify-between gap-3 shadow-sm">
                                <div className="space-y-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-purple-950 dark:text-purple-300 text-xs flex items-center gap-1">
                                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                                      <span>Rated {eodLeadRating}.0 / 5 Stars</span>
                                    </span>
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-200/80 dark:bg-purple-500/20 text-purple-900 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30">
                                      Wrap-Up Verified
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 dark:text-muted-foreground">
                                    Verified by <strong className="text-slate-900 dark:text-foreground">{eodVerifiedBy}</strong> ({eodVerifiedAt})
                                  </p>
                                </div>

                                <Button
                                  size="sm"
                                  variant="brand"
                                  onClick={() => setExpandedWrapupTasks((prev) => ({
                                    ...prev,
                                    [member.id]: !prev[member.id],
                                  }))}
                                  className="h-8 px-3 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm flex items-center gap-1.5 shrink-0 rounded-xl cursor-pointer"
                                >
                                  {expandedWrapupTasks[member.id] ? (
                                    <>
                                      <ChevronUp className="h-3.5 w-3.5" />
                                      <span>Hide Wrap-Up Tasks</span>
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-3.5 w-3.5" />
                                      <span>View Wrap-Up Tasks</span>
                                    </>
                                  )}
                                </Button>
                              </div>

                              <div className="p-3 rounded-xl bg-white dark:bg-background/80 border border-purple-200 dark:border-purple-500/20 text-[11px] text-slate-600 dark:text-muted-foreground space-y-1 shadow-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-purple-700 dark:text-purple-400 font-bold shrink-0">Feedback:</span>
                                  <span className="italic truncate text-slate-700 dark:text-foreground/90">&quot;{eodLeadComment}&quot;</span>
                                </div>
                                {eodLeadActionItem && (
                                  <p className="text-[10px] text-slate-600 dark:text-muted-foreground truncate">
                                    <strong className="text-slate-900 dark:text-foreground/80">Action Item:</strong> {eodLeadActionItem}
                                  </p>
                                )}
                              </div>

                              {/* Inline Verified Wrap-Up Tasks List (No scrollbar, full display) */}
                              {expandedWrapupTasks[member.id] && (
                                <div className="space-y-2 pt-2 border-t border-purple-200 dark:border-purple-500/20 animate-in fade-in slide-in-from-top-2">
                                  <div className="flex items-center justify-between text-[11px] font-bold text-purple-900 dark:text-purple-300 px-0.5">
                                    <span>Executed Deliverables ({tasksToDisplay.length})</span>
                                    <span className="font-mono text-[10px] text-slate-500 dark:text-muted-foreground">{memberProgress}% Completed</span>
                                  </div>
                                  <div className="space-y-2">
                                    {tasksToDisplay.map((t, i) => {
                                      const isDone = t.completionPercentage === 100 || t.status === "COMPLETED";
                                      const pct = t.completionPercentage || 0;
                                      return (
                                        <div
                                          key={t.id || i}
                                          className="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-background/90 border border-slate-200 dark:border-purple-500/15 space-y-2.5 hover:border-purple-400 dark:hover:border-purple-500/30 transition-all shadow-sm"
                                        >
                                          <div className="flex items-center justify-between gap-2.5">
                                            <div className="space-y-1 min-w-0 flex-1">
                                              <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`text-xs font-bold leading-snug truncate ${isDone ? "text-slate-900 dark:text-foreground font-semibold" : "text-slate-800 dark:text-foreground/90"}`}>
                                                  {t.title}
                                                </span>
                                                <Badge variant="outline" className="text-[9px] px-1.5 py-0.2 rounded-md font-bold bg-slate-50 dark:bg-muted/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-border">
                                                  {t.project || "General"}
                                                </Badge>
                                                {t.priority && (
                                                  <Badge variant={t.priority === "HIGH" ? "destructive" : "outline"} className="text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                                                    {t.priority === "HIGH" ? "Important" : "Normal"}
                                                  </Badge>
                                                )}
                                              </div>
                                              {t.expectedOutput && t.expectedOutput !== t.title && (
                                                <p className="text-[10px] text-slate-500 dark:text-muted-foreground truncate max-w-md">
                                                  Deliverable: {t.expectedOutput}
                                                </p>
                                              )}
                                            </div>

                                            {/* Progress Status Capsule */}
                                            <div className="flex items-center gap-1.5 shrink-0">
                                              <span
                                                className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border transition-all ${
                                                  isDone
                                                    ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/30"
                                                    : pct > 0
                                                    ? "text-purple-700 bg-purple-50 dark:text-purple-300 dark:bg-purple-950/40 border-purple-200 dark:border-purple-500/30"
                                                    : "text-slate-600 bg-slate-50 dark:text-muted-foreground dark:bg-muted/40 border border-slate-200 dark:border-border"
                                                }`}
                                              >
                                                <span className={`h-1.5 w-1.5 rounded-full ${isDone ? "bg-emerald-500 animate-pulse" : pct > 0 ? "bg-purple-500 animate-pulse" : "bg-slate-400"}`} />
                                                <span>{pct}%</span>
                                              </span>
                                            </div>
                                          </div>

                                          {/* Sleek Milestone Progress Meter */}
                                          <div className="space-y-1">
                                            <div className="h-1.5 w-full bg-slate-100 dark:bg-muted/60 rounded-full overflow-hidden border border-slate-200/60 dark:border-transparent">
                                              <div
                                                className={`h-full rounded-full transition-all duration-500 ease-out ${
                                                  isDone
                                                    ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                                                    : pct >= 50
                                                    ? "bg-gradient-to-r from-purple-500 to-indigo-500"
                                                    : pct > 0
                                                    ? "bg-gradient-to-r from-amber-500 to-orange-400"
                                                    : "bg-slate-200 dark:bg-muted"
                                                }`}
                                                style={{ width: `${pct}%` }}
                                              />
                                            </div>
                                            <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 dark:text-muted-foreground px-0.5">
                                              <span className={pct >= 0 ? "font-bold text-slate-600 dark:text-slate-400" : ""}>0%</span>
                                              <span className={pct >= 25 ? "font-bold text-slate-600 dark:text-slate-400" : ""}>25%</span>
                                              <span className={pct >= 50 ? "font-bold text-slate-600 dark:text-slate-400" : ""}>50%</span>
                                              <span className={pct >= 75 ? "font-bold text-slate-600 dark:text-slate-400" : ""}>75%</span>
                                              <span className={pct >= 100 ? "font-bold text-emerald-600 dark:text-emerald-400" : ""}>100% ✓</span>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : isEodSubmitted ? (
                            /* When Submitted by Employee: Show all tasks execution + Lead Rating + Feedback input + Verify & Send */
                            <>
                              <div className="space-y-2.5">
                                {/* All Tasks Execution Breakdown (No scrollbar, full display) */}
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between text-[11px] font-bold text-purple-900 dark:text-purple-300 px-0.5">
                                    <span>Task Execution &amp; Deliverables ({tasksToDisplay.length})</span>
                                    <span className="font-mono text-[10px] text-slate-500 dark:text-muted-foreground">{memberProgress}% Overall Progress</span>
                                  </div>
                                  {tasksToDisplay.length > 0 ? (
                                    tasksToDisplay.map((t, i) => {
                                      const isDone = t.completionPercentage === 100 || t.status === "COMPLETED";
                                      const pct = t.completionPercentage || 0;
                                      return (
                                        <div
                                          key={t.id || i}
                                          className="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-background/90 border border-slate-200 dark:border-purple-500/15 space-y-2.5 hover:border-purple-400 dark:hover:border-purple-500/30 transition-all shadow-sm"
                                        >
                                          <div className="flex items-center justify-between gap-2.5">
                                            <div className="space-y-1 min-w-0 flex-1">
                                              <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`text-xs font-bold leading-snug truncate ${isDone ? "text-slate-900 dark:text-foreground font-semibold" : "text-slate-800 dark:text-foreground/90"}`}>
                                                  {t.title}
                                                </span>
                                                <Badge variant="outline" className="text-[9px] px-1.5 py-0.2 rounded-md font-bold bg-slate-50 dark:bg-muted/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-border">
                                                  {t.project || "General"}
                                                </Badge>
                                                {t.priority && (
                                                  <Badge variant={t.priority === "HIGH" ? "destructive" : "outline"} className="text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                                                    {t.priority === "HIGH" ? "Important" : "Normal"}
                                                  </Badge>
                                                )}
                                              </div>
                                              {t.expectedOutput && t.expectedOutput !== t.title && (
                                                <p className="text-[10px] text-slate-500 dark:text-muted-foreground truncate max-w-md">
                                                  Deliverable: {t.expectedOutput}
                                                </p>
                                              )}
                                            </div>

                                            {/* Progress Status Capsule */}
                                            <div className="flex items-center gap-1.5 shrink-0">
                                              <span
                                                className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border transition-all ${
                                                  isDone
                                                    ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/30"
                                                    : pct > 0
                                                    ? "text-purple-700 bg-purple-50 dark:text-purple-300 dark:bg-purple-950/40 border-purple-200 dark:border-purple-500/30"
                                                    : "text-slate-600 bg-slate-50 dark:text-muted-foreground dark:bg-muted/40 border border-slate-200 dark:border-border"
                                                }`}
                                              >
                                                <span className={`h-1.5 w-1.5 rounded-full ${isDone ? "bg-emerald-500 animate-pulse" : pct > 0 ? "bg-purple-500 animate-pulse" : "bg-slate-400"}`} />
                                                <span>{pct}%</span>
                                              </span>
                                            </div>
                                          </div>

                                          {/* Sleek Milestone Progress Meter */}
                                          <div className="space-y-1">
                                            <div className="h-1.5 w-full bg-slate-100 dark:bg-muted/60 rounded-full overflow-hidden border border-slate-200/60 dark:border-transparent">
                                              <div
                                                className={`h-full rounded-full transition-all duration-500 ease-out ${
                                                  isDone
                                                    ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                                                    : pct >= 50
                                                    ? "bg-gradient-to-r from-purple-500 to-indigo-500"
                                                    : pct > 0
                                                    ? "bg-gradient-to-r from-amber-500 to-orange-400"
                                                    : "bg-slate-200 dark:bg-muted"
                                                }`}
                                                style={{ width: `${pct}%` }}
                                              />
                                            </div>
                                            <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 dark:text-muted-foreground px-0.5">
                                              <span className={pct >= 0 ? "font-bold text-slate-600 dark:text-slate-400" : ""}>0%</span>
                                              <span className={pct >= 25 ? "font-bold text-slate-600 dark:text-slate-400" : ""}>25%</span>
                                              <span className={pct >= 50 ? "font-bold text-slate-600 dark:text-slate-400" : ""}>50%</span>
                                              <span className={pct >= 75 ? "font-bold text-slate-600 dark:text-slate-400" : ""}>75%</span>
                                              <span className={pct >= 100 ? "font-bold text-emerald-600 dark:text-emerald-400" : ""}>100% ✓</span>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <div className="p-3 text-center text-slate-500 dark:text-muted-foreground text-[11px] bg-slate-50 dark:bg-background/50 rounded-xl border border-slate-200/60 dark:border-transparent">
                                      No tasks submitted.
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="pt-2 border-t border-purple-200 dark:border-purple-500/20 text-xs">
                                <div className="space-y-2.5">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-900 dark:text-foreground text-[11px]">Lead Rating:</span>
                                    <div className="flex items-center gap-1">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                          key={star}
                                          type="button"
                                          onClick={() => setActiveRatings({ ...activeRatings, [member.id]: star })}
                                          className="p-0.5 hover:scale-125 transition-transform cursor-pointer"
                                        >
                                          <Star
                                            className={`h-4 w-4 ${
                                              star <= (activeRatings[member.id] || 5)
                                                ? "text-amber-400 fill-amber-400"
                                                : "text-slate-300 dark:text-muted-foreground/30"
                                            }`}
                                          />
                                        </button>
                                      ))}
                                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 ml-1 font-mono">
                                        ({activeRatings[member.id] || 5}.0★)
                                      </span>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Input
                                      value={activeComments[member.id] || ""}
                                      onChange={(e) => setActiveComments({ ...activeComments, [member.id]: e.target.value })}
                                      placeholder={`Write evening feedback for ${member.name}...`}
                                      className="h-8 text-xs bg-white dark:bg-background/90 border-purple-300 dark:border-purple-500/30 w-full shadow-sm"
                                    />
                                    <div className="flex items-center gap-2">
                                      <Input
                                        value={activeActionItems[member.id] || ""}
                                        onChange={(e) => setActiveActionItems({ ...activeActionItems, [member.id]: e.target.value })}
                                        placeholder="Tomorrow action item (optional)..."
                                        className="h-8 text-xs bg-white dark:bg-background/90 border-purple-300 dark:border-purple-500/30 flex-1 shadow-sm"
                                      />
                                      <Button
                                        size="sm"
                                        variant="brand"
                                        onClick={() => handleSendEveningFeedback(member.id, member.name)}
                                        className="h-8 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shrink-0 gap-1 shadow-sm cursor-pointer"
                                      >
                                        <Send className="h-3 w-3" />
                                        <span>Verify &amp; Send</span>
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : (
                            /* When NOT yet submitted by Employee: Clean Awaiting Submission Card */
                            <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-500/[0.03] border border-purple-200 dark:border-purple-500/20 flex items-center gap-3 shadow-inner">
                              <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 shrink-0 border border-purple-200 dark:border-purple-500/20">
                                <Moon className="h-4 w-4" />
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs font-black text-purple-900 dark:text-purple-300">Evening Wrap-Up — Awaiting EOD Submission</p>
                                <p className="text-[11px] text-slate-600 dark:text-muted-foreground">
                                  Evening wrap-up and final execution review will appear here once submitted by {member.name}.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        )}

                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. TAB 2: ASSIGN WORK & LIVE ACKNOWLEDGEMENT TRACKER (SIDE-BY-SIDE) */}
      {activeTab === "ASSIGN_WORK" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form */}
          <div className="lg:col-span-5 lg:sticky lg:top-4">
            <form onSubmit={handleAssignWork} className="p-5 sm:p-6 rounded-3xl border border-indigo-200 dark:border-indigo-500/30 bg-gradient-to-br from-indigo-50/80 via-white to-white dark:from-indigo-950/25 dark:via-card dark:to-card space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                    <Send className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-foreground">Assign Work</h4>
                    <p className="text-[11px] text-muted-foreground">Dispatches deliverable to live task queue.</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] font-bold text-indigo-400 border-indigo-500/30">
                  Real-Time Sync
                </Badge>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Assign To Direct Report</label>
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full h-10 rounded-xl border border-input bg-white dark:bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {dynamicTeamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.designation})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Deliverable / Task Title</label>
                  <Input
                    type="text"
                    placeholder="e.g., Verify mobile navigation and component styles"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="h-10 text-xs rounded-xl"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-foreground">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full h-10 rounded-xl border border-input bg-white dark:bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="Operations">Operations</option>
                      <option value="Planning">Planning</option>
                      <option value="Documentation">Documentation</option>
                      <option value="General">General</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-foreground">Priority</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as any)}
                      className="w-full h-10 rounded-xl border border-input bg-white dark:bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="HIGH">High Priority</option>
                      <option value="MEDIUM">Normal Priority</option>
                      <option value="LOW">Low Priority</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                <Button type="button" variant="outline" size="sm" onClick={() => setActiveTab("TEAM_UPDATES")} className="text-xs h-9 rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="text-xs font-bold h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer">
                  <Send className="h-3.5 w-3.5" />
                  <span>Assign Work to Member</span>
                </Button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Assigned Deliverables & Acknowledgement Tracker */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/70 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-foreground">
                    Assigned Deliverables &amp; Live Acknowledgements
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Real-time status of tasks assigned to your direct reports.
                  </p>
                </div>
              </div>

              {/* Quick Status Stats */}
              <div className="flex items-center gap-2 text-xs shrink-0 flex-wrap">
                <Badge variant="outline" className="text-[10px] font-bold">
                  {assignedTasksLog.length} Total Assigned
                </Badge>
                {assignedTasksLog.filter((t) => !t.acknowledged).length > 0 && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40 text-[10px] font-bold animate-pulse">
                    {assignedTasksLog.filter((t) => !t.acknowledged).length} Awaiting Acceptance
                  </Badge>
                )}
                {assignedTasksLog.filter((t) => t.acknowledged).length > 0 && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px] font-bold">
                    {assignedTasksLog.filter((t) => t.acknowledged).length} Acknowledged
                  </Badge>
                )}
              </div>
            </div>

            {assignedTasksLog.length === 0 ? (
              <div className="p-10 text-center bg-slate-50/60 dark:bg-card/40 rounded-2xl border border-slate-200 dark:border-border/60 text-xs text-muted-foreground space-y-2">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground mx-auto" />
                <span className="font-semibold text-foreground block">No assigned tasks logged yet</span>
                <span>Use the form on the left to assign sprint deliverables to your team.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {assignedTasksLog.map((task) => {
                  const isDone = task.status === "COMPLETED" || task.progress === 100;
                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-2xl border transition-all space-y-3 shadow-sm ${
                        task.acknowledged
                          ? "bg-white dark:bg-card/85 border-emerald-200 dark:border-emerald-500/30"
                          : "bg-white dark:bg-card/85 border-amber-200 dark:border-amber-500/35"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        {/* Member & Task Info */}
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                            {task.targetEmployeeAvatar || task.targetEmployeeName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <strong className="text-xs font-bold text-foreground">
                                {task.targetEmployeeName}
                              </strong>
                              <span className="text-[10px] text-muted-foreground">
                                ({task.targetEmployeeDesignation || "Engineer"})
                              </span>
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-cyan-400 border-cyan-500/30">
                                {task.category || task.project || "Operations"}
                              </Badge>
                              <Badge
                                variant={task.priority === "HIGH" ? "destructive" : "outline"}
                                className="text-[9px] px-1.5 py-0"
                              >
                                {task.priority} Priority
                              </Badge>
                            </div>
                            <h5 className="text-xs font-bold text-foreground leading-snug">
                              {task.title}
                            </h5>
                            <span className="text-[10px] text-muted-foreground block">
                              Assigned by {task.assignedBy || "Alex Lead"} · {task.assignedAt}
                            </span>
                          </div>
                        </div>

                        {/* Real-time Acknowledgement Badge & Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                          {task.acknowledged ? (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px] font-bold px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                              <Check className="h-3 w-3" />
                              <span>Acknowledged ({task.acknowledgedAt || "Today"})</span>
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40 text-[10px] font-bold px-2.5 py-1 flex items-center gap-1.5 animate-pulse">
                              <Clock className="h-3 w-3" />
                              <span>Awaiting Acceptance</span>
                            </Badge>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteAssignedTask(task.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Recall / Delete Assigned Deliverable"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Employee Acknowledgement Note Quote */}
                      {task.acknowledged && task.acknowledgementNote && (
                        <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-500/[0.07] border border-emerald-200 dark:border-emerald-500/25 text-xs text-foreground/90 space-y-0.5">
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            <span>Acknowledgement Note from {task.targetEmployeeName}:</span>
                          </span>
                          <p className="text-[11px] italic text-slate-600 dark:text-muted-foreground pl-4">
                            &quot;{task.acknowledgementNote}&quot;
                          </p>
                        </div>
                      )}

                      {/* Live Progress Bar */}
                      <div className="space-y-1 pt-1 border-t border-border/50">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground font-semibold">Live Deliverable Execution:</span>
                          <span className="font-mono font-bold text-cyan-400">
                            {task.progress || (isDone ? 100 : 0)}% {isDone ? "(Completed)" : task.progress > 0 ? "(In Progress)" : "(Not Started)"}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isDone ? "bg-emerald-500" : task.progress > 0 ? "bg-cyan-500" : "bg-amber-500"
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, task.progress || (isDone ? 100 : 0)))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. TAB 3: MY TASKS */}
      {activeTab === "MY_TASKS" && (
        <div className="space-y-3">
          {showAddLeadTask && (
            <form onSubmit={handleAddLeadTask} className="p-4 rounded-xl bg-white dark:bg-card border border-emerald-200 dark:border-emerald-500/40 space-y-3 animate-in fade-in shadow-sm">
              <h4 className="text-xs font-bold text-foreground">Add Personal Task</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <Input
                    type="text"
                    placeholder="Task description..."
                    value={leadTaskTitle}
                    onChange={(e) => setLeadTaskTitle(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <select
                    value={leadTaskCategory}
                    onChange={(e) => setLeadTaskCategory(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-white dark:bg-background px-2.5 text-xs text-foreground focus:outline-none"
                  >
                    <option value="Operations">Operations</option>
                    <option value="Planning">Planning</option>
                    <option value="Documentation">Documentation</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddLeadTask(false)} className="text-xs h-7">
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant="brand" className="text-xs font-bold h-7 bg-emerald-600 hover:bg-emerald-700 text-white">
                  Save
                </Button>
              </div>
            </form>
          )}

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setLeadTaskFilter("ALL")}
              className={`px-3 py-1 rounded-lg font-semibold text-xs transition-all ${
                leadTaskFilter === "ALL"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "bg-muted/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({leadTasks.length})
            </button>
            <button
              type="button"
              onClick={() => setLeadTaskFilter("OPEN")}
              className={`px-3 py-1 rounded-lg font-semibold text-xs transition-all ${
                leadTaskFilter === "OPEN"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "bg-muted/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              Open ({leadTasks.filter((t) => t.status !== "COMPLETED").length})
            </button>
            <button
              type="button"
              onClick={() => setLeadTaskFilter("COMPLETED")}
              className={`px-3 py-1 rounded-lg font-semibold text-xs transition-all ${
                leadTaskFilter === "COMPLETED"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "bg-muted/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              Completed ({leadTasks.filter((t) => t.status === "COMPLETED").length})
            </button>
          </div>

          {/* Lead Tasks List */}
          <div className="space-y-2">
            {filteredLeadTasks.map((t) => {
              const isDone = t.status === "COMPLETED";

              return (
                <div
                  key={t.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isDone
                      ? "bg-slate-50/60 dark:bg-card/40 border-slate-200/60 dark:border-border/40 opacity-70"
                      : "bg-white dark:bg-card border-slate-200 dark:border-border hover:border-slate-300 dark:hover:border-border/80 shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleLeadTask(t.id)}
                      className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${
                        isDone
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-input hover:border-primary"
                      }`}
                    >
                      {isDone && <Check className="h-3 w-3" />}
                    </button>

                    <div className="space-y-0.5 min-w-0">
                      <span className={`text-xs font-semibold block truncate ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {t.title}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {t.category} · {t.timeSlot}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={isDone ? "outline" : "brand"} className="text-[9px]">
                      {isDone ? "Done" : t.priority}
                    </Badge>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteLeadTask(t.id)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: PRESENCE & SUBMISSION HEATMAP */}
      {activeTab === "HEATMAP" && (
        <div className="space-y-4">
          <TeamHeatmapGrid teamName="Development Team" members={dynamicTeamMembers} />
        </div>
      )}
    </div>
  );
}
