"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { MetricTile3D } from "@/components/3d/MetricTile3D";
import { PageTransition } from "@/components/animations/PageTransition";
import { AnimatedTabContent } from "@/components/animations/AnimatedTabContent";
import { TeamHeatmapGrid } from "@/features/team/components/TeamHeatmapGrid";
import { TeamMemberSODInspector } from "@/features/team/components/TeamMemberSODInspector";
import { TeamManagementDeck } from "@/features/team/components/TeamManagementDeck";
import { TeamLeadLeaveApprovals } from "@/features/team/components/TeamLeadLeaveApprovals";
import { TeamLeadWfhApprovals } from "@/features/team/components/TeamLeadWfhApprovals";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { OrgLiveExecutionMonitor } from "@/features/monitoring/components/OrgLiveExecutionMonitor";
import {
  Users,
  Clock,
  FileCheck2,
  Calendar,
  ChevronRight,
  CheckCircle2,
  Layers,
  Home,
  Eye,
  UserCheck,
} from "lucide-react";

type TeamTabKey =
  | "team_management"
  | "sod_inspector"
  | "org_monitor"
  | "leave_approvals"
  | "wfh_approvals"
  | "blockers"
  | "probation"
  | "heatmap"
  | "reviews"
  | "coaching";

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState<TeamTabKey>("team_management");
  const { allEmployees, leaveRequests, wfhRequests } = useWorkpulseSharedStore();

  const pendingLeaveCount = leaveRequests.filter((r) => r.status === "PENDING_TL_STAGE_1").length;
  const pendingWfhCount = wfhRequests.filter((r) => r.status === "PENDING_TL_STAGE_1").length;

  const [approvedReviews, setApprovedReviews] = useState<Record<string, boolean>>({});

  const reviewsList = (allEmployees.length > 0 ? allEmployees.slice(0, 4) : []).map((emp, idx) => ({
    id: `rev-${emp.id}-34`,
    employeeName: emp.name,
    jobTitle: emp.designation,
    period: "Aug 17 – Aug 23, 2026",
    status: "SUBMITTED",
    submittedAt: `${(idx + 1) * 2} hours ago`,
    approved: !!approvedReviews[`rev-${emp.id}-34`],
  }));

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [blockers, setBlockers] = useState([
    {
      id: "blk-1",
      title: "Cross-department OAuth token refresh sync latency",
      employeeName: "Sara Dev",
      department: "Development Pod",
      severity: "CRITICAL",
      impact: "Affects edge biometric token validation during office rush hour",
      status: "OPEN",
      ageHours: 2.5,
      createdAt: "Today at 09:30 AM",
    },
    {
      id: "blk-2",
      title: "DevOps Redis Cluster failover replica provisioning",
      employeeName: "Rohit Sharma",
      department: "Development Pod",
      severity: "HIGH",
      impact: "Blocks staging benchmark load testing",
      status: "ACKNOWLEDGED",
      ageHours: 4.0,
      createdAt: "Today at 08:00 AM",
    },
  ]);

  const [probationRecommendations, setProbationRecommendations] = useState<Record<string, string>>({
    "emp-rohit": "CONFIRM",
  });

  const upcomingOneToOnes = (allEmployees.length > 0 ? allEmployees.slice(0, 3) : []).map((emp, idx) => ({
    id: `121-${emp.id}`,
    employeeName: emp.name,
    jobTitle: emp.designation,
    scheduledAt: idx === 0 ? "Today at 03:30 PM" : "Tomorrow at 11:00 AM",
    agenda: `Sprint 34 deliverables review & ${emp.designation} alignment`,
  }));

  const handleQuickApprove = (id: string, name: string) => {
    setApprovedReviews((prev) => ({ ...prev, [id]: true }));
    setToastMsg(`Sprint 34 Review for ${name} approved & acknowledged! ⭐`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAcknowledgeBlocker = (id: string) => {
    setBlockers((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "ACKNOWLEDGED" } : b))
    );
    setToastMsg("Blocker acknowledged. SLA timer started.");
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleResolveBlocker = (id: string) => {
    setBlockers((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "RESOLVED" } : b))
    );
    setToastMsg("Blocker marked as resolved! Employee notified.");
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSetProbationRec = (empId: string, name: string, rec: string) => {
    setProbationRecommendations((prev) => ({ ...prev, [empId]: rec }));
    setToastMsg(`Probation recommendation for ${name} recorded as ${rec} and synced to HR! ✓`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const pendingReviewCount = reviewsList.filter((r) => !r.approved).length;
  const activeBlockersCount = blockers.filter((b) => b.status !== "RESOLVED").length;

  return (
    <PageTransition>
      {/* 3D Manager Header Hero */}
      <Interactive3DCard className="p-6 md:p-8 border border-purple-500/30 bg-gradient-to-r from-card/80 via-card/60 to-purple-500/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="font-bold text-[10px] uppercase bg-purple-500/15 border-purple-500/30 text-purple-300">
                <Users className="h-3 w-3 mr-1 text-purple-400" />
                Team Lead Command Hub
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">Alex Lead · Platform Pod · 6 Direct Reports</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Team Operations & Checkpoint Approvals
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Inspect morning SODs & evening EODs, evaluate daily performance with live review sync, approve Stage-1 Leave and WFH requests to forward to HR, resolve blockers, and manage pod sprint milestones.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-background/50 border border-purple-500/30 backdrop-blur-md space-y-1.5 shrink-0 text-xs text-right shadow-sm">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Pod Delivery Health
            </span>
            <span className="text-2xl font-black text-emerald-400">98.4% On-Track</span>
          </div>
        </div>
      </Interactive3DCard>

      {/* Toast Feedback */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-bold">{toastMsg}</span>
        </div>
      )}

      {/* 3D Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile3D
          title="SOD & EOD Inspector"
          value="6 / 6 Active"
          subtitle="Evaluate deliverables & sync feedback"
          icon={Clock}
          change="Live Sync"
          changePositive={true}
          badgeText="Active"
          accent="cyan"
          onClick={() => setActiveTab("sod_inspector")}
        />

        <MetricTile3D
          title="Stage 1 Leave Approvals"
          value={`${pendingLeaveCount} Pending`}
          subtitle="Forward approved leaves to HR"
          icon={Calendar}
          change={pendingLeaveCount > 0 ? "Review Needed" : "All Reviewed"}
          changePositive={pendingLeaveCount === 0}
          badgeText={`Queue: ${pendingLeaveCount}`}
          accent="gold"
          onClick={() => setActiveTab("leave_approvals")}
        />

        <MetricTile3D
          title="Stage 1 WFH Approvals"
          value={`${pendingWfhCount} Pending`}
          subtitle="Forward approved WFH to HR"
          icon={Home}
          change={pendingWfhCount > 0 ? "Review Needed" : "All Reviewed"}
          changePositive={pendingWfhCount === 0}
          badgeText={`Queue: ${pendingWfhCount}`}
          accent="purple"
          onClick={() => setActiveTab("wfh_approvals")}
        />

        <MetricTile3D
          title="Active Blockers"
          value={`${activeBlockersCount} Reported`}
          subtitle="SLA escalated roadblocks"
          icon={FileCheck2}
          change={activeBlockersCount > 0 ? "Action Req" : "All Clear"}
          changePositive={activeBlockersCount === 0}
          badgeText={activeBlockersCount > 0 ? "Critical" : "Clean"}
          accent={activeBlockersCount > 0 ? "rose" : "emerald"}
          onClick={() => setActiveTab("blockers")}
        />
      </div>

      {/* Team Tabs Navigation Bar */}
      <div className="flex items-center p-1.5 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-xl overflow-x-auto gap-1 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab("team_management")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            activeTab === "team_management"
              ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <UserCheck className="h-3.5 w-3.5" />
          <span>Team Management & Roster</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-extrabold">{allEmployees.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sod_inspector")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            activeTab === "sod_inspector"
              ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>SOD & EOD Inspector</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-extrabold">{allEmployees.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("org_monitor")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            activeTab === "org_monitor"
              ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>All Departments (Org Radar)</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-extrabold">{allEmployees.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("leave_approvals")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            activeTab === "leave_approvals"
              ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Leave Approvals (Stage 1)</span>
          {pendingLeaveCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-400/30 text-black font-extrabold text-[10px]">
              {pendingLeaveCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("wfh_approvals")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            activeTab === "wfh_approvals"
              ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Home className="h-3.5 w-3.5" />
          <span>WFH Approvals (Stage 1)</span>
          {pendingWfhCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-extrabold">
              {pendingWfhCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("blockers")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            activeTab === "blockers"
              ? "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <FileCheck2 className="h-3.5 w-3.5" />
          <span>Blockers & SLA Desk</span>
          {activeBlockersCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-extrabold">{activeBlockersCount}</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("probation")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            activeTab === "probation"
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Probation Reviews</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("heatmap")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            activeTab === "heatmap"
              ? "bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Pod Presence Heatmap</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reviews")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            activeTab === "reviews"
              ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <FileCheck2 className="h-3.5 w-3.5" />
          <span>Sprint Reviews</span>
          {pendingReviewCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-extrabold">{pendingReviewCount}</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("coaching")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            activeTab === "coaching"
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>1-on-1 Coaching</span>
        </button>
      </div>

      {/* Animated Tab Content Rendering */}
      <AnimatedTabContent tabKey={activeTab}>
        {/* TAB 0: TEAM MANAGEMENT & DIRECT REPORTS ROSTER */}
        {activeTab === "team_management" && <TeamManagementDeck />}

        {/* TAB 1: INDIVIDUAL SOD & EOD INSPECTOR */}
        {activeTab === "sod_inspector" && <TeamMemberSODInspector />}

        {/* TAB 2: ORG-WIDE LIVE MONITOR */}
        {activeTab === "org_monitor" && <OrgLiveExecutionMonitor />}

        {/* TAB 3: STAGE 1 LEAVE APPROVALS */}
        {activeTab === "leave_approvals" && <TeamLeadLeaveApprovals />}

        {/* TAB 4: STAGE 1 WFH APPROVALS */}
        {activeTab === "wfh_approvals" && <TeamLeadWfhApprovals />}

        {/* TAB 5: BLOCKERS & SLA RESOLUTION DESK */}
        {activeTab === "blockers" && (
          <Interactive3DCard className="p-6 space-y-4 border-border/80">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-rose-400" />
                  Team Roadblocks & Dependency Escalations
                </h3>
                <p className="text-xs text-muted-foreground">
                  Acknowledge and resolve impediments to unblock pod velocity.
                </p>
              </div>
              <Badge variant={activeBlockersCount > 0 ? "destructive" : "brand"} className="text-[10px] font-bold">
                {activeBlockersCount} Active Blockers
              </Badge>
            </div>

            <div className="space-y-3">
              {blockers.map((blk) => (
                <div
                  key={blk.id}
                  className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                    blk.status === "RESOLVED"
                      ? "border-emerald-500/30 bg-card/40 opacity-75"
                      : blk.severity === "CRITICAL"
                      ? "border-rose-500/50 bg-card/80 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                      : "border-border/70 bg-card/60"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-xs font-bold text-foreground">{blk.title}</strong>
                        <Badge
                          variant={blk.severity === "CRITICAL" ? "destructive" : "outline"}
                          className="text-[9px] font-bold"
                        >
                          {blk.severity}
                        </Badge>
                        <Badge variant="secondary" className="text-[9px]">
                          {blk.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{blk.impact}</p>
                      <span className="text-[10px] font-mono text-muted-foreground block mt-1">
                        Reported by {blk.employeeName} · {blk.createdAt} (Age: {blk.ageHours}h)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {blk.status !== "RESOLVED" && (
                        <>
                          {blk.status === "OPEN" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAcknowledgeBlocker(blk.id)}
                              className="text-xs font-semibold h-8"
                            >
                              Acknowledge
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="brand"
                            onClick={() => handleResolveBlocker(blk.id)}
                            className="text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white h-8"
                          >
                            Mark Resolved ✓
                          </Button>
                        </>
                      )}
                      {blk.status === "RESOLVED" && (
                        <Badge variant="brand" className="text-[10px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                          Resolved
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Interactive3DCard>
        )}

        {/* TAB 6: PROBATION REVIEWS & RECOMMENDATIONS */}
        {activeTab === "probation" && (
          <Interactive3DCard className="p-6 space-y-4 border-border/80">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-cyan-400" />
                  30/60/90-Day Pod Probation Recommendations
                </h3>
                <p className="text-xs text-muted-foreground">
                  Provide lead recommendations to HR for full-time confirmation or extension.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  id: "emp-rohit",
                  name: "Rohit Sharma",
                  designation: "Frontend Engineer (UI/UX)",
                  joiningDate: "2024-07-10",
                  stage: "30_DAYS",
                  daysLeft: 12,
                  velocity: "94.5%",
                  sodAdherence: "100%",
                },
                {
                  id: "emp-karthik",
                  name: "Karthik Raja",
                  designation: "DevOps & Cloud Engineer",
                  joiningDate: "2024-09-01",
                  stage: "60_DAYS",
                  daysLeft: 25,
                  velocity: "98.0%",
                  sodAdherence: "96%",
                },
              ].map((rec) => {
                const currentRec = probationRecommendations[rec.id] || "CONFIRM";
                return (
                  <div key={rec.id} className="p-4 rounded-xl border border-border/70 bg-card/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <strong className="text-xs font-bold text-foreground block">{rec.name}</strong>
                        <span className="text-[11px] text-muted-foreground">{rec.designation}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {rec.stage}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-lg bg-background/50 border border-border/40">
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Sprint Velocity</span>
                        <strong className="text-emerald-400 font-mono">{rec.velocity}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">SOD Adherence</span>
                        <strong className="text-cyan-400 font-mono">{rec.sodAdherence}</strong>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Lead Recommendation to HR:
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {["CONFIRM", "EXTEND_30", "UNDER_REVIEW"].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleSetProbationRec(rec.id, rec.name, opt)}
                            className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all ${
                              currentRec === opt
                                ? opt === "CONFIRM"
                                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                                  : opt === "EXTEND_30"
                                  ? "bg-amber-500/20 border-amber-500 text-amber-300"
                                  : "bg-purple-500/20 border-purple-500 text-purple-300"
                                : "border-border/60 hover:bg-muted/40 text-muted-foreground"
                            }`}
                          >
                            {opt === "CONFIRM" ? "Confirm" : opt === "EXTEND_30" ? "Extend 30d" : "Review"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Interactive3DCard>
        )}

        {/* TAB 7: POD PRESENCE HEATMAP */}
        {activeTab === "heatmap" && <TeamHeatmapGrid />}

        {/* TAB 8: SPRINT REVIEWS SIGN-OFF */}
        {activeTab === "reviews" && (
          <Interactive3DCard className="p-6 space-y-4 border-border/80">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-purple-400" />
                Weekly Reviews Awaiting Lead Action
              </h3>
              <Badge variant="secondary" className="text-[10px] font-bold bg-purple-500/15 text-purple-300 border-purple-500/30">
                {pendingReviewCount} in Queue
              </Badge>
            </div>

            <div className="space-y-3">
              {reviewsList.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-xl border border-border/70 bg-card/60 hover:border-purple-500/40 space-y-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground">{rev.employeeName}</span>
                      <span className="text-[11px] text-muted-foreground">({rev.jobTitle})</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground block font-mono">
                      {rev.period} · Submitted {rev.submittedAt}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {rev.approved ? (
                      <Badge variant="brand" className="text-[10px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold uppercase">
                        Approved
                      </Badge>
                    ) : (
                      <>
                        <Button
                          variant="brand"
                          size="sm"
                          onClick={() => handleQuickApprove(rev.id, rev.employeeName)}
                          className="text-xs font-bold bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-sm h-8 px-3 gap-1"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>1-Click Sign-off</span>
                        </Button>
                        <Link href="/reviews">
                          <Button variant="outline" size="sm" className="text-xs font-semibold h-8 px-2.5">
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Interactive3DCard>
        )}

        {/* TAB 9: 1-ON-1 COACHING */}
        {activeTab === "coaching" && (
          <Interactive3DCard className="p-6 space-y-4 border-border/80">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-cyan-400" />
                Upcoming 1-on-1 Coaching Checkpoints
              </h3>
              <Badge variant="brand" className="text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border-cyan-500/30">
                This Week
              </Badge>
            </div>

            <div className="space-y-3">
              {upcomingOneToOnes.map((meeting) => (
                <div
                  key={meeting.id}
                  className="p-4 rounded-xl border border-border/70 bg-card/60 hover:border-cyan-500/40 space-y-2 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground">{meeting.employeeName}</span>
                    <span className="text-[11px] text-cyan-400 font-semibold font-mono bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      {meeting.scheduledAt}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{meeting.agenda}</p>
                </div>
              ))}
            </div>
          </Interactive3DCard>
        )}
      </AnimatedTabContent>
    </PageTransition>
  );
}

