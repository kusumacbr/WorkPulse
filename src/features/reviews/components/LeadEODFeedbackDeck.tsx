"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { AnimatedTabContent } from "@/components/animations/AnimatedTabContent";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import {
  Clock,
  Calendar,
  CalendarDays,
  Award,
  Star,
  MessageSquare,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Users,
  ShieldCheck,
} from "lucide-react";

type FeedbackTimeframe = "day" | "week" | "month";

interface DailyFeedbackItem {
  id: string;
  employeeId?: string;
  employeeName?: string;
  departmentName?: string;
  date: string;
  dayName: string;
  employeeEodSummary: string;
  tasksCompleted: string;
  hoursLogged: number;
  leadFeedbackTime: string;
  leadFeedbackNote: string;
  leadRating: number;
  leadSentiment: "EXCELLENT" | "GREAT" | "ON_TRACK";
  leadActionItem?: string;
  isToday?: boolean;
}

interface WeeklySprintReviewItem {
  id: string;
  sprintName: string;
  period: string;
  leadScore: number;
  status: "APPROVED" | "LOCKED" | "IN_REVIEW";
  leadFeedbackSummary: string;
  leadRatings: {
    quality: number;
    timeliness: number;
    communication: number;
    collaboration: number;
    initiative: number;
  };
  strengths: string;
  improvementFocus: string;
  eodCheckpointsCount: number;
}

interface MonthlyCalibrationItem {
  id: string;
  monthName: string;
  period: string;
  calibratedScore: number;
  eodTotalReviewed: number;
  sprintsCount: number;
  leadPromotionReadiness: string;
  leadQuarterlyNarrative: string;
  coreCompetenciesAverage: number;
  keyMilestonesAcknowledged: string[];
}

const DAILY_FEEDBACKS: DailyFeedbackItem[] = [
  {
    id: "df-today",
    date: "Today (Aug 20, 2026)",
    dayName: "Thursday",
    employeeEodSummary: "Implemented dedicated SOD Carryover section with rollover deck, updated role dashboards, and conducted code review on Stage-2 Leave PRs.",
    tasksCompleted: "2 of 2 Planned Deliverables (100%)",
    hoursLogged: 8.5,
    leadFeedbackTime: "05:45 PM",
    leadFeedbackNote: "Outstanding work on the SOD state machine and role streamlining today, Sara. Code review comments on PR #42 were addressed cleanly and test coverage remained 100%. Great pace heading into tomorrow's sprint review.",
    leadRating: 5,
    leadSentiment: "EXCELLENT",
    leadActionItem: "Prepare demo recording of the SOD rollover flow for tomorrow's team sync.",
    isToday: true,
  },
  {
    id: "df-yesterday",
    date: "Yesterday (Aug 19, 2026)",
    dayName: "Wednesday",
    employeeEodSummary: "Configured brand color tokens across UI layout, built Week/Month switcher layout, and fixed authorization scope isolation.",
    tasksCompleted: "3 of 3 Planned Tasks (100%)",
    hoursLogged: 8.2,
    leadFeedbackTime: "06:10 PM",
    leadFeedbackNote: "The brand extraction and dark mode contrast tokens look super polished. Really appreciate you picking up the authorization test assertions proactively.",
    leadRating: 5,
    leadSentiment: "EXCELLENT",
    leadActionItem: "Align with Rohit on mobile responsive drawer components.",
  },
  {
    id: "df-tue",
    date: "Aug 18, 2026",
    dayName: "Tuesday",
    employeeEodSummary: "Refactored PostgreSQL migration resilience scripts and hardened WebAuthn passkey assertion verification.",
    tasksCompleted: "4 of 4 Planned Tasks (100%)",
    hoursLogged: 8.0,
    leadFeedbackTime: "05:30 PM",
    leadFeedbackNote: "Solid engineering rigor on the database fallback handling. The zero-downtime schema check was a great architectural addition.",
    leadRating: 4.8,
    leadSentiment: "GREAT",
  },
  {
    id: "df-mon",
    date: "Aug 17, 2026",
    dayName: "Monday",
    employeeEodSummary: "Weekly kickoff planning, initial Better Auth role schema design, and unit testing strategy setup.",
    tasksCompleted: "3 of 3 Planned Tasks (100%)",
    hoursLogged: 8.5,
    leadFeedbackTime: "06:00 PM",
    leadFeedbackNote: "Good start to the week. Clear deliverables outlined in your morning SOD with well-defined weights.",
    leadRating: 4.6,
    leadSentiment: "ON_TRACK",
  },
];

