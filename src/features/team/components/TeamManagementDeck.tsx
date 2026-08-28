"use client";

import React, { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { useWorkpulseSharedStore, OrgEmployee } from "@/lib/stores/workpulse-shared-store";
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  Calendar,
  Plus,
  Send,
  Star,
  Check,
  X,
  Target,
} from "lucide-react";

export function TeamManagementDeck() {
  const { allEmployees, departments, updateLeadFeedback, updateEmployee } = useWorkpulseSharedStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<string>("ALL");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal / Interaction states
  const [selectedEmpForTask, setSelectedEmpForTask] = useState<OrgEmployee | null>(null);
  const [selectedEmpFor121, setSelectedEmpFor121] = useState<OrgEmployee | null>(null);
  const [selectedEmpForFeedback, setSelectedEmpForFeedback] = useState<OrgEmployee | null>(null);

  // Form states
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskProject, setNewTaskProject] = useState("Platform & Core Engine");
  const [newTaskPriority, setNewTaskPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("HIGH");
  const [newTaskEstMinutes, setNewTaskEstMinutes] = useState(120);

  const [oneToOneDate, setOneToOneDate] = useState("Tomorrow at 11:00 AM");
  const [oneToOneAgenda, setOneToOneAgenda] = useState("Sprint 34 deliverables review & architectural alignment");

  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackSentiment, setFeedbackSentiment] = useState<"EXCELLENT" | "GOOD" | "COACHING_REQUIRED">("EXCELLENT");
  const [feedbackNotes, setFeedbackNotes] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Direct reports (Platform Pod & all assigned direct reports)
  const directReports = useMemo(() => {
    if (allEmployees.length > 0) {
      return allEmployees;
    }
    // Fallback to department employees
    const devDept = departments.find((d) => d.id === "dept-dev") || departments[0];
    return devDept ? devDept.employees : [];
  }, [allEmployees, departments]);

  const filteredMembers = useMemo(() => {
    return directReports.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMode = filterMode === "ALL" || (emp.workMode || "OFFICE") === filterMode;
      return matchesSearch && matchesMode;
    });
  }, [directReports, searchQuery, filterMode]);

  // Handle Work Mode Switch
  const handleSwitchWorkMode = (empId: string, empName: string, newMode: "OFFICE" | "WFH" | "HYBRID") => {
    updateEmployee(empId, { workMode: newMode });
    showToast(`✓ Work Mode for ${empName} updated to ${newMode}`);
  };

  // Handle Task Assignment Submit
  const handleAssignTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpForTask || !newTaskTitle.trim()) return;

    showToast(`🚀 New task "${newTaskTitle}" assigned to ${selectedEmpForTask.name}!`);
    setSelectedEmpForTask(null);
    setNewTaskTitle("");
  };

  // Handle 1-on-1 Schedule Submit
  const handleSchedule121Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpFor121) return;

    showToast(`📅 1-on-1 sync scheduled with ${selectedEmpFor121.name} for ${oneToOneDate}!`);
    setSelectedEmpFor121(null);
  };

  // Handle Coaching Feedback Submit
  const handleCoachingFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpForFeedback) return;

    updateLeadFeedback({
      employeeId: selectedEmpForFeedback.id,
      employeeName: selectedEmpForFeedback.name,
      note: feedbackNotes || "Consistently delivering robust engineering output with excellent sprint velocity.",
      rating: feedbackRating,
      actionItem: feedbackSentiment,
    });

    showToast(`⭐ ${feedbackRating}-Star coaching feedback logged for ${selectedEmpForFeedback.name} & synced to reviews!`);
    setSelectedEmpForFeedback(null);
    setFeedbackNotes("");
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Pod Team Management Hero */}
      <Interactive3DCard className="p-6 border border-indigo-500/30 bg-gradient-to-r from-card/90 via-card/70 to-indigo-500/10 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="bg-indigo-500/15 border-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase">
                <Users className="h-3 w-3 mr-1 text-indigo-400" />
                Team Management & Direct Reports Roster
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                {directReports.length} Direct Reports · Alex Lead
              </span>
            </div>
            <h2 className="text-2xl font-black text-foreground">Direct Reports Management Desk</h2>
            <p className="text-xs text-muted-foreground">
              Manage member work modes, delegate tasks, schedule 1-on-1 coaching checkpoints, and monitor individual sprint progress.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className="text-xs font-mono py-1.5 px-3 border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              100% Shift Attendance Active
            </Badge>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search direct reports by name, designation, email..."
              className="pl-9 h-9 text-xs bg-background/50 border-border/80"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] text-muted-foreground font-bold uppercase shrink-0">Mode:</span>
            {["ALL", "OFFICE", "WFH", "HYBRID"].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setFilterMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterMode === mode
                    ? "bg-indigo-500 text-white shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </Interactive3DCard>

      {/* Direct Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((emp) => {
          const workMode = emp.workMode || "OFFICE";
          const progress = emp.overallProgress ?? 75;
          const sodStatus = emp.sodStatus || "SUBMITTED";

          return (
            <Interactive3DCard
              key={emp.id}
              className="p-5 border border-border/80 bg-card/60 hover:border-indigo-500/40 space-y-4 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-extrabold text-xs shadow-md">
                    {emp.avatar ||
                      emp.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-foreground block">{emp.name}</strong>
                    <span className="text-[11px] text-muted-foreground">{emp.designation}</span>
                  </div>
                </div>

                <Badge
                  variant={workMode === "OFFICE" ? "brand" : "secondary"}
                  className="text-[10px] font-bold font-mono"
                >
                  {workMode}
                </Badge>
              </div>

              {/* Progress & SOD Status */}
              <div className="space-y-1.5 p-3 rounded-xl bg-background/50 border border-border/60 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3 text-cyan-400" />
                    SOD Status: <strong className="text-foreground">{sodStatus}</strong>
                  </span>
                  <strong className="text-emerald-400 font-mono">{progress}% Complete</strong>
                </div>
                <div className="progress-track-line">
                  <div
                    className="progress-track-fill-cyan"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                  <span>Shift: 10:00 AM – 07:00 PM</span>
                  <span>Leaves: {emp.remainingLeaveBalance ?? 12.0}d Left</span>
                </div>
              </div>

              {/* Work Mode 1-Click Switcher */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Work Mode Assignment:
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(["OFFICE", "WFH", "HYBRID"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleSwitchWorkMode(emp.id, emp.name, mode)}
                      className={`py-1 rounded-lg text-[10px] font-bold border transition-all ${
                        workMode === mode
                          ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 font-black"
                          : "border-border/50 text-muted-foreground hover:bg-muted/40"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-border/60">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedEmpForTask(emp)}
                  className="text-[11px] font-semibold h-8 px-1.5 gap-1 hover:border-indigo-500/40"
                >
                  <Plus className="h-3 w-3 text-indigo-400" />
                  <span>Task</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedEmpFor121(emp)}
                  className="text-[11px] font-semibold h-8 px-1.5 gap-1 hover:border-cyan-500/40"
                >
                  <Calendar className="h-3 w-3 text-cyan-400" />
                  <span>1-on-1</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedEmpForFeedback(emp)}
                  className="text-[11px] font-semibold h-8 px-1.5 gap-1 hover:border-amber-500/40"
                >
                  <Star className="h-3 w-3 text-amber-400" />
                  <span>Coach</span>
                </Button>
              </div>
            </Interactive3DCard>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ASSIGN NEW TASK / DELIVERABLE                                    */}
      {/* ========================================================================= */}
      {selectedEmpForTask && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-indigo-500/40 rounded-2xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-foreground">
                  Assign Task to {selectedEmpForTask.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmpForTask(null)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAssignTaskSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-muted-foreground font-bold">Task Title / Deliverable</label>
                <Input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Implement OAuth token refresh retry logic"
                  className="text-xs bg-background/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-bold">Project</label>
                  <Input
                    value={newTaskProject}
                    onChange={(e) => setNewTaskProject(e.target.value)}
                    className="text-xs bg-background/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-bold">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full h-9 rounded-md border border-input bg-background/50 px-3 text-xs"
                  >
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-bold">Estimated Minutes (Sprint Allocation)</label>
                <Input
                  type="number"
                  value={newTaskEstMinutes}
                  onChange={(e) => setNewTaskEstMinutes(Number(e.target.value))}
                  className="text-xs bg-background/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedEmpForTask(null)}
                  className="text-xs h-8"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  className="text-xs font-bold h-8 bg-indigo-500 hover:bg-indigo-600 text-white gap-1"
                >
                  <Send className="h-3 w-3" />
                  <span>Assign Deliverable</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SCHEDULE 1-ON-1 MEETING                                          */}
      {/* ========================================================================= */}
      {selectedEmpFor121 && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-cyan-500/40 rounded-2xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-foreground">
                  Schedule 1-on-1 with {selectedEmpFor121.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmpFor121(null)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSchedule121Submit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-muted-foreground font-bold">Date & Time</label>
                <Input
                  value={oneToOneDate}
                  onChange={(e) => setOneToOneDate(e.target.value)}
                  placeholder="e.g. Tomorrow at 11:00 AM"
                  className="text-xs bg-background/50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-bold">Talking Points / Agenda</label>
                <textarea
                  value={oneToOneAgenda}
                  onChange={(e) => setOneToOneAgenda(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-input bg-background/50 p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedEmpFor121(null)}
                  className="text-xs h-8"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  className="text-xs font-bold h-8 bg-cyan-500 hover:bg-cyan-600 text-white gap-1"
                >
                  <Calendar className="h-3 w-3" />
                  <span>Confirm Schedule</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PROVIDE DAILY COACHING & FEEDBACK                                */}
      {/* ========================================================================= */}
      {selectedEmpForFeedback && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-amber-500/40 rounded-2xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold text-foreground">
                  Coaching & Feedback for {selectedEmpForFeedback.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmpForFeedback(null)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCoachingFeedbackSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-muted-foreground font-bold">Star Rating (1.0 to 5.0)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 rounded hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= feedbackRating
                            ? "text-amber-400 fill-amber-400"
                            : "text-muted-foreground/40"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-mono font-bold text-sm text-foreground ml-2">
                    {feedbackRating}.0 / 5.0
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-bold">Sentiment Category</label>
                <select
                  value={feedbackSentiment}
                  onChange={(e) => setFeedbackSentiment(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-input bg-background/50 px-3 text-xs"
                >
                  <option value="EXCELLENT">EXCELLENT (Outstanding Velocity)</option>
                  <option value="GOOD">GOOD (Solid Delivery)</option>
                  <option value="COACHING_REQUIRED">COACHING_REQUIRED (Needs Alignment)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-bold">Coaching Takeaways & Notes</label>
                <textarea
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  placeholder="e.g. Excellent progress on OAuth refactoring. Keep attention on edge error handling."
                  rows={3}
                  className="w-full rounded-md border border-input bg-background/50 p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedEmpForFeedback(null)}
                  className="text-xs h-8"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  className="text-xs font-bold h-8 bg-amber-500 hover:bg-amber-600 text-black gap-1"
                >
                  <Check className="h-3 w-3" />
                  <span>Sync Feedback</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
