"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { weeklyGoalCreateSchema, WeeklyGoalCreateInput } from "@/lib/validation/goals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { WeeklyGoalRecord } from "@/server/services/goal-service";
import {
  Target,
  Plus,
  Scale,
  FileCheck2,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";

const GOAL_TEMPLATES = [
  {
    title: "Implement resilient caching & state persistence",
    category: "Engineering Architecture",
    measurableOutcome: "Zero data loss during hot-reloads with 100% test pass",
    weight: 35,
    priority: "HIGH" as const,
    targetValue: 100,
    targetUnit: "%",
    project: "Core Platform",
    evidenceRequired: true,
    managerApprovalRequired: true,
  },
  {
    title: "Component UI test coverage & responsiveness",
    category: "Frontend Excellence",
    measurableOutcome: "All 12 feature components pass visual regression tests",
    weight: 25,
    priority: "MEDIUM" as const,
    targetValue: 12,
    targetUnit: "Components",
    project: "Frontend & UI",
    evidenceRequired: false,
    managerApprovalRequired: false,
  },
  {
    title: "Security audit & RBAC permission matrices",
    category: "API Security",
    measurableOutcome: "Zero high/critical security alerts on automated scans",
    weight: 20,
    priority: "HIGH" as const,
    targetValue: 0,
    targetUnit: "Vulnerabilities",
    project: "Security Team",
    evidenceRequired: true,
    managerApprovalRequired: true,
  },
];

export function WeeklyGoalsList() {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [goals, setGoals] = useState<WeeklyGoalRecord[]>([
    {
      id: "goal-1",
      employeeId: "emp-sarah",
      title: "Deliver Core Employee Workflow & State Machine (Phase 1)",
      description: "Build robust Workday lifecycle transitions with 100% test coverage and zero regressions.",
      category: "Engineering Architecture",
      measurableOutcome: "Phase 1 test suite passing with full SOD/EOD state machine",
      targetValue: 100,
      targetUnit: "%",
      currentValue: 80,
      weight: 40,
      priority: "HIGH",
      startDate: "2026-08-17",
      endDate: "2026-08-23",
      status: "IN_PROGRESS",
      relatedProject: "Core Platform",
      evidenceRequired: true,
      managerApprovalRequired: true,
      progressPercentage: 80,
      createdAt: new Date().toISOString(),
    },
    {
      id: "goal-2",
      employeeId: "emp-sarah",
      title: "GitHub-style Contribution Heatmap Component",
      description: "Implement interactive Month heatmap view with multi-mode presence indicators.",
      category: "Frontend Excellence",
      measurableOutcome: "Component rendered on employee dashboard with cell click navigation",
      targetValue: 1,
      targetUnit: "Component",
      currentValue: 1,
      weight: 35,
      priority: "MEDIUM",
      startDate: "2026-08-17",
      endDate: "2026-08-23",
      status: "COMPLETED",
      relatedProject: "Frontend & UI",
      evidenceRequired: false,
      managerApprovalRequired: false,
      progressPercentage: 100,
      createdAt: new Date().toISOString(),
    },
    {
      id: "goal-3",
      employeeId: "emp-sarah",
      title: "Unit Testing & Authorization Policy Validation",
      description: "Write unit tests for state machine, 100% completion rule, and goal weights.",
      category: "Quality Assurance",
      measurableOutcome: "Zero lint/type errors and 100% automated test pass",
      targetValue: 10,
      targetUnit: "Test suites",
      currentValue: 6,
      weight: 25,
      priority: "HIGH",
      startDate: "2026-08-17",
      endDate: "2026-08-23",
      status: "IN_PROGRESS",
      relatedProject: "Core Platform",
      evidenceRequired: true,
      managerApprovalRequired: false,
      progressPercentage: 60,
      createdAt: new Date().toISOString(),
    },
  ]);

  const totalWeight = goals
    .filter((g) => g.status !== "CANCELLED")
    .reduce((sum, g) => sum + g.weight, 0);

  const form = useForm<WeeklyGoalCreateInput>({
    resolver: zodResolver(weeklyGoalCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Engineering Architecture",
      measurableOutcome: "",
      targetValue: 100,
      targetUnit: "%",
      weight: Math.max(5, Math.min(100, 100 - (totalWeight % 100 || 0))),
      priority: "MEDIUM",
      startDate: "2026-08-17",
      endDate: "2026-08-23",
      relatedProject: "Core Platform",
      evidenceRequired: false,
      managerApprovalRequired: false,
    },
  });

  const applyTemplate = (tpl: typeof GOAL_TEMPLATES[0]) => {
    form.setValue("title", tpl.title);
    form.setValue("category", tpl.category);
    form.setValue("measurableOutcome", tpl.measurableOutcome);
    form.setValue("weight", tpl.weight);
    form.setValue("priority", tpl.priority);
    form.setValue("targetValue", tpl.targetValue);
    form.setValue("targetUnit", tpl.targetUnit);
    form.setValue("relatedProject", tpl.project);
    form.setValue("evidenceRequired", tpl.evidenceRequired);
    form.setValue("managerApprovalRequired", tpl.managerApprovalRequired);
  };

  const onSubmitGoal = async (values: WeeklyGoalCreateInput) => {
    const newGoal: WeeklyGoalRecord = {
      id: `goal-${Date.now()}`,
      employeeId: "emp-sarah",
      title: values.title,
      description: values.description || null,
      category: values.category,
      measurableOutcome: values.measurableOutcome,
      targetValue: values.targetValue || null,
      targetUnit: values.targetUnit || null,
      currentValue: 0,
      weight: values.weight,
      priority: values.priority,
      startDate: values.startDate,
      endDate: values.endDate,
      status: values.managerApprovalRequired ? "PENDING_APPROVAL" : "IN_PROGRESS",
      relatedProject: values.relatedProject || null,
      evidenceRequired: values.evidenceRequired,
      managerApprovalRequired: values.managerApprovalRequired,
      progressPercentage: 0,
      createdAt: new Date().toISOString(),
    };

    setGoals((prev) => [newGoal, ...prev]);
    form.reset({
      title: "",
      description: "",
      category: "Engineering Architecture",
      measurableOutcome: "",
      targetValue: 100,
      targetUnit: "%",
      weight: 20,
      priority: "MEDIUM",
      startDate: "2026-08-17",
      endDate: "2026-08-23",
      relatedProject: "Core Platform",
      evidenceRequired: false,
      managerApprovalRequired: false,
    });
    setToastMsg(`Weekly goal "${values.title}" created with weight ${values.weight}%! 🎯`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="font-bold">{toastMsg}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1ST SECTION: ADD WEEKLY GOAL FORM (PROMINENT AT TOP)          */}
      {/* ============================================================== */}
      <Interactive3DCard className="p-6 md:p-8 border border-emerald-500/40 bg-gradient-to-br from-card/90 via-card/70 to-emerald-500/10 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/70">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="font-bold text-[10px] uppercase bg-emerald-500/20 border-emerald-500/40 text-emerald-300">
                <Plus className="h-3 w-3 mr-1 text-emerald-400" />
                1. Add Option
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">11-Field Weekly Schema</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-foreground">
              Add New Weekly Goal
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Define measurable outcomes, goal weights (1–100%), delivery dates, and verification flags for this week.
            </p>
          </div>

          {/* Quick Template Fillers */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <span className="text-[11px] text-muted-foreground font-bold mr-1">Templates:</span>
            {GOAL_TEMPLATES.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-background/70 hover:bg-muted border border-border/80 text-foreground transition-all hover:border-emerald-500/40"
              >
                {tpl.category.split(" ")[0]} ({tpl.weight}%)
              </button>
            ))}
          </div>
        </div>

        {/* 11-Field Goal Creation Form */}
        <form onSubmit={form.handleSubmit(onSubmitGoal)} className="space-y-5 text-xs">
          {/* Field 1: Title */}
          <div className="space-y-1.5">
            <label className="font-bold text-foreground block text-xs">
              1. Goal Title *
            </label>
            <Input
              placeholder="e.g. Deliver Phase 1 Workday State Machine & Rollover Pile-Up"
              {...form.register("title")}
              className="h-10 text-xs font-semibold"
            />
            {form.formState.errors.title && (
              <p className="text-[11px] text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          {/* Field 2: Description */}
          <div className="space-y-1.5">
            <label className="font-bold text-foreground block text-xs">
              2. Description & Architectural Context
            </label>
            <textarea
              rows={2}
              placeholder="Detailed technical specifications, requirements, and Team alignment..."
              {...form.register("description")}
              className="w-full p-3 rounded-xl border border-input bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400 leading-relaxed"
            />
          </div>

          {/* Fields 3, 6, 7: Category, Weight %, Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground block text-xs">3. Category *</label>
              <select
                {...form.register("category")}
                className="w-full h-10 px-3 rounded-xl border border-input bg-card text-xs font-semibold text-foreground"
              >
                <option value="Engineering Architecture">Engineering Architecture</option>
                <option value="Frontend Excellence">Frontend Excellence</option>
                <option value="Quality Assurance">Quality Assurance</option>
                <option value="DevOps & CI/CD">DevOps & CI/CD</option>
                <option value="API Security">API Security</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground block text-xs">
                6. Weight % (1-100) *
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                {...form.register("weight")}
                className="h-10 text-xs font-mono font-bold"
              />
              {form.formState.errors.weight && (
                <p className="text-[11px] text-destructive">{form.formState.errors.weight.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground block text-xs">7. Priority *</label>
              <select
                {...form.register("priority")}
                className="w-full h-10 px-3 rounded-xl border border-input bg-card text-xs font-semibold text-foreground"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          {/* Field 4: Measurable Outcome */}
          <div className="space-y-1.5">
            <label className="font-bold text-foreground block text-xs">
              4. Measurable Outcome & Verifiable Output *
            </label>
            <Input
              placeholder="e.g. 100% test coverage with zero regressions across Phase 1 state machine"
              {...form.register("measurableOutcome")}
              className="h-10 text-xs"
            />
            {form.formState.errors.measurableOutcome && (
              <p className="text-[11px] text-destructive">{form.formState.errors.measurableOutcome.message}</p>
            )}
          </div>

          {/* Field 5: Target Value & Target Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground block text-xs">5a. Optional Target Value</label>
              <Input
                type="number"
                placeholder="100"
                {...form.register("targetValue")}
                className="h-10 text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-foreground block text-xs">5b. Optional Target Unit</label>
              <Input
                placeholder="e.g. %, endpoints, PRs, components, test suites"
                {...form.register("targetUnit")}
                className="h-10 text-xs"
              />
            </div>
          </div>

          {/* Field 8: Start Date & End Date, Field 9: Related Project */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground block text-xs">8a. Start Date</label>
              <Input
                type="date"
                {...form.register("startDate")}
                className="h-10 text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-foreground block text-xs">8b. End Date</label>
              <Input
                type="date"
                {...form.register("endDate")}
                className="h-10 text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-foreground block text-xs">9. Related Project</label>
              <Input
                placeholder="e.g. Core Platform"
                {...form.register("relatedProject")}
                className="h-10 text-xs"
              />
            </div>
          </div>

          {/* Field 10 & 11: Flags & Add Button */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border/70">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                <input
                  type="checkbox"
                  {...form.register("evidenceRequired")}
                  className="h-4 w-4 rounded border-input text-emerald-500 accent-emerald-500"
                />
                <span>10. Evidence Required Flag</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                <input
                  type="checkbox"
                  {...form.register("managerApprovalRequired")}
                  className="h-4 w-4 rounded border-input text-emerald-500 accent-emerald-500"
                />
                <span>11. Manager Approval Required Flag</span>
              </label>
            </div>

            <Button
              type="submit"
              variant="brand"
              size="lg"
              className="text-xs font-black bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-black h-10 px-6 gap-2 shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:opacity-95"
            >
              <Plus className="h-4 w-4" />
              <span>+ Add Weekly Goal to Sprint</span>
            </Button>
          </div>
        </form>
      </Interactive3DCard>

      {/* ============================================================== */}
      {/* 2ND SECTION: DISPLAY THE WEEKLY GOALS & OKR BUDGET            */}
      {/* ============================================================== */}
      <div className="space-y-5">
        {/* Weight Allocation Progress Bar */}
        <Interactive3DCard className="p-6 border border-border/80 bg-gradient-to-r from-card/80 via-card/60 to-emerald-500/5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="brand" className="text-[10px] uppercase bg-cyan-500/15 border-cyan-500/30 text-cyan-300 font-bold">
                  <Target className="h-3 w-3 mr-1 text-cyan-400" />
                  2. Display Goals
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">This Week's Deliverables</span>
              </div>
              <h3 className="text-lg font-black text-foreground mt-0.5">
                Active Weekly Goals ({goals.length})
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Scale className="h-3.5 w-3.5 text-emerald-400" />
                Total Weight Budget:
              </span>
              <span className="font-mono font-black text-foreground">
                {totalWeight}% / 100%{" "}
                {totalWeight === 100 ? (
                  <span className="text-emerald-400 font-bold">(100% Balanced ✓)</span>
                ) : totalWeight > 100 ? (
                  <span className="text-red-400 font-bold">(⚠️ Over by {totalWeight - 100}%)</span>
                ) : (
                  <span className="text-amber-400 font-bold">(⚠️ {100 - totalWeight}% Remaining)</span>
                )}
              </span>
            </div>
          </div>

          <div className="progress-track-line">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                totalWeight === 100
                  ? "bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_12px_#10b981]"
                  : totalWeight > 100
                  ? "bg-red-500"
                  : "bg-gradient-to-r from-amber-400 to-yellow-500"
              }`}
              style={{ width: `${Math.min(100, totalWeight)}%` }}
            />
          </div>
        </Interactive3DCard>

        {/* Goals Cards List */}
        <div className="space-y-4">
          {goals.map((goal, idx) => (
            <Interactive3DCard
              key={goal.id}
              className="p-5 md:p-6 border border-border/80 hover:border-emerald-500/40 transition-all space-y-4"
            >
              {/* Header & Badges */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="h-6 w-6 rounded-md bg-muted text-emerald-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <h4 className="text-base font-bold text-foreground">{goal.title}</h4>
                    <Badge variant="brand" className="text-[10px] bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-bold">
                      Weight: {goal.weight}%
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[9px] uppercase font-bold ${
                        goal.priority === "CRITICAL"
                          ? "border-red-500 text-red-400 bg-red-500/10"
                          : goal.priority === "HIGH"
                          ? "border-red-500/40 text-red-400"
                          : "border-amber-500/40 text-amber-400"
                      }`}
                    >
                      {goal.priority}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase font-bold ${
                        goal.status === "COMPLETED"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
                      }`}
                    >
                      {goal.status.replace("_", " ")}
                    </Badge>
                  </div>

                  {goal.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">
                      {goal.description}
                    </p>
                  )}

                  {/* Measurable Outcome */}
                  <div className="p-2.5 rounded-lg bg-card/60 border border-border/70 text-xs">
                    <strong className="text-foreground">Measurable Outcome: </strong>
                    <span className="text-muted-foreground">{goal.measurableOutcome}</span>
                    {goal.targetValue && (
                      <span className="ml-2 font-mono text-cyan-400 font-bold">
                        [Target: {goal.targetValue} {goal.targetUnit || ""}]
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar & Percentage */}
                <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                  <div className="text-right">
                    <span className="text-lg font-black text-emerald-400 font-mono">
                      {goal.progressPercentage}%
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">completed</span>
                  </div>
                  <div className="progress-track-line w-36">
                    <div
                      className="progress-track-fill-emerald"
                      style={{ width: `${goal.progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Metadata & Flags Row */}
              <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <Layers className="h-3.5 w-3.5 text-cyan-400" />
                    Category: {goal.category}
                  </span>
                  {goal.relatedProject && (
                    <span>· Project: <strong className="text-foreground">{goal.relatedProject}</strong></span>
                  )}
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {goal.startDate} → {goal.endDate}
                  </span>
                </div>

                {/* Flags */}
                <div className="flex items-center gap-2">
                  {goal.evidenceRequired && (
                    <Badge variant="outline" className="text-[10px] border-cyan-500/40 text-cyan-300 bg-cyan-500/10 gap-1">
                      <FileCheck2 className="h-3 w-3" />
                      <span>Evidence Required</span>
                    </Badge>
                  )}

                  {goal.managerApprovalRequired && (
                    <Badge variant="outline" className="text-[10px] border-purple-500/40 text-purple-300 bg-purple-500/10 gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Manager Approval Req</span>
                    </Badge>
                  )}
                </div>
              </div>
            </Interactive3DCard>
          ))}
        </div>
      </div>
    </div>
  );
}
