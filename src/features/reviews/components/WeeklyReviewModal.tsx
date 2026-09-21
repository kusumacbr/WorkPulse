"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PerformanceReviewRecord } from "@/server/services/review-service";
import { ReviewCalculator } from "@/lib/scoring/review-calculator";
import {
  FileText,
  Lock,
  X,
} from "lucide-react";

interface WeeklyReviewModalProps {
  review: PerformanceReviewRecord;
  isManager?: boolean;
  onClose: () => void;
  onUpdate?: (updated: PerformanceReviewRecord) => void;
}

export function WeeklyReviewModal({
  review,
  onClose,
  onUpdate,
}: WeeklyReviewModalProps) {
  const [currentReview, setCurrentReview] = useState<PerformanceReviewRecord>(review);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Self review form state
  const selfForm = useForm({
    defaultValues: {
      selfSummary: currentReview.selfSummary || "Completed planned sprint deliverables and unit test coverage.",
      selfAchievements: currentReview.selfAchievements || "Delivered Workday state machine engine and Day/Week/Month heatmap.",
      selfMissedCommitments: currentReview.selfMissedCommitments || "None",
      quality: currentReview.selfRatings?.quality || 4,
      timeliness: currentReview.selfRatings?.timeliness || 5,
      communication: currentReview.selfRatings?.communication || 4,
      collaboration: currentReview.selfRatings?.collaboration || 5,
      initiative: currentReview.selfRatings?.initiative || 4,
    },
  });

  // Manager review form state
  const managerForm = useForm({
    defaultValues: {
      managerFeedback: currentReview.managerFeedback || "Great execution on the core platform sprint deliverables.",
      improvementActions: currentReview.improvementActions || "Continue standardizing unit test fixtures across services.",
      quality: currentReview.managerRatings?.quality || 4,
      timeliness: currentReview.managerRatings?.timeliness || 4,
      communication: currentReview.managerRatings?.communication || 4,
      collaboration: currentReview.managerRatings?.collaboration || 5,
      initiative: currentReview.managerRatings?.initiative || 4,
      finalScore: currentReview.finalScore || 90.0,
      scoreOverrideReason: currentReview.scoreOverrideReason || "",
    },
  });

  // Acknowledgement form state
  const ackForm = useForm({
    defaultValues: {
      employeeComment: currentReview.employeeComment || "Acknowledged and agreed with feedback.",
    },
  });

  // Compute live score preview for manager
  const watchedManagerRatings = {
    quality: Number(managerForm.watch("quality")),
    timeliness: Number(managerForm.watch("timeliness")),
    communication: Number(managerForm.watch("communication")),
    collaboration: Number(managerForm.watch("collaboration")),
    initiative: Number(managerForm.watch("initiative")),
  };

  const calculatedLiveScore = ReviewCalculator.calculate({
    ratings: watchedManagerRatings,
  }).totalCalculatedScore;

  const handleSelfSubmit = async (values: any) => {
    setIsSubmitting(true);
    const updated: PerformanceReviewRecord = {
      ...currentReview,
      status: "SUBMITTED",
      selfSummary: values.selfSummary,
      selfAchievements: values.selfAchievements,
      selfMissedCommitments: values.selfMissedCommitments,
      selfRatings: {
        quality: values.quality,
        timeliness: values.timeliness,
        communication: values.communication,
        collaboration: values.collaboration,
        initiative: values.initiative,
      },
      selfSubmittedAt: new Date().toISOString(),
    };
    setCurrentReview(updated);
    if (onUpdate) onUpdate(updated);
    setIsSubmitting(false);
  };

  const handleManagerApprove = async (values: any) => {
    setIsSubmitting(true);
    const updated: PerformanceReviewRecord = {
      ...currentReview,
      status: "APPROVED",
      managerFeedback: values.managerFeedback,
      improvementActions: values.improvementActions,
      managerRatings: watchedManagerRatings,
      calculatedScore: calculatedLiveScore,
      finalScore: Number(values.finalScore) || calculatedLiveScore,
      scoreOverrideReason: values.scoreOverrideReason || null,
      approvedAt: new Date().toISOString(),
    };
    setCurrentReview(updated);
    if (onUpdate) onUpdate(updated);
    setIsSubmitting(false);
  };

  const handleAcknowledge = async (values: any) => {
    setIsSubmitting(true);
    const updated: PerformanceReviewRecord = {
      ...currentReview,
      status: "LOCKED",
      employeeComment: values.employeeComment,
      acknowledgedAt: new Date().toISOString(),
      lockedAt: new Date().toISOString(),
    };
    setCurrentReview(updated);
    if (onUpdate) onUpdate(updated);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <Card className="w-full max-w-3xl border-border shadow-2xl bg-card max-h-[92vh] overflow-y-auto custom-scrollbar">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-[var(--brand-primary)]" />
              Weekly Performance Review
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Period: {currentReview.periodStart} to {currentReview.periodEnd} · Status:{" "}
              <Badge variant="brand" className="text-[10px] uppercase font-semibold">
                {currentReview.status.replace("_", " ")}
              </Badge>
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* STEP 1: Employee Self-Assessment */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] text-xs flex items-center justify-center font-bold">
                1
              </span>
              Employee Self-Assessment
            </h4>

            {currentReview.status === "DRAFT" || currentReview.status === "CHANGES_REQUESTED" ? (
              <form onSubmit={selfForm.handleSubmit(handleSelfSubmit)} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Weekly Self-Summary *</label>
                  <textarea
                    rows={2}
                    {...selfForm.register("selfSummary")}
                    className="w-full p-2.5 rounded-md border border-input bg-background text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Key Achievements & Highlights *</label>
                  <textarea
                    rows={2}
                    {...selfForm.register("selfAchievements")}
                    className="w-full p-2.5 rounded-md border border-input bg-background text-xs"
                  />
                </div>

                {/* Self Ratings 1-5 */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 rounded-xl bg-muted/30 border border-border">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Quality</label>
                    <select {...selfForm.register("quality")} className="w-full h-8 px-2 rounded border bg-background">
                      <option value="5">5 - Exceptional</option>
                      <option value="4">4 - Exceeds</option>
                      <option value="3">3 - Meets</option>
                      <option value="2">2 - Needs Work</option>
                      <option value="1">1 - Unsatisfactory</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Timeliness</label>
                    <select {...selfForm.register("timeliness")} className="w-full h-8 px-2 rounded border bg-background">
                      <option value="5">5 - Exceptional</option>
                      <option value="4">4 - Exceeds</option>
                      <option value="3">3 - Meets</option>
                      <option value="2">2 - Needs Work</option>
                      <option value="1">1 - Unsatisfactory</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Communication</label>
                    <select {...selfForm.register("communication")} className="w-full h-8 px-2 rounded border bg-background">
                      <option value="5">5 - Exceptional</option>
                      <option value="4">4 - Exceeds</option>
                      <option value="3">3 - Meets</option>
                      <option value="2">2 - Needs Work</option>
                      <option value="1">1 - Unsatisfactory</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Collaboration</label>
                    <select {...selfForm.register("collaboration")} className="w-full h-8 px-2 rounded border bg-background">
                      <option value="5">5 - Exceptional</option>
                      <option value="4">4 - Exceeds</option>
                      <option value="3">3 - Meets</option>
                      <option value="2">2 - Needs Work</option>
                      <option value="1">1 - Unsatisfactory</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Initiative</label>
                    <select {...selfForm.register("initiative")} className="w-full h-8 px-2 rounded border bg-background">
                      <option value="5">5 - Exceptional</option>
                      <option value="4">4 - Exceeds</option>
                      <option value="3">3 - Meets</option>
                      <option value="2">2 - Needs Work</option>
                      <option value="1">1 - Unsatisfactory</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="brand" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting Self-Assessment..." : "Submit Self-Assessment"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
                <p className="text-foreground">
                  <span className="font-semibold">Summary:</span> {currentReview.selfSummary}
                </p>
                <p className="text-foreground">
                  <span className="font-semibold">Achievements:</span> {currentReview.selfAchievements}
                </p>
              </div>
            )}
          </div>

          {/* STEP 2: Manager Feedback & Scoring */}
          {(currentReview.status === "SUBMITTED" ||
            currentReview.status === "UNDER_REVIEW" ||
            currentReview.status === "APPROVED" ||
            currentReview.status === "LOCKED") && (
            <div className="space-y-4 pt-4 border-t border-border">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-600 text-xs flex items-center justify-center font-bold">
                  2
                </span>
                Manager Evaluation & Scoring
              </h4>

              {currentReview.status === "SUBMITTED" || currentReview.status === "UNDER_REVIEW" ? (
                <form onSubmit={managerForm.handleSubmit(handleManagerApprove)} className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold block mb-1">Manager Constructive Feedback *</label>
                    <textarea
                      rows={2}
                      {...managerForm.register("managerFeedback")}
                      className="w-full p-2.5 rounded-md border border-input bg-background text-xs"
                    />
                  </div>

                  {/* Rating Sliders */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 rounded-xl bg-muted/30 border border-border">
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Quality</label>
                      <select {...managerForm.register("quality")} className="w-full h-8 px-2 rounded border bg-background">
                        <option value="5">5 - Exceptional</option>
                        <option value="4">4 - Exceeds</option>
                        <option value="3">3 - Meets</option>
                        <option value="2">2 - Needs Work</option>
                        <option value="1">1 - Unsatisfactory</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Timeliness</label>
                      <select {...managerForm.register("timeliness")} className="w-full h-8 px-2 rounded border bg-background">
                        <option value="5">5 - Exceptional</option>
                        <option value="4">4 - Exceeds</option>
                        <option value="3">3 - Meets</option>
                        <option value="2">2 - Needs Work</option>
                        <option value="1">1 - Unsatisfactory</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Communication</label>
                      <select {...managerForm.register("communication")} className="w-full h-8 px-2 rounded border bg-background">
                        <option value="5">5 - Exceptional</option>
                        <option value="4">4 - Exceeds</option>
                        <option value="3">3 - Meets</option>
                        <option value="2">2 - Needs Work</option>
                        <option value="1">1 - Unsatisfactory</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Collaboration</label>
                      <select {...managerForm.register("collaboration")} className="w-full h-8 px-2 rounded border bg-background">
                        <option value="5">5 - Exceptional</option>
                        <option value="4">4 - Exceeds</option>
                        <option value="3">3 - Meets</option>
                        <option value="2">2 - Needs Work</option>
                        <option value="1">1 - Unsatisfactory</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Initiative</label>
                      <select {...managerForm.register("initiative")} className="w-full h-8 px-2 rounded border bg-background">
                        <option value="5">5 - Exceptional</option>
                        <option value="4">4 - Exceeds</option>
                        <option value="3">3 - Meets</option>
                        <option value="2">2 - Needs Work</option>
                        <option value="1">1 - Unsatisfactory</option>
                      </select>
                    </div>
                  </div>

                  {/* Live Calculated Score Card */}
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-foreground block">
                        Fairness-Weighted Suggested Score
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Includes 40% execution + normalized 60% qualitative dimensions
                      </span>
                    </div>
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {calculatedLiveScore} / 100
                    </span>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="submit" variant="brand" size="sm" disabled={isSubmitting}>
                      {isSubmitting ? "Approving Review..." : "Approve & Score Review"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
                  <p className="text-foreground">
                    <span className="font-semibold">Manager Feedback:</span> {currentReview.managerFeedback}
                  </p>
                  <p className="text-foreground">
                    <span className="font-semibold">Overall Final Score:</span>{" "}
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {currentReview.finalScore}%
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Employee Sign-off & Acknowledgement */}
          {currentReview.status === "APPROVED" && (
            <div className="space-y-4 pt-4 border-t border-border">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-blue-500/20 text-blue-600 text-xs flex items-center justify-center font-bold">
                  3
                </span>
                Employee Sign-off & Acknowledgement
              </h4>

              <form onSubmit={ackForm.handleSubmit(handleAcknowledge)} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Optional Employee Comments</label>
                  <textarea
                    rows={2}
                    {...ackForm.register("employeeComment")}
                    placeholder="Add closing reflections or comments..."
                    className="w-full p-2.5 rounded-md border border-input bg-background text-xs"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="brand" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? "Locking Review..." : "Acknowledge & Lock Review"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {currentReview.status === "LOCKED" && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
              <Lock className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-foreground block">
                  Review Locked & Finalized
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Score snapshot and feedback are immutably archived. Any future amendment will preserve full historical versions.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
