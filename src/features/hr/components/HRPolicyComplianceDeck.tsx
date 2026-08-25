"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import {
  Calendar,
  CheckCircle2,
  Award,
  Bell,
  Lock,
  Plus,
  Check,
} from "lucide-react";

interface LeadComplianceRecord {
  leadId: string;
  leadName: string;
  department: string;
  directReportsCount: number;
  completedReviews: number;
  overdueReviews: number;
  complianceRate: number;
  lastReviewDate: string;
  status: "ON_TIME" | "OVERDUE_NUDGED" | "PENDING_SUBMISSION";
}

interface PipRecord {
  id: string;
  employeeName: string;
  department: string;
  designation: string;
  leadName: string;
  stage: "30_DAYS_MILESTONE" | "60_DAYS_FINAL";
  startDate: string;
  nextCheckInDate: string;
  coreObjectives: string;
  weeklyProgressScore: number;
  leadEvaluation: string;
  hrOverrideReason?: string;
  status: "ACTIVE" | "COMPLETED_RECOVERED" | "ESCALATED";
}

interface CompanyHoliday {
  id: string;
  name: string;
  date: string;
  day: string;
  type: "MANDATORY" | "OPTIONAL";
  description: string;
}

const INITIAL_LEAD_COMPLIANCE: LeadComplianceRecord[] = [
  {
    leadId: "lead-alex",
    leadName: "Alex Lead",
    department: "Development",
    directReportsCount: 2,
    completedReviews: 2,
    overdueReviews: 0,
    complianceRate: 100,
    lastReviewDate: "Aug 19, 2026",
    status: "ON_TIME",
  },
  {
    leadId: "admin-david",
    leadName: "David Director",
    department: "R & D",
    directReportsCount: 1,
    completedReviews: 1,
    overdueReviews: 0,
    complianceRate: 100,
    lastReviewDate: "Aug 19, 2026",
    status: "ON_TIME",
  },
  {
    leadId: "lead-vikram",
    leadName: "Vikram Rao",
    department: "Data processing",
    directReportsCount: 1,
    completedReviews: 1,
    overdueReviews: 0,
    complianceRate: 100,
    lastReviewDate: "Aug 19, 2026",
    status: "ON_TIME",
  },
  {
    leadId: "lead-marcus",
    leadName: "Marcus Vance",
    department: "Devops",
    directReportsCount: 1,
    completedReviews: 1,
    overdueReviews: 0,
    complianceRate: 100,
    lastReviewDate: "Aug 19, 2026",
    status: "ON_TIME",
  },
  {
    leadId: "hr-rachel",
    leadName: "Rachel HR",
    department: "Human Resources",
    directReportsCount: 1,
    completedReviews: 1,
    overdueReviews: 0,
    complianceRate: 100,
    lastReviewDate: "Aug 19, 2026",
    status: "ON_TIME",
  },
];

const INITIAL_PIPS: PipRecord[] = [
  {
    id: "pip-101",
    employeeName: "Ananya Sen",
    department: "Service Providers (ConfigTap)",
    designation: "Automation & Embedded QA Engineer",
    leadName: "Alex Lead",
    stage: "30_DAYS_MILESTONE",
    startDate: "2026-08-01",
    nextCheckInDate: "2026-08-31",
    coreObjectives: "Improve test suite coverage on Autosar classic diagnostic protocol and eliminate shift arrival anomalies.",
    weeklyProgressScore: 78.0,
    leadEvaluation: "Demonstrated positive progress in CAN test suite. 2 weeks remaining in 30-day milestone.",
    status: "ACTIVE",
  },
];

const INITIAL_HOLIDAYS: CompanyHoliday[] = [
  {
    id: "hol-1",
    name: "Independence Day",
    date: "2026-08-15",
    day: "Saturday",
    type: "MANDATORY",
    description: "National Holiday",
  },
  {
    id: "hol-2",
    name: "Gandhi Jayanti",
    date: "2026-10-02",
    day: "Friday",
    type: "MANDATORY",
    description: "National Holiday · Long Weekend",
  },
  {
    id: "hol-3",
    name: "Dussehra (Vijayadashami)",
    date: "2026-10-20",
    day: "Tuesday",
    type: "MANDATORY",
    description: "Festival of Triumph",
  },
  {
    id: "hol-4",
    name: "Diwali (Deepavali)",
    date: "2026-11-08",
    day: "Sunday",
    type: "MANDATORY",
    description: "Festival of Lights",
  },
  {
    id: "hol-5",
    name: "Christmas Day",
    date: "2026-12-25",
    day: "Friday",
    type: "MANDATORY",
    description: "Christmas Celebration",
  },
];

