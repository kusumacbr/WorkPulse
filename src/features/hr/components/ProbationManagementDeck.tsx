"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { createClient } from "@/lib/supabase/client";
import {
  UserCheck,
  Clock,
  CheckCircle2,
  Calendar,
  Award,
} from "lucide-react";

interface ProbationCandidate {
  id: string;
  employeeName: string;
  designation: string;
  department: string;
  joiningDate: string;
  probationEndDate: string;
  daysCompleted: number;
  stage: "30_DAYS" | "60_DAYS" | "90_DAYS_FINAL";
  managerRecommendation: "CONFIRM" | "EXTEND_30" | "UNDER_REVIEW";
  managerNotes: string;
  managerName: string;
  okrScore: number;
  attendancePunctuality: number;
  status: "PENDING_HR_DECISION" | "CONFIRMED" | "EXTENDED";
}

const INITIAL_CANDIDATES: ProbationCandidate[] = [
  {
    id: "prob-1",
    employeeName: "Rohit Sharma",
    designation: "Frontend Engineer (UI/UX)",
    department: "Engineering",
    joiningDate: "2026-05-20",
    probationEndDate: "2026-08-20",
    daysCompleted: 90,
    stage: "90_DAYS_FINAL",
    managerRecommendation: "CONFIRM",
    managerNotes: "Exceeded all technical milestones in Next.js & Tailwind components. High collaboration with team.",
    managerName: "Alex Lead",
    okrScore: 92.5,
    attendancePunctuality: 98.0,
    status: "PENDING_HR_DECISION",
  },
  {
    id: "prob-2",
    employeeName: "Ananya Sen",
    designation: "Automation QA Engineer",
    department: "Quality Assurance",
    joiningDate: "2026-06-20",
    probationEndDate: "2026-09-20",
    daysCompleted: 60,
    stage: "60_DAYS",
    managerRecommendation: "CONFIRM",
    managerNotes: "Successfully configured Playwright end-to-end regression testing pipelines.",
    managerName: "Alex Lead",
    okrScore: 88.0,
    attendancePunctuality: 96.5,
    status: "PENDING_HR_DECISION",
  },
  {
    id: "prob-3",
    employeeName: "Karthik Raja",
    designation: "DevOps & Cloud Engineer",
    department: "Infrastructure",
    joiningDate: "2026-07-20",
    probationEndDate: "2026-10-20",
    daysCompleted: 30,
    stage: "30_DAYS",
    managerRecommendation: "UNDER_REVIEW",
    managerNotes: "Completed onboarding. Initial AWS IAM architecture tasks in progress.",
    managerName: "David Admin",
    okrScore: 84.0,
    attendancePunctuality: 100.0,
    status: "PENDING_HR_DECISION",
  },
];