const WEEKLY_REVIEWS: WeeklySprintReviewItem[] = [
  {
    id: "wr-sprint-34",
    sprintName: "This Week (Current Cycle)",
    period: "Aug 17 – Aug 23, 2026",
    leadScore: 89.0,
    status: "APPROVED",
    leadFeedbackSummary: "Sara delivered exceptional value on core employee state machines, high-visibility sliders, and role dashboards. Her PR turnaround and collaboration with QA were best in class.",
    leadRatings: {
      quality: 4.8,
      timeliness: 4.7,
      communication: 4.6,
      collaboration: 4.9,
      initiative: 4.8,
    },
    strengths: "Flawless state transition testing, rigorous unit test assertions (85/85 green), and high responsiveness in team standups.",
    improvementFocus: "Continue mentoring junior engineers on state machine pattern design.",
    eodCheckpointsCount: 5,
  },
  {
    id: "wr-sprint-33",
    sprintName: "Sprint 33",
    period: "Aug 10 – Aug 16, 2026",
    leadScore: 94.0,
    status: "LOCKED",
    leadFeedbackSummary: "Completed Phase 0 foundation: Better Auth integration, central authorization engine, and WCAG AAA theme contrast. Outstanding execution.",
    leadRatings: {
      quality: 5.0,
      timeliness: 5.0,
      communication: 4.5,
      collaboration: 4.8,
      initiative: 5.0,
    },
    strengths: "Central authorization engine implementation was delivered ahead of schedule with zero security leakage.",
    improvementFocus: "Document edge-case token expiration flows.",
    eodCheckpointsCount: 5,
  },
  {
    id: "wr-sprint-32",
    sprintName: "Sprint 32",
    period: "Aug 03 – Aug 09, 2026",
    leadScore: 91.5,
    status: "LOCKED",
    leadFeedbackSummary: "Shipped core biometric transaction ingestion and hardware quarantine buffer with HMAC SHA-256 verification.",
    leadRatings: {
      quality: 4.6,
      timeliness: 4.8,
      communication: 4.7,
      collaboration: 4.6,
      initiative: 4.7,
    },
    strengths: "Clean architecture design for hardware sync buffer.",
    improvementFocus: "Add automated retry mechanisms for network timeouts.",
    eodCheckpointsCount: 5,
  },
];

const MONTHLY_CALIBRATIONS: MonthlyCalibrationItem[] = [
  {
    id: "mc-aug-2026",
    monthName: "August 2026 (Active Month)",
    period: "Aug 01 – Aug 31, 2026",
    calibratedScore: 91.5,
    eodTotalReviewed: 20,
    sprintsCount: 4,
    leadPromotionReadiness: "High — Ready for Lead / Staff Engineer Assessment",
    leadQuarterlyNarrative: "Sara has consistently demonstrated top-tier engineering architecture, 100% test discipline, and proactive technical leadership throughout August. Her daily EOD submissions reflect consistent execution with zero missed deadlines. Her collaboration with QA and HR systems has significantly accelerated our Q3 release roadmap.",
    coreCompetenciesAverage: 4.8,
    keyMilestonesAcknowledged: [
      "Built Core Workday Lifecycle Engine with 100% test pass rate",
      "Delivered Biometric Terminal HMAC Integration & Quarantine Buffer",
      "Streamlined Role Dashboards for Employee, Team Lead, HR, and Admin",
      "Designed Interactive OKR Budgeting Engine & High-Visibility Steppers",
    ],
  },
  {
    id: "mc-jul-2026",
    monthName: "July 2026",
    period: "Jul 01 – Jul 31, 2026",
    calibratedScore: 88.0,
    eodTotalReviewed: 22,
    sprintsCount: 4,
    leadPromotionReadiness: "On Track",
    leadQuarterlyNarrative: "Strong technical foundations established across PostgreSQL schema migrations and authorization policies. Demonstrated consistent reliability in daily sprint execution.",
    coreCompetenciesAverage: 4.5,
    keyMilestonesAcknowledged: [
      "Initial Next.js 15 & Better Auth infrastructure setup",
      "Prisma schema design for Attendance, Workdays, and Reviews",
      "Automated CI/CD testing pipeline setup",
    ],
  },
];

