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
} from "lucide-react";

type TeamTabKey =
  | "sod_inspector"
  | "org_monitor"
  | "leave_approvals"
  | "wfh_approvals"
  | "heatmap"
  | "reviews"
  | "coaching";

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState<TeamTabKey>("sod_inspector");
  const { leaveRequests, wfhRequests } = useWorkpulseSharedStore();

  const pendingLeaveCount = leaveRequests.filter((r) => r.status === "PENDING_TL_STAGE_1").length;
  const pendingWfhCount = wfhRequests.filter((r) => r.status === "PENDING_TL_STAGE_1").length;

  const [reviewsList, setReviewsList] = useState([
    {
      id: "rev-sarah-34",
      employeeName: "Sarah Dev",
      jobTitle: "Senior Backend Engineer",
      period: "Aug 17 – Aug 23, 2026",
      status: "SUBMITTED",
      submittedAt: "2 hours ago",
      approved: false,
    },
    {
      id: "rev-john-34",
      employeeName: "John UI",
      jobTitle: "Frontend Engineer",
      period: "Aug 17 – Aug 23, 2026",
      status: "SUBMITTED",
      submittedAt: "4 hours ago",
      approved: false,
    },
  ]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const upcomingOneToOnes = [
    {
      id: "121-1",
      employeeName: "Sarah Dev",
      jobTitle: "Senior Backend Engineer",
      scheduledAt: "Today at 03:30 PM",
      agenda: "Sprint 34 review & Q3 technical architecture discussion",
    },
    {
      id: "121-2",
      employeeName: "Priya QA",
      jobTitle: "QA Lead",
      scheduledAt: "Tomorrow at 11:00 AM",
      agenda: "End-to-end automation testing strategy",
    },
  ];

  const handleQuickApprove = (id: string, name: string) => {
    setReviewsList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, approved: true } : r))
    );
    setToastMsg(`Sprint 34 Review for ${name} approved & acknowledged! ⭐`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const pendingReviewCount = reviewsList.filter((r) => !r.approved).length;

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
              Inspect morning SODs & evening EODs, evaluate daily performance with live review sync, approve Stage-1 Leave and WFH requests to forward to HR, and manage pod sprint milestones.
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
          title="Weekly Reviews"
          value={`${pendingReviewCount} Pending`}
          subtitle="Sprint 34 sign-offs"
          icon={FileCheck2}
          change={pendingReviewCount > 0 ? "Sign-off" : "Complete"}
          changePositive={pendingReviewCount === 0}
          badgeText={`Queue: ${pendingReviewCount}`}
          accent="gold"
          onClick={() => setActiveTab("reviews")}
        />
      </div>

      {/* Team Tabs Navigation Bar */}
      <div className="flex items-center p-1.5 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-xl overflow-x-auto gap-1 shadow-sm">
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
          <span>Direct Reports (Lead)</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-extrabold">6</span>
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
          <span>All Departments (Org Scope)</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-extrabold">19</span>
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
        {/* TAB 1: INDIVIDUAL SOD & EOD INSPECTOR */}
        {activeTab === "sod_inspector" && <TeamMemberSODInspector />}

        {/* TAB 2: ORG-WIDE LIVE MONITOR */}
        {activeTab === "org_monitor" && <OrgLiveExecutionMonitor />}

        {/* TAB 3: STAGE 1 LEAVE APPROVALS */}
        {activeTab === "leave_approvals" && <TeamLeadLeaveApprovals />}

        {/* TAB 3: STAGE 1 WFH APPROVALS */}
        {activeTab === "wfh_approvals" && <TeamLeadWfhApprovals />}

        {/* TAB 4: POD PRESENCE HEATMAP */}
        {activeTab === "heatmap" && <TeamHeatmapGrid />}

        {/* TAB 5: SPRINT REVIEWS SIGN-OFF */}
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

        {/* TAB 6: 1-ON-1 COACHING */}
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
