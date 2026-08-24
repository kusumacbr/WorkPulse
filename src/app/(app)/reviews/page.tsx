"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { MetricTile3D } from "@/components/3d/MetricTile3D";
import { SelfVsLeadComparisonChart } from "@/features/reviews/components/SelfVsLeadComparisonChart";
import { LeadEODFeedbackDeck } from "@/features/reviews/components/LeadEODFeedbackDeck";
import { HRPerformanceGovernanceDeck } from "@/features/reviews/components/HRPerformanceGovernanceDeck";
import { PageTransition } from "@/components/animations/PageTransition";
import { useCurrentUser } from "@/components/layout/UserContext";
import {
  FileCheck,
  Award,
  ShieldCheck,
  Clock,
  TrendingUp,
  Star,
  MessageSquare,
  BarChart3,
} from "lucide-react";

export default function ReviewsPage() {
  const user = useCurrentUser();
  const isHR = user.roles.includes("HR") || user.primaryRole === "HR" || user.roles.includes("ADMIN");

  const [activeTab, setActiveTab] = useState<"hr_governance" | "my_reviews">(
    isHR ? "hr_governance" : "my_reviews"
  );

  const leadRatings = { quality: 5, timeliness: 4.8, communication: 4.7, collaboration: 4.9, initiative: 4.8, execution: 4.9 };

  return (
    <PageTransition>
      {/* 3D Hero */}
      <Interactive3DCard className="p-6 md:p-8 border border-purple-500/30 bg-gradient-to-r from-card/80 via-card/60 to-purple-500/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="font-bold text-[10px] uppercase bg-purple-500/15 border-purple-500/30 text-purple-300">
                <Award className="h-3 w-3 mr-1 text-purple-400" />
                {isHR ? "Enterprise Appraisal & Performance Governance" : "Continuous Growth & Lead Coaching"}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                {isHR ? "Q3 2026 Appraisal Cycle · All 6 Departments" : "Platform Pod · Alex Lead"}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {isHR ? "Performance Cycles, Lead Audits & Bell Curve Governance" : "Team Lead Feedback & Performance Reviews"}
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {isHR
                ? "Oversee organizational 360° appraisal cycles, audit Team Lead evaluation compliance & turnaround times, calibrate rating distributions (Bell Curve), and review promotion nominations."
                : "Transparent, continuous feedback from your designated Team Lead (Alex Lead) reviewing daily EOD deliverables, sprint OKR execution, and monthly career calibrations."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isHR && (
              <div className="flex items-center p-1 rounded-xl bg-background/50 border border-purple-500/30 backdrop-blur-md shrink-0 shadow-sm">
                <button
                  type="button"
                  onClick={() => setActiveTab("hr_governance")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === "hr_governance"
                      ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>HR Appraisal Governance</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("my_reviews")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === "my_reviews"
                      ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Award className="h-3.5 w-3.5" />
                  <span>My Personal Review</span>
                </button>
              </div>
            )}

            {!isHR && (
              <div className="p-4 rounded-2xl bg-background/50 border border-purple-500/30 backdrop-blur-md space-y-1.5 shrink-0 text-xs text-right shadow-sm">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Cumulative Lead Score
                </span>
                <div className="flex items-center gap-1.5 justify-end">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span className="text-2xl font-black text-purple-300 font-mono">91.5 / 100</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold block">Top 5% Pod Performance</span>
              </div>
            )}
          </div>
        </div>
      </Interactive3DCard>

      {/* Conditional rendering for HR vs Individual Employee */}
      {activeTab === "hr_governance" && isHR ? (
        <HRPerformanceGovernanceDeck />
      ) : (
        <>
          {/* 3D Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricTile3D
              title="Current Sprint Score"
              value="89.0 / 100"
              subtitle="Sprint 34 Evaluated by Alex Lead"
              icon={FileCheck}
              change="Approved & Logged"
              changePositive={true}
              badgeText="Active Sprint"
              accent="purple"
            />

            <MetricTile3D
              title="Daily EOD Turnaround"
              value="1.5 Hours"
              subtitle="Average lead response time on EOD"
              icon={Clock}
              change="100% On-Time"
              changePositive={true}
              badgeText="Fast Response"
              accent="cyan"
            />

            <MetricTile3D
              title="Growth Trajectory"
              value="+4.2% YoY"
              subtitle="Consistent technical excellence increase"
              icon={TrendingUp}
              change="High Velocity"
              changePositive={true}
              badgeText="Calibrated"
              accent="emerald"
            />
          </div>

          {/* Main Content Layout: Left Lead EOD Feedback Suite, Right Competency Alignment */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <LeadEODFeedbackDeck />
            </div>

            {/* Right Column: Lead Competency Evaluation & Alignment Radar */}
            <div className="space-y-6">
              <Interactive3DCard className="p-6 border border-border/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    Team Lead Competency Radar
                  </h3>
                  <Badge variant="outline" className="text-[10px] text-purple-300 border-purple-500/30">
                    Alex Lead
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground">
                  Evaluated across 5 core engineering dimensions in weekly sprint reviews.
                </p>

                <SelfVsLeadComparisonChart
                  managerRatings={leadRatings}
                  reviewerName="Alex Lead"
                />
              </Interactive3DCard>

              {/* Quick Lead Note Card */}
              <Interactive3DCard className="p-5 border border-purple-500/25 bg-purple-500/5 space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-purple-400" />
                  <h4 className="text-xs font-bold text-foreground">Lead Coaching Relationship</h4>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your evening EOD submissions are reviewed daily by <strong className="text-foreground">Alex Lead</strong>. Feedback notes and coaching action items are attached directly to each day&apos;s checkpoint.
                </p>

                <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between text-[11px] text-purple-300 font-semibold">
                  <span>Next 1-on-1 Sync: Today at 03:30 PM</span>
                </div>
              </Interactive3DCard>
            </div>
          </div>
        </>
      )}
    </PageTransition>
  );
}