export function LeadEODFeedbackDeck() {
  const [timeframe, setTimeframe] = useState<FeedbackTimeframe>("day");
  const [selectedSprint, setSelectedSprint] = useState<WeeklySprintReviewItem>(WEEKLY_REVIEWS[0]!);
  const { feedbacks } = useWorkpulseSharedStore();
  const displayFeedbacks = feedbacks.length > 0 ? feedbacks : DAILY_FEEDBACKS;

  return (
    <div className="space-y-6">
      {/* Team Lead Header Hero Banner */}
      <Interactive3DCard className="p-6 md:p-7 border border-purple-500/30 bg-gradient-to-r from-card/80 via-card/60 to-purple-500/10 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="font-bold text-[10px] uppercase bg-purple-500/15 border-purple-500/30 text-purple-300">
                <Users className="h-3 w-3 mr-1 text-purple-400" />
                Team Lead EOD Feedback & Coaching
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                Evaluator: Alex Lead (Engineering Manager · Platform Team)
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-foreground">
              Manager EOD Feedback & Performance Review
            </h3>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Continuous coaching feedback provided by your designated Team Lead across <strong className="text-foreground">Daily EOD Checkpoints</strong>, <strong className="text-foreground">Weekly Sprint Reviews</strong>, and <strong className="text-foreground">Monthly Calibrations</strong>.
            </p>
          </div>

          {/* Lead Summary Stats Tile */}
          <div className="p-4 rounded-2xl bg-background/50 border border-purple-500/30 backdrop-blur-md space-y-1 shrink-0 text-xs text-right shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
              Lead Calibration Rating
            </span>
            <div className="flex items-center gap-1.5 justify-end">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <span className="text-2xl font-black text-purple-300 font-mono">4.8 / 5.0</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold block">100% EODs Reviewed On-Time</span>
          </div>
        </div>

        {/* Reporting Relationship Badge */}
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-purple-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-purple-400 shrink-0" />
            <span>
              Designated Reporting Manager: <strong className="text-foreground">Alex Lead</strong> (Platform Team) · 1-on-1 Sync scheduled every Thursday
            </span>
          </div>

          <Badge variant="outline" className="text-[10px] border-purple-500/40 text-purple-300 bg-purple-500/10 shrink-0">
            This Week Active
          </Badge>
        </div>
      </Interactive3DCard>

      {/* Timeframe Switcher Bar (Day / Week / Month) */}
      <div className="flex items-center p-1.5 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-xl gap-1 shadow-sm overflow-x-auto">
        <button
          type="button"
          onClick={() => setTimeframe("day")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            timeframe === "day"
              ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>Daily EOD Feedback (Day View)</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-extrabold">
            {displayFeedbacks.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTimeframe("week")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            timeframe === "week"
              ? "bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Weekly Sprint Reviews (Week View)</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-extrabold">
            {WEEKLY_REVIEWS.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTimeframe("month")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            timeframe === "month"
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <CalendarDays className="h-3.5 w-3.5" />
          <span>Monthly Calibrations (Month View)</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-extrabold">
            {MONTHLY_CALIBRATIONS.length}
          </span>
        </button>
      </div>

      {/* Animated Timeframe Content */}
      <AnimatedTabContent tabKey={timeframe}>
        {/* ========================================================== */}
        {/* 1. DAY VIEW: DAILY EOD FEEDBACK FROM TEAM LEAD             */}
        {/* ========================================================== */}
        {timeframe === "day" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-400" />
                Daily EOD Submissions & Team Lead Feedback Notes
              </h4>
              <span className="text-xs text-muted-foreground">Showing last 4 daily checkpoints</span>
            </div>

            <div className="space-y-4">
              {displayFeedbacks.map((df) => (
                <Interactive3DCard
                  key={df.id}
                  className={`p-5 md:p-6 border space-y-4 transition-all ${
                    df.isToday
                      ? "border-purple-500/50 bg-gradient-to-r from-card/90 via-card/70 to-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                      : "border-border/80 bg-card/60 hover:border-purple-500/40"
                  }`}
                >
                  {/* Top Bar: Date, Employee EOD Time & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-foreground">{df.date}</span>
                      <Badge variant="outline" className="text-[10px] uppercase text-cyan-400 border-cyan-500/30 font-mono font-bold">
                        {df.dayName}
                      </Badge>
                      {df.employeeName && (
                        <Badge variant="outline" className="text-[10px] text-purple-300 border-purple-500/40 bg-purple-500/10 font-bold">
                          {df.employeeName}
                        </Badge>
                      )}
                      {df.isToday && (
                        <Badge variant="brand" className="text-[9px] uppercase bg-purple-500/20 text-purple-300 border-purple-500/40 font-extrabold">
                          Today&apos;s Review
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs shrink-0">
                      <span className="text-muted-foreground font-mono">
                        Logged: <strong className="text-foreground">{df.hoursLogged} hrs</strong>
                      </span>
                      <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {df.tasksCompleted}
                      </span>
                    </div>
                  </div>

                  {/* Section A: Employee's EOD Reflection */}
                  <div className="p-3.5 rounded-xl bg-card/40 border border-border/60 space-y-1 text-xs">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Employee EOD Reflection & Accomplishments
                    </span>
                    <p className="text-xs text-foreground/90 leading-relaxed">{df.employeeEodSummary}</p>
                  </div>

                  {/* Section B: Team Lead Alex Lead's Official Feedback & Rating */}
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-2.5 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-[10px]">
                          AL
                        </div>
                        <span className="font-extrabold text-foreground">Alex Lead (Team Lead Feedback)</span>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          · Logged at {df.leadFeedbackTime}
                        </span>
                      </div>

                      {/* Lead Star Rating */}
                      <div className="flex items-center gap-1 bg-purple-500/20 px-2.5 py-1 rounded-lg border border-purple-500/30 shrink-0">
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-black text-purple-200 font-mono">{df.leadRating} / 5.0</span>
                        <span className="text-[10px] text-purple-300 font-bold ml-1 uppercase">
                          ({df.leadSentiment})
                        </span>
                      </div>
                    </div>

                    {/* Feedback Note Content */}
                    <p className="text-xs text-purple-100 font-medium leading-relaxed italic">
                      &quot;{df.leadFeedbackNote}&quot;
                    </p>

                    {/* Actionable Coaching Takeaway */}
                    {df.leadActionItem && (
                      <div className="pt-2 border-t border-purple-500/20 flex items-center gap-2 text-[11px] text-cyan-300">
                        <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        <span>
                          <strong>Lead Next Step: </strong> {df.leadActionItem}
                        </span>
                      </div>
                    )}
                  </div>
                </Interactive3DCard>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* 2. WEEK VIEW: WEEKLY SPRINT REVIEWS & EOD ROLLUP           */}
        {/* ========================================================== */}
        {timeframe === "week" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Sprint Reviews List */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Select Sprint Review Cycle
              </span>

              <div className="space-y-2.5">
                {WEEKLY_REVIEWS.map((review) => {
                  const isSelected = review.id === selectedSprint.id;

                  return (
                    <button
                      key={review.id}
                      type="button"
                      onClick={() => setSelectedSprint(review)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? "border-cyan-500/60 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                          : "border-border/70 bg-card/60 hover:border-cyan-500/30 hover:bg-card"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-foreground">{review.sprintName}</span>
                          <Badge
                            variant="outline"
                            className={`text-[9px] uppercase font-bold ${
                              review.status === "APPROVED"
                                ? "border-emerald-500/40 text-emerald-400"
                                : "border-purple-500/40 text-purple-300"
                            }`}
                          >
                            {review.status}
                          </Badge>
                        </div>
                        <span className="text-[11px] text-muted-foreground font-mono block">
                          {review.period}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-lg font-black text-cyan-400 font-mono">
                          {review.leadScore.toFixed(0)}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">Lead Score</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Selected Sprint Detailed Lead Scorecard */}
            <div className="lg:col-span-2 space-y-4">
              <Interactive3DCard className="p-6 md:p-7 border border-cyan-500/30 space-y-6">
                {/* Sprint Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-foreground">{selectedSprint.sprintName}</h4>
                      <Badge variant="brand" className="text-[10px] bg-cyan-500/15 text-cyan-300 border-cyan-500/30 font-bold uppercase">
                        {selectedSprint.eodCheckpointsCount} Daily EODs Consolidated
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">{selectedSprint.period}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-right shrink-0">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                      Lead Evaluated Score
                    </span>
                    <span className="text-2xl font-black text-cyan-400 font-mono">
                      {selectedSprint.leadScore.toFixed(1)} <span className="text-xs text-muted-foreground">/ 100</span>
                    </span>
                  </div>
                </div>

                {/* Team Lead Feedback Narrative */}
                <div className="p-4 rounded-xl bg-card/60 border border-border/70 space-y-2 text-xs">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-cyan-400" />
                    Alex Lead&apos;s Sprint Synthesis & Feedback
                  </span>
                  <p className="text-muted-foreground leading-relaxed italic">
                    &quot;{selectedSprint.leadFeedbackSummary}&quot;
                  </p>
                </div>

                {/* 5 Core Competency Ratings Breakdown */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    Team Lead Competency Ratings Breakdown
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl border border-border/70 bg-card/40 flex items-center justify-between">
                      <span className="text-muted-foreground">Quality & Technical Rigor:</span>
                      <strong className="text-cyan-400 font-mono font-bold">{selectedSprint.leadRatings.quality} / 5.0</strong>
                    </div>

                    <div className="p-3 rounded-xl border border-border/70 bg-card/40 flex items-center justify-between">
                      <span className="text-muted-foreground">Execution & Timeliness:</span>
                      <strong className="text-cyan-400 font-mono font-bold">{selectedSprint.leadRatings.timeliness} / 5.0</strong>
                    </div>

                    <div className="p-3 rounded-xl border border-border/70 bg-card/40 flex items-center justify-between">
                      <span className="text-muted-foreground">Communication & Transparency:</span>
                      <strong className="text-cyan-400 font-mono font-bold">{selectedSprint.leadRatings.communication} / 5.0</strong>
                    </div>

                    <div className="p-3 rounded-xl border border-border/70 bg-card/40 flex items-center justify-between">
                      <span className="text-muted-foreground">Collaboration & Code Reviews:</span>
                      <strong className="text-cyan-400 font-mono font-bold">{selectedSprint.leadRatings.collaboration} / 5.0</strong>
                    </div>

                    <div className="p-3 rounded-xl border border-border/70 bg-card/40 flex items-center justify-between sm:col-span-2">
                      <span className="text-muted-foreground">Technical Initiative & Leadership:</span>
                      <strong className="text-cyan-400 font-mono font-bold">{selectedSprint.leadRatings.initiative} / 5.0</strong>
                    </div>
                  </div>
                </div>

                {/* Key Strengths & Growth Focus */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-border/60">
                  <div className="space-y-1 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                    <strong className="text-emerald-300 block">⭐ Standout Strengths:</strong>
                    <span className="text-muted-foreground">{selectedSprint.strengths}</span>
                  </div>

                  <div className="space-y-1 p-3 rounded-xl bg-purple-500/10 border border-purple-500/25">
                    <strong className="text-purple-300 block">🎯 Lead Focus for Next Sprint:</strong>
                    <span className="text-muted-foreground">{selectedSprint.improvementFocus}</span>
                  </div>
                </div>
              </Interactive3DCard>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* 3. MONTH VIEW: MONTHLY CALIBRATION & GROWTH SUMMARY        */}
        {/* ========================================================== */}
        {timeframe === "month" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-emerald-400" />
                Monthly Calibration & Trajectory Cycles
              </h4>
              <span className="text-xs text-muted-foreground">Aggregated across all daily EOD checkpoints</span>
            </div>

            <div className="space-y-4">
              {MONTHLY_CALIBRATIONS.map((mc) => (
                <Interactive3DCard
                  key={mc.id}
                  className="p-6 md:p-7 border border-emerald-500/30 bg-gradient-to-r from-card/90 via-card/70 to-emerald-500/5 space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-black text-foreground">{mc.monthName}</h4>
                        <Badge variant="brand" className="text-[10px] bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-bold uppercase">
                          {mc.eodTotalReviewed} Daily Checkpoints Reviewed
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">{mc.period} · {mc.sprintsCount} Sprints</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-500/30 shrink-0">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                          Monthly Calibrated Score
                        </span>
                        <span className="text-2xl font-black text-emerald-400 font-mono">
                          {mc.calibratedScore} <span className="text-xs text-muted-foreground">/ 100</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Narrative from Alex Lead */}
                  <div className="p-4 rounded-xl bg-card/60 border border-border/70 space-y-1.5 text-xs">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-emerald-400" />
                      Team Lead Monthly Narrative & Assessment
                    </span>
                    <p className="text-muted-foreground leading-relaxed italic">
                      &quot;{mc.leadQuarterlyNarrative}&quot;
                    </p>
                  </div>

                  {/* Milestones Acknowledged by Lead */}
                  <div className="space-y-2 text-xs">
                    <span className="font-bold text-foreground block">
                      Key Deliverables Acknowledged by Team Lead:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {mc.keyMilestonesAcknowledged.map((ms, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-card/40 border border-border/60 flex items-center gap-2 text-muted-foreground"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{ms}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Career Readiness */}
                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-cyan-400" />
                      <span className="text-muted-foreground">Lead Promotion Readiness:</span>
                      <strong className="text-foreground">{mc.leadPromotionReadiness}</strong>
                    </div>

                    <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                      Average Rating: {mc.coreCompetenciesAverage} / 5.0 ⭐
                    </Badge>
                  </div>
                </Interactive3DCard>
              ))}
            </div>
          </div>
        )}
      </AnimatedTabContent>
    </div>
  );
}
