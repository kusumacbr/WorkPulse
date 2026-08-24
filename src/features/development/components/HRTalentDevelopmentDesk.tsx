"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { MetricTile3D } from "@/components/3d/MetricTile3D";
import {
  AlertTriangle,
  Award,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  HeartHandshake,
  Check,
} from "lucide-react";

interface PipCase {
  id: string;
  employeeName: string;
  departmentName: string;
  designation: string;
  leadName: string;
  startDate: string;
  targetEndDate: string;
  durationDays: number;
  coreObjectives: string;
  weeklyCheckpoint: string;
  progressPercent: number;
  status: "ACTIVE_ON_TRACK" | "UNDER_REVIEW" | "COMPLETED" | "EXTENDED";
}

const INITIAL_PIP_CASES: PipCase[] = [
  {
    id: "pip-1",
    employeeName: "John UI",
    departmentName: "Development",
    designation: "Frontend Engineer",
    leadName: "Alex Lead",
    startDate: "2026-08-01",
    targetEndDate: "2026-08-31",
    durationDays: 30,
    coreObjectives: "Improve SOD planning consistency, eliminate missed deadlines on UI components, and complete dark mode accessibility tasks.",
    weeklyCheckpoint: "Week 3 of 4: Alex Lead confirmed on-time delivery of sidebar navigation contrast fixes.",
    progressPercent: 75,
    status: "ACTIVE_ON_TRACK",
  },
];

interface ComplianceCourse {
  id: string;
  name: string;
  category: "LEGAL_COMPLIANCE" | "SECURITY" | "LEADERSHIP";
  targetAudience: string;
  completionRate: number;
  enrolledCount: number;
  completedCount: number;
  deadline: string;
}

const COMPLIANCE_COURSES: ComplianceCourse[] = [
  {
    id: "crs-1",
    name: "POSH (Prevention of Sexual Harassment) 2026 Annual Certification",
    category: "LEGAL_COMPLIANCE",
    targetAudience: "All 19 Employees & Leads",
    completionRate: 94.7,
    enrolledCount: 19,
    completedCount: 18,
    deadline: "Aug 31, 2026",
  },
  {
    id: "crs-2",
    name: "Zero-Trust Security & Biometric Hardware Privacy Standards",
    category: "SECURITY",
    targetAudience: "Engineering, DevOps & R&D",
    completionRate: 92.3,
    enrolledCount: 13,
    completedCount: 12,
    deadline: "Sep 15, 2026",
  },
  {
    id: "crs-3",
    name: "Empathetic Technical Coaching & 1-on-1 Framework for Team Leads",
    category: "LEADERSHIP",
    targetAudience: "6 Designated Team Leads",
    completionRate: 100.0,
    enrolledCount: 6,
    completedCount: 6,
    deadline: "Completed",
  },
];

