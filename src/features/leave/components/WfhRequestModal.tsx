"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { wfhRequestCreateSchema, WfhRequestCreateInput } from "@/lib/validation/leave";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { useCurrentUser } from "@/components/layout/UserContext";
import { WorkpulseApi } from "@/lib/api/api-client";
import {
  Laptop,
  CheckCircle2,
  AlertCircle,
  X,
  Zap,
} from "lucide-react";

interface WfhRequestModalProps {
  onClose: () => void;
  onSuccess?: (data: any) => void;
  monthlySelfMarkUsed?: number;
  monthlyThreshold?: number;
}

export function WfhRequestModal({
  onClose,
  onSuccess,
  monthlySelfMarkUsed = 1,
  monthlyThreshold = 2,
}: WfhRequestModalProps) {
  const user = useCurrentUser();
  const { addWfhRequest, allEmployees } = useWorkpulseSharedStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const currentEmp = allEmployees.find(
    (e) =>
      e.email.toLowerCase() === user.userEmail.toLowerCase() ||
      e.name.toLowerCase() === user.userName.toLowerCase()
  ) || allEmployees.find(e => e.id === "emp-sarah") || allEmployees[0];

  const form = useForm<WfhRequestCreateInput>({
    resolver: zodResolver(wfhRequestCreateSchema),
    defaultValues: {
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      isSelfMarked: monthlySelfMarkUsed < monthlyThreshold,
      reason: "",
      availabilityHours: "10:00-19:00",
      contactMethod: "Slack & Google Meet",
      plannedDeliverables: "",
    },
  });

  const isSelfMarked = form.watch("isSelfMarked");

  const onSubmit = async (values: WfhRequestCreateInput) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const reqId = `wfh-req-v2-${Date.now()}`;

      // 1. Instant optimistic local store update so parent renders in <1ms
      addWfhRequest({
        id: reqId,
        employeeId: currentEmp?.id || user.userEmail || "emp-sarah",
        employeeName: currentEmp?.name || user.userName || "Sarah Dev",
        departmentId: currentEmp?.departmentId || "dept-development",
        departmentName: currentEmp?.departmentName || "Development",
        designation: currentEmp?.designation || "Senior Backend Engineer",
        startDate: values.startDate,
        endDate: values.endDate,
        daysCount: 1.0,
        reason: values.reason,
        availabilityHours: values.availabilityHours,
        contactMethod: values.contactMethod,
        plannedDeliverables: values.plannedDeliverables,
      });

      // 2. Persist to backend REST API & Supabase asynchronously
      WorkpulseApi.leave.applyWfh({
        id: reqId,
        startDate: values.startDate,
        endDate: values.endDate,
        reason: values.reason,
        availabilityHours: values.availabilityHours,
        contactMethod: values.contactMethod,
        plannedDeliverables: values.plannedDeliverables,
      }).catch((err) => {
        console.warn("Backend WFH background sync status:", err);
      });

      setSubmitSuccess(true);
      if (onSuccess) onSuccess(values);
    } catch (err: any) {
      setSubmitError(err?.message || "Failed to submit WFH request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-emerald-500/30 bg-card p-6 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">WFH Request Submitted!</h3>
          <p className="text-xs text-muted-foreground">
            Your request is now in <span className="font-semibold text-foreground">Stage 1: Team Lead Review</span>. Once approved by your Lead, it will automatically move to HR for final Stage-2 authorization.
          </p>
          <Button variant="brand" size="sm" onClick={onClose}>
            Done
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-lg border-border shadow-2xl bg-card max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Laptop className="h-4 w-4 text-[var(--brand-primary)]" />
              Request Work From Home (WFH)
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Two-stage approval: Team Lead Review &rarr; Final HR Authorization
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-xs">
            {submitError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Monthly Self-Mark Threshold Banner */}
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                  Monthly Self-Mark Allowance
                </span>
                <Badge variant="secondary" className="text-[11px] font-bold">
                  {monthlySelfMarkUsed} / {monthlyThreshold} Days Used
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-foreground select-none">
                  <input
                    type="checkbox"
                    disabled={monthlySelfMarkUsed >= monthlyThreshold}
                    {...form.register("isSelfMarked")}
                    className="rounded border-input text-[var(--brand-primary)]"
                  />
                  <span>Same-day Instant Self-Mark (No manager approval needed)</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Start Date</label>
                <Input type="date" {...form.register("startDate")} className="h-8 text-xs" />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">End Date</label>
                <Input type="date" {...form.register("endDate")} className="h-8 text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">
                  Availability Hours
                </label>
                <Input {...form.register("availabilityHours")} className="h-8 text-xs" />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">
                  Contact Method
                </label>
                <Input {...form.register("contactMethod")} className="h-8 text-xs" />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Reason for WFH *</label>
              <textarea
                rows={2}
                placeholder="Reason for working remotely..."
                {...form.register("reason")}
                className="w-full p-2 rounded-md border border-input bg-background text-xs"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Planned Deliverables *</label>
              <textarea
                rows={2}
                placeholder="Key deliverables and tasks targeted for this remote work period..."
                {...form.register("plannedDeliverables")}
                className="w-full p-2 rounded-md border border-input bg-background text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="brand" size="sm" disabled={isSubmitting}>
                {isSubmitting
                  ? "Submitting..."
                  : isSelfMarked
                  ? "Confirm Instant WFH"
                  : "Submit WFH Request"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
