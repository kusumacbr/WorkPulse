"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { MetricTile3D } from "@/components/3d/MetricTile3D";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import {
  Target,
  Scale,
  Users,
  Clock,
  HeartHandshake,
  Sliders,
} from "lucide-react";

interface StrategicHrGoal {
  id: string;
  title: string;
  category: "TALENT_ACQUISITION" | "ATTENDANCE_COMPLIANCE" | "CULTURE_RETENTION" | "PEOPLE_OPERATIONS";
  metric: string;
  target: string;
  currentValue: string;
  progress: number;
  weight: number;
  owner: string;
  status: "ON_TRACK" | "EXCEEDED" | "IN_PROGRESS";
}

const INITIAL_HR_GOALS: StrategicHrGoal[] = [
  {
    id: "hr-okr-1",
    title: "Accelerate Technical Hiring & Candidate Turnaround",
    category: "TALENT_ACQUISITION",
    metric: "Average Time-to-Hire",
    target: "< 21 Days",
    currentValue: "18.5 Days",
    progress: 92,
    weight: 35,
    owner: "Rachel HR & Talent Team",
    status: "EXCEEDED",
  },
  {
    id: "hr-okr-2",
    title: "Enforce 10:00 AM – 07:00 PM Shift Punctuality & Biometric Adherence",
    category: "ATTENDANCE_COMPLIANCE",
    metric: "Punctuality within 10:15 AM Grace",
    target: "> 98.0%",
    currentValue: "98.2%",
    progress: 98,
    weight: 25,
    owner: "People Operations Desk",
    status: "ON_TRACK",
  },
  {
    id: "hr-okr-3",
    title: "Foster Inclusive Culture, eNPS & Low Attrition",
    category: "CULTURE_RETENTION",
    metric: "Employee Net Promoter Score (eNPS)",
    target: ">= 85 Score",
    currentValue: "88 Score",
    progress: 94,
    weight: 25,
    owner: "Culture & Employee Relations",
    status: "ON_TRACK",
  },
  {
    id: "hr-okr-4",
    title: "100% Compliance on Stage-2 Leave Sign-offs & 30/60/90 Day Checkpoints",
    category: "PEOPLE_OPERATIONS",
    metric: "Milestone SLA Completion",
    target: "100% on-time",
    currentValue: "100%",
    progress: 100,
    weight: 15,
    owner: "HR Compliance Command",
    status: "EXCEEDED",
  },
];