export function ProbationManagementDeck() {
  const { allEmployees, updateEmployee } = useWorkpulseSharedStore();
  const [candidates, setCandidates] = useState<ProbationCandidate[]>(INITIAL_CANDIDATES);
  const [confirmedCount, setConfirmedCount] = useState<number>(14);

  useEffect(() => {
    try {
      const c = localStorage.getItem("workpulse_probation_candidates");
      if (c) setCandidates(JSON.parse(c));
      const cnt = localStorage.getItem("workpulse_probation_confirmed_count");
      if (cnt) setConfirmedCount(JSON.parse(cnt));
    } catch {
      // safe fallback
    }
  }, []);

  const handleConfirm = (id: string) => {
    const updated = candidates.map((c) => (c.id === id ? { ...c, status: "CONFIRMED" as const } : c));
    setCandidates(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("workpulse_probation_candidates", JSON.stringify(updated));
      localStorage.setItem("workpulse_probation_confirmed_count", JSON.stringify(confirmedCount + 1));
    }
    const candidate = candidates.find((c) => c.id === id);
    if (candidate) {
      const matchedEmp = allEmployees.find(
        (e) => e.name.toLowerCase() === candidate.employeeName.toLowerCase()
      );
      if (matchedEmp) {
        updateEmployee(matchedEmp.id, { status: "Full-Time" });
        try {
          const supabase = createClient();
          supabase.channel("workpulse-supabase-live-channel").send({
            type: "broadcast",
            event: "employee:updated",
            payload: { id: matchedEmp.id, status: "Full-Time" },
          });
        } catch {}
      }
    }
    setConfirmedCount((c) => c + 1);
  };

  const handleExtend = (id: string) => {
    const updated = candidates.map((c) => (c.id === id ? { ...c, status: "EXTENDED" as const } : c));
    setCandidates(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("workpulse_probation_candidates", JSON.stringify(updated));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-transparent border border-purple-500/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
              Talent Evaluation & Growth
            </span>
          </div>
          <h3 className="text-lg font-bold text-foreground">
            Probation Milestones & Confirmation Pipeline
          </h3>
          <p className="text-xs text-muted-foreground">
            Review 30/60/90 day checkpoints. <strong className="text-amber-300">Policy:</strong> Probationers & Interns work <strong className="text-foreground">Monday to Saturday Full (10:00 AM – 07:00 PM)</strong> with Sunday as official week off.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs bg-card/60 px-4 py-2 rounded-xl border border-border/80 shrink-0">
          <div className="text-right">
            <span className="text-[10px] text-muted-foreground uppercase block font-bold">2026 Confirmations</span>
            <strong className="text-sm font-extrabold text-emerald-400">{confirmedCount} Employees</strong>
          </div>
        </div>
      </div>

      {/* Probation Candidates Grid */}
      <div className="space-y-4">
        {candidates.map((cand) => {
          const isPending = cand.status === "PENDING_HR_DECISION";
          const matchedEmp = allEmployees.find(
            (e) => e.name.toLowerCase() === cand.employeeName.toLowerCase() || (cand.id === "prob-1" && e.id === "emp-rohit")
          );
          const employeeName = matchedEmp ? matchedEmp.name : cand.employeeName;
          const designation = matchedEmp ? matchedEmp.designation : cand.designation;
          const department = matchedEmp ? matchedEmp.departmentName : cand.department;

          return (
            <Interactive3DCard
              key={cand.id}
              className={`p-6 border transition-all ${
                cand.status === "CONFIRMED"
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : cand.status === "EXTENDED"
                  ? "border-amber-500/30 bg-amber-500/5"
                  : ""
              }`}
            >
              <div className="space-y-4">
                {/* Candidate Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-[1px]">
                      <div className="h-full w-full rounded-full bg-[#0b0f19] flex items-center justify-center text-purple-300 font-bold text-xs">
                        {employeeName.slice(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-foreground">{employeeName}</h4>
                        <Badge
                          variant="brand"
                          className="text-[10px] uppercase font-bold bg-purple-500/15 border-purple-500/30 text-purple-300"
                        >
                          {cand.stage.replace("_", " ")}
                        </Badge>
                        {cand.status === "CONFIRMED" && (
                          <Badge variant="brand" className="text-[10px] bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-bold uppercase">
                            Confirmed Permanent
                          </Badge>
                        )}
                        {cand.status === "EXTENDED" && (
                          <Badge variant="brand" className="text-[10px] bg-amber-500/15 border-amber-500/30 text-amber-400 font-bold uppercase">
                            Extended 30 Days
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground block">
                        {designation} · {department}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground block">OKR Score</span>
                      <strong className="text-sm font-bold text-cyan-400">{cand.okrScore}%</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground block">Punctuality</span>
                      <strong className="text-sm font-bold text-emerald-400">{cand.attendancePunctuality}%</strong>
                    </div>
                  </div>
                </div>

                {/* Performance & Recommendation Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-card/70 border border-border/60 space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-cyan-400" />
                      Probation Timeline
                    </span>
                    <span className="text-foreground block font-mono">
                      Joined: {cand.joiningDate}
                    </span>
                    <span className="text-muted-foreground block">
                      Day {cand.daysCompleted} of 90 (End: {cand.probationEndDate})
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-card/70 border border-border/60 space-y-1 md:col-span-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Award className="h-3 w-3 text-purple-400" />
                      Lead Assessment & Recommendation
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-bold ${
                          cand.managerRecommendation === "CONFIRM"
                            ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                            : "border-amber-500/30 text-amber-400 bg-amber-500/10"
                        }`}
                      >
                        {cand.managerRecommendation === "CONFIRM" ? "Recommend Confirmation" : "Under Review"}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">by {cand.managerName}</span>
                    </div>
                    <p className="text-muted-foreground pt-0.5">&quot;{cand.managerNotes}&quot;</p>
                  </div>
                </div>

                {/* HR Action Buttons */}
                {isPending && (
                  <div className="pt-2 border-t border-border/60 flex items-center justify-end gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExtend(cand.id)}
                      className="text-xs font-semibold text-amber-400 hover:bg-amber-500/10 border-border h-9 px-4 gap-1.5"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      <span>Extend 30 Days</span>
                    </Button>

                    <Button
                      variant="brand"
                      size="sm"
                      onClick={() => handleConfirm(cand.id)}
                      className="text-xs font-bold bg-gradient-to-r from-purple-500 via-indigo-600 to-teal-500 text-white shadow-md hover:opacity-95 h-9 px-5 gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Confirm Permanent Employment</span>
                    </Button>
                  </div>
                )}
              </div>
            </Interactive3DCard>
          );
        })}
      </div>
    </div>
  );
}
