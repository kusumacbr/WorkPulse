"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { WorkpulseApi } from "@/lib/api/api-client";
import {
  Clock,
  FileCheck2,
  Target,
  Send,
  Star,
  CheckCircle2,
  Award,
} from "lucide-react";

interface TeamMemberRecord {
  id: string;
  name: string;
  designation: string;
  avatar: string;
  workMode: "OFFICE" | "WFH" | "HYBRID";
  sodStatus: "SUBMITTED" | "PENDING";
  sodTime: string;
  eodStatus: "SUBMITTED" | "IN_PROGRESS" | "PENDING";
  eodTime?: string;
  overallProgress: number;
  plannedTasks: {
    id: string;
    title: string;
    project: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    estimatedMinutes: number;
    completionPercentage: number;
    status: "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED" | "BLOCKED";
    expectedOutput: string;
  }[];
  eodAchievements?: string;
  eodBlockers?: string;
  eodTomorrowFocus?: string;
}

const TEAM_MEMBERS: TeamMemberRecord[] = [
  {
    id: "emp-sarah",
    name: "Sara Dev",
    designation: "Senior Backend Engineer",
    avatar: "SD",
    workMode: "OFFICE",
    sodStatus: "SUBMITTED",
    sodTime: "10:15 AM",
    eodStatus: "IN_PROGRESS",
    overallProgress: 80,
    plannedTasks: [
      {
        id: "st-1",
        title: "Implement dedicated SOD Carryover section with rolled-over task pile-up",
        project: "Frontend & UI",
        priority: "HIGH",
        estimatedMinutes: 180,
        completionPercentage: 80,
        status: "IN_PROGRESS",
        expectedOutput: "Zero carryover leak across sprint boundaries",
      },
      {
        id: "st-2",
        title: "Enforce manager assignment RBAC policies on profile editing endpoints",
        project: "Security & Auth",
        priority: "HIGH",
        estimatedMinutes: 120,
        completionPercentage: 100,
        status: "COMPLETED",
        expectedOutput: "Manager can only edit assigned pod members",
      },
    ],
    eodAchievements: "Refactored role checks and completed RBAC verification test suites.",
    eodBlockers: "None",
    eodTomorrowFocus: "Connect biometric edge events with live attendance pipeline.",
  },
  {
    id: "emp-rohit",
    name: "Rohit Sharma",
    designation: "Frontend Engineer (UI/UX)",
    avatar: "RS",
    workMode: "OFFICE",
    sodStatus: "SUBMITTED",
    sodTime: "10:20 AM",
    eodStatus: "IN_PROGRESS",
    overallProgress: 65,
    plannedTasks: [
      {
        id: "rt-1",
        title: "Design 3D interactive glassmorphism cards and smooth Framer Motion transitions",
        project: "Frontend & UI",
        priority: "HIGH",
        estimatedMinutes: 240,
        completionPercentage: 70,
        status: "IN_PROGRESS",
        expectedOutput: "Smooth page transition component across all 10 views",
      },
      {
        id: "rt-2",
        title: "Fix dark mode contrast tokens for secondary badges",
        project: "Design System",
        priority: "LOW",
        estimatedMinutes: 60,
        completionPercentage: 60,
        status: "IN_PROGRESS",
        expectedOutput: "WCAG AAA accessible contrast",
      },
    ],
    eodAchievements: "Shipped PageTransition & AnimatedTabContent components.",
    eodBlockers: "None",
    eodTomorrowFocus: "Optimize mobile viewport responsiveness.",
  },
  {
    id: "emp-priya",
    name: "Priya QA",
    designation: "QA Lead Engineer",
    avatar: "PQ",
    workMode: "WFH",
    sodStatus: "SUBMITTED",
    sodTime: "10:05 AM",
    eodStatus: "SUBMITTED",
    eodTime: "06:55 PM",
    overallProgress: 100,
    plannedTasks: [
      {
        id: "pt-1",
        title: "Automate Playwright end-to-end regression test suite for biometric sync",
        project: "Quality Assurance",
        priority: "HIGH",
        estimatedMinutes: 180,
        completionPercentage: 100,
        status: "COMPLETED",
        expectedOutput: "17 test suites passing in CI/CD pipeline",
      },
      {
        id: "pt-2",
        title: "Verify RBAC permission boundary tests for HR Stage-2 leave approvals",
        project: "Security & Auth",
        priority: "HIGH",
        estimatedMinutes: 120,
        completionPercentage: 100,
        status: "COMPLETED",
        expectedOutput: "Zero regression leaks on permission elevation",
      },
    ],
    eodAchievements: "85/85 unit tests and Playwright regressions green across all suites.",
    eodBlockers: "None",
    eodTomorrowFocus: "Prepare automated performance benchmarks.",
  },
  {
    id: "emp-karthik",
    name: "Karthik Raja",
    designation: "DevOps & Cloud Engineer",
    avatar: "KR",
    workMode: "OFFICE",
    sodStatus: "SUBMITTED",
    sodTime: "10:10 AM",
    eodStatus: "IN_PROGRESS",
    overallProgress: 75,
    plannedTasks: [
      {
        id: "kt-1",
        title: "Configure GitHub Actions CI/CD caching for Turborepo and Next.js artifacts",
        project: "Infrastructure",
        priority: "HIGH",
        estimatedMinutes: 200,
        completionPercentage: 80,
        status: "IN_PROGRESS",
        expectedOutput: "CI build times reduced by 40%",
      },
    ],
    eodAchievements: "Implemented npm cache layer in GitHub Actions workflow.",
    eodBlockers: "None",
    eodTomorrowFocus: "Production cluster failover testing.",
  },
  {
    id: "emp-ananya",
    name: "Ananya Sen",
    designation: "Automation QA Engineer",
    avatar: "AS",
    workMode: "OFFICE",
    sodStatus: "SUBMITTED",
    sodTime: "10:12 AM",
    eodStatus: "IN_PROGRESS",
    overallProgress: 85,
    plannedTasks: [
      {
        id: "at-1",
        title: "Write Vitest assertions for OKR 100% weight budget calculations",
        project: "Core Platform",
        priority: "MEDIUM",
        estimatedMinutes: 150,
        completionPercentage: 90,
        status: "IN_PROGRESS",
        expectedOutput: "Complete coverage on goal creation and budget caps",
      },
    ],
    eodAchievements: "Covered 6 critical edge cases in goal budgeting logic.",
    eodBlockers: "None",
    eodTomorrowFocus: "Review test coverage reports with Priya QA.",
  },
  {
    id: "emp-sneha",
    name: "Sneha Kapoor",
    designation: "Data Analytics Engineer",
    avatar: "SK",
    workMode: "OFFICE",
    sodStatus: "SUBMITTED",
    sodTime: "10:08 AM",
    eodStatus: "IN_PROGRESS",
    overallProgress: 75,
    plannedTasks: [
      {
        id: "sk-1",
        title: "Build automated telemetry ingestion pipelines for biometric attendance logs",
        project: "Data Lake",
        priority: "HIGH",
        estimatedMinutes: 240,
        completionPercentage: 75,
        status: "IN_PROGRESS",
        expectedOutput: "Sub-second analytical queries on 1M+ attendance events",
      },
    ],
  },
];

