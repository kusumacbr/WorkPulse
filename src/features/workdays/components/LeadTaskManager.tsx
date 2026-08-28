"use client";

import React, { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TeamHeatmapGrid } from "@/features/team/components/TeamHeatmapGrid";
import { fireCelebrationConfetti, fireSuccessBurst } from "@/lib/ui/confetti";
import {
  Users,
  CheckCircle2,
  Plus,
  ListTodo,
  Send,
  Star,
  ChevronDown,
  ChevronUp,
  Trash2,
  Check,
  Sun,
  Moon,
  Clock,
  Sparkles,
  Layers,
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

const DEFAULT_LEAD_TASKS: LeadPersonalTask[] = [
  {
    id: "lt-1",
    title: "1-on-1 Performance Check-in with Sarah Dev",
    category: "1-on-1 Sync",
    priority: "HIGH",
    status: "NOT_STARTED",
    progress: 0,
    timeSlot: "Today · 03:30 PM",
  },
  {
    id: "lt-2",
    title: "Review Sprint 34 Pull Requests & Architecture Sign-off",
    category: "Code Review",
    priority: "HIGH",
    status: "IN_PROGRESS",
    progress: 75,
    timeSlot: "Today",
  },
  {
    id: "lt-3",
    title: "Approve Pod Leave & WFH Requests for Next Week",
    category: "Approvals",
    priority: "MEDIUM",
    status: "COMPLETED",
    progress: 100,
    timeSlot: "Completed",
  },
  {
    id: "lt-4",
    title: "Submit 90-Day Probation Confirmation Recommendation",
    category: "Probation & HR",
    priority: "HIGH",
    status: "IN_PROGRESS",
    progress: 80,
    timeSlot: "Today",
  },
  {
    id: "lt-5",
    title: "Verify Pod Biometric Shift Compliance & Punch Regularizations",
    category: "HR & Attendance",
    priority: "MEDIUM",
    status: "COMPLETED",
    progress: 100,
    timeSlot: "Completed",
  },
  {
    id: "lt-6",
    title: "Prepare Sprint Retrospective Notes for David Director",
    category: "Planning",
    priority: "MEDIUM",
    status: "NOT_STARTED",
    progress: 0,
    timeSlot: "Tomorrow",
  },
];

export interface DailyFeedbackRecord {
  sodAcknowledged?: boolean;
  sodNote?: string;
  sodTime?: string;
  eodReviewed?: boolean;
  rating?: number;
  eodComment?: string;
  actionItem?: string;
  eodTime?: string;
}

const DEFAULT_DAILY_FEEDBACK: Record<string, DailyFeedbackRecord> = {
  "emp-sarah": {
    sodAcknowledged: true,
    sodNote: "Morning plan looks solid. Prioritize the PR reviews first.",
    sodTime: "10:15 AM",
    eodReviewed: true,
    rating: 5,
    eodComment: "Great progress on CI cache layer and automated test suites.",
    actionItem: "Present results in tomorrow's team sync.",
    eodTime: "06:45 PM",
  },
  "emp-rohit": {
    sodAcknowledged: true,
    sodNote: "Good focus on responsive design today.",
    sodTime: "10:20 AM",
    eodReviewed: false,
    rating: 5,
    eodComment: "",
  },
};

const CLEAN_POD_MEMBERS = [
  {
    id: "emp-rohit",
    name: "Rohit Sharma",
    designation: "Frontend Engineer",
    avatar: "RS",
    avatarBg: "bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-cyan-500/20 shadow-sm",
    workMode: "OFFICE",
    sodTime: "10:15 AM",
    overallProgress: 85,
    eodStatus: "SUBMITTED",
    plannedTasks: [
      { id: "t1", title: "Implement mobile responsive navigation and test coverage", completionPercentage: 85 },
      { id: "t2", title: "Review frontend pull requests with team", completionPercentage: 100 },
    ],
    eodAchievements: "Finished scheduled feature implementation and automated test suites.",
    eodBlockers: "None reported today.",
    eodTomorrowFocus: "Connect websocket edge events with live attendance pipeline.",
  },
  {
    id: "emp-sarah",
    name: "Sarah Dev",
    designation: "Senior Backend Engineer",
    avatar: "SD",
    avatarBg: "bg-gradient-to-tr from-purple-500 to-pink-500 text-white shadow-purple-500/20 shadow-sm",
    workMode: "OFFICE",
    sodTime: "10:08 AM",
    overallProgress: 90,
    eodStatus: "SUBMITTED",
    plannedTasks: [
      { id: "t3", title: "Telemetry ingestion pipeline optimization", completionPercentage: 90 },
      { id: "t4", title: "PR reviews & architecture schema migration", completionPercentage: 100 },
    ],
    eodAchievements: "CI cache layer speed improved by 40% with zero test failures.",
    eodBlockers: "None reported today.",
    eodTomorrowFocus: "Deploy staging verification builds.",
  },
  {
    id: "emp-priya",
    name: "Priya Patel",
    designation: "QA & Test Lead",
    avatar: "PP",
    avatarBg: "bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-amber-500/20 shadow-sm",
    workMode: "REMOTE",
    sodTime: "10:25 AM",
    overallProgress: 75,
    eodStatus: "IN_PROGRESS",
    plannedTasks: [
      { id: "t5", title: "Execute automated regression suite on Sprint 34 release branch", completionPercentage: 75 },
    ],
    eodAchievements: "Identified 2 edge cases in permissions module and patched them.",
    eodBlockers: "None reported today.",
    eodTomorrowFocus: "Sign off on Sprint 34 QA matrix.",
  },
  {
    id: "emp-arjun",
    name: "Arjun Kumar",
    designation: "Fullstack Developer",
    avatar: "AK",
    avatarBg: "bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-emerald-500/20 shadow-sm",
    workMode: "OFFICE",
    sodTime: "10:30 AM",
    overallProgress: 70,
    eodStatus: "IN_PROGRESS",
    plannedTasks: [
      { id: "t6", title: "Database index tuning & audit log pagination", completionPercentage: 70 },
    ],
    eodAchievements: "Added database query indexes to speed up dashboard metrics.",
    eodBlockers: "None reported today.",
    eodTomorrowFocus: "Finalize audit trail pagination.",
  },
];

type LeadTaskTab = "TEAM_UPDATES" | "ASSIGN_WORK" | "MY_TASKS" | "HEATMAP";

export function LeadTaskManager() {
  const [activeTab, setActiveTab] = useState<LeadTaskTab>("TEAM_UPDATES");
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>("emp-rohit");
  const [memberFilter, setMemberFilter] = useState("ALL");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Daily feedback storage
  const [dailyFeedback, setDailyFeedback] = useState<Record<string, DailyFeedbackRecord>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("workpulse_lead_daily_feedback");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_DAILY_FEEDBACK;
  });

  // Review form states
  const [activeRating, setActiveRating] = useState<number>(5);
  const [activeComment, setActiveComment] = useState<string>("");
  const [activeSodNote, setActiveSodNote] = useState<string>("");

  // Assign deliverable form state (Tab 2)
  const [assigneeId, setAssigneeId] = useState<string>(CLEAN_POD_MEMBERS[0]?.id || "");
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Frontend & UI");
  const [newPriority, setNewPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("MEDIUM");

  // Lead personal task state (Tab 3)
  const [leadTasks, setLeadTasks] = useState<LeadPersonalTask[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("workpulse_lead_personal_tasks");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_LEAD_TASKS;
  });
  const [showAddLeadTask, setShowAddLeadTask] = useState(false);
  const [leadTaskTitle, setLeadTaskTitle] = useState("");
  const [leadTaskCategory, setLeadTaskCategory] = useState("Code Review");
  const [leadTaskFilter, setLeadTaskFilter] = useState<"ALL" | "OPEN" | "COMPLETED">("ALL");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const saveLeadTasks = (updated: LeadPersonalTask[]) => {
    setLeadTasks(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("workpulse_lead_personal_tasks", JSON.stringify(updated));
      } catch {}
    }
  };

  // 1-Click Approve Morning Plan
  const handleApproveMorningPlan = (empId: string, empName: string) => {
    const note = activeSodNote.trim() || "Morning plan approved by Team Lead.";
    const next = {
      ...dailyFeedback,
      [empId]: {
        ...dailyFeedback[empId],
        sodAcknowledged: true,
        sodNote: note,
        sodTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    };
    setDailyFeedback(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("workpulse_lead_daily_feedback", JSON.stringify(next));
    }
    setActiveSodNote("");
    fireSuccessBurst();
    showToast(`✓ Morning plan for ${empName} approved!`);
  };

  // 1-Click Send Evening Feedback
  const handleSendEveningFeedback = (empId: string, empName: string) => {
    if (!activeComment.trim()) {
      showToast("Please enter a short feedback note.");
      return;
    }

    const next = {
      ...dailyFeedback,
      [empId]: {
        ...dailyFeedback[empId],
        eodReviewed: true,
        rating: activeRating,
        eodComment: activeComment.trim(),
        eodTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    };
    setDailyFeedback(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("workpulse_lead_daily_feedback", JSON.stringify(next));
    }
    setActiveComment("");
    fireCelebrationConfetti();
    showToast(`✓ Feedback sent to ${empName}!`);
  };

  // Assign deliverable (Tab 2)
  const handleAssignWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const targetEmp = CLEAN_POD_MEMBERS.find((e) => e.id === assigneeId) || CLEAN_POD_MEMBERS[0];
    const targetName = targetEmp ? targetEmp.name : "Team Member";

    setNewTitle("");
    setActiveTab("TEAM_UPDATES");
    fireSuccessBurst();
    showToast(`✓ Work assigned to ${targetName}!`);
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

  // Delete lead personal task
  const handleDeleteLeadTask = (id: string) => {
    const updated = leadTasks.filter((t) => t.id !== id);
    saveLeadTasks(updated);
    showToast("Task removed.");
  };

  const filteredMembers = useMemo(() => {
    if (memberFilter === "ALL") return CLEAN_POD_MEMBERS;
    return CLEAN_POD_MEMBERS.filter((m) => m.id === memberFilter);
  }, [memberFilter]);

  const filteredLeadTasks = useMemo(() => {
    return leadTasks.filter((t) => {
      if (leadTaskFilter === "OPEN" && t.status === "COMPLETED") return false;
      if (leadTaskFilter === "COMPLETED" && t.status !== "COMPLETED") return false;
      return true;
    });
  }, [leadTasks, leadTaskFilter]);

  return (
    <div className="space-y-5">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-semibold">{toastMsg}</span>
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
            <span>Team Updates ({CLEAN_POD_MEMBERS.length})</span>
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
            <span>Assign Work</span>
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
              All ({CLEAN_POD_MEMBERS.length})
            </button>
            {CLEAN_POD_MEMBERS.map((m) => (
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
              const feedback = dailyFeedback[member.id] || {};
              const isExpanded = expandedMemberId === member.id;
              const isFullyReviewed = feedback.sodAcknowledged && feedback.eodReviewed;
              const isEodReady = feedback.sodAcknowledged && !feedback.eodReviewed;

              return (
                <div
                  key={member.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isFullyReviewed
                      ? "border-emerald-500/40 bg-emerald-500/[0.02]"
                      : isEodReady
                      ? "border-purple-500/40 bg-purple-500/[0.02]"
                      : "border-amber-500/30 bg-amber-500/[0.02]"
                  }`}
                >
                  {/* Clickable Header Row */}
                  <div
                    onClick={() => setExpandedMemberId(isExpanded ? null : member.id)}
                    className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-muted/20 transition-colors select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Distinct Avatar Gradient */}
                      <div className={`h-10 w-10 rounded-full ${member.avatarBg} font-bold text-xs flex items-center justify-center shrink-0`}>
                        {member.avatar}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-bold text-foreground truncate">{member.name}</strong>
                          <span className="text-xs text-muted-foreground hidden sm:inline">· {member.designation}</span>
                          <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted/40 hidden md:inline">
                            {member.workMode === "OFFICE" ? "Office" : "Remote"}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Morning Plan: <span className="text-foreground font-semibold">{member.sodTime}</span> · Progress:{" "}
                          <strong className="text-cyan-400 font-mono font-bold">{member.overallProgress}%</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {feedback.sodAcknowledged ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          <span>Plan Approved</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Plan Pending</span>
                        </span>
                      )}

                      {feedback.eodReviewed ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span>{feedback.rating}.0★</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 hidden sm:inline-flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-purple-400" />
                          <span>Review Ready</span>
                        </span>
                      )}

                      <div className="text-muted-foreground p-1">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Body: Highly Differentiated Side-by-Side Panels */}
                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-border/40 animate-in fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        
                        {/* ☀️ Left Panel: Morning Plan (Warm Amber/Gold Distinct Styling) */}
                        <div className="p-4 rounded-2xl bg-amber-500/[0.04] border border-amber-500/25 space-y-3 shadow-inner">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                              <span className="p-1 rounded-md bg-amber-500/15 text-amber-400">
                                <Sun className="h-3.5 w-3.5" />
                              </span>
                              <span>Today&apos;s Morning Plan</span>
                            </span>
                            <span className="text-[10px] font-mono text-amber-400/80">Shared at {member.sodTime}</span>
                          </div>

                          <div className="space-y-2 text-xs">
                            {member.plannedTasks.map((t, i) => (
                              <div key={i} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-background/90 border border-amber-500/15">
                                <span className="text-foreground font-medium truncate">{t.title}</span>
                                <span className="text-[10px] font-mono font-bold text-emerald-400 shrink-0 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                  {t.completionPercentage}%
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Approval / Lead Note */}
                          <div className="pt-2 border-t border-amber-500/20 text-xs">
                            {feedback.sodAcknowledged ? (
                              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] flex items-center gap-1.5">
                                <Check className="h-3.5 w-3.5 shrink-0" />
                                <span><strong>Lead Note:</strong> &quot;{feedback.sodNote}&quot;</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Input
                                  placeholder="Add morning advice or note..."
                                  value={activeSodNote}
                                  onChange={(e) => setActiveSodNote(e.target.value)}
                                  className="h-8 text-xs bg-background/90 border-amber-500/30 flex-1"
                                />
                                <Button
                                  size="sm"
                                  variant="brand"
                                  onClick={() => handleApproveMorningPlan(member.id, member.name)}
                                  className="h-8 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shrink-0 shadow-sm"
                                >
                                  Approve Plan
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 🌙 Right Panel: Evening Wrap-Up (Twilight Purple Distinct Styling) */}
                        <div className="p-4 rounded-2xl bg-purple-500/[0.04] border border-purple-500/25 space-y-3 shadow-inner">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-purple-300 text-xs flex items-center gap-1.5">
                              <span className="p-1 rounded-md bg-purple-500/15 text-purple-400">
                                <Moon className="h-3.5 w-3.5" />
                              </span>
                              <span>Evening Wrap-Up &amp; Review</span>
                            </span>
                            <span className="text-[10px] font-mono text-purple-300/80">Submitted 06:45 PM</span>
                          </div>

                          <div className="space-y-1.5 text-xs text-muted-foreground bg-background/90 p-3 rounded-xl border border-purple-500/15">
                            <p><strong className="text-foreground">Completed: </strong>{member.eodAchievements}</p>
                            <p><strong className="text-foreground">Blockers: </strong>{member.eodBlockers}</p>
                          </div>

                          {/* Review Output OR Form */}
                          <div className="pt-2 border-t border-purple-500/20 text-xs">
                            {feedback.eodReviewed ? (
                              <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 space-y-1">
                                <div className="flex items-center justify-between text-purple-200 font-bold text-[11px]">
                                  <span className="flex items-center gap-1">
                                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                    <span>Rated {feedback.rating}.0 / 5 Stars by Alex Lead</span>
                                  </span>
                                  <span className="text-[10px] font-mono text-muted-foreground">{feedback.eodTime}</span>
                                </div>
                                <p className="text-foreground/90">&quot;{feedback.eodComment}&quot;</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-foreground text-[11px]">Star Rating:</span>
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                        key={star}
                                        type="button"
                                        onClick={() => setActiveRating(star)}
                                        className="p-0.5 hover:scale-125 transition-transform cursor-pointer"
                                      >
                                        <Star
                                          className={`h-4 w-4 ${
                                            star <= activeRating
                                              ? "text-amber-400 fill-amber-400"
                                              : "text-muted-foreground/30"
                                          }`}
                                        />
                                      </button>
                                    ))}
                                    <span className="text-[11px] font-bold text-amber-400 ml-1 font-mono">({activeRating}.0★)</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Input
                                    value={activeComment}
                                    onChange={(e) => setActiveComment(e.target.value)}
                                    placeholder={`Write feedback for ${member.name}...`}
                                    className="h-8 text-xs bg-background/90 border-purple-500/30 flex-1"
                                  />
                                  <Button
                                    size="sm"
                                    variant="brand"
                                    onClick={() => handleSendEveningFeedback(member.id, member.name)}
                                    className="h-8 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shrink-0 gap-1 shadow-sm"
                                  >
                                    <Send className="h-3 w-3" />
                                    <span>Send</span>
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. TAB 2: ASSIGN WORK */}
      {activeTab === "ASSIGN_WORK" && (
        <form onSubmit={handleAssignWork} className="p-5 rounded-2xl border border-border bg-card space-y-4 max-w-xl mx-auto shadow-sm">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-foreground">Assign Work to Team Member</h4>
            <p className="text-xs text-muted-foreground">Select a direct report and enter the task details.</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Assign To</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs text-foreground focus:outline-none"
              >
                {CLEAN_POD_MEMBERS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.designation})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Task Title</label>
              <Input
                type="text"
                placeholder="e.g., Verify mobile navigation and component styles"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs text-foreground focus:outline-none"
                >
                  <option value="Frontend & UI">Frontend & UI</option>
                  <option value="Platform Architecture">Platform Architecture</option>
                  <option value="Security & Auth">Security & Auth</option>
                  <option value="QA & Testing">QA & Testing</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs text-foreground focus:outline-none"
                >
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Normal Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setActiveTab("TEAM_UPDATES")} className="text-xs h-8">
              Cancel
            </Button>
            <Button type="submit" size="sm" variant="brand" className="text-xs font-bold h-8 bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
              <Send className="h-3.5 w-3.5" />
              <span>Assign Work</span>
            </Button>
          </div>
        </form>
      )}

      {/* 4. TAB 3: MY TASKS */}
      {activeTab === "MY_TASKS" && (
        <div className="space-y-3">
          {showAddLeadTask && (
            <form onSubmit={handleAddLeadTask} className="p-4 rounded-xl bg-card border border-emerald-500/40 space-y-3 animate-in fade-in">
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
                    className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none"
                  >
                    <option value="Code Review">Code Review</option>
                    <option value="1-on-1 Sync">1-on-1 Sync</option>
                    <option value="Approvals">Approvals</option>
                    <option value="Planning">Planning</option>
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
                      ? "bg-card/40 border-border/40 opacity-70"
                      : "bg-card border-border hover:border-border/80 shadow-sm"
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
          <TeamHeatmapGrid teamName="Development Pod" sprintRange="Sprint 34 (Aug 17 – Aug 23, 2026)" />
        </div>
      )}
    </div>
  );
}
