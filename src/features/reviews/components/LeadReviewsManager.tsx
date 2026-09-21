"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import {
  Star,
  Award,
  MessageSquare,
  Calendar,
  CheckCircle2,
  Send,
  Users,
  Clock,
  UserCheck,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export interface TeamEvaluation {
  id: string;
  name: string;
  role: string;
  avatar: string;
  avatarBg: string;
  cardBorder: string;
  score: number;
  quality: number;
  timeliness: number;
  communication: number;
  teamwork: number;
  initiative: number;
  leadNotes: string;
  status: "EVALUATED" | "PENDING_REVIEW";
}

const DEFAULT_TEAM_EVALUATIONS: TeamEvaluation[] = [];

type LeadReviewTab =
  | "TEAM_EVALUATIONS"
  | "ONE_ON_ONE"
  | "PROBATION"
  | "GIVE_FEEDBACK"
  | "DIRECTOR_REVIEW";

export function LeadReviewsManager() {
  const [activeTab, setActiveTab] = useState<LeadReviewTab>("TEAM_EVALUATIONS");
  const [evaluations, setEvaluations] = useState<TeamEvaluation[]>(DEFAULT_TEAM_EVALUATIONS);

  // Give feedback state with the 4 sections
  const [selectedRecipient, setSelectedRecipient] = useState("Sarah Dev");
  const [qualityScore, setQualityScore] = useState<number>(5.0);
  const [timelinessScore, setTimelinessScore] = useState<number>(4.8);
  const [communicationScore, setCommunicationScore] = useState<number>(4.7);
  const [teamworkScore, setTeamworkScore] = useState<number>(4.9);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [actionItem, setActionItem] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Probation recommendations state
  const [probationRecs, setProbationRecs] = useState<Record<string, string>>({
    "emp-arjun": "CONFIRM",
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSelectRecipient = (name: string) => {
    setSelectedRecipient(name);
    const existing = evaluations.find((e) => e.name === name);
    if (existing) {
      setQualityScore(existing.quality);
      setTimelinessScore(existing.timeliness);
      setCommunicationScore(existing.communication);
      setTeamworkScore(existing.teamwork);
      setFeedbackNote(existing.leadNotes || "");
    }
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackNote.trim()) return;

    const calculatedScore = Math.round(
      ((qualityScore + timelinessScore + communicationScore + teamworkScore) / 20) * 100
    );

    const updated = evaluations.map((ev) => {
      if (ev.name !== selectedRecipient) return ev;
      return {
        ...ev,
        quality: qualityScore,
        timeliness: timelinessScore,
        communication: communicationScore,
        teamwork: teamworkScore,
        score: calculatedScore,
        leadNotes: feedbackNote.trim(),
        status: "EVALUATED" as const,
      };
    });

    setEvaluations(updated);

    // Persist feedback to Supabase workdays/feedbacks
    if (typeof window !== "undefined") {
      fetch("/api/v1/supabase/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert",
          table: "feedbacks",
          record: {
            id: `eval-${Date.now()}`,
            employee_name: selectedRecipient,
            feedback_note: feedbackNote.trim(),
            action_item: actionItem.trim(),
            rating: Math.round(calculatedScore / 20),
            created_at: new Date().toISOString(),
          },
        }),
      }).catch(() => {});
    }

    setFeedbackNote("");
    setActionItem("");
    setActiveTab("TEAM_EVALUATIONS");
    showToast(`✓ Comprehensive 4-Section Feedback & Score (${calculatedScore}/100) saved for ${selectedRecipient}!`);
  };

  const handleSetProbationDecision = (empId: string, name: string, decision: string) => {
    setProbationRecs((prev) => ({ ...prev, [empId]: decision }));
    showToast(`✓ Decision for ${name} recorded as "${decision}" and forwarded to HR!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* 1. Glanceable Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Team Average Score</span>
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">90.0 / 100</p>
          <span className="text-[11px] text-emerald-400 font-semibold">Top Performing Team</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Reviews Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">4 / 4 Complete</p>
          <span className="text-[11px] text-muted-foreground">All direct reports rated</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Upcoming 1-on-1</span>
            <Clock className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-indigo-400">Today</p>
          <span className="text-[11px] text-muted-foreground">03:30 PM with Sarah Dev</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Director Evaluation</span>
            <Award className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-400">95 / 100</p>
          <span className="text-[11px] text-muted-foreground">From David Director</span>
        </div>
      </div>

      {/* 2. Differentiated Segregation Tabs */}
      <Interactive3DCard className="p-3 border border-border/80 bg-card/70">
        <div className="flex items-center p-1 rounded-xl bg-background/50 border border-border/60 overflow-x-auto gap-1 text-xs font-semibold">
          {/* TAB 1: Team Evaluations */}
          <button
            type="button"
            onClick={() => setActiveTab("TEAM_EVALUATIONS")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === "TEAM_EVALUATIONS"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Team Evaluations ({evaluations.length})</span>
          </button>

          {/* TAB 2: 1-on-1 Meetings */}
          <button
            type="button"
            onClick={() => setActiveTab("ONE_ON_ONE")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === "ONE_ON_ONE"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>1-on-1 Meetings</span>
          </button>

          {/* TAB 3: Probation Reviews */}
          <button
            type="button"
            onClick={() => setActiveTab("PROBATION")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === "PROBATION"
                ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Probation Reviews</span>
          </button>

          {/* TAB 4: Give Feedback */}
          <button
            type="button"
            onClick={() => setActiveTab("GIVE_FEEDBACK")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === "GIVE_FEEDBACK"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-sm"
                : "text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Give Feedback</span>
          </button>

          {/* TAB 5: Director Feedback */}
          <button
            type="button"
            onClick={() => setActiveTab("DIRECTOR_REVIEW")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === "DIRECTOR_REVIEW"
                ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>Director Feedback</span>
          </button>
        </div>
      </Interactive3DCard>

      {/* 3. Tab Contents */}

      {/* TAB 1: TEAM MEMBER EVALUATIONS */}
      {activeTab === "TEAM_EVALUATIONS" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evaluations.length === 0 ? (
              <div className="col-span-full p-8 text-center rounded-2xl border border-dashed border-border bg-card/40 text-muted-foreground space-y-2">
                <p className="text-sm font-semibold">No team evaluations submitted yet</p>
                <p className="text-xs">Evaluations will appear here once performance reviews are conducted.</p>
              </div>
            ) : (
              evaluations.map((member) => (
              <div
                key={member.id}
                className={`p-5 rounded-2xl border bg-card space-y-3.5 transition-all shadow-sm ${member.cardBorder}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full ${member.avatarBg} flex items-center justify-center font-bold text-xs shrink-0`}>
                      {member.avatar}
                    </div>
                    <div>
                      <strong className="text-sm font-bold text-foreground block">{member.name}</strong>
                      <span className="text-xs text-muted-foreground">{member.role}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-purple-300 font-mono">{member.score}</span>
                    <span className="text-[11px] text-muted-foreground font-semibold"> / 100</span>
                  </div>
                </div>

                {/* 4 Themed Competencies */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between">
                    <span className="text-cyan-300 font-medium">Quality:</span>
                    <strong className="text-cyan-200 font-bold">{member.quality.toFixed(1)} ⭐</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                    <span className="text-amber-300 font-medium">Timeliness:</span>
                    <strong className="text-amber-200 font-bold">{member.timeliness.toFixed(1)} ⭐</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                    <span className="text-emerald-300 font-medium">Communication:</span>
                    <strong className="text-emerald-200 font-bold">{member.communication.toFixed(1)} ⭐</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
                    <span className="text-purple-300 font-medium">Teamwork:</span>
                    <strong className="text-purple-200 font-bold">{member.teamwork.toFixed(1)} ⭐</strong>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">
                  &quot;{member.leadNotes}&quot;
                </p>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Quarterly Review Approved</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      handleSelectRecipient(member.name);
                      setActiveTab("GIVE_FEEDBACK");
                    }}
                    className="text-purple-400 hover:text-purple-300 font-bold text-xs flex items-center gap-1 hover:underline"
                  >
                    <span>Give Feedback →</span>
                  </button>
                </div>
              </div>
            )))}
          </div>
        </div>
      )}

      {/* TAB 2: 1-ON-1 MEETINGS */}
      {activeTab === "ONE_ON_ONE" && (
        <div className="space-y-3">
          {[
            {
              member: "Sarah Dev",
              role: "Senior Backend Engineer",
              avatarBg: "bg-gradient-to-tr from-purple-500 to-pink-500 text-white",
              time: "Today at 03:30 PM",
              topic: "Weekly Architecture Progress & Senior Track Milestone",
              status: "Upcoming",
              statusBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
            },
            {
              member: "Rohit Sharma",
              role: "Frontend Engineer",
              avatarBg: "bg-gradient-to-tr from-cyan-500 to-blue-600 text-white",
              time: "Tomorrow at 11:00 AM",
              topic: "Component Library Responsive Tests & Workload Check-in",
              status: "Scheduled",
              statusBg: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
            },
            {
              member: "Priya Patel",
              role: "QA & Test Lead",
              avatarBg: "bg-gradient-to-tr from-amber-500 to-orange-500 text-white",
              time: "Friday at 04:00 PM",
              topic: "Automated Regression Test Matrix Sign-off",
              status: "Scheduled",
              statusBg: "bg-amber-500/15 text-amber-300 border-amber-500/30",
            },
            {
              member: "Arjun Kumar",
              role: "Fullstack Developer",
              avatarBg: "bg-gradient-to-tr from-emerald-500 to-teal-500 text-white",
              time: "Next Monday at 02:00 PM",
              topic: "Probation Progress Review & Backend Mentorship",
              status: "Scheduled",
              statusBg: "bg-teal-500/15 text-teal-300 border-teal-500/30",
            },
          ].map((sync) => (
            <div
              key={sync.member}
              className="p-5 rounded-2xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-emerald-500/40 transition-all"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className={`h-7 w-7 rounded-full ${sync.avatarBg} flex items-center justify-center font-bold text-[10px]`}>
                    {sync.member.slice(0, 2).toUpperCase()}
                  </div>
                  <strong className="text-xs font-bold text-foreground">{sync.member}</strong>
                  <span className="text-[11px] text-muted-foreground">· {sync.role}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${sync.statusBg}`}>
                    {sync.status}
                  </span>
                </div>
                <p className="text-xs text-foreground/80">{sync.topic}</p>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{sync.time}</span>
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => showToast(`1-on-1 notes for ${sync.member} synced.`)}
                  className="text-xs h-8 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                >
                  Meeting Notes
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: PROBATION REVIEWS */}
      {activeTab === "PROBATION" && (
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="p-4 rounded-2xl bg-amber-500/[0.04] border border-amber-500/30 space-y-1">
            <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-amber-400" />
              <span>Direct Reports Probation Reviews</span>
            </h4>
            <p className="text-xs text-muted-foreground">
              Evaluate and record confirmation recommendations for new members completing their 90-day onboarding period.
            </p>
          </div>

          {[
            {
              id: "emp-arjun",
              name: "Arjun Kumar",
              role: "Junior Developer",
              avatarBg: "bg-gradient-to-tr from-emerald-500 to-teal-500 text-white",
              joinDate: "June 01, 2026",
              daysRemaining: 12,
              score: 86,
              summary: "Fast learner on database schemas and TypeScript endpoints. Positive team communication.",
            },
          ].map((emp) => {
            const currentDec = probationRecs[emp.id] || "CONFIRM";

            return (
              <div
                key={emp.id}
                className="p-5 rounded-2xl border border-amber-500/30 bg-card space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full ${emp.avatarBg} flex items-center justify-center font-bold text-xs`}>
                      AK
                    </div>
                    <div>
                      <strong className="text-sm font-bold text-foreground block">{emp.name}</strong>
                      <span className="text-xs text-muted-foreground">Joined {emp.joinDate} · {emp.role}</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    {emp.daysRemaining} Days Remaining
                  </span>
                </div>

                <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border/50">
                  {emp.summary}
                </p>

                <div className="space-y-2 pt-2 border-t border-border">
                  <span className="text-xs font-bold text-foreground block">
                    Team Lead Recommendation:
                  </span>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant={currentDec === "CONFIRM" ? "brand" : "outline"}
                      onClick={() => handleSetProbationDecision(emp.id, emp.name, "CONFIRM")}
                      className={`text-xs h-8 gap-1.5 font-bold ${
                        currentDec === "CONFIRM"
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                          : "text-muted-foreground"
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Confirm as Permanent</span>
                    </Button>

                    <Button
                      size="sm"
                      variant={currentDec === "EXTEND" ? "brand" : "outline"}
                      onClick={() => handleSetProbationDecision(emp.id, emp.name, "EXTEND")}
                      className={`text-xs h-8 gap-1.5 font-bold ${
                        currentDec === "EXTEND"
                          ? "bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                          : "text-muted-foreground"
                      }`}
                    >
                      <span>Extend (30 Days)</span>
                    </Button>

                    <Button
                      size="sm"
                      variant={currentDec === "SUPPORT" ? "brand" : "outline"}
                      onClick={() => handleSetProbationDecision(emp.id, emp.name, "SUPPORT")}
                      className={`text-xs h-8 gap-1.5 font-bold ${
                        currentDec === "SUPPORT"
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                          : "text-muted-foreground"
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Provide Mentorship</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: GIVE TEAM FEEDBACK */}
      {activeTab === "GIVE_FEEDBACK" && (
        <form onSubmit={handleSendFeedback} className="p-6 rounded-2xl border border-purple-500/30 bg-card space-y-4 shadow-sm max-w-2xl mx-auto">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-400" />
              <span>Provide Performance Coaching &amp; Evaluation</span>
            </h4>
            <p className="text-xs text-muted-foreground">
              Rate your team member across all 4 core performance dimensions and write coaching guidance.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Recipient Selector + Live Calculated Score */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-semibold text-foreground">Select Team Member</label>
                <select
                  value={selectedRecipient}
                  onChange={(e) => handleSelectRecipient(e.target.value)}
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs text-foreground focus:outline-none"
                >
                  <option value="Sarah Dev">Sarah Dev (Senior Backend Engineer)</option>
                  <option value="Rohit Sharma">Rohit Sharma (Frontend Engineer)</option>
                  <option value="Priya Patel">Priya Patel (QA Engineer)</option>
                  <option value="Arjun Kumar">Arjun Kumar (Junior Developer)</option>
                </select>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground font-semibold">Overall Score:</span>
                <span className="text-sm font-mono font-bold text-purple-300">
                  {Math.round(((qualityScore + timelinessScore + communicationScore + teamworkScore) / 20) * 100)} / 100
                </span>
              </div>
            </div>

            {/* The 4 Evaluation Sections */}
            <div className="space-y-2 pt-1">
              <label className="font-bold text-foreground text-xs block">
                4 Core Evaluation Dimensions:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Section 1: Quality */}
                <div className="p-3.5 rounded-2xl bg-cyan-500/[0.05] border border-cyan-500/25 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300 text-xs">1. Quality of Work</span>
                    <span className="text-xs font-mono font-bold text-cyan-300">{qualityScore.toFixed(1)}★</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Technical accuracy, code cleanliness &amp; zero regressions.</p>
                  <div className="flex items-center gap-1 pt-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setQualityScore(star)}
                        className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            star <= qualityScore
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section 2: Timeliness */}
                <div className="p-3.5 rounded-2xl bg-amber-500/[0.05] border border-amber-500/25 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 text-xs">2. Timeliness &amp; Delivery</span>
                    <span className="text-xs font-mono font-bold text-amber-300">{timelinessScore.toFixed(1)}★</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Meeting sprint commitments, predictability &amp; velocity.</p>
                  <div className="flex items-center gap-1 pt-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setTimelinessScore(star)}
                        className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            star <= timelinessScore
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section 3: Communication */}
                <div className="p-3.5 rounded-2xl bg-emerald-500/[0.05] border border-emerald-500/25 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300 text-xs">3. Communication</span>
                    <span className="text-xs font-mono font-bold text-emerald-300">{communicationScore.toFixed(1)}★</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Clear morning/evening updates, raising blockers early.</p>
                  <div className="flex items-center gap-1 pt-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setCommunicationScore(star)}
                        className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            star <= communicationScore
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section 4: Teamwork */}
                <div className="p-3.5 rounded-2xl bg-purple-500/[0.05] border border-purple-500/25 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-300 text-xs">4. Teamwork &amp; Collaboration</span>
                    <span className="text-xs font-mono font-bold text-purple-300">{teamworkScore.toFixed(1)}★</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Peer reviews, helpfulness, and positive culture attitude.</p>
                  <div className="flex items-center gap-1 pt-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setTeamworkScore(star)}
                        className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            star <= teamworkScore
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Feedback Note &amp; Praise</label>
              <textarea
                rows={3}
                placeholder="Share specific observations about recent deliverables, quality, or team collaboration..."
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                className="w-full rounded-lg border border-input bg-background p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Action Item / Growth Next Step (Optional)</label>
              <Input
                type="text"
                placeholder="e.g., Lead next week's architecture walkthrough presentation"
                value={actionItem}
                onChange={(e) => setActionItem(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("TEAM_EVALUATIONS")}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" variant="brand" className="text-xs font-bold h-9 bg-purple-600 hover:bg-purple-700 text-white gap-1.5 shadow-sm">
              <Send className="h-3.5 w-3.5" />
              <span>Submit 4-Section Feedback</span>
            </Button>
          </div>
        </form>
      )}

      {/* TAB 5: DIRECTOR FEEDBACK ON LEAD */}
      {activeTab === "DIRECTOR_REVIEW" && (
        <div className="p-6 rounded-2xl border border-rose-500/30 bg-gradient-to-b from-rose-500/[0.04] to-card space-y-4 shadow-sm max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-rose-400" />
                <span>Executive Director Evaluation</span>
              </h4>
              <p className="text-xs text-muted-foreground">
                Quarterly performance evaluation conducted by David Director.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-right">
              <span className="text-base font-black text-rose-300 font-mono">95 / 100</span>
              <span className="text-[10px] text-muted-foreground block font-bold">Grade: Exemplary (A+)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-background/80 border border-border/70 space-y-2 text-xs">
            <p className="text-foreground leading-relaxed italic">
              &quot;Alex has demonstrated exceptional technical leadership this week. The Development Team has sustained high velocity, zero security regressions, and exemplary collaboration. High recommendation for Senior Engineering Lead track.&quot;
            </p>
            <span className="text-[11px] text-rose-300 font-bold block pt-1">
              — David Director, Head of Engineering (Evaluated Aug 20, 2026)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
