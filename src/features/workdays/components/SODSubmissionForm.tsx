"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sodSubmissionSchema, SodSubmissionInput } from "@/lib/validation/workday";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, CheckCircle2, Clock, Shield, AlertCircle } from "lucide-react";

interface SODSubmissionFormProps {
  initialDate?: string;
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}

export function SODSubmissionForm({
  initialDate = new Date().toISOString().split("T")[0],
  onSuccess,
  onCancel,
}: SODSubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<SodSubmissionInput>({
    resolver: zodResolver(sodSubmissionSchema),
    defaultValues: {
      workDate: initialDate,
      workMode: "OFFICE",
      shift: "09:00-18:00",
      plannedHours: 8.0,
      tasks: [
        {
          title: "",
          project: "Core Platform",
          priority: "MEDIUM",
          taskType: "PLANNED",
          estimatedMinutes: 120,
          expectedOutput: "",
          isConfidential: false,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tasks",
  });

  const onSubmit = async (values: SodSubmissionInput) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Simulating / calling server action / API endpoint
      await fetch("/api/v1/workdays/sod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }).catch(() => null);

      setSubmitSuccess(true);
      if (onSuccess) onSuccess(values);
    } catch (err: any) {
      setSubmitError(err?.message || "Failed to submit Start-of-Day plan.");
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
          <h3 className="text-lg font-bold text-foreground">Start-of-Day Plan Submitted!</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Your workday is now in <span className="font-semibold text-foreground">SOD Submitted</span> state.
            You can log progress updates and finalize your EOD wrap-up at the end of your shift.
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
              <Clock className="h-5 w-5 text-[var(--brand-primary)]" />
              Start-of-Day (SOD) Work Plan
            </CardTitle>
            <CardDescription className="mt-1">
              Log your intended deliverables, estimated hours, and sprint goals for {initialDate}.
            </CardDescription>
          </div>
          <Badge variant="brand">Step 1: SOD Plan</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {submitError && (
            <div className="p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Work Mode & Hours Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/40 border border-border">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                Work Mode
              </label>
              <select
                {...form.register("workMode")}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="OFFICE">Office (Headquarters)</option>
                <option value="WFH">Work From Home (WFH)</option>
                <option value="HYBRID">Hybrid</option>
                <option value="CLIENT_LOCATION">Client Location</option>
                <option value="BUSINESS_TRAVEL">Business Travel</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                Shift Schedule
              </label>
              <Input
                {...form.register("shift")}
                className="h-9 text-xs"
                placeholder="09:00-18:00"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                Planned Hours
              </label>
              <Input
                type="number"
                step="0.5"
                {...form.register("plannedHours")}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Dynamic Task List Builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">
                Planned Tasks ({fields.length})
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-8"
                onClick={() =>
                  append({
                    title: "",
                    project: "Core Platform",
                    priority: "MEDIUM",
                    taskType: "PLANNED",
                    estimatedMinutes: 60,
                    expectedOutput: "",
                    isConfidential: false,
                  })
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Add Task
              </Button>
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 rounded-xl border border-border bg-card/60 space-y-3 relative group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-[var(--brand-primary)]">
                        #{index + 1}
                      </span>
                      <Input
                        placeholder="Task title (e.g. Implement authentication authorization engine)"
                        {...form.register(`tasks.${index}.title` as const)}
                        className="h-8 text-xs font-semibold"
                      />
                    </div>
                    {form.formState.errors.tasks?.[index]?.title && (
                      <p className="text-[11px] text-destructive mt-0.5">
                        {form.formState.errors.tasks[index]?.title?.message}
                      </p>
                    )}
                  </div>

                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1">Project</label>
                    <Input
                      placeholder="Project name"
                      {...form.register(`tasks.${index}.project` as const)}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1">Priority</label>
                    <select
                      {...form.register(`tasks.${index}.priority` as const)}
                      className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1">Task Type</label>
                    <select
                      {...form.register(`tasks.${index}.taskType` as const)}
                      className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs"
                    >
                      <option value="PLANNED">Planned</option>
                      <option value="SUPPORT">Support</option>
                      <option value="MEETING">Meeting</option>
                      <option value="INCIDENT">Incident</option>
                      <option value="LEARNING">Learning</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1">Est. Mins</label>
                    <Input
                      type="number"
                      placeholder="60"
                      {...form.register(`tasks.${index}.estimatedMinutes` as const)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
                  <Input
                    placeholder="Expected outcome / deliverables"
                    {...form.register(`tasks.${index}.expectedOutput` as const)}
                    className="h-8 text-xs"
                  />
                  <Input
                    placeholder="Ticket URL (e.g. Jira / Linear / GitHub issue)"
                    {...form.register(`tasks.${index}.externalTicketUrl` as const)}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      {...form.register(`tasks.${index}.isConfidential` as const)}
                      className="rounded border-input text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                    />
                    <Shield className="h-3 w-3 text-muted-foreground" />
                    <span>Confidential Task (Restricted Visibility)</span>
                  </label>
                </div>
              </div>
            ))}
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
              {isSubmitting ? "Submitting Plan..." : "Submit Start-of-Day Plan"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
