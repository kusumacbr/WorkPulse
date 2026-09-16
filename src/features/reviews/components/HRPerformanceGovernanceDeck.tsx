"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { MetricTile3D } from "@/components/3d/MetricTile3D";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import {
  FileCheck,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  BarChart3,
  Check,
  X,
} from "lucide-react";

interface PromotionNomination {
  id: string;
  employeeName: string;
  departmentName: string;
  currentTitle: string;
  proposedTitle: string;
  nominatedBy: string;
  currentRating: number;
  businessJustification: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

const INITIAL_NOMINATIONS: PromotionNomination[] = [
  {
    id: "nom-1",
    employeeName: "Sara Dev",
    departmentName: "Development",
    currentTitle: "Senior Backend Engineer",
    proposedTitle: "Staff Software Architect",
    nominatedBy: "Alex Lead",
    currentRating: 91.5,
    businessJustification: "Led the PostgreSQL resilience architecture, 100% sprint OKR delivery, and mentored 2 junior developers.",
    status: "PENDING",
  },
  {
    id: "nom-2",
    employeeName: "Priya QA",
    departmentName: "R & D",
    currentTitle: "QA & Test Automation Lead",
    proposedTitle: "Principal Quality Engineer",
    nominatedBy: "David Director",
    currentRating: 94.0,
    businessJustification: "Zero production regressions for 3 consecutive quarters, created automated Playwright biometric harness.",
    status: "PENDING",
  },
  {
    id: "nom-3",
    employeeName: "Karthik Raja",
    departmentName: "DevOps",
    currentTitle: "DevOps & Cloud Engineer",
    proposedTitle: "Senior SRE & Cloud Architect",
    nominatedBy: "Marcus Vance",
    currentRating: 88.5,
    businessJustification: "Reduced CI/CD build times by 40% and maintained 99.99% uptime on staging and production Kubernetes clusters.",
    status: "PENDING",
  },
];

export function HRPerformanceGovernanceDeck() {
  const { departments, allEmployees, updateEmployee } = useWorkpulseSharedStore();
  const [activeTab, setActiveTab] = useState<"cycles" | "leads" | "bellcurve" | "promotions">("cycles");
  const [nominations, setNominations] = useState<PromotionNomination[]>(INITIAL_NOMINATIONS);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleApproveNomination = (id: string, name: string, title: string) => {
    const updated = nominations.map((n) => (n.id === id ? { ...n, status: "APPROVED" as const } : n));
    setNominations(updated);

    const matchedEmp = allEmployees.find(
      (e) => e.name.toLowerCase() === name.toLowerCase()
    );
    if (matchedEmp) {
      updateEmployee(matchedEmp.id, { designation: title });
    }
    setToastMsg(`Promotion nomination for ${name} to "${title}" approved & updated across all organizational rosters! 🏆`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleRejectNomination = (id: string, name: string) => {
    const updated = nominations.map((n) => (n.id === id ? { ...n, status: "REJECTED" as const } : n));
    setNominations(updated);
    setToastMsg(`Nomination for ${name} deferred to next cycle.`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const pendingNomCount = nominations.filter((n) => n.status === "PENDING").length;

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-bold">{toastMsg}</span>
        </div>
      )}

      {/* 3D Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile3D
          title="Active Appraisal Cycle"
          value="Q3 2026 Cycle"
          subtitle="84.2% completion across 6 departments"
          icon={FileCheck}
          change="Closes in 12 Days"
          changePositive={true}
          badgeText="Active"
          accent="purple"
          onClick={() => setActiveTab("cycles")}
        />

        <MetricTile3D
          title="Team Lead Compliance"
          value="5 of 6 Completed"
          subtitle="Alex, Maya, Vikram, Suresh, Marcus on-time"
          icon={Users}
          change="1 Lead Overdue"
          changePositive={false}
          badgeText="83% Leads Done"
          accent="cyan"
          onClick={() => setActiveTab("leads")}
        />

        <MetricTile3D
          title="Org Bell Curve Score"
          value="88.4 / 100"
          subtitle="Calibrated rating distribution"
          icon={TrendingUp}
          change="Normal Distribution"
          changePositive={true}
          badgeText="Calibrated"
          accent="emerald"
          onClick={() => setActiveTab("bellcurve")}
        />

        <MetricTile3D
          title="Promotion Nominations"
          value={`${pendingNomCount} Nominees`}
          subtitle="Level upgrades submitted by Leads"
          icon={Award}
          change={pendingNomCount > 0 ? "Committee Review" : "All Reviewed"}
          changePositive={pendingNomCount === 0}
          badgeText={`Queue: ${pendingNomCount}`}
          accent="gold"
          onClick={() => setActiveTab("promotions")}
        />
      </div>

      {/* Sub-tab Pill Navigation */}
      <div className="flex items-center p-1.5 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-xl overflow-x-auto gap-1 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab("cycles")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === "cycles"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <FileCheck className="h-3.5 w-3.5" />
          <span>Appraisal Cycles & Department Progress</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("leads")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === "leads"
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Team Lead Review Auditor</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("bellcurve")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === "bellcurve"
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          <span>Bell Curve & Rating Calibrations</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("promotions")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === "promotions"
              ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Award className="h-3.5 w-3.5" />
          <span>Promotion & Merit Nominations</span>
          {pendingNomCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-black/20 text-[10px] font-extrabold">
              {pendingNomCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: APPRAISAL CYCLES & DEPARTMENT PROGRESS */}
      {activeTab === "cycles" && (
        <div className="space-y-6">
          <Interactive3DCard className="p-6 space-y-4 border-border/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-purple-400" />
                  Q3 2026 Enterprise Appraisal Cycle (360° Review Progress)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Includes Self Assessment, Team Lead Evaluation, Peer Multi-Rater Feedback, and HR Calibration.
                </p>
              </div>

              <Badge variant="brand" className="text-[10px] bg-purple-500/15 text-purple-300 border-purple-500/30 font-bold">
                Cycle Ends Aug 31, 2026
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {departments.map((dept, idx) => {
                const progress = idx === 0 ? 100 : idx === 1 ? 95 : idx === 2 ? 85 : idx === 3 ? 100 : idx === 4 ? 90 : 65;
                const status = progress === 100 ? "COMPLETED" : "IN_PROGRESS";

                return (
                  <div
                    key={dept.id}
                    className="p-4 rounded-xl bg-card/60 border border-border/80 space-y-3 hover:border-purple-500/40 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground">{dept.name}</span>
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-bold ${
                          status === "COMPLETED"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {status}
                      </Badge>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Lead: {dept.teamLead.name}</span>
                        <strong className="text-purple-300 font-mono">{progress}% Complete</strong>
                      </div>
                      <div className="progress-track-line">
                        <div
                          className={`h-full rounded-full ${progress === 100 ? "progress-track-fill-emerald" : "progress-track-fill-purple"}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground block font-mono">
                        {dept.employees.length} Employee EOD & OKR checks synchronized
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Interactive3DCard>
        </div>
      )}

      {/* TAB 2: TEAM LEAD REVIEW AUDITOR */}
      {activeTab === "leads" && (
        <Interactive3DCard className="p-6 space-y-4 border-border/80">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-cyan-400" />
              Team Lead Review Compliance & Coaching Turnaround Auditor
            </h3>
            <p className="text-xs text-muted-foreground">
              Audit each designated Team Lead&apos;s turnaround time on daily EOD reviews, sprint evaluations, and 1-on-1 coaching syncs.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {departments.map((dept, idx) => {
              const isOverdue = idx === 5; // SAP Services
              const turnaround = isOverdue ? "4.2 Hours (Needs Follow-up)" : "1.2 Hours (Fast)";
              const avgScore = (88 + (idx * 2) - 1).toFixed(1);

              return (
                <div
                  key={dept.id}
                  className="p-4 rounded-xl bg-card/60 border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-cyan-500/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-muted/80 border border-border flex items-center justify-center font-bold text-cyan-400 text-xs shrink-0">
                      {dept.teamLead.avatar}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-xs">{dept.teamLead.name}</span>
                        <span className="text-[11px] text-muted-foreground">({dept.name})</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                        <span>Direct Reports: <strong className="text-foreground">{dept.employees.length}</strong></span>
                        <span>·</span>
                        <span>Avg Turnaround: <strong className={isOverdue ? "text-amber-400" : "text-emerald-400"}>{turnaround}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:text-right shrink-0">
                    <div>
                      <span className="font-mono font-bold text-purple-300 text-sm">{avgScore} / 100</span>
                      <span className="text-[10px] text-muted-foreground block">Team Calibrated Score</span>
                    </div>

                    <Badge
                      variant="outline"
                      className={`text-[9px] uppercase font-bold ${
                        isOverdue
                          ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      }`}
                    >
                      {isOverdue ? "Review Pending" : "100% Compliant"}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </Interactive3DCard>
      )}

      {/* TAB 3: BELL CURVE & RATING CALIBRATION */}
      {activeTab === "bellcurve" && (
        <Interactive3DCard className="p-6 space-y-4 border-border/80">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-400" />
              Organizational Bell Curve Calibration & Normalization
            </h3>
            <p className="text-xs text-muted-foreground">
              Standard Gaussian Distribution across all 19 staff members to prevent rating inflation and ensure fair rewards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-card/60 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-emerald-400">Exceeds Expectations (Top 15%)</span>
                <Badge variant="brand" className="text-[9px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                  3 Staff
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Score Range: 90 – 100. High performers driving innovation and outsized business impact.
              </p>
              <div className="pt-2 border-t border-border/50 text-[11px] text-foreground font-semibold space-y-1">
                <div>• Sara Dev (Score: 91.5)</div>
                <div>• Priya QA (Score: 94.0)</div>
                <div>• Ananya Sen (Score: 92.0)</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card/60 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-cyan-400">Strong Contributors (Core 70%)</span>
                <Badge variant="brand" className="text-[9px] bg-cyan-500/15 text-cyan-300 border-cyan-500/30">
                  4 Staff
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Score Range: 75 – 89. Steady, reliable delivery meeting all sprint OKR deliverables consistently.
              </p>
              <div className="pt-2 border-t border-border/50 text-[11px] text-foreground font-semibold space-y-1">
                <div>• Rohit Sharma, Karthik Raja, Sneha Kapoor, Ananya Sen...</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card/60 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-400">Needs Coaching & Growth (15%)</span>
                <Badge variant="brand" className="text-[9px] bg-amber-500/15 text-amber-300 border-amber-500/30">
                  2 Staff
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Score Range: Below 75. Enrolled in 1-on-1 development coaching and skill upskilling plans.
              </p>
              <div className="pt-2 border-t border-border/50 text-[11px] text-foreground font-semibold space-y-1">
                <div>• Rohit Sharma (Score: 74.0 · Active 1-on-1 Plan)</div>
                <div>• Sneha Kapoor (Score: 73.0 · Ingestion Coaching)</div>
              </div>
            </div>
          </div>
        </Interactive3DCard>
      )}

      {/* TAB 4: PROMOTIONS & MERIT NOMINATIONS */}
      {activeTab === "promotions" && (
        <Interactive3DCard className="p-6 space-y-4 border-border/80">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-400" />
                Team Lead Promotion & Merit Increment Nominations Desk
              </h3>
              <p className="text-xs text-muted-foreground">
                Review promotions nominated by designated Team Leads with performance data justification.
              </p>
            </div>
            <Badge variant="brand" className="text-[10px] bg-amber-500/15 text-amber-300 border-amber-500/30 font-bold">
              {pendingNomCount} Pending Sign-off
            </Badge>
          </div>

          <div className="space-y-3 pt-2">
            {nominations.map((nom) => {
              const matchedEmp = allEmployees.find(
                (e) => e.name.toLowerCase() === nom.employeeName.toLowerCase() || (nom.id === "nom-1" && e.id === "emp-sarah")
              );
              const employeeName = matchedEmp ? matchedEmp.name : nom.employeeName;
              const currentTitle = matchedEmp ? matchedEmp.designation : nom.currentTitle;
              const departmentName = matchedEmp ? matchedEmp.departmentName : nom.departmentName;

              return (
                <div
                  key={nom.id}
                  className="p-4 rounded-xl bg-card/60 border border-border/80 space-y-3 hover:border-amber-500/40 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{employeeName}</span>
                        <span className="text-xs text-muted-foreground">({departmentName})</span>
                        <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30 font-mono">
                          Rating: {nom.currentRating} / 100
                        </Badge>
                      </div>

                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                        <span>{currentTitle}</span>
                        <span className="text-amber-400 font-bold">→</span>
                        <strong className="text-amber-300 font-bold">{nom.proposedTitle}</strong>
                      </div>
                    </div>

                  <Badge
                    variant="outline"
                    className={`text-[9px] uppercase font-bold ${
                      nom.status === "APPROVED"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : nom.status === "REJECTED"
                        ? "bg-red-500/15 text-red-400 border-red-500/30"
                        : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                    }`}
                  >
                    {nom.status}
                  </Badge>
                </div>

                <div className="p-3 rounded-lg bg-background/50 border border-border/60 text-xs space-y-1">
                  <span className="text-muted-foreground font-bold block">
                    Lead Justification (by {nom.nominatedBy}):
                  </span>
                  <p className="text-foreground">{nom.businessJustification}</p>
                </div>

                {nom.status === "PENDING" && (
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/60">
                    <Button
                      variant="brand"
                      size="sm"
                      onClick={() => handleApproveNomination(nom.id, nom.employeeName, nom.proposedTitle)}
                      className="text-xs font-bold h-7 bg-gradient-to-r from-amber-500 to-yellow-600 text-black gap-1 shadow-sm"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Approve Promotion</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRejectNomination(nom.id, nom.employeeName)}
                      className="text-xs font-bold h-7 border-red-500/40 text-red-400 hover:bg-red-500/10 gap-1"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>Defer</span>
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Interactive3DCard>
      )}
    </div>
  );
}
