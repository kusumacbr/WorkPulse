"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PerformanceReviewRecord } from "@/server/services/review-service";
import {
  FileText,
  Star,
  Send,
  X,
  Award,
  Link2,
} from "lucide-react";

interface SelfAssessmentFormModalProps {
  onClose: () => void;
  onSubmitAssessment: (assessment: Partial<PerformanceReviewRecord>) => void;
}

const COMPETENCY_DEFINITIONS = [
  {
    key: "quality" as const,
    label: "Quality & Technical Craftsmanship",
    desc: "Robust architecture, unit test coverage, zero regressions, and clean maintainable code.",
  },
  {
    key: "timeliness" as const,
    label: "Execution Speed & Delivery Timeliness",
    desc: "Hitting sprint OKR milestones, timely PR submissions, and rapid blocker escalation.",
  },
  {
    key: "communication" as const,
    label: "Communication & Transparency",
    desc: "Clear morning SOD deliverables, prompt Slack/team updates, and thorough documentation.",
  },
  {
    key: "collaboration" as const,
    label: "Team Collaboration & Peer Code Reviews",
    desc: "Constructive PR reviews, mentoring peers, and unblocking teammates promptly.",
  },
  {
    key: "initiative" as const,
    label: "Technical Initiative & Leadership",
    desc: "Proactive refactoring, proposing architectural improvements, and driving excellence.",
  },
];

export function SelfAssessmentFormModal({
  onClose,
  onSubmitAssessment,
}: SelfAssessmentFormModalProps) {
  const [period] = useState("This Week (Aug 17 – Aug 23, 2026)");
  const [summary, setSummary] = useState(
    "Implemented core employee workflow state machines, interactive OKR weight budgeting, and team lead SOD/EOD inspector."
  );
  const [achievements, setAchievements] = useState(
    "Shipped 100% test coverage across 17 test suites (85 unit tests), configured high-visibility progress sliders, and integrated HR Stage-2 leave workflows."
  );
  const [missedCommitments, setMissedCommitments] = useState(
    "None. All planned weekly deliverables completed on schedule."
  );
  const [growthGoals, setGrowthGoals] = useState(
    "Lead architectural design for upcoming Google Calendar sync & automated webhook integrations."
  );
  const [evidenceUrl, setEvidenceUrl] = useState(
    "https://github.com/xorstack/workpulse/pull/42"
  );

  const [ratings, setRatings] = useState({
    quality: 5,
    timeliness: 4,
    communication: 5,
    collaboration: 5,
    initiative: 4,
  });

  const handleRatingChange = (key: keyof typeof ratings, val: number) => {
    setRatings((prev) => ({ ...prev, [key]: val }));
  };

  // Calculate live self score (weighted out of 100)
  const averageRating =
    (ratings.quality +
      ratings.timeliness +
      ratings.communication +
      ratings.collaboration +
      ratings.initiative) /
    5;
  const calculatedSelfScore = Math.round((averageRating / 5) * 100 * 10) / 10;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitAssessment({
      selfSummary: summary,
      selfAchievements: achievements,
      selfMissedCommitments: missedCommitments,
      selfRatings: ratings,
      calculatedScore: calculatedSelfScore,
      finalScore: calculatedSelfScore,
      selfSubmittedAt: new Date().toISOString(),
      status: "SUBMITTED",
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <Interactive3DCard className="w-full max-w-3xl border border-purple-500/40 bg-gradient-to-b from-[#0f172a] to-[#0b0f19] shadow-2xl p-4 sm:p-6 md:p-8 space-y-6 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="font-bold text-[10px] uppercase bg-purple-500/15 border-purple-500/30 text-purple-300">
                <Award className="h-3 w-3 mr-1 text-purple-400" />
                Employee Self-Assessment
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">{period}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-foreground">
              Submit Weekly Performance Self-Review
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg border border-border/80 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Live Score Preview Tile */}
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">
              Calculated Self-Score Preview
            </span>
            <span className="text-xs text-muted-foreground">
              Based on 5 core competency ratings (Average: {averageRating.toFixed(1)} / 5.0)
            </span>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-purple-300 font-mono">
              {calculatedSelfScore} <span className="text-xs text-muted-foreground">/ 100</span>
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: 5 Core Competency Ratings */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              1. Core Competency Self-Ratings (1 to 5 Stars)
            </h4>

            <div className="space-y-2.5">
              {COMPETENCY_DEFINITIONS.map((comp) => {
                const currentRating = ratings[comp.key];

                return (
                  <div
                    key={comp.key}
                    className="p-3.5 rounded-xl border border-border/70 bg-card/60 space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-xs text-foreground block">
                          {comp.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground">{comp.desc}</span>
                      </div>

                      {/* 5-Star Rating Buttons */}
                      <div className="flex items-center gap-1 shrink-0 bg-muted/60 p-1 rounded-lg border border-border/60">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingChange(comp.key, star)}
                            className={`px-2 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${
                              currentRating >= star
                                ? "text-amber-300 bg-amber-500/20 shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <Star
                              className={`h-3 w-3 ${
                                currentRating >= star ? "fill-amber-400 text-amber-400" : ""
                              }`}
                            />
                            <span>{star}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Qualitative Reflections */}
          <div className="space-y-4 text-xs">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-cyan-400" />
              2. Qualitative Accomplishments & Reflections
            </h4>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground block">
                Sprint Summary & OKR Impact
              </label>
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-input bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-purple-400"
                placeholder="High-level overview of your sprint achievements..."
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground block">
                Key Accomplishments & Concrete Artifacts
              </label>
              <textarea
                rows={2}
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-input bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-purple-400"
                placeholder="List major code deliverables, architecture docs, or PRs..."
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground block">
                  Impediments / Missed Commitments
                </label>
                <Input
                  value={missedCommitments}
                  onChange={(e) => setMissedCommitments(e.target.value)}
                  placeholder="Any blockers or slipped items?"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground block flex items-center gap-1">
                  <Link2 className="h-3 w-3 text-cyan-400" />
                  Evidence / PR / Demo Link
                </label>
                <Input
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="https://github.com/.../pull/12"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground block">
                Next Sprint Growth Focus & Support Needed from Lead (Alex Lead)
              </label>
              <Input
                value={growthGoals}
                onChange={(e) => setGrowthGoals(e.target.value)}
                placeholder="What technical area will you focus on next sprint?"
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-border/60 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="w-full sm:w-auto text-xs h-9 justify-center"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="brand"
              size="lg"
              className="w-full sm:w-auto text-xs font-extrabold bg-gradient-to-r from-purple-500 via-indigo-600 to-teal-500 text-white shadow-[0_4px_20px_rgba(168,85,247,0.25)] h-10 px-6 gap-2 justify-center"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Submit Self-Assessment to Lead</span>
            </Button>
          </div>
        </form>
      </Interactive3DCard>
    </div>
  );
}
