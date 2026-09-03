"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import {
  Star,
  Award,
  MessageSquare,
  Calendar,
  CheckCircle2,
  Send,
  UserCheck,
  TrendingUp,
  FileCheck2,
  Clock,
  Sparkles,
} from "lucide-react";

export interface FeedbackNote {
  id: string;
  date: string;
  managerName: string;
  rating: number;
  note: string;
  actionItem?: string;
  sentiment: "EXCELLENT" | "GREAT" | "GOOD";
}

const DEFAULT_FEEDBACK_NOTES: FeedbackNote[] = [
  {
    id: "fb-1",
    date: "Aug 20, 2026",
    managerName: "Alex Lead",
    rating: 5,
    sentiment: "EXCELLENT",
    note: "Outstanding delivery on this week's priorities. The team appreciated your clear walkthrough and thorough preparation. Great momentum heading into next week!",
    actionItem: "Share your project organization tips in our team sync.",
  },
  {
    id: "fb-2",
    date: "Aug 18, 2026",
    managerName: "Alex Lead",
    rating: 5,
    sentiment: "EXCELLENT",
    note: "Proactive communication during yesterday's planning session helped resolve roadblocks early. Clean execution across the board.",
    actionItem: "Follow up with the operations team on milestone sign-offs.",
  },
  {
    id: "fb-3",
    date: "Aug 14, 2026",
    managerName: "Alex Lead",
    rating: 4.8,
    sentiment: "GREAT",
    note: "Solid turnaround on weekly deliverables. Documentation was organized and easy for everyone to follow.",
  },
];

const PAST_REVIEWS = [
  {
    id: "rev-q3",
    cycle: "Q3 2026 Performance Review",
    period: "Jul 2026 – Sep 2026",
    score: 92,
    status: "Approved",
    reviewer: "Alex Lead",
    summary: "Consistent high performance, excellent team collaboration, and proactive problem solving.",
  },
  {
    id: "rev-q2",
    cycle: "Q2 2026 Performance Review",
    period: "Apr 2026 – Jun 2026",
    score: 88,
    status: "Completed",
    reviewer: "Alex Lead",
    summary: "Exceeded all planned project milestones. Strong growth in cross-team coordination.",
  },
  {
    id: "rev-q1",
    cycle: "Q1 2026 Performance Review",
    period: "Jan 2026 – Mar 2026",
    score: 86,
    status: "Completed",
    reviewer: "Alex Lead",
    summary: "Successfully onboarded to core team initiatives and completed initial certification.",
  },
];

const COMPETENCY_RATINGS = [
  { label: "Work Quality & Excellence", score: 5.0, stars: 5, note: "Consistently delivers polished, reliable work" },
  { label: "Timeliness & Reliability", score: 4.8, stars: 5, note: "Completes deliverables on or before deadlines" },
  { label: "Communication & Clarity", score: 4.7, stars: 5, note: "Communicates proactively and listens effectively" },
  { label: "Team Collaboration", score: 4.9, stars: 5, note: "Supportive team player who helps teammates succeed" },
  { label: "Initiative & Ownership", score: 4.8, stars: 5, note: "Takes ownership of outcomes without hesitation" },
];

type ReviewTab = "OVERVIEW" | "FEEDBACK" | "HISTORY" | "SELF_ASSESSMENT";