export function HREnterpriseGoalsDeck() {
  const { departments } = useWorkpulseSharedStore();
  const [goals, setGoals] = useState<StrategicHrGoal[]>(INITIAL_HR_GOALS);
  const [activeTab, setActiveTab] = useState<"strategic" | "dept_alignment" | "budgeting">("strategic");

  const totalWeight = goals.reduce((acc, g) => acc + g.weight, 0);
  const weightedProgress = Math.round(
    goals.reduce((acc, g) => acc + (g.progress * g.weight) / 100, 0)
  );

  const handleWeightChange = (id: string, newWeight: number) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, weight: newWeight } : g))
    );
  };

  return (
    <div className="space-y-6">
      {/* 3D Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile3D
          title="HR Strategic OKR Progress"
          value={`${weightedProgress}%`}
          subtitle="Cumulative weighted strategic completion"
          icon={Target}
          change="+8% this month"
          changePositive={true}
          badgeText="High Velocity"
          accent="emerald"
          onClick={() => setActiveTab("strategic")}
        />

        <MetricTile3D
          title="Time-to-Hire"
          value="18.5 Days"
          subtitle="Target: < 21 Days (Dev, DevOps, SAP)"
          icon={Clock}
          change="3.5 Days Ahead"
          changePositive={true}
          badgeText="Optimized"
          accent="cyan"
          onClick={() => setActiveTab("strategic")}
        />

        <MetricTile3D
          title="Employee eNPS Score"
          value="88 / 100"
          subtitle="High satisfaction & pod morale"
          icon={HeartHandshake}
          change="+4.5 MoM"
          changePositive={true}
          badgeText="Exemplary"
          accent="purple"
          onClick={() => setActiveTab("strategic")}
        />

        <MetricTile3D
          title="Cross-Dept OKR Alignment"
          value="6 of 6 Pods"
          subtitle="100% weight budgeted in all pods"
          icon={Scale}
          change="Aligned"
          changePositive={true}
          badgeText="100% Balanced"
          accent="gold"
          onClick={() => setActiveTab("dept_alignment")}
        />
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex items-center p-1.5 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-xl overflow-x-auto gap-1 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab("strategic")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === "strategic"
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Target className="h-3.5 w-3.5" />
          <span>People Strategy Strategic OKRs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("dept_alignment")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === "dept_alignment"
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Cross-Department Cascaded OKR Health</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("budgeting")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === "budgeting"
              ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>100% OKR Weight Budgeting</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-extrabold">
            {totalWeight}%
          </span>
        </button>
      </div>

      {/* TAB 1: STRATEGIC HR OKRS */}
      {activeTab === "strategic" && (
        <Interactive3DCard className="p-6 space-y-4 border-border/80">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-400" />
              People Operations & Talent Strategic Goals (Q3 2026)
            </h3>
            <p className="text-xs text-muted-foreground">
              Core institutional objectives tied directly to organization growth, talent retention, shift adherence, and compliance.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="p-5 rounded-2xl bg-card/60 border border-border/80 hover:border-emerald-500/40 space-y-3 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{goal.title}</span>
                      <Badge variant="outline" className="text-[10px] text-cyan-400 border-cyan-500/30">
                        {goal.category.replace("_", " ")}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground block">
                      Metric: <strong className="text-foreground">{goal.metric}</strong> · Target:{" "}
                      <strong className="text-foreground">{goal.target}</strong> · Current:{" "}
                      <strong className="text-emerald-400">{goal.currentValue}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-[10px] font-mono text-purple-300 border-purple-500/30">
                      {goal.weight}% Weight
                    </Badge>
                    <Badge
                      variant="brand"
                      className={`text-[9px] uppercase font-bold ${
                        goal.status === "EXCEEDED"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                      }`}
                    >
                      {goal.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Owner: {goal.owner}</span>
                    <strong className="text-emerald-400 font-mono">{goal.progress}% Completed</strong>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Interactive3DCard>
      )}

      {/* TAB 2: DEPARTMENT CASCADED OKR HEALTH */}
      {activeTab === "dept_alignment" && (
        <Interactive3DCard className="p-6 space-y-4 border-border/80">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-cyan-400" />
              Cross-Department Cascaded OKR Health & Alignment
            </h3>
            <p className="text-xs text-muted-foreground">
              Monitor sprint goal velocity, weight budget balance (100%), and blocker status across all 6 departments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {departments.map((dept, idx) => {
              const progress = idx === 0 ? 88 : idx === 1 ? 92 : idx === 2 ? 80 : idx === 3 ? 100 : idx === 4 ? 85 : 90;

              return (
                <div
                  key={dept.id}
                  className="p-4 rounded-xl bg-card/60 border border-border/80 space-y-3 hover:border-cyan-500/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground">{dept.name}</span>
                    <Badge variant="outline" className={`text-[9px] ${dept.badgeColor}`}>
                      {dept.employees.length} Staff
                    </Badge>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Lead: {dept.teamLead.name}</span>
                      <strong className="text-emerald-400 font-mono">{progress}% Velocity</strong>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Budget: <strong className="text-emerald-400">100%</strong></span>
                    <span className="text-muted-foreground">Blockers: <strong className="text-foreground">0 Open</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </Interactive3DCard>
      )}

      {/* TAB 3: 100% OKR WEIGHT BUDGETING */}
      {activeTab === "budgeting" && (
        <Interactive3DCard className="p-6 space-y-4 border-border/80">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Scale className="h-4 w-4 text-purple-400" />
                HR Strategic OKR Weight Calibration Engine
              </h3>
              <p className="text-xs text-muted-foreground">
                Ensure weights total exactly <strong className="text-foreground">100%</strong> to maintain proportional accountability.
              </p>
            </div>

            <Badge
              variant="outline"
              className={`text-xs font-mono font-bold px-3 py-1 ${
                totalWeight === 100
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "bg-red-500/15 text-red-400 border-red-500/30"
              }`}
            >
              Total Budget: {totalWeight}% / 100%
            </Badge>
          </div>

          <div className="space-y-4 pt-2">
            {goals.map((g) => (
              <div key={g.id} className="p-4 rounded-xl bg-card/60 border border-border/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground">{g.title}</span>
                  <span className="font-mono text-purple-300 font-bold">{g.weight}% Weight</span>
                </div>

                <input
                  type="range"
                  min={5}
                  max={50}
                  step={5}
                  value={g.weight}
                  onChange={(e) => handleWeightChange(g.id, parseInt(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-purple-400"
                />
              </div>
            ))}
          </div>
        </Interactive3DCard>
      )}
    </div>
  );
}