export function HRTalentDevelopmentDesk() {
  const [activeTab, setActiveTab] = useState<"pip" | "compliance" | "grievances" | "recognition">("pip");
  const [pipCases, setPipCases] = useState<PipCase[]>(INITIAL_PIP_CASES);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleSignoffPip = (id: string, name: string) => {
    setPipCases((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "COMPLETED", progressPercent: 100 } : c))
    );
    setToastMsg(`Formal PIP for ${name} successfully confirmed & completed with HR sign-off! 🎉`);
    setTimeout(() => setToastMsg(null), 3000);
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

      {/* 3D Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile3D
          title="Active PIP Governance"
          value="1 Formal Plan"
          subtitle="John UI (Dev Pod) · Week 3 on-track"
          icon={AlertTriangle}
          change="75% Milestones Green"
          changePositive={true}
          badgeText="Active Case"
          accent="gold"
          onClick={() => setActiveTab("pip")}
        />

        <MetricTile3D
          title="Mandatory L&D Compliance"
          value="95.6% Rate"
          subtitle="POSH & Security certifications"
          icon={GraduationCap}
          change="1 Staff Pending"
          changePositive={true}
          badgeText="High Adherence"
          accent="emerald"
          onClick={() => setActiveTab("compliance")}
        />

        <MetricTile3D
          title="Employee Grievances"
          value="0 Open Tickets"
          subtitle="All workplace queries resolved in SLA"
          icon={HeartHandshake}
          change="Clean Log"
          changePositive={true}
          badgeText="SLA 100%"
          accent="cyan"
          onClick={() => setActiveTab("grievances")}
        />

        <MetricTile3D
          title="Peer Kudos & Badges"
          value="48 Badges"
          subtitle="Awarded company-wide this month"
          icon={Award}
          change="+12 This Week"
          changePositive={true}
          badgeText="High Morale"
          accent="rose"
          onClick={() => setActiveTab("recognition")}
        />
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex items-center p-1.5 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-xl overflow-x-auto gap-1 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab("pip")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === "pip"
              ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Formal PIP Governance Desk</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-black/20 text-[10px] font-extrabold">1</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("compliance")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === "compliance"
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <GraduationCap className="h-3.5 w-3.5" />
          <span>Mandatory L&D & POSH Compliance Matrix</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("grievances")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === "grievances"
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <HeartHandshake className="h-3.5 w-3.5" />
          <span>Employee Relations & Confidential Pulse</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("recognition")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === "recognition"
              ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Award className="h-3.5 w-3.5" />
          <span>Organization Recognition & Values Feed</span>
        </button>
      </div>

      {/* TAB 1: FORMAL PIP GOVERNANCE */}
      {activeTab === "pip" && (
        <Interactive3DCard className="p-6 space-y-4 border-border/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Performance Improvement Plan (PIP) Governance Desk
              </h3>
              <p className="text-xs text-muted-foreground">
                Formal confidential performance plans co-managed between designated Team Lead and HR People Operations.
              </p>
            </div>

            <Badge variant="outline" className="text-[10px] text-amber-300 border-amber-500/30">
              Confidential HR Workspace
            </Badge>
          </div>

          <div className="space-y-4 pt-2">
            {pipCases.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-card/60 border border-amber-500/30 space-y-3 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{c.employeeName}</span>
                      <span className="text-xs text-muted-foreground">({c.designation})</span>
                      <Badge variant="brand" className="text-[10px] bg-purple-500/15 text-purple-300 border-purple-500/30">
                        {c.departmentName}
                      </Badge>
                    </div>

                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                      <span>Coaching Lead: <strong className="text-foreground">{c.leadName}</strong></span>
                      <span>·</span>
                      <span className="font-mono text-amber-400">
                        {c.durationDays} Days Plan ({c.startDate} → {c.targetEndDate})
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-[9px] uppercase font-bold ${
                      c.status === "COMPLETED"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                    }`}
                  >
                    {c.status.replace("_", " ")}
                  </Badge>
                </div>

                <div className="p-3 rounded-xl bg-background/50 border border-border/70 text-xs space-y-1">
                  <strong className="text-foreground block">Formal Improvement Objectives:</strong>
                  <p className="text-muted-foreground">{c.coreObjectives}</p>
                </div>

                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs">
                  <strong className="text-purple-300 block font-bold">Latest Checkpoint Feedback:</strong>
                  <p className="text-foreground/90 mt-0.5">{c.weeklyCheckpoint}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress Completion:</span>
                    <strong className="text-amber-400 font-mono">{c.progressPercent}%</strong>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${c.progressPercent}%` }}
                    />
                  </div>
                </div>

                {c.status !== "COMPLETED" && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                    <Button
                      variant="brand"
                      size="sm"
                      onClick={() => handleSignoffPip(c.id, c.employeeName)}
                      className="text-xs font-bold h-7 bg-gradient-to-r from-emerald-500 to-teal-600 text-white gap-1"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Approve Milestone Sign-off</span>
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Interactive3DCard>
      )}

      {/* TAB 2: L&D & POSH COMPLIANCE MATRIX */}
      {activeTab === "compliance" && (
        <Interactive3DCard className="p-6 space-y-4 border-border/80">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-emerald-400" />
              Organizational L&D, POSH & Statutory Compliance Matrix
            </h3>
            <p className="text-xs text-muted-foreground">
              Monitor enterprise compliance across statutory mandatory trainings and engineering certifications.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {COMPLIANCE_COURSES.map((crs) => (
              <div
                key={crs.id}
                className="p-4 rounded-xl bg-card/60 border border-border/80 space-y-3 hover:border-emerald-500/40 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-xs text-foreground block">{crs.name}</span>
                    <span className="text-[11px] text-muted-foreground">
                      Audience: <strong className="text-foreground">{crs.targetAudience}</strong> · Deadline:{" "}
                      <span className="font-mono text-cyan-400">{crs.deadline}</span>
                    </span>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-[9px] uppercase font-bold ${
                      crs.completionRate === 100
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                    }`}
                  >
                    {crs.completedCount} / {crs.enrolledCount} Certified ({crs.completionRate}%)
                  </Badge>
                </div>

                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${crs.completionRate === 100 ? "bg-emerald-400" : "bg-cyan-400"}`}
                    style={{ width: `${crs.completionRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Interactive3DCard>
      )}

      {/* TAB 3: EMPLOYEE RELATIONS & GRIEVANCES */}
      {activeTab === "grievances" && (
        <Interactive3DCard className="p-6 space-y-4 border-border/80">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <HeartHandshake className="h-4 w-4 text-cyan-400" />
              Employee Relations & Confidential Pulse Log
            </h3>
            <p className="text-xs text-muted-foreground">
              Confidential case registry for dispute resolution, workplace inquiries, and anonymous sentiment feedback.
            </p>
          </div>

          <div className="p-8 text-center bg-card/40 rounded-2xl border border-border/60 text-xs text-muted-foreground space-y-2">
            <ShieldCheck className="h-8 w-8 text-emerald-400 mx-auto" />
            <p className="font-bold text-foreground text-sm">All Employee Relations Inquiries Clear</p>
            <p className="max-w-md mx-auto">
              Zero active grievances or escalated conflict tickets across all 6 departments. Monthly workplace pulse sentiment stands at <strong className="text-emerald-400">92% Positive</strong>.
            </p>
          </div>
        </Interactive3DCard>
      )}

      {/* TAB 4: RECOGNITION & KUDOS */}
      {activeTab === "recognition" && (
        <Interactive3DCard className="p-6 space-y-4 border-border/80">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Award className="h-4 w-4 text-rose-400" />
              Enterprise Kudos & Values Recognition Feed
            </h3>
            <p className="text-xs text-muted-foreground">
              Real-time peer recognitions aligned with company core values: Ownership, Velocity, Collaboration, and Innovation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-card/60 border border-rose-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">Sarah Dev awarded Priya QA</span>
                <Badge variant="brand" className="text-[9px] bg-rose-500/15 text-rose-300 border-rose-500/30">
                  Problem Solver 🌟
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                &quot;Huge shoutout to Priya for automating all 17 Playwright suites before sprint freeze!&quot;
              </p>
            </div>

            <div className="p-4 rounded-xl bg-card/60 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">Marcus Vance awarded Karthik Raja</span>
                <Badge variant="brand" className="text-[9px] bg-purple-500/15 text-purple-300 border-purple-500/30">
                  Reliability Hero 🚀
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                &quot;Karthik optimized GitHub Actions caching, shaving 40% off CI build times.&quot;
              </p>
            </div>
          </div>
        </Interactive3DCard>
      )}
    </div>
  );
}