export function SimpleReviewsManager() {
  const [activeTab, setActiveTab] = useState<ReviewTab>("OVERVIEW");

  // Self-assessment form state
  const [achievements, setAchievements] = useState(
    "Completed all scheduled deliverables on time, supported team members during onboarding, and organized project templates."
  );
  const [improvements, setImprovements] = useState(
    "I want to expand my skills in project management tools and cross-functional leadership."
  );
  const [supportNeeded, setSupportNeeded] = useState(
    "Opportunities to shadow client presentation meetings and participate in leadership workshops."
  );

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSaveSelfAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("✓ Self-assessment submitted for manager review.");
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

      {/* Reviewer & Coach Banner */}
      <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold text-xs shrink-0">
            AL
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <strong className="text-foreground text-xs">Lead Reviewer: Alex Lead</strong>
              <Badge variant="outline" className="text-[9px] text-purple-300 border-purple-500/30">
                Development Team
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Quarterly performance evaluations, coaching feedback, and 1-on-1 syncs are conducted with your Team Lead.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-right shrink-0 self-start sm:self-center">
          <div className="text-left sm:text-right">
            <span className="text-purple-300 font-semibold block text-[11px]">1-on-1 Sync Today</span>
            <span className="text-muted-foreground text-[10px]">03:30 PM · Sprint Review</span>
          </div>
        </div>
      </div>

      {/* 1. Glanceable Top Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Overall Score</span>
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">92 / 100</p>
          <span className="text-[11px] text-emerald-400 font-semibold">Top 5% Team Performance</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Competency Avg</span>
            <Award className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-400">4.9 / 5.0</p>
          <span className="text-[11px] text-muted-foreground">Based on 5 core dimensions</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Manager Feedback</span>
            <MessageSquare className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-cyan-400">{DEFAULT_FEEDBACK_NOTES.length} Notes</p>
          <span className="text-[11px] text-muted-foreground">From Alex Lead</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Next 1-on-1</span>
            <Clock className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">Today</p>
          <span className="text-[11px] text-muted-foreground">03:30 PM with Lead</span>
        </div>
      </div>

      {/* 2. Segregation Navigation Tabs */}
      <Interactive3DCard className="p-4 md:p-5 border border-border/80 bg-card/60 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center p-1 rounded-xl bg-background/50 border border-border/60 overflow-x-auto gap-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("OVERVIEW")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeTab === "OVERVIEW"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              <span>Performance Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("FEEDBACK")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeTab === "FEEDBACK"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-sm"
                  : "text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Manager Feedback ({DEFAULT_FEEDBACK_NOTES.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("HISTORY")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeTab === "HISTORY"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Review History ({PAST_REVIEWS.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("SELF_ASSESSMENT")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeTab === "SELF_ASSESSMENT"
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <FileCheck2 className="h-3.5 w-3.5" />
              <span>Self-Assessment</span>
            </button>
          </div>
        </div>
      </Interactive3DCard>

      {/* 3. Tab Contents */}

      {/* TAB 1: PERFORMANCE OVERVIEW */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Competency Ratings */}
            <div className="p-5 rounded-xl border border-border bg-card space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span>Competency Breakdown</span>
                </h4>
                <Badge variant="brand" className="text-[9px]">Lead Evaluated</Badge>
              </div>

              <div className="space-y-3.5 text-xs">
                {COMPETENCY_RATINGS.map((comp) => (
                  <div key={comp.label} className="space-y-1">
                    <div className="flex items-center justify-between font-semibold text-foreground">
                      <span>{comp.label}</span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-purple-300 font-bold">{comp.score.toFixed(1)}</span>
                        <span className="text-[10px] text-muted-foreground">/ 5.0</span>
                      </div>
                    </div>
                    <div className="progress-track-line">
                      <div
                        className="progress-track-fill-cyan"
                        style={{ width: `${(comp.score / 5.0) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground block">{comp.note}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Growth Areas */}
            <div className="space-y-4">
              <div className="p-5 rounded-xl border border-border bg-card space-y-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <h4 className="text-sm font-bold text-foreground">Key Strengths</h4>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Exceptional Work Quality:</strong> Delivers thorough, dependable results with zero rework.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Proactive Communication:</strong> Keeps manager and teammates aligned on progress and deadlines.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Team Ownership:</strong> Stepped up to assist peers during sprint peak delivery.</span>
                  </li>
                </ul>
              </div>

              <div className="p-5 rounded-xl border border-border bg-card space-y-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-cyan-400" />
                  <h4 className="text-sm font-bold text-foreground">Growth Opportunities</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Continue taking lead roles in cross-departmental presentations. Recommended for senior track advancement in the next cycle.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGER FEEDBACK */}
      {activeTab === "FEEDBACK" && (
        <div className="space-y-3">
          {DEFAULT_FEEDBACK_NOTES.map((fb) => (
            <div
              key={fb.id}
              className="p-5 rounded-xl border border-border/70 bg-card hover:border-primary/40 transition-all space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold text-xs">
                    AL
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-foreground block">{fb.managerName}</strong>
                    <span className="text-[10px] text-muted-foreground">{fb.date}</span>
                  </div>
                </div>

                <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                  {fb.rating} / 5 Stars
                </Badge>
              </div>

              <p className="text-xs text-foreground/90 leading-relaxed pl-10">
                &quot;{fb.note}&quot;
              </p>

              {fb.actionItem && (
                <div className="ml-10 p-2.5 rounded-lg bg-muted/40 border border-border/60 text-xs text-muted-foreground flex items-center gap-2">
                  <span className="font-bold text-foreground shrink-0">Action Item:</span>
                  <span>{fb.actionItem}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: REVIEW HISTORY */}
      {activeTab === "HISTORY" && (
        <div className="space-y-3">
          {PAST_REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-xl border border-border/70 bg-card hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <strong className="text-sm font-bold text-foreground">{rev.cycle}</strong>
                  <Badge variant="brand" className="text-[9px]">
                    {rev.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{rev.period} · Reviewer: {rev.reviewer}</p>
                <p className="text-xs text-foreground/80 pt-1 leading-relaxed">{rev.summary}</p>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border text-center shrink-0 self-end sm:self-center min-w-[90px]">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Final Score</span>
                <span className="text-xl font-black text-purple-300 font-mono">{rev.score} / 100</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: SELF-ASSESSMENT FORM */}
      {activeTab === "SELF_ASSESSMENT" && (
        <form onSubmit={handleSaveSelfAssessment} className="p-6 rounded-xl border border-border bg-card space-y-5 shadow-sm">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-cyan-400" />
              <span>Self-Assessment & Reflections</span>
            </h4>
            <p className="text-xs text-muted-foreground">
              Share your achievements, growth areas, and support requests for your upcoming review sync.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">
                1. What were your key accomplishments during this period?
              </label>
              <textarea
                rows={3}
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                className="w-full rounded-lg border border-input bg-background p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">
                2. What skills or areas would you like to improve next?
              </label>
              <textarea
                rows={3}
                value={improvements}
                onChange={(e) => setImprovements(e.target.value)}
                className="w-full rounded-lg border border-input bg-background p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">
                3. What support or guidance do you need from your manager?
              </label>
              <textarea
                rows={3}
                value={supportNeeded}
                onChange={(e) => setSupportNeeded(e.target.value)}
                className="w-full rounded-lg border border-input bg-background p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="submit" variant="brand" className="text-xs font-bold gap-1.5 h-9">
              <Send className="h-3.5 w-3.5" />
              <span>Save & Submit Assessment</span>
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