export function HRPolicyComplianceDeck({ defaultSubTab = "reviews" }: { defaultSubTab?: string }) {
  const [subTab, setSubTab] = useState<"reviews" | "pip" | "holidays">(
    defaultSubTab === "holidays" ? "holidays" : (defaultSubTab as any) || "reviews"
  );

  const [leadCompliance, setLeadCompliance] = useState<LeadComplianceRecord[]>(INITIAL_LEAD_COMPLIANCE);
  const [pipList, setPipList] = useState<PipRecord[]>(INITIAL_PIPS);
  const [holidays, setHolidays] = useState<CompanyHoliday[]>(INITIAL_HOLIDAYS);

  const [newHolidayName, setNewHolidayName] = useState("");
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleNudgeLead = (leadId: string, leadName: string) => {
    setLeadCompliance((prev) =>
      prev.map((l) => (l.leadId === leadId ? { ...l, status: "OVERDUE_NUDGED" } : l))
    );
    showToast(`Appraisal reminder nudge broadcast sent to ${leadName} via Slack & Email! 🔔`);
  };

  const handleSignoffPip = (id: string, name: string) => {
    setPipList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "COMPLETED_RECOVERED" } : p))
    );
    showToast(`PIP milestone progress signed off for ${name}. ✓`);
  };

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayName.trim() || !newHolidayDate.trim()) return;

    const newHol: CompanyHoliday = {
      id: `hol-${Date.now()}`,
      name: newHolidayName.trim(),
      date: newHolidayDate,
      day: "Official Holiday",
      type: "MANDATORY",
      description: "Company Published Holiday",
    };

    setHolidays([...holidays, newHol]);
    setNewHolidayName("");
    setNewHolidayDate("");
    showToast(`Holiday "${newHol.name}" published to organization calendar! 🗓️`);
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

      {/* Sub-Navigation */}
      <div className="flex items-center p-1.5 rounded-xl bg-card/60 border border-border/80 overflow-x-auto gap-1 text-xs">
        <button
          type="button"
          onClick={() => setSubTab("reviews")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold transition-all ${
            subTab === "reviews"
              ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Award className="h-3.5 w-3.5" />
          <span>Team Lead Review Compliance</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("pip")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold transition-all ${
            subTab === "pip"
              ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Lock className="h-3.5 w-3.5" />
          <span>Confidential PIP Pipeline</span>
          <Badge variant="outline" className="text-[9px] ml-1 bg-white/20 text-white border-transparent">
            {pipList.length} Active
          </Badge>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("holidays")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold transition-all ${
            subTab === "holidays"
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Holiday Calendar Management</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 1. TEAM LEAD REVIEW COMPLIANCE TRACKER                         */}
      {/* ============================================================== */}
      {subTab === "reviews" && (
        <Interactive3DCard className="p-6 border border-amber-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-400" />
                Team Lead Appraisal Review Compliance Tracker
              </h3>
              <p className="text-xs text-muted-foreground">
                Tracks timely completion of direct report appraisals across all 6 leads to ensure zero performance backlog.
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-bold text-amber-300 border-amber-500/30">
              Q3 2026 Active Cycle
            </Badge>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border/80 bg-card/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border/60">
                <tr>
                  <th className="p-3">Designated Lead</th>
                  <th className="p-3">Department</th>
                  <th className="p-3 text-center">Reports</th>
                  <th className="p-3 text-center">Compliance</th>
                  <th className="p-3">Last Completed</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {leadCompliance.map((lead) => (
                  <tr key={lead.leadId} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-bold text-foreground">{lead.leadName}</td>
                    <td className="p-3 text-cyan-400 font-medium">{lead.department}</td>
                    <td className="p-3 text-center font-mono font-bold">{lead.directReportsCount}</td>
                    <td className="p-3 text-center">
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-bold ${
                          lead.complianceRate === 100
                            ? "border-emerald-500/40 text-emerald-400"
                            : "border-rose-500/40 text-rose-400"
                        }`}
                      >
                        {lead.complianceRate}% On-Time
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground font-mono text-[11px]">{lead.lastReviewDate}</td>
                    <td className="p-3 text-right">
                      {lead.overdueReviews > 0 ? (
                        <Button
                          variant="brand"
                          size="sm"
                          onClick={() => handleNudgeLead(lead.leadId, lead.leadName)}
                          className="text-xs font-bold h-7 bg-gradient-to-r from-amber-500 to-yellow-600 text-black gap-1"
                        >
                          <Bell className="h-3 w-3" />
                          <span>{lead.status === "OVERDUE_NUDGED" ? "Nudged ✓" : "Send Nudge"}</span>
                        </Button>
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-semibold flex items-center justify-end gap-1">
                          <Check className="h-3.5 w-3.5" />
                          <span>Compliant</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Interactive3DCard>
      )}

      {/* ============================================================== */}
      {/* 2. CONFIDENTIAL PIP PIPELINE & AUDIT OVERRIDE LOGGING          */}
      {/* ============================================================== */}
      {subTab === "pip" && (
        <Interactive3DCard className="p-6 border border-rose-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4 text-rose-400" />
                Confidential Performance Improvement Plan (PIP) Pipeline
              </h3>
              <p className="text-xs text-muted-foreground">
                Strict access control: HR, Assigned Manager, and Authorized Admin only. Any decision override requires written audit justification.
              </p>
            </div>
            <Badge variant="destructive" className="text-xs font-bold">
              Restricted Sensitivity
            </Badge>
          </div>

          <div className="space-y-3 text-xs">
            {pipList.map((pip) => (
              <div
                key={pip.id}
                className="p-4 rounded-xl bg-card/60 border border-border/80 space-y-3"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">{pip.employeeName}</span>
                      <span className="text-muted-foreground">({pip.department} · {pip.designation})</span>
                      <Badge variant="brand" className="text-[9px] bg-rose-500/15 text-rose-300 border-rose-500/30 font-bold">
                        30-Day Milestone Checkpoint
                      </Badge>
                    </div>

                    <p className="text-[11px] text-muted-foreground">
                      Assigned Lead: <strong className="text-foreground">{pip.leadName}</strong> · Next Check-in: <strong className="text-cyan-300">{pip.nextCheckInDate}</strong>
                    </p>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-[10px] text-muted-foreground block">Milestone Score</span>
                    <strong className="text-emerald-400 font-bold text-base">{pip.weeklyProgressScore}%</strong>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-background/50 border border-border space-y-1 text-[11px]">
                  <strong className="text-foreground">Core Objectives:</strong>
                  <p className="text-muted-foreground">{pip.coreObjectives}</p>
                </div>

                <div className="pt-2 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-[10px] text-muted-foreground">
                    Lead Note: &quot;{pip.leadEvaluation}&quot;
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="brand"
                      size="sm"
                      onClick={() => handleSignoffPip(pip.id, pip.employeeName)}
                      className="text-xs font-bold h-7 bg-gradient-to-r from-emerald-500 to-teal-600 text-white gap-1"
                    >
                      <Check className="h-3 w-3" />
                      <span>Sign-off Milestone</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Interactive3DCard>
      )}

      {/* ============================================================== */}
      {/* 3. HOLIDAY CALENDAR MANAGEMENT                                  */}
      {/* ============================================================== */}
      {subTab === "holidays" && (
        <Interactive3DCard className="p-6 border border-cyan-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-cyan-400" />
                Enterprise Holiday Calendar Management (2026)
              </h3>
              <p className="text-xs text-muted-foreground">
                Manage statutory, mandatory, and optional company holidays visible to all employees on their dashboard.
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-bold text-cyan-300 border-cyan-500/30">
              {holidays.length} Official Holidays
            </Badge>
          </div>

          {/* Add Holiday Form */}
          <form onSubmit={handleAddHoliday} className="p-3.5 rounded-xl bg-card/60 border border-border flex flex-col sm:flex-row items-center gap-2 text-xs">
            <Input
              value={newHolidayName}
              onChange={(e) => setNewHolidayName(e.target.value)}
              placeholder="Holiday name (e.g. Karnataka Rajyotsava)"
              className="h-8 text-xs flex-1"
            />
            <Input
              type="date"
              value={newHolidayDate}
              onChange={(e) => setNewHolidayDate(e.target.value)}
              className="h-8 text-xs w-40"
            />
            <Button type="submit" variant="brand" size="sm" className="text-xs font-bold h-8 px-4 shrink-0 gap-1">
              <Plus className="h-3.5 w-3.5" />
              <span>Add Holiday</span>
            </Button>
          </form>

          {/* Holiday List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {holidays.map((hol) => (
              <div
                key={hol.id}
                className="p-3.5 rounded-xl bg-card/60 border border-border/80 space-y-1.5 hover:border-cyan-500/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-sm">{hol.name}</span>
                  <Badge variant="brand" className="text-[9px] bg-cyan-500/15 text-cyan-300 border-cyan-500/30 font-bold">
                    {hol.type}
                  </Badge>
                </div>
                <div className="text-muted-foreground font-mono text-[11px]">
                  {hol.date} · {hol.day}
                </div>
                <p className="text-[10px] text-muted-foreground">{hol.description}</p>
              </div>
            ))}
          </div>
        </Interactive3DCard>
      )}
    </div>
  );
}