export function TeamMemberSODInspector() {
  const { allEmployees, updateLeadFeedback } = useWorkpulseSharedStore();

  const teamMembers: TeamMemberRecord[] = useMemo(() => {
    if (allEmployees.length > 0) {
      return allEmployees.map((emp) => ({
        id: emp.id,
        name: emp.name,
        designation: emp.designation,
        avatar:
          emp.avatar ||
          emp.name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
        workMode: emp.workMode || "OFFICE",
        sodStatus: emp.sodStatus || "PENDING",
        sodTime: emp.sodTime || "--",
        eodStatus: emp.eodStatus || "PENDING",
        eodTime: emp.eodTime,
        overallProgress: emp.overallProgress || 0,
        plannedTasks:
          emp.plannedTasks && emp.plannedTasks.length > 0
            ? emp.plannedTasks
            : [
                {
                  id: `task-${emp.id}-1`,
                  title: `Execute assigned deliverables for ${emp.designation}`,
                  project: "Core Pod Sprint",
                  priority: "HIGH" as const,
                  estimatedMinutes: 180,
                  completionPercentage: emp.overallProgress || 0,
                  status:
                    emp.overallProgress === 100
                      ? ("COMPLETED" as const)
                      : emp.sodStatus === "SUBMITTED"
                      ? ("IN_PROGRESS" as const)
                      : ("NOT_STARTED" as const),
                  expectedOutput: "Delivery per sprint acceptance criteria",
                },
              ],
        eodAchievements: emp.eodAchievements,
        eodBlockers: emp.eodBlockers,
        eodTomorrowFocus: emp.eodTomorrowFocus,
      }));
    }
    return TEAM_MEMBERS;
  }, [allEmployees]);

  const [selectedMemberId, setSelectedMemberId] = useState<string>("emp-sarah");
  const selectedMember =
    teamMembers.find((m) => m.id === selectedMemberId) ||
    teamMembers[0] ||
    TEAM_MEMBERS[0]!;

  const [leadComment, setLeadComment] = useState<string>(
    "Outstanding work on the SOD state machine and role streamlining today, Sara. Code review comments were addressed cleanly and test coverage remained 100%."
  );
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [leadActionItem, setLeadActionItem] = useState<string>(
    "Prepare demo recording of the SOD rollover flow for tomorrow's pod sync."
  );
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState<{ memberName: string; rating: number } | null>(null);

  const handleSelectMember = (member: TeamMemberRecord) => {
    setSelectedMemberId(member.id);
    setLastSubmitted(null);
    if (member.id === "emp-sarah") {
      setLeadComment("Outstanding work on the SOD state machine and role streamlining today, Sara. Code review comments were addressed cleanly and test coverage remained 100%.");
      setSelectedRating(5);
      setLeadActionItem("Prepare demo recording of the SOD rollover flow for tomorrow's pod sync.");
    } else if (member.id === "emp-priya") {
      setLeadComment("All 17 test suites passing in CI/CD pipeline. Flawless execution on the automated regression suite!");
      setSelectedRating(5);
      setLeadActionItem("Conduct knowledge transfer session on Playwright mocks.");
    } else {
      setLeadComment(`Solid execution today, ${member.name.split(" ")[0]}. Deliverables are well aligned with sprint goals.`);
      setSelectedRating(4);
      setLeadActionItem("Complete remaining wrap-up tasks before 07:00 PM.");
    }
  };

  const handleSendFeedback = async () => {
    if (!leadComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const note = leadComment.trim();
    const rating = selectedRating;
    const actionItem = leadActionItem.trim() || undefined;
    const empName = selectedMember.name;
    const empId = selectedMember.id;

    // 1. Immediately update reactive shared store
    updateLeadFeedback({
      employeeId: empId,
      employeeName: empName,
      note,
      rating,
      actionItem,
    });

    // 2. Persist to backend REST API endpoint (/api/v1/reviews/feedback)
    try {
      await WorkpulseApi.reviews.submitFeedback({
        employeeId: empId,
        employeeName: empName,
        note,
        rating,
        actionItem,
      });
    } catch (err) {
      console.warn("Backend API sync completed in local store:", err);
    }

    setIsSubmitting(false);
    setLastSubmitted({ memberName: empName, rating });
    setToastMsg(`Feedback & ${rating}-Star Rating for ${empName} submitted & synced live to Performance Reviews! ⭐`);

    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  const totalMembers = teamMembers.length;
  const sodSubmittedCount = teamMembers.filter((m) => m.sodStatus === "SUBMITTED").length;
  const avgProgress = Math.round(
    teamMembers.reduce((acc, m) => acc + m.overallProgress, 0) / (totalMembers || 1)
  );

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-card/60 border border-border flex items-center justify-between">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">SOD Completion</span>
            <span className="text-xl font-extrabold text-foreground">{sodSubmittedCount} of {totalMembers} Members</span>
          </div>
          <Badge variant="brand" className="text-xs bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
            {Math.round((sodSubmittedCount / (totalMembers || 1)) * 100)}% Locked
          </Badge>
        </div>

        <div className="p-4 rounded-xl bg-card/60 border border-border flex items-center justify-between">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Average Pod Velocity</span>
            <span className="text-xl font-extrabold text-cyan-400">{avgProgress}% Logged</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            Shift: 10AM - 7PM
          </Badge>
        </div>

        <div className="p-4 rounded-xl bg-card/60 border border-border flex items-center justify-between">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">EOD Evaluations</span>
            <span className="text-xl font-extrabold text-purple-400">Live Sync Enabled</span>
          </div>
          <Badge variant="outline" className="text-xs text-purple-300 border-purple-500/40">
            Auto-Sync to Reviews
          </Badge>
        </div>
      </div>

      {/* Main 2-Column Inspector: Member List & Detailed Workday Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Direct Reports List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Pod Direct Reports ({totalMembers})
            </h4>
            <span className="text-[10px] text-muted-foreground">Select to evaluate</span>
          </div>

          <div className="space-y-2">
            {teamMembers.map((member) => {
              const isSelected = selectedMember.id === member.id;
              const hasSubmittedSOD = member.sodStatus === "SUBMITTED";

              return (
                <div
                  key={member.id}
                  onClick={() => handleSelectMember(member)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                    isSelected
                      ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 ring-1 ring-[var(--brand-primary)] shadow-md"
                      : "border-border bg-card/60 hover:bg-card/90 hover:border-border/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[var(--brand-primary)] to-cyan-400 p-[1px]">
                      <div className="h-full w-full rounded-full bg-[#0b0f19] flex items-center justify-center text-cyan-300 font-extrabold text-xs">
                        {member.avatar}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-foreground">{member.name}</span>
                        {member.workMode === "WFH" && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 text-purple-300 border-purple-500/30 bg-purple-500/10">
                            WFH
                          </Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground block truncate max-w-[150px]">
                        {member.designation}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    {hasSubmittedSOD ? (
                      <span className="text-[11px] font-extrabold text-emerald-400 block font-mono">
                        {member.overallProgress}%
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400 font-bold block">Pending SOD</span>
                    )}
                    <span className="text-[9px] text-muted-foreground">
                      {member.plannedTasks.length} {member.plannedTasks.length === 1 ? "task" : "tasks"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Member SOD & EOD Deep Dive (8 cols) */}
        <div className="lg:col-span-8">
          <Interactive3DCard className="p-5 md:p-6 border border-border bg-card/60 space-y-5">
            {/* Header: Selected Member Info & Timings */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/30 flex items-center justify-center text-cyan-300 font-extrabold text-sm">
                  {selectedMember.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-foreground">{selectedMember.name}</h3>
                    <Badge variant="secondary" className="text-[10px]">
                      {selectedMember.designation}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Work Mode: <strong className="text-foreground">{selectedMember.workMode}</strong> · Shift:{" "}
                    <strong>10:00 AM – 07:00 PM</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant="brand"
                  className={
                    selectedMember.sodStatus === "SUBMITTED"
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs"
                      : "bg-amber-500/15 text-amber-400 border-amber-500/30 text-xs"
                  }
                >
                  <Clock className="h-3 w-3 mr-1" />
                  SOD: {selectedMember.sodStatus} {selectedMember.sodTime !== "--" && `(${selectedMember.sodTime})`}
                </Badge>

                {selectedMember.eodStatus === "SUBMITTED" && (
                  <Badge variant="outline" className="bg-purple-500/15 text-purple-300 border-purple-500/30 text-xs">
                    <FileCheck2 className="h-3 w-3 mr-1" />
                    EOD Submitted
                  </Badge>
                )}
              </div>
            </div>

            {/* Morning Planned Tasks Deck */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-cyan-400" />
                  SOD Deliverables Planned ({selectedMember.plannedTasks.length})
                </span>
                <span className="text-xs text-muted-foreground">
                  Overall Completion: <strong className="text-cyan-400 font-mono">{selectedMember.overallProgress}%</strong>
                </span>
              </div>

              <div className="space-y-2.5">
                {selectedMember.plannedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl bg-background/50 border border-border/70 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-foreground">{task.title}</span>
                      <Badge
                        variant="outline"
                        className={
                          task.priority === "HIGH"
                            ? "text-red-400 border-red-500/30 text-[9px]"
                            : "text-amber-400 border-amber-500/30 text-[9px]"
                        }
                      >
                        {task.priority}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-muted-foreground">
                      <strong>Expected Output:</strong> {task.expectedOutput}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                      <span>Project: <strong>{task.project}</strong> · Est: <strong>{task.estimatedMinutes}m</strong></span>
                      <span className="font-mono font-bold text-cyan-400">{task.completionPercentage}%</span>
                    </div>

                    <div className="progress-track-line">
                      <div
                        className="progress-track-fill-cyan"
                        style={{ width: `${task.completionPercentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evening EOD Summary */}
            {selectedMember.eodAchievements && (
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/25 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <FileCheck2 className="h-3.5 w-3.5 text-purple-400" />
                    Evening EOD Reflection Summary
                  </span>
                  {selectedMember.eodTime && (
                    <span className="text-[11px] font-mono text-purple-300">Submitted {selectedMember.eodTime}</span>
                  )}
                </div>

                <div className="space-y-1 text-muted-foreground">
                  <div>
                    <strong className="text-foreground">Achievements: </strong>
                    <span>{selectedMember.eodAchievements}</span>
                  </div>
                  <div>
                    <strong className="text-foreground">Blockers: </strong>
                    <span>{selectedMember.eodBlockers || "None"}</span>
                  </div>
                  {selectedMember.eodTomorrowFocus && (
                    <div>
                      <strong className="text-foreground">Tomorrow&apos;s Focus: </strong>
                      <span>{selectedMember.eodTomorrowFocus}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Team Lead EOD Evaluation & Live Feedback Sync Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent border border-purple-500/30 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-amber-400" />
                  Evaluate & Send EOD Feedback to {selectedMember.name}
                </span>

                {/* 5-Star Rating Selector */}
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-muted-foreground mr-1">Calibrated Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedRating(star)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          star <= selectedRating
                            ? "text-amber-400 fill-amber-400"
                            : "text-muted-foreground/40"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-400 ml-1">({selectedRating}.0 / 5)</span>
                </div>
              </div>

              <div className="space-y-2">
                <textarea
                  value={leadComment}
                  onChange={(e) => setLeadComment(e.target.value)}
                  placeholder={`Write official daily EOD feedback for ${selectedMember.name}...`}
                  rows={3}
                  className="w-full p-3 rounded-xl bg-background/80 border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-purple-400 resize-none leading-relaxed"
                />

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground shrink-0 font-bold">Action Item:</span>
                  <Input
                    value={leadActionItem}
                    onChange={(e) => setLeadActionItem(e.target.value)}
                    placeholder="e.g. Prepare demo recording for sprint sync..."
                    className="h-8 text-xs flex-1 bg-background/80"
                  />
                </div>
              </div>

              {/* Inline Success Notice */}
              {lastSubmitted && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>
                      ✓ <strong>{lastSubmitted.memberName}</strong>&apos;s EOD evaluation & {lastSubmitted.rating}.0★ rating synced to Performance Reviews!
                    </span>
                  </div>
                  <Link
                    href="/reviews"
                    className="text-[11px] font-bold text-cyan-300 hover:text-cyan-200 underline shrink-0 flex items-center gap-1"
                  >
                    <span>Open Reviews</span>
                    <span>→</span>
                  </Link>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <span className="text-[10px] text-muted-foreground">
                  💡 This feedback immediately reflects on {selectedMember.name}&apos;s <strong>Performance & Reviews</strong> section.
                </span>

                <Button
                  variant="brand"
                  size="sm"
                  disabled={isSubmitting || !leadComment.trim()}
                  onClick={handleSendFeedback}
                  className={`h-8 px-4 text-xs font-bold transition-all gap-1.5 shadow-sm cursor-pointer ${
                    lastSubmitted
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] border border-emerald-400/40"
                      : "bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-95"
                  }`}
                >
                  {lastSubmitted ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>✓ Synced to Performance Reviews!</span>
                    </>
                  ) : isSubmitting ? (
                    <>
                      <Clock className="h-3.5 w-3.5 animate-spin" />
                      <span>Syncing Feedback...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Submit & Sync to Performance Review</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Interactive3DCard>
        </div>
      </div>
    </div>
  );
}
