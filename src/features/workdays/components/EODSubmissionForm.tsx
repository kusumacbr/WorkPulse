"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eodSubmissionSchema, EodSubmissionInput } from "@/lib/validation/workday";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { WorkdayRecord } from "@/server/services/workday-service";
import {
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
} from "lucide-react";

interface EODSubmissionFormProps {
  workday: WorkdayRecord;
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}

export function EODSubmissionForm({ workday, onSuccess, onCancel }: EODSubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<EodSubmissionInput>({
    resolver: zodResolver(eodSubmissionSchema),
    defaultValues: {
      workdayId: workday.id,
      tasks: workday.dailyTasks.map((t) => ({
        id: t.id,
        title: t.title,
        status: (t.status || "IN_PROGRESS") as any,
        completionPercentage: t.completionPercentage || 0,
        workCompleted: t.workCompleted || "",
        actualMinutes: t.actualMinutes || t.estimatedMinutes || 60,
        remainingWork: t.remainingWork || "",
        delayReason: t.delayReason || "",
        blockerReference: t.blockerReference || "",
        evidenceUrl: t.evidenceUrl || "",
        nextAction: t.nextAction || "",
      })),
      dailySummary: {
        achievements: workday.achievements || "",
        issues: workday.issues || "",
        supportNeeded: workday.supportNeeded || "",
        nextDayFocus: workday.nextDayFocus || "",
      },
    },
  });

  const onSubmit = async (values: EodSubmissionInput) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Simulating / calling server action / API endpoint
      await fetch("/api/v1/workdays/eod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }).catch(() => null);

      setSubmitSuccess(true);
      if (onSuccess) onSuccess(values);
    } catch (err: any) {
      setSubmitError(err?.message || "Failed to submit End-of-Day results.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="p-8 text-center flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">End-of-Day Wrap-Up Submitted!</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Your workday record is now <span className="font-semibold text-foreground">EOD Submitted</span> and ready
            for manager review.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-[var(--brand-primary)]" />
              End-of-Day (EOD) Results & Summary
            </CardTitle>
            <CardDescription className="mt-1">
              Finalize task outcomes, actual time spent, and daily reflection for {workday.workDate}.
            </CardDescription>
          </div>
          <Badge variant="brand">Step 2: EOD Submission</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {submitError && (
            <div className="p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Task Status & Outcome Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Task Outcomes & Deliverables</h4>

            {workday.dailyTasks.map((task, index) => {
              const currentStatus = form.watch(`tasks.${index}.status`);

              return (
                <div
                  key={task.id}
                  className="p-4 rounded-xl border border-border bg-card/60 space-y-3.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--brand-primary)]">
                        #{index + 1}
                      </span>
                      <span className="text-sm font-semibold text-foreground">{task.title}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {task.project}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        {...form.register(`tasks.${index}.status` as const, {
                          onChange: (e) => {
                            if (e.target.value === "COMPLETED") {
                              form.setValue(`tasks.${index}.completionPercentage`, 100);
                            }
                          },
                        })}
                        className="h-8 px-2.5 rounded-md border border-input bg-background text-xs font-semibold"
                      >
                        <option value="COMPLETED">Completed (100%)</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="PARTIALLY_COMPLETED">Partially Completed</option>
                        <option value="BLOCKED">Blocked</option>
                        <option value="CARRIED_FORWARD">Carried Forward</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] text-muted-foreground block mb-1">
                        Completion % {currentStatus === "COMPLETED" && "(Must be 100%)"}
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        {...form.register(`tasks.${index}.completionPercentage` as const)}
                        className="h-8 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-muted-foreground block mb-1">
                        Actual Time Spent (Mins)
                      </label>
                      <Input
                        type="number"
                        {...form.register(`tasks.${index}.actualMinutes` as const)}
                        className="h-8 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-muted-foreground block mb-1">
                        Evidence / PR / Artifact Link
                      </label>
                      <Input
                        placeholder="https://github.com/.../pull/12"
                        {...form.register(`tasks.${index}.evidenceUrl` as const)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1">
                      Work Completed Summary
                    </label>
                    <Input
                      placeholder="Summary of deliverables accomplished for this item"
                      {...form.register(`tasks.${index}.workCompleted` as const)}
                      className="h-8 text-xs"
                    />
                  </div>

                  {/* Conditional Fields based on Status */}
                  {currentStatus === "CANCELLED" && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                      <span className="font-semibold text-amber-700 dark:text-amber-300 block">
                        Mandatory Reason for Cancellation
                      </span>
                      <Input
                        placeholder="Why was this task cancelled?"
                        {...form.register(`tasks.${index}.delayReason` as const)}
                        className="h-8 text-xs bg-background"
                      />
                    </div>
                  )}

                  {currentStatus === "BLOCKED" && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs space-y-1">
                      <span className="font-semibold text-destructive block">
                        Blocker Details & Reference
                      </span>
                      <Input
                        placeholder="Describe the blocker (e.g. Waiting on API credentials from DevOps)"
                        {...form.register(`tasks.${index}.blockerReference` as const)}
                        className="h-8 text-xs bg-background"
                      />
                    </div>
                  )}

                  {currentStatus === "CARRIED_FORWARD" && (
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs space-y-1">
                      <span className="font-semibold text-blue-700 dark:text-blue-300 block">
                        Next Action for Tomorrow's Workday
                      </span>
                      <Input
                        placeholder="Action planned for the next shift"
                        {...form.register(`tasks.${index}.nextAction` as const)}
                        className="h-8 text-xs bg-background"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Daily Summary Section */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground">Daily Reflection & Summary</h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Key Achievements & Highlights *
                </label>
                <textarea
                  rows={2}
                  placeholder="Summarize key milestones achieved during today's work session..."
                  {...form.register("dailySummary.achievements")}
                  className="w-full p-2.5 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
                {form.formState.errors.dailySummary?.achievements && (
                  <p className="text-[11px] text-destructive mt-0.5">
                    {form.formState.errors.dailySummary.achievements.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">
                    Issues / Obstacles
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Any technical or operational hurdles..."
                    {...form.register("dailySummary.issues")}
                    className="w-full p-2.5 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">
                    Support Needed
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Assistance needed from manager or team..."
                    {...form.register("dailySummary.supportNeeded")}
                    className="w-full p-2.5 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">
                    Next-Day Focus
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Priority items for next shift..."
                    {...form.register("dailySummary.nextDayFocus")}
                    className="w-full p-2.5 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            {onCancel && (
              <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="brand"
              size="default"
              disabled={isSubmitting}
              className="px-6"
            >
              {isSubmitting ? "Submitting EOD..." : "Submit End-of-Day Wrap-Up"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
